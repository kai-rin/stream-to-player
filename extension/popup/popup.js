let currentPageInfo = null;
let isLoading = false;

const ui = {
  mainUi: document.getElementById("main-ui"),
  unsupported: document.getElementById("unsupported"),
  siteName: document.getElementById("site-name"),
  siteBadge: document.getElementById("site-badge"),
  pageTitle: document.getElementById("page-title"),
  qualitySelect: document.getElementById("quality-select"),
  toolName: document.getElementById("tool-name"),
  btnPlay: document.getElementById("btn-play"),
  status: document.getElementById("status"),
  settingsLink: document.getElementById("settings-link"),
  customUrlInput: document.getElementById("custom-url-input"),
  btnCustomPlay: document.getElementById("btn-custom-play"),
  customToolSelect: document.getElementById("custom-tool-select"),
  customQualitySelect: document.getElementById("custom-quality-select"),
  customStatus: document.getElementById("custom-status"),
};

const CUSTOM_QUALITIES = {
  "yt-dlp": [
    { label: "最高画質", value: "bestvideo+bestaudio/best" },
    { label: "1080p", value: "bestvideo[height<=1080]+bestaudio/best[height<=1080]" },
    { label: "720p", value: "bestvideo[height<=720]+bestaudio/best[height<=720]" },
    { label: "480p", value: "bestvideo[height<=480]+bestaudio/best[height<=480]" },
    { label: "音声のみ", value: "bestaudio" },
  ],
  "streamlink": ["best", "1080p", "720p", "480p", "worst", "audio_only"],
};

function updateCustomQualities() {
  const tool = ui.customToolSelect.value;
  const qualities = CUSTOM_QUALITIES[tool];
  ui.customQualitySelect.innerHTML = "";
  if (typeof qualities[0] === "string") {
    for (const q of qualities) {
      const opt = document.createElement("option");
      opt.value = q;
      opt.textContent = q === "best" ? "最高画質 (best)" : q;
      ui.customQualitySelect.appendChild(opt);
    }
  } else {
    for (const q of qualities) {
      const opt = document.createElement("option");
      opt.value = q.value;
      opt.textContent = q.label;
      ui.customQualitySelect.appendChild(opt);
    }
  }
}

async function init() {
  ui.settingsLink.addEventListener("click", () => {
    chrome.runtime.openOptionsPage();
  });

  // カスタムURL機能の初期化
  updateCustomQualities();
  ui.customToolSelect.addEventListener("change", updateCustomQualities);
  ui.btnCustomPlay.addEventListener("click", handleCustomPlay);
  ui.customUrlInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") handleCustomPlay();
  });

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab) {
    showUnsupported();
    return;
  }

  try {
    const info = await chrome.runtime.sendMessage({
      action: "getPageInfo",
      url: tab.url,
      title: tab.title,
    });

    if (!info.supported) {
      showUnsupported();
      return;
    }

    currentPageInfo = info;
    renderPageInfo(info);
  } catch (err) {
    showStatus(`エラー: ${err.message}`, "error");
    showUnsupported();
  }
}

function renderPageInfo(info) {
  ui.mainUi.style.display = "block";
  ui.unsupported.style.display = "none";

  ui.siteName.textContent = info.siteName;
  ui.pageTitle.textContent = info.title || "";

  if (info.streamType === "live") {
    ui.siteBadge.textContent = "LIVE";
    ui.siteBadge.className = "badge-live";
  } else {
    ui.siteBadge.textContent = "VOD";
    ui.siteBadge.className = "badge-vod";
  }

  ui.toolName.textContent = info.recommendedTool;

  // 品質選択肢を動的生成
  ui.qualitySelect.innerHTML = "";
  const qualities = info.qualities || [];

  if (qualities.length === 0) {
    const opt = document.createElement("option");
    opt.value = "best";
    opt.textContent = "最高画質 (best)";
    ui.qualitySelect.appendChild(opt);
  } else if (typeof qualities[0] === "string") {
    // streamlink形式
    for (const q of qualities) {
      const opt = document.createElement("option");
      opt.value = q;
      opt.textContent = q === "best" ? "最高画質 (best)" : q;
      ui.qualitySelect.appendChild(opt);
    }
  } else {
    // yt-dlp形式 { label, value }
    for (const q of qualities) {
      const opt = document.createElement("option");
      opt.value = q.value;
      opt.textContent = q.label;
      ui.qualitySelect.appendChild(opt);
    }
  }

  ui.btnPlay.addEventListener("click", handlePlay);
}

function showUnsupported() {
  ui.mainUi.style.display = "none";
  ui.unsupported.style.display = "block";
}

async function handlePlay() {
  if (isLoading || !currentPageInfo) return;

  setLoading(true);
  showStatus(
    `<span class="spinner"></span>起動中...`,
    "loading",
  );

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const response = await chrome.runtime.sendMessage({
      action: "play",
      url: tab.url,
      tabId: tab.id,
      quality: ui.qualitySelect.value,
      tool: currentPageInfo.recommendedTool,
      streamType: currentPageInfo.streamType,
    });

    if (response.success) {
      showStatus("再生を開始しました", "ok");
    } else {
      showStatus(`エラー: ${response.error}`, "error");
    }
  } catch (err) {
    showStatus(`エラー: ${err.message}`, "error");
  } finally {
    setLoading(false);
  }
}

function setLoading(loading) {
  isLoading = loading;
  ui.btnPlay.disabled = loading;
}

async function handleCustomPlay() {
  const url = ui.customUrlInput.value.trim();
  if (!url) {
    showCustomStatus("URLを入力してください", "error");
    return;
  }
  if (!/^https?:\/\//i.test(url)) {
    showCustomStatus("http:// または https:// で始まるURLを入力してください", "error");
    return;
  }

  ui.btnCustomPlay.disabled = true;
  showCustomStatus('<span class="spinner"></span>起動中...', "loading");

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const response = await chrome.runtime.sendMessage({
      action: "play",
      url,
      tabId: tab?.id,
      quality: ui.customQualitySelect.value,
      tool: ui.customToolSelect.value,
      streamType: "vod",
    });

    if (response.success) {
      showCustomStatus("再生を開始しました", "ok");
    } else {
      showCustomStatus(`エラー: ${response.error}`, "error");
    }
  } catch (err) {
    showCustomStatus(`エラー: ${err.message}`, "error");
  } finally {
    ui.btnCustomPlay.disabled = false;
  }
}

function showCustomStatus(html, type) {
  ui.customStatus.innerHTML = html;
  ui.customStatus.className = `status-${type}`;
}

function showStatus(html, type) {
  ui.status.innerHTML = html;
  ui.status.className = `status-${type}`;
}

init().catch(console.error);
