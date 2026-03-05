#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Stream to Player - Native Messaging Host
Chrome拡張機能からの命令を受けてstreamlink/yt-dlpを実行する。

プロトコル: 4バイト長プレフィックス (little-endian) + UTF-8 JSON
Windows: stream_to_player_host.bat 経由で python -u で起動される
macOS: stream_to_player_host.sh 経由 or 直接実行
"""

import sys
import json
import struct
import subprocess
import os
import shutil
import logging
import time
import uuid
from pathlib import Path
from urllib.parse import urlparse

IS_WINDOWS = sys.platform == "win32"
IS_MACOS = sys.platform == "darwin"

if IS_WINDOWS:
    import ctypes
    import ctypes.wintypes as wt
else:
    import socket
    import select

# ロギング設定（stdoutはChrome用プロトコル専用のためファイルのみ）
if IS_WINDOWS:
    LOG_DIR = Path(os.environ.get("APPDATA", str(Path.home()))) / "StreamToPlayer"
elif IS_MACOS:
    LOG_DIR = Path.home() / "Library" / "Logs" / "StreamToPlayer"
else:
    LOG_DIR = Path(os.environ.get("XDG_STATE_HOME", str(Path.home() / ".local" / "state"))) / "StreamToPlayer"
LOG_DIR.mkdir(parents=True, exist_ok=True)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[logging.FileHandler(LOG_DIR / "host.log", encoding="utf-8")],
)
log = logging.getLogger(__name__)

# ツールパスの候補
if IS_WINDOWS:
    TOOL_CANDIDATES = {
        "streamlink": [
            str(Path.home() / ".local" / "bin" / "streamlink.exe"),
            "streamlink",
        ],
        "yt-dlp": [
            str(Path.home() / ".local" / "bin" / "yt-dlp.exe"),
            "yt-dlp",
        ],
        "mpv": [
            str(Path.home() / "AppData" / "Local" / "UniGetUI" / "Chocolatey" / "lib" / "mpvio.portable" / "tools" / "mpv.exe"),
            r"C:\Program Files\mpv\mpv.exe",
            "mpv",
        ],
        "vlc": [
            r"C:\Program Files\VideoLAN\VLC\vlc.exe",
            r"C:\Program Files (x86)\VideoLAN\VLC\vlc.exe",
            "vlc",
        ],
    }
elif IS_MACOS:
    TOOL_CANDIDATES = {
        "streamlink": [
            "/opt/homebrew/bin/streamlink",
            "/usr/local/bin/streamlink",
            "streamlink",
        ],
        "yt-dlp": [
            "/opt/homebrew/bin/yt-dlp",
            "/usr/local/bin/yt-dlp",
            "yt-dlp",
        ],
        "mpv": [
            "/opt/homebrew/bin/mpv",
            "/usr/local/bin/mpv",
            "/Applications/mpv.app/Contents/MacOS/mpv",
            "mpv",
        ],
        "vlc": [
            "/Applications/VLC.app/Contents/MacOS/VLC",
            "/opt/homebrew/bin/vlc",
            "/usr/local/bin/vlc",
            "vlc",
        ],
    }
else:
    TOOL_CANDIDATES = {
        "streamlink": ["streamlink"],
        "yt-dlp": ["yt-dlp"],
        "mpv": ["mpv"],
        "vlc": ["vlc"],
    }

# サイト別ツール優先ルール
SITE_TOOL_RULES = {
    "abema.tv":          {"live": "streamlink", "vod": "streamlink", "streamlink_only": True},
    "radiko.jp":         {"live": "streamlink", "vod": "streamlink", "streamlink_only": True},
    "tver.jp":           {"live": "yt-dlp",     "vod": "yt-dlp",     "ytdlp_only": True},
    "youtube.com":       {"live": "streamlink", "vod": "yt-dlp"},
    "youtu.be":          {"live": "streamlink", "vod": "yt-dlp"},
    "twitch.tv":         {"live": "streamlink", "vod": "yt-dlp"},
    "nicovideo.jp":      {"live": "streamlink", "vod": "yt-dlp"},
    "twitter.com":       {"live": "yt-dlp",     "vod": "yt-dlp",     "ytdlp_only": True},
    "x.com":             {"live": "yt-dlp",     "vod": "yt-dlp",     "ytdlp_only": True},
    "tiktok.com":        {"live": "yt-dlp",     "vod": "yt-dlp",     "ytdlp_only": True},
    "twitcasting.tv":    {"live": "streamlink", "vod": "yt-dlp"},
    "fc2.com":           {"live": "yt-dlp",     "vod": "yt-dlp",     "ytdlp_only": True},
    "showroom-live.com": {"live": "streamlink", "vod": "yt-dlp"},
    "openrec.tv":        {"live": "streamlink", "vod": "yt-dlp"},
    "bilibili.com":      {"live": "streamlink", "vod": "yt-dlp"},
    "dailymotion.com":   {"live": "yt-dlp",     "vod": "yt-dlp"},
    "dai.ly":            {"live": "yt-dlp",     "vod": "yt-dlp"},
    "vimeo.com":         {"live": "yt-dlp",     "vod": "yt-dlp"},
    "soundcloud.com":    {"live": "yt-dlp",     "vod": "yt-dlp",     "ytdlp_only": True},
}


# === Chrome Native Messaging プロトコル ===

def read_message():
    raw_length = sys.stdin.buffer.read(4)
    if not raw_length or len(raw_length) < 4:
        return None
    message_length = struct.unpack("<I", raw_length)[0]
    if message_length == 0 or message_length > 1024 * 1024:
        return None
    raw_message = sys.stdin.buffer.read(message_length)
    if len(raw_message) < message_length:
        return None
    return json.loads(raw_message.decode("utf-8"))


def send_message(payload):
    encoded = json.dumps(payload, ensure_ascii=False).encode("utf-8")
    sys.stdout.buffer.write(struct.pack("<I", len(encoded)) + encoded)
    sys.stdout.buffer.flush()


# === ツール検索 ===

def find_tool(tool_name, override_path=""):
    candidates = []
    if override_path:
        candidates.append(override_path)
    candidates.extend(TOOL_CANDIDATES.get(tool_name, [tool_name]))

    for candidate in candidates:
        if os.path.isabs(candidate):
            if Path(candidate).is_file():
                return candidate
        else:
            found = shutil.which(candidate)
            if found:
                return found
    return None


def check_all_tools():
    return {tool: find_tool(tool) for tool in ["streamlink", "yt-dlp", "mpv", "vlc"]}


# === ツール選択 ===

def extract_domain(url):
    try:
        return urlparse(url).netloc.removeprefix("www.")
    except Exception:
        return ""


def select_tool_for_url(url, stream_type, user_pref):
    domain = extract_domain(url)

    rules = {}
    for key in SITE_TOOL_RULES:
        if domain.endswith(key):
            rules = SITE_TOOL_RULES[key]
            break

    if user_pref and user_pref != "auto":
        if user_pref == "streamlink" and rules.get("ytdlp_only"):
            return "yt-dlp"
        if user_pref == "yt-dlp" and rules.get("streamlink_only"):
            return "streamlink"
        return user_pref

    if rules:
        return rules.get(stream_type, rules.get("vod", "yt-dlp"))

    return "streamlink" if stream_type == "live" else "yt-dlp"


# === コマンド構築 ===

def build_play_cmd_streamlink(url, quality, player_name, player_path, sl_path):
    cmd = [sl_path, url, quality or "best",
           "-4",                 # IPv6 は Twitch Usher 等で極端に遅いため IPv4 強制
           "--http-timeout", "15"]
    player = player_path or find_tool(player_name) or player_name
    if player:
        cmd += ["--player", player]
    if player_name == "mpv":
        cmd += ["--player-args", "--force-window --autofit=1920x1080 --title={title}"]
    return cmd


def _ssl_cert_env():
    """certifi の CA 証明書パスを SSL_CERT_FILE に設定した環境変数を返す。
    スタンドアロン版 yt-dlp がバンドルする CA 証明書が不完全な場合の対策。"""
    env = os.environ.copy()
    if env.get("SSL_CERT_FILE"):
        return env
    try:
        import certifi
        env["SSL_CERT_FILE"] = certifi.where()
    except ImportError:
        pass
    return env


def _resolve_urls_ytdlp(url, fmt, timeout=15):
    """yt-dlp -g でストリームURLを事前解決（mpv内蔵の -J 方式より大幅に高速）"""
    ytdlp = find_tool("yt-dlp")
    if not ytdlp:
        raise FileNotFoundError("yt-dlp が見つかりません")
    log.info("Resolving URL with yt-dlp -g: fmt=%s", fmt)
    t0 = time.time()
    result = subprocess.run(
        [ytdlp, "-g", "-f", fmt, "--no-playlist", "--force-ipv4", url],
        capture_output=True, text=True, timeout=timeout,
        creationflags=subprocess.CREATE_NO_WINDOW if sys.platform == "win32" else 0,
        env=_ssl_cert_env(),
    )
    elapsed = time.time() - t0
    if result.returncode != 0:
        raise RuntimeError(f"yt-dlp URL解決失敗: {result.stderr.strip()}")
    urls = [u.strip() for u in result.stdout.strip().split("\n") if u.strip()]
    if not urls:
        raise RuntimeError("yt-dlp returned no URLs")
    log.info("URL resolved in %.1fs (%d stream(s))", elapsed, len(urls))
    return urls


def _build_cmd_ytdlp_preresolved(url, fmt, player, player_name, stream_type, pipe_name):
    """yt-dlp -g でURL事前解決し、プレイヤーに直接URLを渡す (高速パス)"""
    fmt_arg = "best" if stream_type == "live" else (fmt or "bestvideo+bestaudio/best")
    stream_urls = _resolve_urls_ytdlp(url, fmt_arg)

    if player_name == "mpv":
        cmd = [player, "--force-window=immediate", "--autofit=1920x1080"]
        cmd.append(f"--log-file={LOG_DIR / 'mpv.log'}")
        if len(stream_urls) >= 2:
            cmd.append(f"--audio-file={stream_urls[1]}")
        cmd.append(stream_urls[0])
        if pipe_name:
            cmd.append(f"--input-ipc-server={pipe_name}")
        return cmd
    else:
        return [player, stream_urls[0]]


def _build_cmd_ytdlp_direct(url, fmt, player, player_name, stream_type, pipe_name):
    """mpv 内蔵の yt-dlp に URL 解決を委ねる (フォールバック、遅いが確実)"""
    fmt_arg = "best" if stream_type == "live" else (fmt or "bestvideo+bestaudio/best")
    if player_name == "mpv":
        cmd = [player, "--force-window=immediate", "--autofit=1920x1080",
               f"--log-file={LOG_DIR / 'mpv.log'}",
               f"--ytdl-format={fmt_arg}", url]
        if pipe_name:
            cmd.append(f"--input-ipc-server={pipe_name}")
        return cmd
    else:
        raise RuntimeError("yt-dlp URL resolution failed and player is not mpv")


# === mpv IPC ===
# Windows: named pipe (ctypes.windll.kernel32)
# macOS/Linux: Unix domain socket (標準 socket モジュール)

if IS_WINDOWS:
    _kernel32 = ctypes.windll.kernel32
    _kernel32.CreateFileW.restype = ctypes.c_void_p
    _kernel32.PeekNamedPipe.argtypes = [
        ctypes.c_void_p, ctypes.c_void_p, wt.DWORD,
        ctypes.POINTER(wt.DWORD), ctypes.POINTER(wt.DWORD), ctypes.POINTER(wt.DWORD),
    ]
    _kernel32.ReadFile.argtypes = [
        ctypes.c_void_p, ctypes.c_void_p, wt.DWORD,
        ctypes.POINTER(wt.DWORD), ctypes.c_void_p,
    ]
    _kernel32.WriteFile.argtypes = [
        ctypes.c_void_p, ctypes.c_void_p, wt.DWORD,
        ctypes.POINTER(wt.DWORD), ctypes.c_void_p,
    ]
    _INVALID_HANDLE = ctypes.c_void_p(-1).value
    _GENERIC_RW = 0xC0000000  # GENERIC_READ | GENERIC_WRITE
    _OPEN_EXISTING = 3

    def _connect_pipe(name, timeout=15, proc=None):
        """named pipe に接続（リトライ付き）"""
        t0 = time.time()
        deadline = t0 + timeout
        while time.time() < deadline:
            if proc and proc.poll() is not None:
                log.info("Process exited before pipe connected (rc=%d)", proc.returncode)
                return None
            h = _kernel32.CreateFileW(name, _GENERIC_RW, 0, None, _OPEN_EXISTING, 0, None)
            if h and h != _INVALID_HANDLE:
                log.info("Connected to mpv IPC pipe: %s (%.1fs)", name, time.time() - t0)
                return h
            time.sleep(0.3)
        log.warning("Failed to connect to mpv IPC pipe within %ds: %s", timeout, name)
        return None

    def _peek_pipe(h):
        """pipe にデータがあるか非ブロッキング確認"""
        avail = wt.DWORD()
        ok = _kernel32.PeekNamedPipe(h, None, 0, None, ctypes.byref(avail), None)
        return ok and avail.value > 0

    def _read_pipe(h, size=8192):
        """pipe からデータ読み取り"""
        buf = ctypes.create_string_buffer(size)
        n = wt.DWORD()
        ok = _kernel32.ReadFile(h, buf, size, ctypes.byref(n), None)
        return buf.raw[:n.value].decode("utf-8", errors="replace") if ok and n.value > 0 else ""

    def _write_pipe(h, data):
        """pipe にデータ書き込み"""
        raw = data.encode("utf-8") if isinstance(data, str) else data
        n = wt.DWORD()
        ok = _kernel32.WriteFile(h, raw, len(raw), ctypes.byref(n), None)
        return ok and n.value == len(raw)

    def _close_handle(h):
        _kernel32.CloseHandle(ctypes.c_void_p(h))

else:
    # macOS / Linux: Unix domain socket
    def _connect_pipe(name, timeout=15, proc=None):
        """Unix domain socket に接続（リトライ付き）"""
        t0 = time.time()
        deadline = t0 + timeout
        while time.time() < deadline:
            if proc and proc.poll() is not None:
                log.info("Process exited before socket connected (rc=%d)", proc.returncode)
                return None
            try:
                sock = socket.socket(socket.AF_UNIX, socket.SOCK_STREAM)
                sock.connect(name)
                sock.setblocking(False)
                log.info("Connected to mpv IPC socket: %s (%.1fs)", name, time.time() - t0)
                return sock
            except (ConnectionRefusedError, FileNotFoundError, OSError):
                try:
                    sock.close()
                except Exception:
                    pass
                time.sleep(0.3)
        log.warning("Failed to connect to mpv IPC socket within %ds: %s", timeout, name)
        return None

    def _peek_pipe(h):
        """socket にデータがあるか非ブロッキング確認"""
        r, _, _ = select.select([h], [], [], 0)
        return len(r) > 0

    def _read_pipe(h, size=8192):
        """socket からデータ読み取り"""
        try:
            data = h.recv(size)
            return data.decode("utf-8", errors="replace") if data else ""
        except (BlockingIOError, OSError):
            return ""

    def _write_pipe(h, data):
        """socket にデータ書き込み"""
        raw = data.encode("utf-8") if isinstance(data, str) else data
        try:
            h.sendall(raw)
            return True
        except OSError:
            return False

    def _close_handle(h):
        try:
            h.close()
        except OSError:
            pass


def wait_for_mpv_playback(pipe_name, proc, timeout=120):
    """mpv の再生開始を IPC 経由で検知（observe_property 方式）

    接続後に observe_property で core-idle を監視する。
    observe_property は現在の値を即座に返すため、
    接続前に playback-restart が発火していても検知可能。
    """
    h = _connect_pipe(pipe_name, timeout=timeout, proc=proc)
    if not h:
        log.warning("Could not connect to mpv IPC pipe: %s", pipe_name)
        return False
    try:
        # core-idle プロパティを監視（現在値も即座に通知される）
        cmd = json.dumps({"command": ["observe_property", 1, "core-idle"]}) + "\n"
        if not _write_pipe(h, cmd):
            log.warning("Failed to send observe_property command")
            return False
        log.debug("Sent observe_property for core-idle")

        deadline = time.time() + timeout
        buf = ""
        while time.time() < deadline:
            if proc.poll() is not None:
                log.info("mpv process exited during IPC monitoring")
                return False
            if _peek_pipe(h):
                chunk = _read_pipe(h)
                if chunk:
                    buf += chunk
                    while "\n" in buf:
                        line, buf = buf.split("\n", 1)
                        line = line.strip()
                        if not line:
                            continue
                        try:
                            msg = json.loads(line)
                            ev = msg.get("event")
                            if ev == "property-change":
                                log.debug("mpv IPC property-change: %s=%s",
                                          msg.get("name"), msg.get("data"))
                            elif ev:
                                log.debug("mpv IPC event: %s", ev)
                            # core-idle が false → 再生中
                            if (ev == "property-change"
                                    and msg.get("name") == "core-idle"
                                    and msg.get("data") is False):
                                log.info("mpv playback detected (core-idle=false)")
                                return True
                        except json.JSONDecodeError:
                            log.debug("IPC non-JSON line: %s", line[:100])
            else:
                time.sleep(0.1)
        log.warning("IPC monitoring timed out after %ds", timeout)
    except Exception as e:
        log.warning("IPC monitoring error: %s", e)
    finally:
        _close_handle(h)


def _make_ipc_name():
    """mpv IPC サーバー名を生成（Windows: named pipe, macOS/Linux: Unix socket）"""
    tag = uuid.uuid4().hex[:8]
    if IS_WINDOWS:
        return rf"\\.\pipe\stp-{tag}"
    return f"/tmp/stp-{tag}.sock"


# === アクションハンドラ ===

def handle_ping():
    tools = check_all_tools()
    return {"success": True, "tools": tools}


def _detect_and_notify_playback(pipe_name, proc):
    """mpv IPC で再生開始を検知し、playback_started を送信する。
    検知できなければ何もしない（元動画は再生され続ける）。"""
    if not pipe_name:
        return
    try:
        detected = wait_for_mpv_playback(pipe_name, proc, timeout=120)
    except Exception as e:
        log.warning("IPC detection failed: %s", e)
        return
    if detected:
        try:
            send_message({"event": "playback_started"})
        except (BrokenPipeError, OSError):
            log.debug("Port closed before playback notification")


def _open_stderr_log(name):
    """stderr 記録用ファイルを開く（診断用）"""
    try:
        return open(LOG_DIR / f"{name}.stderr.log", "w", encoding="utf-8")
    except OSError:
        return subprocess.DEVNULL


_CREATE_NO_WINDOW = subprocess.CREATE_NO_WINDOW if sys.platform == "win32" else 0


def _play_via_streamlink(url, quality, player_name, player_path, sl_path):
    """streamlink 経由で再生（ライブ配信向け）
    streamlink の出力ログを監視し、プレイヤー起動/エラーを検知してからレスポンスを返す。
    stdout はファイル出力 (パイプではない) のため、ホスト終了後も streamlink は影響を受けない。"""
    cmd = build_play_cmd_streamlink(url, quality, player_name, player_path, sl_path)
    log.info("Executing (streamlink): %s", cmd)

    sl_log = LOG_DIR / "streamlink.log"

    # PYTHONUNBUFFERED=1 で streamlink (Python製) の出力バッファリングを無効化
    env = os.environ.copy()
    env["PYTHONUNBUFFERED"] = "1"

    # stdout をファイルに出力 (パイプではないのでバッファ詰まりやパイプ破損の心配なし)
    sl_log_f = open(sl_log, "w", encoding="utf-8")
    proc = subprocess.Popen(cmd, stdout=sl_log_f, stderr=subprocess.STDOUT,
                            creationflags=_CREATE_NO_WINDOW, env=env)
    sl_log_f.close()  # 子プロセスが自身のハンドルで書き続ける

    # streamlink の出力ログを監視 (最大30秒)
    deadline = time.time() + 30
    while time.time() < deadline:
        rc = proc.poll()
        if rc is not None:
            content = _read_sl_log(sl_log)
            log.error("streamlink exited (rc=%d): %s", rc, content[:500])
            send_message({"success": False,
                          "error": f"streamlink: {content[-200:] or f'exit code {rc}'}"})
            return

        content = _read_sl_log(sl_log)

        if "Starting player:" in content:
            log.info("streamlink: player launch detected")
            send_message({"success": True, "pid": proc.pid, "tool": "streamlink"})
            return

        for line in content.split("\n"):
            line = line.strip()
            if line.startswith("error:") or "[cli][error]" in line:
                log.error("streamlink error: %s", line)
                send_message({"success": False, "error": f"streamlink: {line[:200]}"})
                return

        time.sleep(0.5)

    # 30秒タイムアウト: streamlink が応答しない = ストリームがオフラインの可能性
    content = _read_sl_log(sl_log)
    log.warning("streamlink monitoring timed out (30s), last output: %s", content[-200:])
    # プロセスを終了させる
    proc.terminate()
    send_message({"success": False,
                  "error": "streamlink 応答なし (30秒) — ストリームがオフラインの可能性があります"})


def _read_sl_log(path):
    """streamlink ログファイルを安全に読む"""
    try:
        return path.read_text(encoding="utf-8", errors="replace")
    except OSError:
        return ""


def _play_via_ytdlp(url, fmt, player_name, player_path, stream_type):
    """yt-dlp 経由で再生（VOD向け、事前解決 + フォールバック）"""
    player = player_path or find_tool(player_name) or player_name
    pipe_name = _make_ipc_name() if player_name == "mpv" else None

    # URL 事前解決を試行。失敗したら mpv 内蔵の yt-dlp にフォールバック
    try:
        cmd = _build_cmd_ytdlp_preresolved(url, fmt, player, player_name,
                                            stream_type, pipe_name)
    except Exception as e:
        log.warning("yt-dlp pre-resolution failed (%s), falling back to mpv internal", e)
        cmd = _build_cmd_ytdlp_direct(url, fmt, player, player_name,
                                       stream_type, pipe_name)

    log.info("Executing (yt-dlp): %s", cmd)
    stderr_f = _open_stderr_log("player")
    proc = subprocess.Popen(cmd, stdout=subprocess.DEVNULL, stderr=stderr_f,
                            creationflags=_CREATE_NO_WINDOW)
    send_message({"success": True, "pid": proc.pid, "tool": "yt-dlp"})
    _detect_and_notify_playback(pipe_name, proc)


def handle_play(msg):
    """再生コマンド。メッセージを直接送信する（戻り値なし）。"""
    url = msg.get("url", "")
    quality = msg.get("quality", "best")
    ytdlp_fmt = msg.get("ytdlpFormat", "bestvideo+bestaudio/best")
    player = msg.get("player", "mpv")
    player_path = msg.get("playerPath", "")
    tool_pref = msg.get("tool", "auto")
    stream_type = msg.get("streamType", "vod")

    if not url:
        send_message({"success": False, "error": "URLが指定されていません"})
        return

    tool = select_tool_for_url(url, stream_type, tool_pref)
    log.info("Play: url=%s tool=%s player=%s stream_type=%s", url, tool, player, stream_type)

    try:
        if tool == "streamlink":
            sl_path = find_tool("streamlink")
            if sl_path:
                _play_via_streamlink(url, quality, player, player_path, sl_path)
                return
            log.warning("streamlink not found, falling back to yt-dlp")

        _play_via_ytdlp(url, ytdlp_fmt, player, player_path, stream_type)

    except FileNotFoundError as e:
        send_message({"success": False, "error": f"実行ファイルが見つかりません: {e}"})
    except Exception as e:
        log.exception("Play failed")
        send_message({"success": False, "error": str(e)})


# === メインループ ===

def main():
    log.info("Native Host started (PID=%d)", os.getpid())

    while True:
        try:
            msg = read_message()
            if msg is None:
                break

            log.debug("Received: %s", msg)
            action = msg.get("action", "")

            if action == "play":
                handle_play(msg)  # 内部でメッセージを直接送信
                break  # play は one-shot（IPC 監視完了後に終了）
            else:
                if action == "ping":
                    response = handle_ping()
                else:
                    response = {"success": False, "error": f"Unknown action: {action}"}
                send_message(response)

        except Exception as e:
            log.exception("Unhandled error")
            try:
                send_message({"success": False, "error": str(e)})
            except Exception:
                break

    log.info("Native Host exiting.")


if __name__ == "__main__":
    main()
