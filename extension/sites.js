// サイト別設定モジュール (ES Module)
// background.js から import して使用

export const SITE_CONFIGS = [
  {
    id: "youtube",
    name: "YouTube",
    hostSuffixes: ["youtube.com", "youtu.be"],
    urlPatterns: [
      /youtube\.com\/watch\?/,
      /youtube\.com\/live\//,
      /youtube\.com\/@[^/]+\/live/,
      /youtu\.be\//,
    ],
    isLivePattern: /youtube\.com\/(live\/|@[^/]+\/live)/,
    preferredTool: { live: "streamlink", vod: "yt-dlp" },
    streamlinkQualities: ["best", "1080p", "720p", "480p", "360p", "worst"],
    ytdlpFormats: [
      { label: "最高画質", value: "bestvideo+bestaudio/best" },
      { label: "1080p", value: "bestvideo[height<=1080]+bestaudio/best[height<=1080]" },
      { label: "720p", value: "bestvideo[height<=720]+bestaudio/best[height<=720]" },
      { label: "音声のみ", value: "bestaudio" },
    ],
  },
  {
    id: "twitch",
    name: "Twitch",
    hostSuffixes: ["twitch.tv"],
    urlPatterns: [/twitch\.tv\/.+/],
    isLivePattern: /twitch\.tv\/(?!videos\/|clip\/)[^/]+\/?$/,
    preferredTool: { live: "streamlink", vod: "yt-dlp" },
    streamlinkQualities: ["best", "1080p60", "720p60", "720p", "480p", "360p", "worst"],
    ytdlpFormats: [
      { label: "最高画質", value: "bestvideo+bestaudio/best" },
      { label: "音声のみ", value: "bestaudio" },
    ],
  },
  {
    id: "abema",
    name: "AbemaTV",
    hostSuffixes: ["abema.tv"],
    urlPatterns: [/abema\.tv\/(now-on-air|video|channels)\//],
    isLivePattern: /abema\.tv\/(now-on-air|channels)\//,
    preferredTool: { live: "streamlink", vod: "streamlink" },
    streamlinkQualities: ["best", "1080p", "720p", "480p", "360p", "worst"],
    ytdlpFormats: [],
    ytdlpUnsupported: true,
  },
  {
    id: "tver",
    name: "TVer",
    hostSuffixes: ["tver.jp"],
    urlPatterns: [/tver\.jp\/(episodes|lives|series)\//],
    isLivePattern: /tver\.jp\/lives\//,
    preferredTool: { live: "yt-dlp", vod: "yt-dlp" },
    streamlinkQualities: [],
    ytdlpFormats: [
      { label: "最高画質", value: "bestvideo+bestaudio/best" },
      { label: "音声のみ", value: "bestaudio" },
    ],
    streamlinkUnsupported: true,
  },
  {
    id: "nicovideo",
    name: "ニコニコ動画",
    hostSuffixes: ["nicovideo.jp", "live.nicovideo.jp"],
    urlPatterns: [/nicovideo\.jp\/(watch|live)\//],
    isLivePattern: /live\.nicovideo\.jp\/watch\//,
    preferredTool: { live: "streamlink", vod: "yt-dlp" },
    streamlinkQualities: ["best", "super_high", "high", "normal", "low", "worst"],
    ytdlpFormats: [
      { label: "最高画質", value: "bestvideo+bestaudio/best" },
    ],
  },
  {
    id: "radiko",
    name: "Radiko",
    hostSuffixes: ["radiko.jp"],
    urlPatterns: [/radiko\.jp\//],
    isLivePattern: /radiko\.jp/,
    preferredTool: { live: "streamlink", vod: "streamlink" },
    streamlinkQualities: ["best"],
    ytdlpFormats: [],
    ytdlpUnsupported: true,
    audioOnly: true,
  },
  {
    id: "twitter",
    name: "X (Twitter)",
    hostSuffixes: ["twitter.com", "x.com"],
    urlPatterns: [
      /(?:twitter|x)\.com\/\w+\/status\//,
      /(?:twitter|x)\.com\/i\/spaces\//,
    ],
    isLivePattern: /(?:twitter|x)\.com\/i\/spaces\//,
    preferredTool: { live: "yt-dlp", vod: "yt-dlp" },
    streamlinkQualities: [],
    ytdlpFormats: [
      { label: "最高画質", value: "bestvideo+bestaudio/best" },
      { label: "音声のみ", value: "bestaudio" },
    ],
    streamlinkUnsupported: true,
  },
  {
    id: "tiktok",
    name: "TikTok",
    hostSuffixes: ["tiktok.com"],
    urlPatterns: [/tiktok\.com\/@[^/]+/],
    isLivePattern: /tiktok\.com\/@[^/]+\/live/,
    preferredTool: { live: "yt-dlp", vod: "yt-dlp" },
    streamlinkQualities: [],
    ytdlpFormats: [
      { label: "最高画質", value: "bestvideo+bestaudio/best" },
    ],
    streamlinkUnsupported: true,
  },
  {
    id: "twitcasting",
    name: "TwitCasting",
    hostSuffixes: ["twitcasting.tv"],
    urlPatterns: [/twitcasting\.tv\/[^/]+/],
    isLivePattern: /twitcasting\.tv\/[^/]+\/?$/,
    preferredTool: { live: "streamlink", vod: "yt-dlp" },
    streamlinkQualities: ["best", "high", "low", "worst"],
    ytdlpFormats: [
      { label: "最高画質", value: "bestvideo+bestaudio/best" },
    ],
  },
  {
    id: "fc2",
    name: "FC2",
    hostSuffixes: ["fc2.com"],
    urlPatterns: [
      /video\.fc2\.com\/content\//,
      /live\.fc2\.com\/\d+/,
    ],
    isLivePattern: /live\.fc2\.com\//,
    preferredTool: { live: "yt-dlp", vod: "yt-dlp" },
    streamlinkQualities: [],
    ytdlpFormats: [
      { label: "最高画質", value: "bestvideo+bestaudio/best" },
    ],
    streamlinkUnsupported: true,
  },
  {
    id: "showroom",
    name: "SHOWROOM",
    hostSuffixes: ["showroom-live.com"],
    urlPatterns: [/showroom-live\.com\/[^/]+/],
    isLivePattern: /showroom-live\.com\//,
    preferredTool: { live: "streamlink", vod: "yt-dlp" },
    streamlinkQualities: ["best", "high", "low", "worst"],
    ytdlpFormats: [
      { label: "最高画質", value: "bestvideo+bestaudio/best" },
    ],
  },
  {
    id: "openrec",
    name: "OPENREC.tv",
    hostSuffixes: ["openrec.tv"],
    urlPatterns: [/openrec\.tv\/(live|movie)\//],
    isLivePattern: /openrec\.tv\/live\//,
    preferredTool: { live: "streamlink", vod: "yt-dlp" },
    streamlinkQualities: ["best", "high", "low", "worst"],
    ytdlpFormats: [
      { label: "最高画質", value: "bestvideo+bestaudio/best" },
    ],
  },
  {
    id: "bilibili",
    name: "Bilibili",
    hostSuffixes: ["bilibili.com"],
    urlPatterns: [
      /bilibili\.com\/video\//,
      /live\.bilibili\.com\/\d+/,
      /bilibili\.com\/bangumi\//,
    ],
    isLivePattern: /live\.bilibili\.com\//,
    preferredTool: { live: "streamlink", vod: "yt-dlp" },
    streamlinkQualities: ["best", "high", "low", "worst"],
    ytdlpFormats: [
      { label: "最高画質", value: "bestvideo+bestaudio/best" },
      { label: "1080p", value: "bestvideo[height<=1080]+bestaudio/best[height<=1080]" },
      { label: "720p", value: "bestvideo[height<=720]+bestaudio/best[height<=720]" },
    ],
  },
  {
    id: "dailymotion",
    name: "Dailymotion",
    hostSuffixes: ["dailymotion.com", "dai.ly"],
    urlPatterns: [
      /dailymotion\.com\/video\//,
      /dai\.ly\/[a-zA-Z0-9]+/,
    ],
    preferredTool: { live: "yt-dlp", vod: "yt-dlp" },
    streamlinkQualities: ["best", "1080p", "720p", "480p", "worst"],
    ytdlpFormats: [
      { label: "最高画質", value: "bestvideo+bestaudio/best" },
      { label: "720p", value: "bestvideo[height<=720]+bestaudio/best[height<=720]" },
    ],
  },
  {
    id: "vimeo",
    name: "Vimeo",
    hostSuffixes: ["vimeo.com"],
    urlPatterns: [/vimeo\.com\/\d+/],
    preferredTool: { live: "yt-dlp", vod: "yt-dlp" },
    streamlinkQualities: ["best", "1080p", "720p", "480p", "worst"],
    ytdlpFormats: [
      { label: "最高画質", value: "bestvideo+bestaudio/best" },
      { label: "720p", value: "bestvideo[height<=720]+bestaudio/best[height<=720]" },
    ],
  },
  {
    id: "soundcloud",
    name: "SoundCloud",
    hostSuffixes: ["soundcloud.com"],
    urlPatterns: [/soundcloud\.com\/[^/]+\/[^/]+/],
    preferredTool: { live: "yt-dlp", vod: "yt-dlp" },
    streamlinkQualities: [],
    ytdlpFormats: [
      { label: "最高音質", value: "bestaudio" },
    ],
    streamlinkUnsupported: true,
    audioOnly: true,
  },
];

export function detectSite(url) {
  try {
    const hostname = new URL(url).hostname.replace(/^www\./, "");
    return SITE_CONFIGS.find(site =>
      site.hostSuffixes.some(suffix => hostname === suffix || hostname.endsWith("." + suffix))
    ) || null;
  } catch {
    return null;
  }
}

export function detectStreamType(url, siteConfig) {
  if (!siteConfig || !siteConfig.isLivePattern) return "unknown";
  return siteConfig.isLivePattern.test(url) ? "live" : "vod";
}

export function selectTool(siteConfig, streamType, userPrefs) {
  const override = userPrefs.toolOverride;
  if (override && override !== "auto") {
    if (override === "streamlink" && siteConfig.streamlinkUnsupported) return "yt-dlp";
    if (override === "yt-dlp" && siteConfig.ytdlpUnsupported) return "streamlink";
    return override;
  }
  const type = streamType === "unknown" ? "vod" : streamType;
  return siteConfig.preferredTool[type] || "yt-dlp";
}
