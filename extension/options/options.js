const DEFAULT_SETTINGS = {
  player: "mpv",
  playerPath: "",
  quality: "best",
  ytdlpFormat: "bestvideo+bestaudio/best",
  toolOverride: "auto",
};

const el = {
  playerMpv:         document.getElementById("player-mpv"),
  playerVlc:         document.getElementById("player-vlc"),
  playerPath:        document.getElementById("player-path"),
  toolAuto:          document.getElementById("tool-auto"),
  toolStreamlink:    document.getElementById("tool-streamlink"),
  toolYtdlp:         document.getElementById("tool-ytdlp"),
  qualityStreamlink: document.getElementById("quality-streamlink"),
  qualityYtdlp:      document.getElementById("quality-ytdlp"),
  btnSave:           document.getElementById("btn-save"),
  btnTest:           document.getElementById("btn-test"),
  btnReset:          document.getElementById("btn-reset"),
  statusMsg:         document.getElementById("status-msg"),
};

async function loadSettings() {
  const s = await chrome.storage.sync.get(DEFAULT_SETTINGS);
  el.playerMpv.checked = s.player === "mpv";
  el.playerVlc.checked = s.player === "vlc";
  el.playerPath.value = s.playerPath || "";
  el.toolAuto.checked = s.toolOverride === "auto";
  el.toolStreamlink.checked = s.toolOverride === "streamlink";
  el.toolYtdlp.checked = s.toolOverride === "yt-dlp";
  el.qualityStreamlink.value = s.quality || "best";
  el.qualityYtdlp.value = s.ytdlpFormat || "bestvideo+bestaudio/best";
}

function collectSettings() {
  return {
    player: el.playerMpv.checked ? "mpv" : "vlc",
    playerPath: el.playerPath.value.trim(),
    quality: el.qualityStreamlink.value,
    ytdlpFormat: el.qualityYtdlp.value,
    toolOverride: el.toolAuto.checked ? "auto"
      : el.toolStreamlink.checked ? "streamlink"
      : "yt-dlp",
  };
}

async function saveSettings() {
  await chrome.storage.sync.set(collectSettings());
  showStatus("設定を保存しました", "ok");
}

async function testConnection() {
  showStatus("接続テスト中...", "");
  try {
    const response = await chrome.runtime.sendMessage({ action: "checkHost" });
    if (response.success) {
      const tools = response.tools || {};
      const lines = Object.entries(tools)
        .map(([name, path]) => `  ${name}: ${path || "未検出"}`)
        .join("\n");
      showStatus(`接続OK\n${lines}`, "ok");
    } else {
      showStatus(`接続失敗: ${response.error}`, "error");
    }
  } catch (err) {
    showStatus(
      `ネイティブホストに接続できません。\ninstall.py を実行してください。\n\n${err.message}`,
      "error",
    );
  }
}

async function resetSettings() {
  if (!confirm("デフォルト設定に戻しますか？")) return;
  await chrome.storage.sync.set(DEFAULT_SETTINGS);
  await loadSettings();
  showStatus("デフォルト設定に戻しました", "ok");
}

function showStatus(msg, type) {
  el.statusMsg.textContent = msg;
  el.statusMsg.className = type;
}

el.btnSave.addEventListener("click", saveSettings);
el.btnTest.addEventListener("click", testConnection);
el.btnReset.addEventListener("click", resetSettings);

loadSettings().catch(console.error);
