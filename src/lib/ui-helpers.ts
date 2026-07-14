declare const QRCode: any;

/**
 * データのURL（base64）を受け取り、余白（20px）を追加した新しいデータURLを返す
 */
async function addMarginToQR(dataUrl: string, size: number, margin: number): Promise<string> {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                resolve(dataUrl);
                return;
            }

            const canvasSize = size + (margin * 2);
            canvas.width = canvasSize;
            canvas.height = canvasSize;

            // 背景を白にする
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvasSize, canvasSize);

            // QRを描画
            ctx.drawImage(img, margin, margin, size, size);
            resolve(canvas.toDataURL('image/png'));
        };
        img.src = dataUrl;
    });
}

/**
 * QRコードを生成し、余白を追加して新しいタブで表示する
 */
export async function generateAndOpenQR(data: any, email: string) {
    const hiddenContainer = document.getElementById("hidden-qr-container");
    if (!hiddenContainer) return;
    hiddenContainer.innerHTML = "";

    const size = 400; // インデックス、一括共通で400px
    const margin = 40;

    // 1. QR生成 (一時的に非表示エリアに生成)
    new QRCode(hiddenContainer, {
        text: JSON.stringify(data),
        width: size,
        height: size,
        correctLevel: QRCode.CorrectLevel.L,
    });

    // 生成待ち (QRCode.jsは非同期でimgを生成するため少し待つ)
    setTimeout(async () => {
        const imgTag = hiddenContainer.querySelector("img") as HTMLImageElement;
        if (imgTag && imgTag.src) {
            // 2. 余白を追加
            const dataUrlWithMargin = await addMarginToQR(imgTag.src, size, margin);
            // 3. 結果タブを開く
            openResultTab(dataUrlWithMargin, email);
        } else {
            alert("QRコードの生成に失敗しました。");
        }
    }, 150);
}

export function openResultTab(dataUrl: string, email: string) {
    const newWindow = window.open("", "_blank");
    if (!newWindow) {
        alert("ポップアップがブロックされました。");
        return;
    }

    const fileName = (email ? email : "thunderbird-settings") + ".png";
    const origin = window.location.origin;
    const year = new Date().getFullYear();

    const navLinks = [
        { href: "/", label: "作成フォーム" },
        { href: "/bulk", label: "一括読み込み" },
        { href: "/guide", label: "仕様・使い方解説" },
    ]
        .map((link) => `<a href="${origin}${link.href}">${link.label}</a>`)
        .join("");

    const htmlContent = `
        <!DOCTYPE html>
        <html lang="ja">
        <head>
            <meta charset="UTF-8">
            <title>QRコード発行 - ${email}</title>
            <link rel="preconnect" href="https://fonts.googleapis.com">
            <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
            <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@700;800&family=Inter:wght@400;500;700&display=swap" rel="stylesheet">
            <style>
                * { box-sizing: border-box; }
                body { font-family: 'Inter', system-ui, sans-serif; background: #f8fafc; color: #0f172a; margin: 0; min-height: 100vh; display: flex; flex-direction: column; }
                header { background: rgba(255,255,255,0.7); backdrop-filter: blur(24px); border-bottom: 1px solid rgba(255,255,255,0.2); padding: 1em 1.5em; }
                header .brand { font-family: 'Outfit', system-ui, sans-serif; font-weight: 900; font-style: italic; letter-spacing: -0.02em; color: #0f172a; font-size: 1.1em; text-decoration: none; }
                header .brand span { color: #4f46e5; }
                main { flex: 1; text-align: center; padding: 2em; display: flex; flex-direction: column; align-items: center; justify-content: center; }
                .card { background: white; padding: 3em; border-radius: 2rem; border: 1px solid rgba(226,232,240,0.6); box-shadow: 0 4px 10px rgba(0,0,0,0.06); max-width:500px; width:100%; }
                h1 { font-family: 'Outfit', system-ui, sans-serif; font-weight: 800; font-style: italic; letter-spacing: -0.02em; color: #0f172a; margin: 0 0 0.5em 0; font-size: 1.5em; }
                img { border: 1px solid #e2e8f0; border-radius: 0.75rem; margin: 1.5em 0; max-width: 100%; }
                .btn { display: inline-block; padding: 12px 20px; text-decoration: none; border-radius: 0.75rem; font-weight: 700; background: #4f46e5; color: white; border: none; cursor: pointer; margin: 0.5em; transition: background 0.2s; }
                .btn:hover { background: #4338ca; }
                .btn-mail { background: #059669; }
                .btn-mail:hover { background: #047857; }
                .toast { position: fixed; top: 20px; left: 50%; transform: translateX(-50%); background: #0f172a; color: white; padding: 10px 20px; border-radius: 999px; opacity: 0; transition: opacity 0.3s; pointer-events: none; font-size: 0.9em; }
                .toast.show { opacity: 1; }
                footer { text-align: center; padding: 2em; }
                footer nav { margin-bottom: 0.75em; }
                footer nav a { font-size: 0.8em; font-weight: 500; color: #64748b; text-decoration: none; margin: 0 0.75em; }
                footer nav a:hover { color: #4f46e5; }
                footer p { font-size: 0.8em; color: #94a3b8; margin: 0; }
                footer p a { color: inherit; }
                footer p a:hover { color: #4f46e5; }
            </style>
        </head>
        <body>
            <header>
                <a class="brand" href="${origin}/">Thunderbird<span>QR</span></a>
            </header>
            <main>
                <div class="card">
                    <h1>設定用QR (${email})</h1>
                    <img id="qr-image" src="${dataUrl}">
                    <div style="margin-top: 1em;">
                        <button id="copy-mail-btn" class="btn btn-mail">メール通知用コピー & メール作成</button>
                        <a href="${dataUrl}" download="${fileName}" class="btn">画像を保存 (${fileName})</a>
                    </div>
                    <p style="font-size: 0.85em; color: #666; margin-top: 1.5em;">
                        ※「メール通知用」ボタンを押すと画像がクリップボードにコピーされ、<br>メールソフトが起動します。本文に貼り付けて(Ctrl+V)送信してください。
                    </p>
                </div>
            </main>
            <footer>
                <nav>${navLinks}</nav>
                <p>&copy; ${year} <a href="https://4y4.app">4y4.app</a></p>
            </footer>
            <div id="toast" class="toast">クリップボードにコピーしました</div>

            <script>
                const copyBtn = document.getElementById('copy-mail-btn');
                const toast = document.getElementById('toast');

                copyBtn.onclick = async () => {
                    try {
                        // 1. 画像をクリップボードにコピー
                        const response = await fetch("${dataUrl}");
                        const blob = await response.blob();
                        await navigator.clipboard.write([
                            new ClipboardItem({ 'image/png': blob })
                        ]);

                        // 2. トースト表示
                        toast.classList.add('show');
                        setTimeout(() => toast.classList.remove('show'), 2000);

                        // 3. mailtoリンクを開く
                        const subject = encodeURIComponent("Thunderbird設定用QR発行のお知らせ");
                        const body = encodeURIComponent("Thunderbird設定用のQRコードを発行しました。\\n\\n以下にQRコードを貼り付けてください。\\n\\n(ここにCtrl+Vで貼り付け)");
                        window.location.href = "mailto:?subject=" + subject + "&body=" + body;

                    } catch (err) {
                        console.error(err);
                        alert("コピーに失敗しました。ブラウザの設定を確認してください。");
                    }
                };
            </script>
        </body>
        </html>
    `;
    newWindow.document.write(htmlContent);
    newWindow.document.close();
}
