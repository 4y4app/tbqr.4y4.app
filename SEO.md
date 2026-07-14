# SEO実装ガイド（Astro 静的サイト向け）

Astro SSG を前提とした SEO 実装の参考ドキュメント。  

---

## 目次

1. [基本メタタグ](#1-基本メタタグ)
2. [OGP / Twitter Cards](#2-ogp--twitter-cards)
3. [構造化データ（Schema.org）](#3-構造化データschemaorg)
4. [サイトマップ](#4-サイトマップ)
5. [テクニカルSEO](#5-テクニカルseo)
6. [アナリティクス](#6-アナリティクス)
7. [チェックリスト](#7-チェックリスト)

---

## 1. 基本メタタグ

全ページ共通のレイアウトコンポーネント（`Layout.astro` など）に集約する。

```astro
---
interface Props {
  title: string;
  description?: string;
}
const { title, description = "サイトのデフォルト説明文" } = Astro.props;
---

<html lang="ja">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>{title}</title>
    <meta name="description" content={description} />
    <meta name="author" content="作者名" />
    <meta name="keywords" content="キーワード1, キーワード2" />
    <link
      rel="canonical"
      href={new URL(Astro.url.pathname, Astro.site).href}
    />
  </head>
</html>
```

### ポイント

| 項目 | 説明 |
|---|---|
| `lang` 属性 | 日本語サイトなら `ja`。言語宣言はクローラーとアクセシビリティ両方に効く |
| `title` | 各ページ固有の値を渡す。目安は30〜60文字 |
| `description` | 各ページ固有が理想。共通フォールバックは持たせておく。目安は70〜120文字 |
| `canonical` | `Astro.site`（`astro.config.mjs` の `site` 値）を使って絶対URLを生成する |
| `keywords` | 現代のGoogleはほぼ無視するが、他エンジン向けに残してよい |

`Astro.site` を有効化するには `astro.config.mjs` に `site` を設定する：

```js
// astro.config.mjs
export default defineConfig({
  site: 'https://example.com',
});
```

---

## 2. OGP / Twitter Cards

SNSシェア時のプレビュー制御。レイアウトの `<head>` に追加する。

```astro
<!-- Open Graph -->
<meta property="og:title" content={title} />
<meta property="og:description" content={description} />
<meta property="og:type" content="website" />
<meta property="og:url" content={Astro.url} />
<meta property="og:image" content={new URL("/og-image.png", Astro.site)} />
<meta property="og:site_name" content="サイト名" />
<meta property="og:locale" content="ja_JP" />

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:url" content={Astro.url} />
<meta name="twitter:title" content={title} />
<meta name="twitter:description" content={description} />
<meta name="twitter:image" content={new URL("/og-image.png", Astro.site)} />
```

### OGPイメージの仕様

| 項目 | 推奨値 |
|---|---|
| サイズ | 1200×630px |
| 形式 | **PNG または JPG**（Twitter/X・Facebook は SVG 非対応） |
| ファイル配置 | `public/og-image.png` |
| 容量 | 5MB 以内（Twitter は 5MB、Facebook は 8MB） |

### ページ別に OGP イメージを変える場合

```astro
---
interface Props {
  title: string;
  description?: string;
  ogImage?: string; // パスを渡せるようにする
}
const { title, description, ogImage = "/og-image.png" } = Astro.props;
---
<meta property="og:image" content={new URL(ogImage, Astro.site)} />
```

---

## 3. 構造化データ（Schema.org）

### 仕組み

Astro のフロントマターでオブジェクトを組み立て、`set:html` でビルド時に静的展開する。ランタイム JS は不要。

```
データ（JSON / 変数）
  ↓ TypeScript でオブジェクト生成
  ↓ JSON.stringify()
<script is:inline type="application/ld+json" set:html={...} />
  ↓ ビルド時展開
出力 HTML（静的・変更なし）
```

### ページ固有スキーマの注入パターン

Layout に named slot を用意し、各ページから差し込む。

```astro
<!-- Layout.astro の <head> 内 -->
<slot name="head" />
```

```astro
<!-- 各ページ -->
<Layout title="...">
  <script is:inline slot="head" type="application/ld+json" set:html={JSON.stringify(schema)} />
  <!-- ページ本文 -->
</Layout>
```

---

### Organization スキーマ（企業・団体サイト全ページ）

サイト全体の組織情報。レイアウトに直接埋め込んで全ページに出力する。

```astro
---
const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "組織名",
  url: "https://example.com",
  description: "組織の説明",
  founder: {
    "@type": "Person",
    name: "代表者名",
  },
  sameAs: [
    "https://twitter.com/handle",
    "https://github.com/handle",
  ],
};
---

<script is:inline type="application/ld+json" set:html={JSON.stringify(organizationSchema)} />
```

---

### Person スキーマ（プロフィール・個人ページ）

```astro
---
const personSchema = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "氏名",
  alternateName: "Name in English",
  url: "https://example.com/profile",
  jobTitle: "Software Engineer",
  description: "自己紹介文",
  worksFor: {
    "@type": "Organization",
    name: "所属組織名",
    url: "https://example.com",
  },
  sameAs: ["https://github.com/handle"],
};
---

<Layout title="Profile">
  <script is:inline slot="head" type="application/ld+json" set:html={JSON.stringify(personSchema)} />
  ...
</Layout>
```

---

### Service + OfferCatalog スキーマ（料金・サービスページ）

料金データが JSON ファイルで管理されている場合は動的に生成できる。

```astro
---
import pricingData from "../data/pricing.json";

const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "サービス名",
  url: "https://example.com/pricing",
  provider: {
    "@type": "Organization",
    name: "組織名",
    url: "https://example.com",
  },
  areaServed: "JP",
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "プラン一覧",
    itemListElement: pricingData.map((plan) => ({
      "@type": "Offer",
      name: plan.name,
      description: plan.description,
      // 数値に変換できる場合のみ price を付与（"要相談" 等を除外）
      ...(plan.price && !isNaN(Number(plan.price.replace(/,/g, "")))
        ? { price: Number(plan.price.replace(/,/g, "")), priceCurrency: "JPY" }
        : {}),
    })),
  },
};
---

<Layout title="Pricing">
  <script is:inline slot="head" type="application/ld+json" set:html={JSON.stringify(serviceSchema)} />
  ...
</Layout>
```

---

### BreadcrumbList スキーマ（階層の深いページ）

```astro
---
const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://example.com/" },
    { "@type": "ListItem", position: 2, name: "Blog", item: "https://example.com/blog/" },
    { "@type": "ListItem", position: 3, name: "記事タイトル" },
  ],
};
---
```

### Article スキーマ（ブログ・記事ページ）

```astro
---
const articleSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "記事タイトル",
  description: "記事の説明",
  author: { "@type": "Person", name: "著者名" },
  publisher: {
    "@type": "Organization",
    name: "サイト名",
    url: "https://example.com",
  },
  datePublished: "2026-01-01",
  dateModified: "2026-05-28",
  url: "https://example.com/blog/slug",
};
---
```

### 検証

- [Google リッチリザルト テスト](https://search.google.com/test/rich-results) — Googleでのリッチリザルト表示を確認
- [Schema.org Validator](https://validator.schema.org/) — スキーマの構文チェック

---

## 4. サイトマップ

`@astrojs/sitemap` を使うとビルド時に自動生成される。

```bash
npm install @astrojs/sitemap
```

```js
// astro.config.mjs
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://example.com', // 必須
  integrations: [
    sitemap({
      changefreq: 'weekly',   // 任意: クロール頻度のヒント
      priority: 0.7,          // 任意: デフォルト優先度（0.0〜1.0）
      // 特定ページを除外する場合:
      // filter: (page) => !page.includes('/construction/'),
    }),
  ],
});
```

生成物: `dist/sitemap-index.xml`・`dist/sitemap-0.xml`（ページ数が多いと複数に分割される）

### robots.txt との連携

`public/robots.txt` にサイトマップのURLを記載する：

```txt
User-agent: *
Allow: /

Sitemap: https://example.com/sitemap-index.xml
```

---

## 5. テクニカルSEO

### Google Fonts のパフォーマンス最適化

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Inter&display=swap" rel="stylesheet" />
```

`rel="preconnect"` でDNS解決・TLSハンドシェイクを先行させ、フォントのレンダリングブロックを短縮する。

### 外部リンクのセキュリティ属性

```html
<a href="https://external.example.com" target="_blank" rel="noopener noreferrer">
```

`noopener` はタブナビゲーション攻撃を防ぎ、`noreferrer` はリファラー情報を送らない。SEO的にも安全な外部リンクの標準形。

### 画像の `alt` テキスト

```astro
<!-- 意味のある画像 -->
<img src="/photo.jpg" alt="プロジェクトのスクリーンショット" />

<!-- 装飾目的の画像（クローラーに無視させる） -->
<img src="/decoration.svg" alt="" role="presentation" />

<!-- SVGアイコン（ラベルが必要な場合） -->
<button aria-label="GitHubを開く">
  <svg>...</svg>
</button>
```

### Astro 静的生成（SSG）の利点

- ビルド時にHTMLを生成するためクローラーがJSを実行しなくてもコンテンツを読める
- `astro.config.mjs` で `output: 'static'`（デフォルト）を明示してもよい

---

## 6. アナリティクス

### Google Analytics 4

```astro
<!-- Layout.astro の </head> 直前 -->
<script is:inline async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script is:inline>
  window.dataLayer = window.dataLayer || [];
  function gtag(){ dataLayer.push(arguments); }
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

### Google Search Console 連携

DNSで認証済み

---

## 7. チェックリスト

### 必須

- [ ] `astro.config.mjs` に `site` を設定した
- [ ] 全ページに固有の `title` を設定した
- [ ] `description` を設定した（ページ固有が理想、共通フォールバックは必須）
- [ ] `canonical` タグを設定した
- [ ] OGP タグを設定した（`og:title`・`og:description`・`og:image`・`og:url`）
- [ ] OGP イメージが PNG/JPG で 1200×630px として存在する
- [ ] `twitter:card` を設定した
- [ ] `public/robots.txt` を作成した
- [ ] サイトマップを生成・`robots.txt` に記載した
- [ ] `<html lang>` を設定した

### 推奨

- [ ] Organization または Person スキーマを実装した
- [ ] サービス・料金ページに Service/Product スキーマを実装した
- [ ] Google Search Console にサイトを登録した
- [ ] Google Analytics 4 を設定した
- [ ] 外部リンクに `rel="noopener noreferrer"` を付けた
- [ ] 意味のある画像すべてに `alt` テキストを設定した
- [ ] Google Fonts に `rel="preconnect"` を設定した

### 任意（上級）

- [ ] ページ階層がある場合 BreadcrumbList スキーマを実装した
- [ ] ブログ記事がある場合 Article スキーマを実装した
- [ ] サイトマップに `changefreq`・`priority` を設定した
- [ ] `theme-color` メタタグを設定した
- [ ] Web App Manifest（`manifest.json`）を作成した
