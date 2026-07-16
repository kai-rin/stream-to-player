"""
stream_to_player_host.py のツール選択ロジックのテスト
実行: python tests/test_host_logic.py
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent / "native-host"))
import stream_to_player_host as host
from stream_to_player_host import select_tool_for_url, extract_domain

passed = 0
failed = 0


def assert_eq(actual, expected, label):
    global passed, failed
    if actual == expected:
        passed += 1
    else:
        failed += 1
        print(f"  FAIL: {label}: expected={expected}, got={actual}")


def section(name):
    print(f"\n--- {name} ---")


# === ドメイン抽出 ===
section("ドメイン抽出 (extract_domain)")

domain_tests = [
    ("https://www.youtube.com/watch?v=abc", "youtube.com"),
    ("https://youtu.be/abc", "youtu.be"),
    ("https://www.twitch.tv/streamer", "twitch.tv"),
    ("https://abema.tv/now-on-air/news", "abema.tv"),
    ("https://tver.jp/episodes/abc", "tver.jp"),
    ("https://www.nicovideo.jp/watch/sm1234", "nicovideo.jp"),
    ("https://live.nicovideo.jp/watch/lv1234", "live.nicovideo.jp"),
    ("https://radiko.jp/#!/live/TBS", "radiko.jp"),
    ("https://twitter.com/user/status/123", "twitter.com"),
    ("https://x.com/user/status/789", "x.com"),
    ("https://www.tiktok.com/@user/video/123", "tiktok.com"),
    ("https://www.nhk.or.jp/p/ts/abc", "nhk.or.jp"),
    ("https://plus.nhk.jp/watch/abc", "plus.nhk.jp"),
    ("https://twitcasting.tv/user123", "twitcasting.tv"),
    ("https://video.fc2.com/content/123", "video.fc2.com"),
    ("https://live.fc2.com/12345", "live.fc2.com"),
    ("https://www.showroom-live.com/room", "showroom-live.com"),
    ("https://www.openrec.tv/live/abc", "openrec.tv"),
    ("https://live.bilibili.com/12345", "live.bilibili.com"),
    ("https://www.bilibili.com/video/BV123", "bilibili.com"),
    ("https://www.dailymotion.com/video/x123", "dailymotion.com"),
    ("https://dai.ly/x123", "dai.ly"),
    ("https://vimeo.com/12345678", "vimeo.com"),
    ("https://soundcloud.com/artist/track", "soundcloud.com"),
]

for url, expected in domain_tests:
    actual = extract_domain(url)
    assert_eq(actual, expected, url)

# === ツール選択 (auto) ===
section("ツール選択 - auto")

auto_tests = [
    # (url, stream_type, user_pref, expected_tool)
    # YouTube
    ("https://www.youtube.com/watch?v=abc", "vod", "auto", "yt-dlp"),
    # streamlink の YouTube プラグイン破損により live も yt-dlp
    ("https://www.youtube.com/live/abc", "live", "auto", "yt-dlp"),
    ("https://youtu.be/abc", "vod", "auto", "yt-dlp"),
    # Twitch
    ("https://www.twitch.tv/streamer", "live", "auto", "streamlink"),
    ("https://www.twitch.tv/videos/123", "vod", "auto", "yt-dlp"),
    # AbemaTV (streamlink only)
    ("https://abema.tv/now-on-air/news", "live", "auto", "streamlink"),
    ("https://abema.tv/video/episode/x", "vod", "auto", "streamlink"),
    # TVer (yt-dlp only)
    ("https://tver.jp/episodes/abc", "vod", "auto", "yt-dlp"),
    ("https://tver.jp/lives/abc", "live", "auto", "yt-dlp"),
    # ニコニコ
    ("https://www.nicovideo.jp/watch/sm1234", "vod", "auto", "yt-dlp"),
    ("https://live.nicovideo.jp/watch/lv1234", "live", "auto", "streamlink"),
    # Radiko (streamlink only)
    ("https://radiko.jp/#!/live/TBS", "live", "auto", "streamlink"),
    # X (Twitter) (yt-dlp only)
    ("https://twitter.com/user/status/123", "vod", "auto", "yt-dlp"),
    ("https://x.com/i/spaces/abc", "live", "auto", "yt-dlp"),
    # TikTok (yt-dlp only)
    ("https://www.tiktok.com/@user/video/123", "vod", "auto", "yt-dlp"),
    # NHK (yt-dlp only)
    ("https://www.nhk.or.jp/p/ts/abc", "vod", "auto", "yt-dlp"),
    ("https://plus.nhk.jp/watch/abc", "vod", "auto", "yt-dlp"),
    # TwitCasting
    ("https://twitcasting.tv/user123", "live", "auto", "streamlink"),
    ("https://twitcasting.tv/user123/movie/789", "vod", "auto", "yt-dlp"),
    # FC2 (yt-dlp only)
    ("https://video.fc2.com/content/123", "vod", "auto", "yt-dlp"),
    ("https://live.fc2.com/12345", "live", "auto", "yt-dlp"),
    # SHOWROOM
    ("https://www.showroom-live.com/room", "live", "auto", "streamlink"),
    # OPENREC
    ("https://www.openrec.tv/live/abc", "live", "auto", "streamlink"),
    ("https://www.openrec.tv/movie/abc", "vod", "auto", "yt-dlp"),
    # Bilibili
    ("https://live.bilibili.com/12345", "live", "auto", "streamlink"),
    ("https://www.bilibili.com/video/BV123", "vod", "auto", "yt-dlp"),
    # Dailymotion
    ("https://www.dailymotion.com/video/x123", "vod", "auto", "yt-dlp"),
    ("https://dai.ly/x123", "vod", "auto", "yt-dlp"),
    # Vimeo
    ("https://vimeo.com/12345678", "vod", "auto", "yt-dlp"),
    # SoundCloud (yt-dlp only)
    ("https://soundcloud.com/artist/track", "vod", "auto", "yt-dlp"),
    # 不明サイト
    ("https://unknown-site.com/video", "vod", "auto", "yt-dlp"),
    ("https://unknown-site.com/live", "live", "auto", "streamlink"),
]

for url, stream_type, pref, expected in auto_tests:
    actual = select_tool_for_url(url, stream_type, pref)
    assert_eq(actual, expected, f"{url} ({stream_type})")

# === ツール選択 (ユーザー指定) ===
section("ツール選択 - ユーザー手動指定")

override_tests = [
    # 通常のオーバーライド
    ("https://www.youtube.com/watch?v=abc", "vod", "streamlink", "streamlink"),
    ("https://www.twitch.tv/streamer", "live", "yt-dlp", "yt-dlp"),
    # サイト制限によるフォールバック
    ("https://abema.tv/video/episode/x", "vod", "yt-dlp", "streamlink"),   # abema: ytdlp_only → streamlink
    ("https://tver.jp/episodes/abc", "vod", "streamlink", "yt-dlp"),       # tver: streamlink_only → yt-dlp
    ("https://radiko.jp/#!/live/TBS", "live", "yt-dlp", "streamlink"),     # radiko: ytdlp_only → streamlink
    # 新規サイトのフォールバック
    ("https://twitter.com/user/status/123", "vod", "streamlink", "yt-dlp"),  # twitter: ytdlp_only
    ("https://x.com/i/spaces/abc", "live", "streamlink", "yt-dlp"),         # x.com: ytdlp_only
    ("https://www.tiktok.com/@user/video/123", "vod", "streamlink", "yt-dlp"),
    ("https://live.fc2.com/12345", "live", "streamlink", "yt-dlp"),          # fc2: ytdlp_only
    ("https://soundcloud.com/artist/track", "vod", "streamlink", "yt-dlp"), # soundcloud: ytdlp_only
]

for url, stream_type, pref, expected in override_tests:
    actual = select_tool_for_url(url, stream_type, pref)
    assert_eq(actual, expected, f"{url} override={pref}")

# === streamlink コマンド構築 ===
section("コマンド構築 (build_play_cmd_streamlink)")

import shlex

# mpv + IPC pipe: streamlink は --player-args を shlex.split (posix) で分割するため、
# named pipe のバックスラッシュが分割後も生き残ることを検証する
cmd = host.build_play_cmd_streamlink(
    "https://twitch.tv/x", "best", "mpv", "", "streamlink",
    pipe_name=r"\\.\pipe\stp-test")
player_args = cmd[cmd.index("--player-args") + 1]
tokens = shlex.split(player_args)
assert_eq(r"--input-ipc-server=\\.\pipe\stp-test" in tokens, True,
          "pipe name survives shlex.split")
assert_eq("--force-window" in tokens, True, "force-window present")

# pipe_name なし → input-ipc-server を含まない
cmd = host.build_play_cmd_streamlink(
    "https://twitch.tv/x", "best", "mpv", "", "streamlink")
player_args = cmd[cmd.index("--player-args") + 1]
assert_eq("--input-ipc-server" in player_args, False, "no ipc without pipe_name")

# IPv4 強制フラグ
assert_eq("-4" in cmd, True, "IPv4 forced")

# === yt-dlp 事前解決コマンド構築 ===
section("コマンド構築 (_build_cmd_ytdlp_preresolved)")

_orig_resolve = host._resolve_urls_ytdlp

# 映像+音声が別URLのケース
host._resolve_urls_ytdlp = lambda url, fmt, timeout=15: ["http://video", "http://audio"]

# mpv: --audio-file で音声を渡す
cmd = host._build_cmd_ytdlp_preresolved(
    "https://example.com/v", "best", "mpv.exe", "mpv", "vod", None)
assert_eq("--audio-file=http://audio" in cmd, True, "mpv: audio-file passed")
assert_eq(cmd[-1], "http://video", "mpv: video URL last")

# VLC: --input-slave で音声を渡す (分離URLでの無音バグの回帰テスト)
cmd = host._build_cmd_ytdlp_preresolved(
    "https://example.com/v", "best", "vlc.exe", "vlc", "vod", None)
assert_eq(cmd, ["vlc.exe", "http://video", "--input-slave=http://audio"],
          "vlc: input-slave for separate audio")

# 単一URLのケース: VLC に input-slave を付けない
host._resolve_urls_ytdlp = lambda url, fmt, timeout=15: ["http://muxed"]
cmd = host._build_cmd_ytdlp_preresolved(
    "https://example.com/v", "best", "vlc.exe", "vlc", "vod", None)
assert_eq(cmd, ["vlc.exe", "http://muxed"], "vlc: single muxed URL")

host._resolve_urls_ytdlp = _orig_resolve

# === yt-dlp エラー抽出 ===
section("エラー抽出 (_extract_ytdlp_error)")

stderr_sample = """WARNING: Your yt-dlp version (2026.03.03) is older than 90 days!
         It is strongly recommended to always use the latest version.
WARNING: [youtube] No supported JavaScript runtime could be found.
ERROR: [youtube] abc123: Video unavailable"""
assert_eq(host._extract_ytdlp_error(stderr_sample),
          "ERROR: [youtube] abc123: Video unavailable",
          "ERROR line extracted, WARNINGs dropped")
assert_eq(host._extract_ytdlp_error("some raw failure text"),
          "some raw failure text", "no ERROR line → raw text")
assert_eq(host._extract_ytdlp_error(""), "", "empty stderr")
assert_eq(host._extract_ytdlp_error(None), "", "None stderr")

# === streamlink エラー抽出 ===
section("エラー抽出 (_extract_sl_error)")

sl_output = """[cli][info] Found matching plugin youtube for URL https://example.com
error: Unable to open URL: https://www.youtube.com/youtubei/v1/player (400 Client Error)"""
assert_eq(host._extract_sl_error(sl_output, rc=1),
          "error: Unable to open URL: https://www.youtube.com/youtubei/v1/player (400 Client Error)",
          "error line extracted (not mid-line slice)")
assert_eq(host._extract_sl_error("", rc=1), "exit code 1", "empty output → exit code")
assert_eq(host._extract_sl_error("some tail text"), "some tail text", "no error line → tail")

# === mpv ゴーストウィンドウ防止 (--idle=no) ===
section("mpv --idle=no")

host._resolve_urls_ytdlp = lambda url, fmt, timeout=15: ["http://video"]
cmd = host._build_cmd_ytdlp_preresolved(
    "https://example.com/v", "best", "mpv.exe", "mpv", "vod", None)
assert_eq("--idle=no" in cmd, True, "preresolved: idle=no")
cmd = host._build_cmd_ytdlp_direct(
    "https://example.com/v", "best", "mpv.exe", "mpv", "vod", None)
assert_eq("--idle=no" in cmd, True, "direct: idle=no")
host._resolve_urls_ytdlp = _orig_resolve

cmd = host.build_play_cmd_streamlink(
    "https://twitch.tv/x", "best", "mpv", "", "streamlink")
assert_eq("--idle=no" in cmd[cmd.index("--player-args") + 1], True,
          "streamlink player-args: idle=no")

# === 結果 ===
print(f"\n{'=' * 40}")
print(f"結果: {passed} passed, {failed} failed")
if failed > 0:
    sys.exit(1)
