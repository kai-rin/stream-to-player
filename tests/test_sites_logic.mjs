/**
 * sites.js のサイト検出・ストリームタイプ判定・ツール選択ロジックのテスト
 * 実行: node tests/test_sites_logic.mjs
 */

import { SITE_CONFIGS, detectSite, detectStreamType, selectTool } from "../extension/sites.js";

let passed = 0;
let failed = 0;

function assert(condition, label) {
  if (condition) {
    passed++;
  } else {
    failed++;
    console.error(`  FAIL: ${label}`);
  }
}

function section(name) {
  console.log(`\n--- ${name} ---`);
}

// === サイト検出 ===
section("サイト検出 (detectSite)");

const siteTests = [
  // YouTube
  ["https://www.youtube.com/watch?v=bd_ce2CehyM", "youtube"],
  ["https://youtube.com/watch?v=abc123", "youtube"],
  ["https://youtu.be/abc123", "youtube"],
  ["https://www.youtube.com/live/abc123", "youtube"],
  ["https://www.youtube.com/@channel/live", "youtube"],
  // Twitch
  ["https://www.twitch.tv/streamer_name", "twitch"],
  ["https://www.twitch.tv/videos/1234567890", "twitch"],
  ["https://twitch.tv/clip/ClipName", "twitch"],
  // AbemaTV
  ["https://abema.tv/now-on-air/abema-news", "abema"],
  ["https://abema.tv/video/episode/xxx", "abema"],
  ["https://abema.tv/channels/abema-news", "abema"],
  // TVer
  ["https://tver.jp/episodes/abc123", "tver"],
  ["https://tver.jp/lives/abc123", "tver"],
  ["https://tver.jp/series/abc123", "tver"],
  // ニコニコ
  ["https://www.nicovideo.jp/watch/sm1234", "nicovideo"],
  ["https://live.nicovideo.jp/watch/lv1234", "nicovideo"],
  // Radiko
  ["https://radiko.jp/#!/live/TBS", "radiko"],
  // X (Twitter)
  ["https://twitter.com/user/status/123456", "twitter"],
  ["https://x.com/user/status/789", "twitter"],
  ["https://x.com/i/spaces/abc123", "twitter"],
  // TikTok
  ["https://www.tiktok.com/@user/video/123", "tiktok"],
  ["https://www.tiktok.com/@user/live", "tiktok"],
  // NHK
  ["https://www.nhk.or.jp/p/program/ts/abc", "nhk"],
  ["https://www.nhk.or.jp/school/movie/bangumi.cgi", "nhk"],
  ["https://www.nhk.or.jp/radiru/player/", "nhk"],
  ["https://plus.nhk.jp/watch/abc123", "nhk"],
  // TwitCasting
  ["https://twitcasting.tv/user123", "twitcasting"],
  ["https://twitcasting.tv/user123/movie/789", "twitcasting"],
  // FC2
  ["https://video.fc2.com/content/123", "fc2"],
  ["https://live.fc2.com/12345", "fc2"],
  // SHOWROOM
  ["https://www.showroom-live.com/room123", "showroom"],
  // OPENREC
  ["https://www.openrec.tv/live/abc", "openrec"],
  ["https://www.openrec.tv/movie/abc", "openrec"],
  // Bilibili
  ["https://www.bilibili.com/video/BV123", "bilibili"],
  ["https://live.bilibili.com/12345", "bilibili"],
  ["https://www.bilibili.com/bangumi/play/ep123", "bilibili"],
  // Dailymotion
  ["https://www.dailymotion.com/video/x123", "dailymotion"],
  ["https://dai.ly/x123abc", "dailymotion"],
  // Vimeo
  ["https://vimeo.com/12345678", "vimeo"],
  // SoundCloud
  ["https://soundcloud.com/artist/track-name", "soundcloud"],
  // 非対応サイト
  ["https://www.google.com", null],
  ["https://example.com", null],
  ["https://netflix.com/watch/123", null],
];

for (const [url, expectedId] of siteTests) {
  const site = detectSite(url);
  const actualId = site ? site.id : null;
  assert(actualId === expectedId, `${url} → expected=${expectedId}, got=${actualId}`);
}

// === ストリームタイプ判定 ===
section("ストリームタイプ判定 (detectStreamType)");

const streamTypeTests = [
  // YouTube
  ["https://www.youtube.com/watch?v=abc123", "youtube", "vod"],
  ["https://www.youtube.com/live/abc123", "youtube", "live"],
  ["https://www.youtube.com/@channel/live", "youtube", "live"],
  ["https://youtu.be/abc123", "youtube", "vod"],
  // Twitch
  ["https://www.twitch.tv/streamer_name", "twitch", "live"],
  ["https://www.twitch.tv/videos/1234567890", "twitch", "vod"],
  ["https://www.twitch.tv/clip/ClipName", "twitch", "vod"],
  // AbemaTV
  ["https://abema.tv/now-on-air/abema-news", "abema", "live"],
  ["https://abema.tv/video/episode/xxx", "abema", "vod"],
  ["https://abema.tv/channels/abema-news", "abema", "live"],
  // TVer
  ["https://tver.jp/episodes/abc123", "tver", "vod"],
  ["https://tver.jp/lives/abc123", "tver", "live"],
  // ニコニコ
  ["https://www.nicovideo.jp/watch/sm1234", "nicovideo", "vod"],
  ["https://live.nicovideo.jp/watch/lv1234", "nicovideo", "live"],
  // Radiko
  ["https://radiko.jp/#!/live/TBS", "radiko", "live"],
  // X (Twitter)
  ["https://twitter.com/user/status/123456", "twitter", "vod"],
  ["https://x.com/i/spaces/abc123", "twitter", "live"],
  // TikTok
  ["https://www.tiktok.com/@user/video/123", "tiktok", "vod"],
  ["https://www.tiktok.com/@user/live", "tiktok", "live"],
  // NHK
  ["https://www.nhk.or.jp/p/program/ts/abc", "nhk", "vod"],
  ["https://www.nhk.or.jp/radiru/toppage/player/", "nhk", "live"],
  // TwitCasting
  ["https://twitcasting.tv/user123", "twitcasting", "live"],
  ["https://twitcasting.tv/user123/movie/789", "twitcasting", "vod"],
  // FC2
  ["https://video.fc2.com/content/123", "fc2", "vod"],
  ["https://live.fc2.com/12345", "fc2", "live"],
  // SHOWROOM (常にlive)
  ["https://www.showroom-live.com/room123", "showroom", "live"],
  // OPENREC
  ["https://www.openrec.tv/live/abc", "openrec", "live"],
  ["https://www.openrec.tv/movie/abc", "openrec", "vod"],
  // Bilibili
  ["https://www.bilibili.com/video/BV123", "bilibili", "vod"],
  ["https://live.bilibili.com/12345", "bilibili", "live"],
  // Dailymotion (isLivePatternなし → unknown)
  ["https://www.dailymotion.com/video/x123", "dailymotion", "unknown"],
  // Vimeo (isLivePatternなし → unknown)
  ["https://vimeo.com/12345678", "vimeo", "unknown"],
  // SoundCloud (isLivePatternなし → unknown)
  ["https://soundcloud.com/artist/track-name", "soundcloud", "unknown"],
];

for (const [url, siteId, expectedType] of streamTypeTests) {
  const site = SITE_CONFIGS.find(s => s.id === siteId);
  const actual = detectStreamType(url, site);
  assert(actual === expectedType, `${url} → expected=${expectedType}, got=${actual}`);
}

// === ツール選択 ===
section("ツール選択 (selectTool)");

const autoPrefs = { toolOverride: "auto" };

const toolTests = [
  // 自動選択
  ["youtube", "vod", autoPrefs, "yt-dlp"],
  ["youtube", "live", autoPrefs, "streamlink"],
  ["twitch", "live", autoPrefs, "streamlink"],
  ["twitch", "vod", autoPrefs, "yt-dlp"],
  ["abema", "live", autoPrefs, "streamlink"],
  ["abema", "vod", autoPrefs, "streamlink"],
  ["tver", "vod", autoPrefs, "yt-dlp"],
  ["tver", "live", autoPrefs, "yt-dlp"],
  ["nicovideo", "vod", autoPrefs, "yt-dlp"],
  ["nicovideo", "live", autoPrefs, "streamlink"],
  ["radiko", "live", autoPrefs, "streamlink"],
  // 新規追加サイト
  ["twitter", "vod", autoPrefs, "yt-dlp"],
  ["twitter", "live", autoPrefs, "yt-dlp"],
  ["tiktok", "vod", autoPrefs, "yt-dlp"],
  ["tiktok", "live", autoPrefs, "yt-dlp"],
  ["nhk", "vod", autoPrefs, "yt-dlp"],
  ["twitcasting", "live", autoPrefs, "streamlink"],
  ["twitcasting", "vod", autoPrefs, "yt-dlp"],
  ["fc2", "live", autoPrefs, "yt-dlp"],
  ["fc2", "vod", autoPrefs, "yt-dlp"],
  ["showroom", "live", autoPrefs, "streamlink"],
  ["openrec", "live", autoPrefs, "streamlink"],
  ["openrec", "vod", autoPrefs, "yt-dlp"],
  ["bilibili", "live", autoPrefs, "streamlink"],
  ["bilibili", "vod", autoPrefs, "yt-dlp"],
  ["dailymotion", "unknown", autoPrefs, "yt-dlp"],
  ["vimeo", "unknown", autoPrefs, "yt-dlp"],
  ["soundcloud", "unknown", autoPrefs, "yt-dlp"],
  // サイト制限によるフォールバック (新規サイト)
  ["twitter", "vod", { toolOverride: "streamlink" }, "yt-dlp"],   // streamlink非対応→yt-dlp
  ["fc2", "vod", { toolOverride: "streamlink" }, "yt-dlp"],       // streamlink非対応→yt-dlp
  ["soundcloud", "vod", { toolOverride: "streamlink" }, "yt-dlp"], // streamlink非対応→yt-dlp
  // ユーザー手動指定
  ["youtube", "vod", { toolOverride: "streamlink" }, "streamlink"],
  ["youtube", "live", { toolOverride: "yt-dlp" }, "yt-dlp"],
  // サイト制限によるフォールバック
  ["abema", "vod", { toolOverride: "yt-dlp" }, "streamlink"],      // abema: yt-dlp非対応→streamlink
  ["tver", "vod", { toolOverride: "streamlink" }, "yt-dlp"],       // tver: streamlink非対応→yt-dlp
  // unknown stream type → vod扱い
  ["youtube", "unknown", autoPrefs, "yt-dlp"],
];

for (const [siteId, streamType, prefs, expectedTool] of toolTests) {
  const site = SITE_CONFIGS.find(s => s.id === siteId);
  const actual = selectTool(site, streamType, prefs);
  assert(
    actual === expectedTool,
    `${siteId}/${streamType} (${prefs.toolOverride}) → expected=${expectedTool}, got=${actual}`,
  );
}

// === 結果 ===
console.log(`\n${"=".repeat(40)}`);
console.log(`結果: ${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
