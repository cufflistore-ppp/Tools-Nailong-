# Kenapa layar putih di tools-nailong.vercel.app

Situs sudah kebuka `index.html`, tapi file ini 404:

- /css/style.css
- /js/config.js
- /js/registry.js
- /js/app.js
- /assets/...

Tanpa CSS background jadi putih. Tanpa JS `#app` kosong. Jadi kelihatan layar putih.

`tools-nailong.vervel.app` salah ketik. Domain Vercel yang benar: **vercel.app**.

## Cara deploy yang benar

1. Upload **seluruh folder** `nailong-tools`, jangan hanya `index.html`.
2. Isi yang wajib ada di root project:

```
index.html
vercel.json
css/style.css
js/config.js
js/registry.js
js/store.js
js/auth.js
js/device.js
js/membership.js
js/engines.js
js/extras.js
js/app.js
assets/banner/nailong-banner.mp4
assets/qris/qris.jpg
```

3. Vercel → Project Settings:
   - Framework Preset: **Other**
   - Root Directory: folder yang berisi `index.html` (bukan folder kosong / bukan `app` Next.js)
   - Output Directory: kosong
   - Build Command: kosong

4. Redeploy.

Kalau kamu drag-drop di vercel.com/new, drop folder `nailong-tools` utuh.
