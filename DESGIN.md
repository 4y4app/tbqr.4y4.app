# DESIGN.md — 4y4.app デザインシステム

4y4.app ブランドファミリー共通のデザイン原則・カラー・タイポグラフィ・UIパターンを定義する。
個別ページ固有の実装詳細は各プロジェクト側で管理し、ここには記載しない。

---

## 原則

- **コンパクト** — 情報は必要最小限。余白で読ませる。
- **無装飾な誠実さ** — グラデーションや動きは目的のためだけに使う。
- **日本語優先** — ラベル・エラー・説明はまず日本語で書く。英語は補助。
- **一貫したコントラスト** — テキストは背景に対して十分なコントラスト比を保つ。

---

## カラーパレット

### Brand（インディゴ系）

```
brand-50   #eef2ff   背景ハイライト・バッジ地
brand-100  #e0e7ff   ホバー背景
brand-200  #c7d2fe   ボーダー・区切り
brand-300  #a5b4fc
brand-400  #818cf8
brand-500  #6366f1   プライマリーアクセント（アイコン・リンク）
brand-600  #4f46e5   CTAボタン・強調テキスト
brand-700  #4338ca   ホバー状態のCTA
```

### Neutral（Slate系）

```
slate-50   #f8fafc   ページ背景
slate-100  #f1f5f9   テーブルヘッダー・入力背景
slate-200  #e2e8f0   ボーダー・区切り線
slate-400  #94a3b8   プレースホルダー・補助テキスト
slate-500  #64748b   ラベル・セカンダリテキスト
slate-700  #334155   ボタン背景（セカンダリ）
slate-900  #0f172a   プライマリテキスト・ボタン
slate-950  #020617   ダークサーフェス背景
```

### ステータスカラー

| 状態 | 背景 | テキスト | ボーダー |
|---|---|---|---|
| Stable / 完了 | `emerald-50` | `emerald-700` | `emerald-200` |
| Development / 開発中 | `brand-50` | `brand-700` | `brand-200` |
| Testing | `amber-50` | `amber-700` | `amber-200` |
| Planning | `slate-100` | `slate-600` | `slate-200` |
| Maintenance | `purple-50` | `purple-700` | `purple-200` |
| Critical / Error | `red-50` | `red-700` | `red-200` |

---

## タイポグラフィ

### フォントスタック

```
見出し (h1〜h4)  : 'Outfit', system-ui  — font-family: 'Outfit'
本文・UI         : 'Inter', system-ui
コード・ID・mono : 'Fira Code', monospace
```

### スケール（主要）

```
text-[9px]   ラベル・バッジ内テキスト
text-[10px]  キャプション・タイムスタンプ・トラッキングラベル
text-xs      補助テキスト・タグ (12px)
text-sm      本文・フォーム (14px)
text-base    標準本文 (16px)
text-xl      カードタイトル (20px)
text-2xl     セクション小見出し (24px)
text-5xl     ページ大見出し (48px)
text-7xl     トップ特大見出し (72px)
```

### 見出しスタイル（4y4.appサイト）

```css
/* トップページ・セクション見出し */
font-bold italic tracking-tighter

/* グラデーションテキスト */
.text-gradient {
  background: linear-gradient(to right, #4f46e5, #4338ca);
  -webkit-background-clip: text;
  color: transparent;
}
```

---

## スペーシング・レイアウト

```
container         max-w-screen、mx-auto px-6
セクション上下   pt-32 pb-20（ページコンテンツ）
カード内パディング p-8
カードギャップ    gap-6 / gap-8
```

---

## コンポーネントパターン

### 4y4.app サイト

#### カード（Works・Status共通）

```
rounded-[2rem]  border border-slate-200/60
hover:border-brand-300
shadow-sm hover:shadow-xl hover:shadow-brand-100/30
transition-all duration-500
```

#### ステータスバッジ

```
text-[9px] font-black uppercase tracking-widest
border px-2 py-0.5 rounded-md
```

#### CTAボタン（プライマリ）

```
bg-brand-600 text-white
px-8 py-4 rounded-2xl font-bold
hover:bg-brand-600 shadow-lg hover:shadow-brand-200
```

#### ナビゲーション

```css
/* Glassmorphism ヘッダー */
.glass {
  background: rgba(255,255,255,0.7);
  backdrop-filter: blur(24px);
  border: 1px solid rgba(255,255,255,0.2);
}
```

#### モバイルナビゲーション（ハンバーガー + オーバーレイ）

`sm`（640px）未満ではヘッダーのナビリンクを隠し、ハンバーガーメニューに集約する。

- **トリガー**: ヘッダー右端にハンバーガーアイコンボタン（`sm:hidden`）。
  `rounded-xl p-2 text-slate-500 hover:bg-brand-50 hover:text-brand-600`
- **オーバーレイ**: 全画面 `fixed inset-0 z-[100]`。背景は glass の白強め（`bg-white/90 backdrop-blur-xl`）。
  開閉は `visible opacity-100` ↔ `invisible opacity-0` を `transition-all duration-500` でトグル（モーダルと同パターン）。
- **リンク**: 縦積み中央揃え `gap-8`、`text-2xl font-black uppercase tracking-widest`。
  非アクティブ `slate-500` / アクティブ・ホバー `brand-600`。
  出現時は各リンクに `translate-y-3 → 0` + `opacity 0 → 1` を 60ms ずつの `transition-delay` でスタガー表示。
- **閉じる操作**: 右上の X ボタン（`top-4 right-5`、`rounded-xl bg-slate-50 p-3`）、背景タップ、リンク選択・ページ遷移のいずれでも閉じる。
- **スクロールロック**: 表示中は `body { overflow: hidden }`。
- **アクセシビリティ**: トリガーに `aria-label` と `aria-expanded` を付与。アイコンは他と同じインライン SVG（stroke-width 2）。

#### タイプラベル（Works種別）

```
text-[10px] font-black uppercase tracking-[0.3em]
text-brand-600 bg-brand-50 border border-brand-100/50
px-2 py-1 rounded-md
```

---

## アニメーション

### Intersection Observer reveal

```js
// .reveal / .reveal-item クラスに付与
// threshold: 0.1 で .active クラスを追加
// 各カードに transition-delay を nth-child で設定
```

### ローディング

```
animate-pulse  スケルトン表示
animate-pulse on status dot  開発中プロジェクトのパルス
```

---

## アイコン

- SVGインラインで直接記述。外部ライブラリ不使用。
- stroke-width: `2` / `2.5`（強調時）
- サイズ: `w-5 h-5`（標準）、`w-4 h-4`（コンパクト）

---

## レスポンシブ方針

- モバイルファースト（Tailwind デフォルト）
- ブレークポイント: `sm`（640px）・`md`（768px）・`lg`（1024px）のみ使用
