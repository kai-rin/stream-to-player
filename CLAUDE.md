# Stream to Player

ストリーミングサイト (YouTube, Twitch, AbemaTV 等 16サイト) の動画を mpv/vlc で再生する Chrome 拡張機能。Windows / macOS 対応。

## アーキテクチャ

```
[Popup] → runtime.sendMessage → [Service Worker] → connectNative → [Python Host]
                                      ↑                                 ↓
                                 sites.js による                  subprocess.Popen
                                 サイト検出・ツール選択           streamlink / yt-dlp → mpv / vlc
```

## プロジェクト構成

- `extension/` - Chrome 拡張機能 (Manifest V3, ES Modules)
  - `manifest.json` - MV3 マニフェスト
  - `background.js` - Service Worker (メッセージルーティング, connectNative)
  - `sites.js` - サイト別設定の一元管理 (ツール選択・Live判定・品質リスト)
  - `popup/` - ポップアップUI
  - `options/` - 設定ページ
- `native-host/` - Native Messaging Host (Python)
  - `stream_to_player_host.py` - メイン (4byte長プレフィックス + JSON プロトコル)
  - `stream_to_player_host.bat` - Windows ラッパー
  - `install.py` - インストーラー (Windows: レジストリ, macOS: NativeMessagingHosts)
- `tests/` - テスト

## 設計判断

- **Native Messaging**: stdin/stdout で 4バイト長プレフィックス (LE) + UTF-8 JSON。stdout は Chrome 専用、ログはファイル出力のみ
- **メッセージ順序**: `progress` イベント (任意回数) → 初回レスポンス → `playback_started` の3段階。progress は background が popup へ中継
- **再生方式 (yt-dlp)**: `yt-dlp -g` で URL 事前解決 → mpv に直接渡す高速パス。失敗時は `mpv --ytdl-format` にフォールバック
  - 抽出器エラー (`ERROR:` 行 = 配信オフライン/動画削除) は `StreamResolveError` としてフォールバックせず即エラー返却 (偽成功防止)
- **再生方式 (streamlink)**: `streamlink URL quality --player mpv`。stdout ファイル監視で「Starting player:」を検知
  - 失敗時は yt-dlp へ自動フォールバック (`streamlink_only` サイト除く)
  - `--player-args` は shlex.split (posix) で分割される → named pipe 等のバックスラッシュは二重化必須
- **再生検知**: mpv IPC で `observe_property core-idle` を監視 (Windows: named pipe, macOS: Unix socket)
- **ツール自動選択**: ライブ → streamlink 優先、VOD → yt-dlp 優先。サイト固有制限あり (sites.js + SITE_TOOL_RULES)。例外: YouTube は live も yt-dlp (streamlink の YouTube プラグインが上流破損)
- **yt-dlp 2026.x**: YouTube 抽出に JS runtime 必須 → ホストが node 検出時 `--js-runtimes node` を自動付与
- **IPv4 強制**: streamlink `-4`、yt-dlp `--force-ipv4` (IPv6 は Twitch 等で遅い)
- **Service Worker (MV3)**: リスナーはトップレベル登録必須。状態は `chrome.storage` に保持

## テスト実行

- Python: `python tests/test_host_logic.py` (スクリプト形式。pytest では収集されない)
- JS: `node tests/test_sites_logic.mjs`
- ネイティブホスト変更の反映: `stream_to_player_host.py` をインストール先 (Windows: `%LOCALAPPDATA%\StreamToPlayer\`) にコピー。install.py の再実行は .bat の Python パスを実行中の Python で上書きするため、Extension ID 変更時以外は避ける

## テスト成果物

- Playwright のスクリーンショット等は必ず `.playwright-mcp/` ディレクトリ内に保存する（例: `filename: ".playwright-mcp/screenshot.png"`）
- `.playwright-mcp/` は `.gitignore` 対象。プロジェクトルートに一時ファイルを生成しないこと

## サイト追加方法

1. `extension/sites.js` の `SITE_CONFIGS` にエントリ追加
2. `native-host/stream_to_player_host.py` の `SITE_TOOL_RULES` にルール追加
3. 拡張を再読み込み
