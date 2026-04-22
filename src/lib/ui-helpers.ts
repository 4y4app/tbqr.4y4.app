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

    const htmlContent = `
        <!DOCTYPE html>
        <html lang="ja">
        <head>
            <meta charset="UTF-8">
            <title>QRコード発行 - ${email}</title>
            <style>
                body { font-family: sans-serif; text-align: center; background: #f4f4f9; padding: 2em; display:flex; flex-direction:column; align-items:center; justify-content:center; min-height: 80vh; }
                .card { background: white; padding: 3em; border-radius: 8px; box-shadow: 0 4px 10px rgba(0,0,0,0.1); max-width:500px; width:100%; }
                h1 { color: #444; margin: 0 0 0.5em 0; font-size: 1.5em; }
                img { border: 1px solid #eee; margin: 1.5em 0; max-width: 100%; }
                .btn { display: inline-block; padding: 10px 20px; text-decoration: none; border-radius: 4px; font-weight: bold; background: #007bff; color: white; border: none; cursor: pointer; margin: 0.5em; }
                .btn:hover { background: #0056b3; }
                .btn-mail { background: #28a745; }
                .btn-mail:hover { background: #218838; }
                .toast { position: fixed; top: 20px; left: 50%; transform: translateX(-50%); background: #333; color: white; padding: 10px 20px; border-radius: 20px; opacity: 0; transition: opacity 0.3s; pointer-events: none; }
                .toast.show { opacity: 1; }
            </style>
        </head>
        <body>
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
