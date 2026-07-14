import sharp from "sharp";
import { writeFileSync } from "node:fs";

const svg = `
<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#eef2ff" />
      <stop offset="100%" stop-color="#e0e7ff" />
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)" />

  <rect x="80" y="80" width="1040" height="470" rx="40" fill="#ffffff" stroke="#c7d2fe" stroke-width="2" />

  <text x="600" y="270" font-family="Arial, sans-serif" font-size="80" font-weight="900" font-style="italic" letter-spacing="-2" text-anchor="middle" fill="#0f172a">Thunderbird<tspan dx="14" fill="#4f46e5">QR</tspan></text>

  <text x="600" y="340" font-family="Arial, sans-serif" font-size="30" font-weight="500" text-anchor="middle" fill="#475569">メールアカウント設定をQRコードに変換</text>

  <rect x="480" y="380" width="240" height="120" rx="16" fill="#f8fafc" stroke="#e2e8f0" stroke-width="2" />
  <g transform="translate(520, 400)">
    <rect x="0" y="0" width="24" height="24" fill="#0f172a" />
    <rect x="32" y="0" width="16" height="16" fill="#0f172a" />
    <rect x="64" y="0" width="24" height="24" fill="#0f172a" />
    <rect x="0" y="32" width="16" height="16" fill="#0f172a" />
    <rect x="32" y="32" width="16" height="16" fill="#4f46e5" />
    <rect x="72" y="32" width="16" height="16" fill="#0f172a" />
    <rect x="0" y="64" width="24" height="24" fill="#0f172a" />
    <rect x="40" y="64" width="16" height="16" fill="#0f172a" />
    <rect x="64" y="64" width="24" height="24" fill="#0f172a" />
  </g>

  <text x="600" y="570" font-family="Arial, sans-serif" font-size="22" font-weight="500" text-anchor="middle" fill="#94a3b8">tbqr.4y4.app</text>
</svg>
`;

const png = await sharp(Buffer.from(svg)).png().toBuffer();
writeFileSync(new URL("../public/og-image.png", import.meta.url), png);
console.log("og-image.png generated");
