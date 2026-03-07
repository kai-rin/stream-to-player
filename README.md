# Stream to Player

ストリーミングサイトの動画を mpv や VLC で直接再生する Chrome 拡張機能。

<div align="center">
  <video src="https://github.com/kai-rin/stream-to-player/raw/main/promo-video/out/promo.mp4" width="720" autoplay loop muted playsinline></video>
  <br>
  <sub>▶ 動画が表示されない場合は <a href="promo-video/out/promo.mp4">こちらからダウンロード</a></sub>
</div>

### なぜ外部プレイヤーで再生するのか

mpv や VLC などの専用プレイヤーに切り替えると:

- **独立** — 再生中のタブから離れても動画が途切れない。ブラウジングしながらの"ながら見"に最適
- **自由** — 再生速度・音量・字幕・スクリーンショットなどをキーボードで細かく操作できる
- **快適** — サイトごとの UI の違いを気にせず、使い慣れたプレイヤーに統一できる
- **シンプル** — 余計な要素のない、動画だけに集中できるすっきりした視聴体験

ブラウザで動画ページを開き、ワンクリックで外部プレイヤーに送れます。ライブ配信には streamlink、VOD には yt-dlp を自動選択し、サイトごとに最適なツールで再生します。

> **Claude Code / Codex などの AI コーディングツールをお使いの方へ:** このリポジトリの URL を渡して「セットアップして」と伝えれば、外部ツールのインストールからネイティブホストの登録まで大部分を自動でやってくれます。Chrome 拡張の読み込み (ステップ 2) だけは手動で行ってください。

## 対応サイト

| サイト | Live | VOD | ツール |
|--------|:----:|:---:|--------|
| YouTube | o | o | streamlink / yt-dlp |
| Twitch | o | o | streamlink / yt-dlp |
| Abema | o | o | streamlink |
| TVer | o | o | yt-dlp |
| ニコニコ動画 | o | o | streamlink / yt-dlp |

## 動作要件

| 項目 | 要件 |
|------|------|
| OS | Windows 10 / 11、macOS (実験的) |
| ブラウザ | Chrome 91+ / Edge 91+ / Brave |
| Python | 3.8 以上 ([python.org](https://www.python.org/downloads/) からインストール) |

> Python のインストール時に「Add python.exe to PATH」にチェックを入れてください。これを忘れるとコマンドプロンプトから `python` が実行できません。

> macOS にもコード上は対応していますが、十分なテストができていません。不具合があれば Issue で報告してください。

### 外部ツール

最低限 streamlink または yt-dlp のどちらか1つと、mpv または VLC のどちらか1つが必要です。全て揃えると全サイト・全機能が使えます。

| ツール | 用途 | 備考 |
|--------|------|------|
| [streamlink](https://streamlink.github.io/) | ライブ配信の取得 | Twitch・YouTube Live 等のリアルタイム配信向け |
| [yt-dlp](https://github.com/yt-dlp/yt-dlp) | VOD 取得・URL 解決 | TVer・アーカイブ動画等のオンデマンド配信向け |
| [mpv](https://mpv.io/) | 動画再生 (推奨) | 再生検知に対応。再生開始時にブラウザ側の動画を自動停止します |
| [VLC](https://www.videolan.org/) | 動画再生 (代替) | 再生はできるが、再生検知は非対応 |

## インストール

### 0. このプロジェクトを配置する

このページ上部の緑色の「Code」ボタン →「Download ZIP」をクリックして zip をダウンロードしてください。展開したフォルダをわかりやすい場所に移動してください。拡張機能のフォルダは今後も参照され続けるため、「ダウンロード」フォルダに置いたままにしないでください。

> git を使える方は `git clone` でも構いません。

おすすめの配置先:

```
C:\Users\（ユーザー名）\Apps\stream-to-player
```

> 自分でファイル管理ができる方は、好きな場所に置いて構いません。以降の手順ではこの配置先を例として使います。

### 1. 外部ツールをインストールする

以下のリンクから各ツールのインストーラーをダウンロードして実行してください。

プレイヤー (どちらか1つ以上):

- mpv (推奨): https://mpv.io/installation/ → Windows builds をダウンロード
  - zip を展開し、中の `mpv.exe` があるフォルダを PATH に追加してください（手順は下記）
- VLC: https://www.videolan.org/vlc/ → 「ダウンロード VLC」ボタンからインストーラーを実行
  - デフォルト設定のままインストールすれば OK

配信取得ツール (どちらか1つ以上):

- streamlink: https://streamlink.github.io/install.html → Windows Installer をダウンロードして実行
- yt-dlp: https://github.com/yt-dlp/yt-dlp/releases → `yt-dlp.exe` をダウンロードし、PATH の通ったフォルダに置く（手順は下記）

> pip に慣れている方は `pip install streamlink yt-dlp` でもインストールできます。

<details>
<summary>PATH の追加方法（mpv や yt-dlp をコマンドプロンプトから使えるようにする）</summary>

mpv の zip を展開したフォルダや、`yt-dlp.exe` を置いたフォルダを PATH に追加すると、どこからでもコマンドで実行できるようになります。

1. `Win` キーを押し、「環境変数」と入力 →「システム環境変数の編集」を開く
2. 右下の「環境変数」ボタンをクリック
3. 上段の「ユーザー環境変数」から `Path` を選び、「編集」をクリック
4. 「新規」をクリックし、追加したいフォルダのパスを入力
   - 例: mpv を `C:\Tools\mpv` に展開した場合 → `C:\Tools\mpv` を追加
   - 例: yt-dlp.exe を `C:\Tools` に置いた場合 → `C:\Tools` を追加
5. OK を押してすべてのダイアログを閉じる
6. コマンドプロンプトを開き直す（既に開いているウィンドウには反映されません）

</details>

インストール確認: コマンドプロンプト (または PowerShell) を開き、以下を1行ずつ実行してバージョンが表示されれば成功です。

```
streamlink --version
```
```
yt-dlp --version
```
```
mpv --version
```

### 2. Chrome 拡張機能を読み込む

1. Chrome のアドレスバーに `chrome://extensions/` と入力して開く
2. 画面右上の「デベロッパーモード」のスイッチをオンにする
3. 左上に現れる「パッケージ化されていない拡張機能を読み込む」をクリック
4. ステップ 0 で配置したフォルダの中にある `extension` フォルダを選択 (例: `C:\Users\（ユーザー名）\Apps\stream-to-player\extension`)
5. 拡張機能が追加され、カードに拡張機能 ID (`kcppnao...` のような32文字の英字) が表示されます。次のステップで使うので控えておいてください

### 3. Chrome 拡張と外部プレイヤーをつなぐ

Chrome 拡張はセキュリティ上の制限でパソコン上のアプリ (mpv など) を直接起動できません。そこで「中継プログラム」を Windows に登録して、拡張 → 中継プログラム → mpv という橋渡しを行います。この登録を自動で行うスクリプトが用意されています。

1. コマンドプロンプトを開く
   - キーボードの `Win` キーを押し、「cmd」と入力して Enter

2. プロジェクトの `native-host` フォルダに移動する
   - ステップ 0 の例に合わせると:
   ```
   cd C:\Users\（ユーザー名）\Apps\stream-to-player\native-host
   ```

3. 登録スクリプトを実行する
   ```
   python install.py
   ```

4. 拡張機能 ID の入力: ステップ 2 で控えた ID を聞かれた場合は貼り付けて Enter
   - 多くの場合は Chrome の設定から自動検出されるため、入力不要でそのまま進みます

5. 「Installation complete」と表示されれば完了

> このスクリプトが裏側で行っていること:
> - 中継プログラムを `%LOCALAPPDATA%\StreamToPlayer\` にコピー
> - Chrome が中継プログラムを見つけられるよう Windows レジストリに登録
> - streamlink・yt-dlp・mpv などが正しくインストールされているか確認

### 4. 接続テスト

1. 拡張機能の設定ページを開く (拡張機能アイコン右クリック → オプション)
2. 接続テストボタンをクリック
3. 各ツールのパスが表示されれば成功

## 使い方

1. 対応サイト (YouTube, Twitch など) の動画ページを開く
2. ツールバーの拡張機能アイコンが有効になる (非対応サイトではグレーアウト)
3. アイコンをクリックしてポップアップを開く
4. 品質を選択
5. 再生ボタンをクリック
6. mpv/VLC が起動して再生開始

mpv 使用時は再生が検知されると、ブラウザ側の動画が自動的に一時停止します。

## アーキテクチャ

3層構成: Chrome 拡張 → Native Messaging → ローカルツール

```
[Popup] → runtime.sendMessage → [Service Worker] → connectNative → [Python Host]
                                      ↑                                 ↓
                                 declarativeContent              subprocess.Popen
                                 (対応サイトでのみ有効化)         streamlink / yt-dlp → mpv / vlc
```

Chrome 拡張から外部プログラムを直接起動することはできないため、[Native Messaging](https://developer.chrome.com/docs/extensions/develop/concepts/native-messaging) を介して Python ホストと通信します。

### 再生パイプライン

- streamlink 使用時 (ライブ配信): `streamlink URL quality -4 --player mpv`
- yt-dlp 使用時 (高速パス): `yt-dlp -g --force-ipv4` で URL 事前解決 → `mpv VIDEO_URL --audio-file=AUDIO_URL`
- yt-dlp 使用時 (フォールバック): URL 解決失敗時、`mpv --ytdl-format=FORMAT URL` (mpv 内蔵 yt-dlp)

IPv6 は Twitch 等で極端に遅いため、すべてのパスで IPv4 を強制しています。

## ライセンス

[MIT](LICENSE)
