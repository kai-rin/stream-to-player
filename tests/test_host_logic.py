"""
stream_to_player_host.py のツール選択ロジックのテスト
実行: python tests/test_host_logic.py
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent / "native-host"))
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
    ("https://www.youtube.com/live/abc", "live", "auto", "streamlink"),
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

# === 結果 ===
print(f"\n{'=' * 40}")
print(f"結果: {passed} passed, {failed} failed")
if failed > 0:
    sys.exit(1)
