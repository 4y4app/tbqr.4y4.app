# Thunderbird設定QR生成アプリ

Thunderbirdのモバイルアプリ設定用QRコードを生成するWebアプリケーションです。

## プロジェクト構造

このプロジェクトは[Astro](https://astro.build/)フレームワークを使用しています。主なソースコードは`src`ディレクトリに含まれています。

### ディレクトリ構成

```
src/
├── components/       # UIコンポーネント
│   ├── Header.astro         # ヘッダー部分
│   ├── IncomingForm.astro   # 受信サーバー設定フォーム
│   ├── SMTPForm.astro       # 送信サーバー設定フォーム
│   └── QRHiddenArea.astro   # QRコード生成用の不可視領域
├── layouts/          # ページレイアウト
│   └── Layout.astro         # 共通レイアウト
├── lib/              # ロジック・ユーティリティ
│   ├── constants.ts         # 定数定義 (プロトコル、セキュリティポートなど)
│   ├── thunderbird.ts       # Thunderbird形式のデータ構造構築ロジック・型定義
│   └── ui-helpers.ts        # UI操作ヘルパー (タブ表示、画像生成など)
└── pages/            # ページルーティング
    ├── index.astro          # メインページ (フォームと統合ロジック)
    ├── guide.astro          # 解説と仕様ページ
    └── bulk.astro           # CSV一括読み込みページ
```

## 各ファイルの役割

### `src/pages/`
- **index.astro**: アプリケーションのエントリーポイント。フォームの配置、受信・送信設定間のリアルタイム同期ロジック、およびQRコード生成の管理を行います。メールアドレス入力時の自動補完仕様は [AUTOFILL.md](./AUTOFILL.md) を参照してください。
- **guide.astro**: QRコードの利用方法、内部JSON構造の技術仕様、およびセキュリティに関する解説ページです。
- **bulk.astro**: `public/mailimport.csv` からメール設定を一括で読み込み、マルチアカウント設定を含むQRコードを生成するページです。

### `src/lib/`
ビジネスロジックを分離しています。
- **thunderbird.ts**: フォーム入力をThunderbird専用のJSON配列形式に変換します。単一アカウント用の `buildThunderbirdData` とマルチアカウント用の `buildMultiThunderbirdData` を含みます。
- **ui-helpers.ts**: 生成されたQRコードを新規タブでプレビューし、PNG画像として保存する機能を実行します。
- **constants.ts**: 各種プロトコル番号やポート番号、暗号化設定値を一元管理しています。

### `src/components/`
UIを部品化しています。
- **IncomingForm.astro**: 基本的なアカウント情報と受信サーバー設定の入力。
- **SMTPForm.astro**: 送信サーバー設定。チェックボックスにより表示・非表示を切り替えられますが、入力値は常に受信設定とバックグラウンドで同期されます。
- **Header.astro**: ナビゲーションを含む共通ヘッダー。
- **QRHiddenArea.astro**: 画面には表示されない、QRコード画像生成用の作業領域。

