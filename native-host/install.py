#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Stream to Player - インストーラー (Windows / macOS 対応)
1. ネイティブホストファイルをインストール先にコピー
2. ラッパースクリプトを生成 (Windows: .bat, macOS: .sh)
3. ホストマニフェスト JSON を生成
4. ホスト登録 (Windows: レジストリ, macOS: ファイル配置)
5. 依存ツールの存在確認
"""

import argparse
import glob as globmod
import os
import stat
import sys
import json
import shutil
from pathlib import Path

IS_WINDOWS = sys.platform == "win32"
IS_MACOS = sys.platform == "darwin"

if IS_WINDOWS:
    import winreg

HOST_NAME = "com.stream_to_player.host"
SRC_DIR = Path(__file__).parent

# === プラットフォーム別パス ===

if IS_WINDOWS:
    INSTALL_DIR = Path(os.environ["LOCALAPPDATA"]) / "StreamToPlayer"
    REG_KEY = rf"Software\Google\Chrome\NativeMessagingHosts\{HOST_NAME}"
    CHROME_PREFS_PATTERNS = [
        Path(os.environ["LOCALAPPDATA"]) / "Google" / "Chrome" / "User Data" / "*" / "Secure Preferences",
        Path(os.environ["LOCALAPPDATA"]) / "Microsoft" / "Edge" / "User Data" / "*" / "Secure Preferences",
        Path(os.environ["LOCALAPPDATA"]) / "BraveSoftware" / "Brave-Browser" / "User Data" / "*" / "Secure Preferences",
    ]
elif IS_MACOS:
    INSTALL_DIR = Path.home() / "Library" / "Application Support" / "StreamToPlayer"
    # macOS ではマニフェスト JSON をこのディレクトリに配置するだけで登録完了（レジストリ不要）
    CHROME_MANIFEST_DIRS = {
        "Chrome": Path.home() / "Library" / "Application Support" / "Google" / "Chrome" / "NativeMessagingHosts",
        "Edge": Path.home() / "Library" / "Application Support" / "Microsoft Edge" / "NativeMessagingHosts",
        "Brave": Path.home() / "Library" / "Application Support" / "BraveSoftware" / "Brave-Browser" / "NativeMessagingHosts",
    }
    CHROME_PREFS_PATTERNS = [
        Path.home() / "Library" / "Application Support" / "Google" / "Chrome" / "*" / "Secure Preferences",
        Path.home() / "Library" / "Application Support" / "Microsoft Edge" / "*" / "Secure Preferences",
        Path.home() / "Library" / "Application Support" / "BraveSoftware" / "Brave-Browser" / "*" / "Secure Preferences",
    ]
else:
    INSTALL_DIR = Path.home() / ".local" / "share" / "StreamToPlayer"
    CHROME_PREFS_PATTERNS = [
        Path.home() / ".config" / "google-chrome" / "*" / "Secure Preferences",
        Path.home() / ".config" / "microsoft-edge" / "*" / "Secure Preferences",
        Path.home() / ".config" / "BraveSoftware" / "Brave-Browser" / "*" / "Secure Preferences",
    ]


def find_extension_id_from_chrome():
    """Chrome の Preferences から Stream to Player 拡張のIDを自動検出する。"""
    for pattern in CHROME_PREFS_PATTERNS:
        for pref_path in globmod.glob(str(pattern)):
            try:
                with open(pref_path, "r", encoding="utf-8") as f:
                    prefs = json.load(f)
                exts = prefs.get("extensions", {}).get("settings", {})
                for ext_id, ext_info in exts.items():
                    manifest = ext_info.get("manifest", {})
                    name = manifest.get("name", "")
                    if name == "Stream to Player":
                        browser = Path(pref_path).parts[-4]  # e.g. "Chrome"
                        print(f"  自動検出: {ext_id} ({browser})")
                        return ext_id
            except Exception:
                continue
    return None


def get_extension_id(cli_id=None, auto=False):
    if cli_id:
        print(f"  CLI引数で指定: {cli_id}")
        return cli_id

    if auto:
        found = find_extension_id_from_chrome()
        if found:
            return found
        print("  自動検出失敗: Chrome に拡張機能が登録されていません。")
        print("  先に chrome://extensions/ で extension/ フォルダを読み込んでください。")
        sys.exit(1)

    # 自動検出を試みてからフォールバック
    found = find_extension_id_from_chrome()
    if found:
        use = input(f"検出されたID [{found}] を使用しますか? (Y/n): ").strip()
        if use.lower() != "n":
            return found

    print()
    print("拡張機能のIDを入力してください。")
    print("Chrome の chrome://extensions/ で「デベロッパーモード」を有効にすると表示されます。")
    print("例: abcdefghijklmnopqrstuvwxyzabcdef")
    print()
    ext_id = input("Extension ID: ").strip()
    if not ext_id:
        print("IDが入力されませんでした。後でマニフェストファイルを手動で編集してください。")
        return "EXTENSION_ID_PLACEHOLDER"
    return ext_id


def install_files():
    INSTALL_DIR.mkdir(parents=True, exist_ok=True)

    # Python スクリプトをコピー
    src = SRC_DIR / "stream_to_player_host.py"
    dst = INSTALL_DIR / "stream_to_player_host.py"
    shutil.copy2(src, dst)
    print(f"  コピー: {dst}")

    if IS_WINDOWS:
        # .bat ラッパーを生成
        wrapper_path = INSTALL_DIR / "stream_to_player_host.bat"
        python_path = sys.executable
        wrapper_path.write_text(
            f'@echo off\n"{python_path}" -u "%~dp0stream_to_player_host.py"\n',
            encoding="ascii",
        )
    else:
        # .sh ラッパーを生成 + 実行権限付与
        wrapper_path = INSTALL_DIR / "stream_to_player_host.sh"
        python_path = shutil.which("python3") or sys.executable
        wrapper_path.write_text(
            f'#!/bin/bash\nexec "{python_path}" -u "$(dirname "$0")/stream_to_player_host.py"\n',
            encoding="utf-8",
        )
        wrapper_path.chmod(wrapper_path.stat().st_mode | stat.S_IXUSR | stat.S_IXGRP)

    print(f"  生成: {wrapper_path}")
    return wrapper_path


def create_manifest(wrapper_path, extension_id):
    manifest = {
        "name": HOST_NAME,
        "description": "Stream to Player Native Messaging Host",
        "path": str(wrapper_path),
        "type": "stdio",
        "allowed_origins": [f"chrome-extension://{extension_id}/"],
    }
    manifest_path = INSTALL_DIR / f"{HOST_NAME}.json"
    manifest_path.write_text(
        json.dumps(manifest, indent=2, ensure_ascii=False),
        encoding="utf-8",
    )
    print(f"  マニフェスト: {manifest_path}")
    return manifest_path


def register_host(manifest_path):
    """ネイティブメッセージングホストを登録する。
    Windows: レジストリに登録
    macOS: マニフェスト JSON を各ブラウザの NativeMessagingHosts/ にコピー
    """
    if IS_WINDOWS:
        with winreg.CreateKey(winreg.HKEY_CURRENT_USER, REG_KEY) as key:
            winreg.SetValueEx(key, "", 0, winreg.REG_SZ, str(manifest_path))
        print(f"  レジストリ: HKCU\\{REG_KEY}")
    elif IS_MACOS:
        for browser, manifest_dir in CHROME_MANIFEST_DIRS.items():
            manifest_dir.mkdir(parents=True, exist_ok=True)
            dst = manifest_dir / f"{HOST_NAME}.json"
            shutil.copy2(manifest_path, dst)
            print(f"  マニフェスト配置 ({browser}): {dst}")
    else:
        # Linux: Chrome / Edge / Brave の NativeMessagingHosts
        nm_dirs = {
            "Chrome": Path.home() / ".config" / "google-chrome" / "NativeMessagingHosts",
            "Chromium": Path.home() / ".config" / "chromium" / "NativeMessagingHosts",
            "Edge": Path.home() / ".config" / "microsoft-edge" / "NativeMessagingHosts",
            "Brave": Path.home() / ".config" / "BraveSoftware" / "Brave-Browser" / "NativeMessagingHosts",
        }
        for browser, nm_dir in nm_dirs.items():
            nm_dir.mkdir(parents=True, exist_ok=True)
            dst = nm_dir / f"{HOST_NAME}.json"
            shutil.copy2(manifest_path, dst)
            print(f"  マニフェスト配置 ({browser}): {dst}")


def check_dependencies():
    print("\n依存ツールの確認:")

    if IS_WINDOWS:
        tools = {
            "streamlink": [str(Path.home() / ".local/bin/streamlink.exe"), "streamlink"],
            "yt-dlp": [str(Path.home() / ".local/bin/yt-dlp.exe"), "yt-dlp"],
            "mpv": [
                str(Path.home() / "AppData/Local/UniGetUI/Chocolatey/lib/mpvio.portable/tools/mpv.exe"),
                "mpv",
            ],
            "vlc": [r"C:\Program Files\VideoLAN\VLC\vlc.exe", "vlc"],
        }
    elif IS_MACOS:
        tools = {
            "streamlink": ["/opt/homebrew/bin/streamlink", "/usr/local/bin/streamlink", "streamlink"],
            "yt-dlp": ["/opt/homebrew/bin/yt-dlp", "/usr/local/bin/yt-dlp", "yt-dlp"],
            "mpv": ["/opt/homebrew/bin/mpv", "/usr/local/bin/mpv", "mpv"],
            "vlc": ["/Applications/VLC.app/Contents/MacOS/VLC", "vlc"],
        }
    else:
        tools = {
            "streamlink": ["streamlink"],
            "yt-dlp": ["yt-dlp"],
            "mpv": ["mpv"],
            "vlc": ["vlc"],
        }

    all_ok = True
    for tool_name, candidates in tools.items():
        found = None
        for c in candidates:
            if os.path.isabs(c) and Path(c).is_file():
                found = c
                break
            elif not os.path.isabs(c):
                found = shutil.which(c)
                if found:
                    break

        if found:
            print(f"  [OK] {tool_name}: {found}")
        else:
            print(f"  [!!] {tool_name}: 未検出")
            all_ok = False

    if not all_ok:
        print("\n一部のツールが見つかりません。以下のコマンドでインストールできます:")
        if IS_WINDOWS:
            print("  streamlink: pip install streamlink")
            print("  yt-dlp:     pip install yt-dlp")
            print("  mpv:        winget install mpv  (または choco install mpv)")
            print("  vlc:        winget install VideoLAN.VLC")
        elif IS_MACOS:
            print("  streamlink: brew install streamlink")
            print("  yt-dlp:     brew install yt-dlp")
            print("  mpv:        brew install mpv")
            print("  vlc:        brew install --cask vlc")
        else:
            print("  streamlink: pip install streamlink")
            print("  yt-dlp:     pip install yt-dlp")
            print("  mpv:        パッケージマネージャでインストール")
            print("  vlc:        パッケージマネージャでインストール")


def main():
    parser = argparse.ArgumentParser(description="Stream to Player - インストーラー")
    parser.add_argument("--extension-id", help="Chrome拡張機能のID (32文字)")
    parser.add_argument("--auto", action="store_true", help="Chrome Preferencesから自動検出")
    args = parser.parse_args()

    print("=" * 50)
    print("Stream to Player - インストーラー")
    print("=" * 50)
    print(f"\nPython: {sys.executable}")
    print(f"プラットフォーム: {sys.platform}")
    print(f"インストール先: {INSTALL_DIR}")

    extension_id = get_extension_id(cli_id=args.extension_id, auto=args.auto)

    print("\nファイルをインストール中...")
    wrapper_path = install_files()
    manifest_path = create_manifest(wrapper_path, extension_id)
    register_host(manifest_path)

    check_dependencies()

    print("\n" + "=" * 50)
    print("インストール完了!")
    print("Chrome で拡張機能を読み込み、設定ページで「接続テスト」を実行してください。")
    print("=" * 50)


if __name__ == "__main__":
    main()
