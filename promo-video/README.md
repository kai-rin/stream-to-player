# Stream to Player - プロモーション動画

[Stream to Player](https://github.com/kai-rin/stream-to-player) Chrome拡張機能の30秒プロモーション動画を [Remotion](https://remotion.dev/) で制作するプロジェクトです。

## 動画構成（30秒 / 1920x1080 / 30fps）

| シーン | 秒数 | 内容 |
|--------|------|------|
| Scene 1: Hook | 0-4s | 「ブラウザ動画を外部プレイヤーで」+ アイコン |
| Scene 2: Problem | 4-9s | ブラウザ再生の不満（ごちゃごちゃUI→操作バラバラ→ストレス） |
| Scene 3: Demo | 9-22s | Twitch→ポップアップ→品質選択→mpv再生の操作フロー |
| Scene 4: Proof | 22-27s | 対応5サイト一覧 + mpv/VLC バッジ |
| Scene 5: CTA | 27-30s | 「Stream to Player」+ GitHub URL |

## 設計方針

- **モックベース実装**: 画面録画ではなく、拡張UIをReactコンポーネントとして再現
- **スクリーンショット駆動QA**: `npx remotion still` でキーフレームをキャプチャし、崩れた箇所のみ修正

## コマンド

```bash
# プレビュー（Remotion Studio）
npm run dev

# MP4レンダリング
npm run build

# GIFレンダリング
npm run build:gif

# TypeCheck
npx tsc --noEmit

# 特定フレームのキャプチャ
npx remotion still PromoVideo captures/frame-060.png --frame=60
```

## プロジェクト構造

```
promo-video/
├── src/
│   ├── index.ts              # エントリポイント
│   ├── Root.tsx               # Composition定義
│   ├── Composition.tsx        # TransitionSeriesでシーン接続
│   ├── utils/
│   │   ├── time.ts            # sec() ヘルパー, FPS定数
│   │   ├── styles.ts          # カラーパレット, フォント
│   │   └── animations.ts     # trapezoidFade, exitOpacity, spring設定
│   ├── mocks/
│   │   ├── MockPopup.tsx      # 拡張ポップアップUI再現
│   │   ├── MockBrowser.tsx    # Chrome風ブラウザフレーム
│   │   ├── MockVideoPlayer.tsx # ごちゃごちゃUI/エラー状態
│   │   ├── MockExternalPlayer.tsx # mpv/VLCプレーヤー風
│   │   └── SiteLogoBadge.tsx  # サイトバッジ + 5サイトデータ
│   └── scenes/
│       ├── Scene1Hook.tsx
│       ├── Scene2Problem.tsx
│       ├── Scene3Demo.tsx
│       ├── Scene4Proof.tsx
│       └── Scene5CTA.tsx
├── public/
│   └── icon128.png            # 拡張アイコン
├── captures/                  # QAフレームキャプチャ
└── out/
    └── promo.mp4              # 出力動画
```

## 使用Skillセット

- [remotion-promo-video-factory](https://github.com/nyosegawa/skills/tree/main/skills/remotion-promo-video-factory) — ワークフロー・QAガイド
- [remotion (公式)](https://github.com/remotion-dev/skills) — Remotion APIルール
