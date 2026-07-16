import { detectSite, detectStreamType, selectTool } from "./sites.js";

const NATIVE_HOST_NAME = "com.stream_to_player.host";

const DEFAULT_SETTINGS = {
  player: "mpv",
  playerPath: "",
  quality: "best",
  ytdlpFormat: "bestvideo+bestaudio/best",
  toolOverride: "auto",
  theme: "system",
};

// デフォルト設定の初期化
chrome.runtime.onInstalled.addListener(async () => {
  // 既存の設定は上書きしない
  const existing = await chrome.storage.sync.get(null);
  const toSet = {};
  for (const [key, val] of Object.entries(DEFAULT_SETTINGS)) {
    if (existing[key] === undefined) toSet[key] = val;
  }
  if (Object.keys(toSet).length > 0) {
    await chrome.storage.sync.set(toSet);
  }
});

// メッセージハンドラ
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "playProgress") return false; // popup宛のブロードキャスト
  handleMessage(message).then(sendResponse).catch(err => {
    sendResponse({ success: false, error: err.message });
  });
  return true;
});

async function handleMessage(message) {
  switch (message.action) {
    case "getPageInfo":
      return handleGetPageInfo(message);
    case "play":
      return handlePlay(message);
    case "checkHost":
      return sendToNativeHost({ action: "ping" });
    default:
      throw new Error(`Unknown action: ${message.action}`);
  }
}

async function handleGetPageInfo(message) {
  const { url, title } = message;
  const siteConfig = detectSite(url);
  if (!siteConfig) {
    return { supported: false };
  }

  const streamType = detectStreamType(url, siteConfig);
  const settings = await chrome.storage.sync.get(DEFAULT_SETTINGS);
  const tool = selectTool(siteConfig, streamType, settings);

  return {
    supported: true,
    siteId: siteConfig.id,
    siteName: siteConfig.name,
    streamType,
    recommendedTool: tool,
    url,
    title,
    qualities: tool === "streamlink"
      ? siteConfig.streamlinkQualities
      : siteConfig.ytdlpFormats,
    audioOnly: siteConfig.audioOnly || false,
  };
}

async function handlePlay(message) {
  const settings = await chrome.storage.sync.get(DEFAULT_SETTINGS);

  return new Promise((resolve, reject) => {
    let port;
    try {
      port = chrome.runtime.connectNative(NATIVE_HOST_NAME);
    } catch (err) {
      reject(new Error(`ネイティブホストへの接続失敗: ${err.message}`));
      return;
    }

    // streamlink 監視 (最大30s) + yt-dlp フォールバック解決 (最大15s) が
    // 低速回線で直列に発生しても収まるよう余裕を持たせる
    const timeout = setTimeout(() => {
      port.disconnect();
      reject(new Error("ネイティブホストのタイムアウト (90s)"));
    }, 90000);

    let resolved = false;

    let disconnected = false;

    port.onMessage.addListener((response) => {
      void chrome.runtime.lastError; // Unchecked 警告防止
      if (response.event === "progress") {
        // ホストの処理状況をポップアップに中継 (ポップアップが閉じていても無視)
        chrome.runtime.sendMessage({
          action: "playProgress",
          message: response.message,
        }).catch(() => {});
        return;
      }
      if (response.event === "playback_started") {
        // 再生開始 → 元動画を停止
        if (message.tabId) {
          chrome.scripting.executeScript({
            target: { tabId: message.tabId },
            func: () => document.querySelectorAll("video").forEach(v => v.pause()),
          }).catch(() => {});
        }
        if (!disconnected) port.disconnect();
        return;
      }

      // 初回レスポンス（起動結果）
      clearTimeout(timeout);
      resolved = true;
      resolve(response);
    });

    port.onDisconnect.addListener(() => {
      disconnected = true;
      clearTimeout(timeout);
      const err = chrome.runtime.lastError; // 必ず読み取って "Unchecked" 警告を防ぐ
      if (!resolved) {
        reject(new Error(`ホスト切断: ${err?.message || "不明"}`));
      }
    });

    // quality は選択ツールに対応するフィールドにのみ渡す。
    // ホスト側でツールが切り替わった場合 (フォールバック/サイト制限) に
    // 異種フォーマット文字列が流用されるのを防ぐ
    const tool = message.tool || settings.toolOverride;
    port.postMessage({
      action: "play",
      url: message.url,
      tool,
      quality: tool === "yt-dlp"
        ? settings.quality
        : (message.quality || settings.quality),
      ytdlpFormat: tool === "streamlink"
        ? settings.ytdlpFormat
        : (message.quality || settings.ytdlpFormat),
      player: settings.player,
      playerPath: settings.playerPath,
      streamType: message.streamType || "vod",
    });
  });
}

function sendToNativeHost(command) {
  return new Promise((resolve, reject) => {
    let port;
    try {
      port = chrome.runtime.connectNative(NATIVE_HOST_NAME);
    } catch (err) {
      reject(new Error(`ネイティブホストへの接続失敗: ${err.message}`));
      return;
    }

    const timeout = setTimeout(() => {
      port.disconnect();
      reject(new Error("ネイティブホストのタイムアウト (30s)"));
    }, 30000);

    port.onMessage.addListener((response) => {
      void chrome.runtime.lastError;
      clearTimeout(timeout);
      port.disconnect();
      resolve(response);
    });

    port.onDisconnect.addListener(() => {
      clearTimeout(timeout);
      const err = chrome.runtime.lastError;
      if (err) {
        reject(new Error(`ホスト切断: ${err.message}`));
      }
    });

    port.postMessage(command);
  });
}
