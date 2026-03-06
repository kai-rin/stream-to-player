# Stream to Player

ストリーミングサイト (YouTube, Twitch, AbemaTV 等 16サイト) の動画を mpv/vlc で再生する Chrome 拡張機能。Windows / macOS 対応。

## アーキテクチャ

```
[Popup] → runtime.sendMessage → [Service Worker] → connectNative → [Python Host]
                                      ↑                                 ↓
                                 declarativeContent              subprocess.Popen
                                 (対応サイトでのみ有効化)         streamlink / yt-dlp → mpv / vlc
```

## プロジェクト構成

- `extension/` - Chrome 拡張機能 (Manifest V3, ES Modules)
  - `manifest.json` - MV3 マニフェスト
  - `background.js` - Service Worker (declarativeContent, メッセージルーティング, connectNative)
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
- **再生方式 (yt-dlp)**: `yt-dlp -g` で URL 事前解決 → mpv に直接渡す高速パス。失敗時は `mpv --ytdl-format` にフォールバック
- **再生方式 (streamlink)**: `streamlink URL quality --player mpv`。stdout ファイル監視で「Starting player:」を検知
- **再生検知**: mpv IPC で `observe_property core-idle` を監視 (Windows: named pipe, macOS: Unix socket)
- **ツール自動選択**: ライブ → streamlink 優先、VOD → yt-dlp 優先。サイト固有制限あり (sites.js + SITE_TOOL_RULES)
- **IPv4 強制**: streamlink `-4`、yt-dlp `--force-ipv4` (IPv6 は Twitch 等で遅い)
- **Service Worker (MV3)**: リスナーはトップレベル登録必須。状態は `chrome.storage` に保持

## テスト成果物

- Playwright のスクリーンショット等は必ず `.playwright-mcp/` ディレクトリ内に保存する（例: `filename: ".playwright-mcp/screenshot.png"`）
- `.playwright-mcp/` は `.gitignore` 対象。プロジェクトルートに一時ファイルを生成しないこと

## サイト追加方法

1. `extension/sites.js` の `SITE_CONFIGS` にエントリ追加
2. `native-host/stream_to_player_host.py` の `SITE_TOOL_RULES` にルール追加
3. 拡張を再読み込み → declarativeContent ルールが自動更新
