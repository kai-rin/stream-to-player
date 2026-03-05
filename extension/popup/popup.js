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
};

async function init() {
  ui.settingsLink.addEventListener("click", () => {
    chrome.runtime.openOptionsPage();
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

function showStatus(html, type) {
  ui.status.innerHTML = html;
  ui.status.className = `status-${type}`;
}

init().catch(console.error);
