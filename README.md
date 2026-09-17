# NAILONG TOOLS v148.027.00

All-in-One Online Tools platform.

Theme: black + yellow + orange  
Banner: `assets/banner/nailong-banner.mp4` (the video you supplied). It autoplays, stays muted, and loops with no pause/controls.

## What already works

- Login / Register / Forgot password UI
- Local account store (works immediately in the browser)
- Firebase Auth hook (Email + Google) when you add config
- Post-login animation
- Dashboard with **one** looping video banner
- Search, categories, favorites, history, profile, settings, admin view
- Tool registry with **242** listed tools
- Client-side tools that actually run in the browser:
  - Image compress/resize/convert/filters/watermark/QR/PDF merge/images-to-PDF
  - Text, developer, calculator, generator, productivity tools
- AI tools call `/api/ai` and show a clear error until you add a server key
- PWA manifest + service worker
- SEO meta, robots.txt, sitemap.xml
- Firestore / Storage security rules templates

This is Phase 2–3 of the roadmap (foundation + a large working set).  
Do not advertise “500 tools live” until each extra tool has a real handler.

## Folder structure

```
nailong-tools/
├── index.html
├── 404.html
├── css/style.css
├── js/config.js
├── js/registry.js
├── js/auth.js
├── js/store.js
├── js/engines.js
├── js/extras.js
├── js/app.js
├── api/ai.js
├── assets/banner/nailong-banner.mp4
├── assets/banner/poster.jpg
├── assets/icons/
├── firebase/firestore.rules
├── firebase/storage.rules
├── manifest.json
├── service-worker.js
├── robots.txt
├── sitemap.xml
├── vercel.json
└── README.md
```

## Run on phone (Acode) or computer

1. Open the `nailong-tools` folder.
2. Serve it with any static server. Opening `index.html` as a file also works for most tools, but login Google / PWA / AI need HTTPS hosting.

Simple local server:

```bash
cd nailong-tools
python3 -m http.server 8080
```

Then open `http://localhost:8080`.

First visit goes to Login. Create an account, wait for the short animation, then the dashboard loads.

## Video banner

File already placed at:

`assets/banner/nailong-banner.mp4`

Poster:

`assets/banner/poster.jpg`

Rules implemented:

- only one homepage banner
- `autoplay muted loop playsinline`
- no controls
- if the browser pauses it, JavaScript starts it again
- `object-fit: cover`

To replace later, overwrite that file only. Do not add a second video.

## Firebase setup

1. Create a Firebase project.
2. Enable **Authentication → Email/Password** and **Google**.
3. Create a Firestore database (production mode).
4. Paste config into `js/config.js`:

```js
firebaseEnabled: true,
firebaseConfig: { apiKey, authDomain, projectId, storageBucket, messagingSenderId, appId }
```

5. Deploy rules from `firebase/firestore.rules` and `firebase/storage.rules`.
6. Add your admin email to `adminEmails` in `js/config.js`.
7. Optional stronger admin: set a Firebase Auth custom claim `{ "admin": true }` with Admin SDK.

Until `firebaseEnabled` is true and the key is real, the app uses a **local browser account**. That is a real local login (password hashed with SHA-256), not a fake button. Google login and email reset need Firebase.

## Firestore user document (suggested)

`users/{uid}`

- uid, name, email, photoURL, createdAt, role, membership, favorites, lastLogin

Do not store passwords in Firestore. Firebase Auth owns passwords.

## Admin

- First local account becomes admin, or any email listed in `adminEmails`.
- On Firebase, also protect writes with custom claims in security rules (`request.auth.token.admin`).
- Admin page: `#/admin`

## Membership / ads / payments

Placeholder only. No fake checkout. Add Stripe/Xendit later on a serverless function.

## AI Tools

Frontend posts to `/api/ai`.

On Vercel:

1. Settings → Environment Variables → `OPENAI_API_KEY`
2. Optional `OPENAI_MODEL` (default `gpt-4o-mini`)
3. Redeploy

The function is `api/ai.js`. The key never goes in HTML/JS.

## Add a tool

1. Add an object in `js/registry.js` or in `scripts/generate_registry.py` then run:

```bash
python3 scripts/generate_registry.py
```

2. Reuse an existing `kind` if the engine already supports it.
3. For a new kind, add logic in `js/engines.js` and/or `js/app.js` / `js/extras.js`.

Example:

```js
{
  "id": "image-compressor",
  "name": "Image Compressor",
  "category": "Image Tools",
  "description": "Compress images online",
  "kind": "image-compress",
  "icon": "fa-solid fa-compress",
  "premium": false,
  "popular": true,
  "newest": false,
  "keywords": "compress jpg png"
}
```

## Heavy video / audio processing

Browser tools can read duration, type, size, and grab a thumbnail.  
Full compress/convert/trim with FFmpeg needs a backend or ffmpeg.wasm. Do not show a fake progress bar for those until the backend exists.

## GitHub

```bash
cd nailong-tools
git init
git add .
git commit -m "NAILONG TOOLS v148.027.00"
git branch -M main
git remote add origin https://github.com/USER/REPO.git
git push -u origin main
```

Do not commit real API keys.

## Vercel

1. Import the GitHub repo.
2. Framework: Other
3. Root: repository root
4. Add env vars for AI
5. Deploy

Update `robots.txt` and `sitemap.xml` `YOUR-DOMAIN`.

## Security notes

- Rules file denies public read/write.
- File tools prefer local processing.
- No exploit / account-theft / spam tools are included.

## Roadmap

- Phase 1: foundation — done
- Phase 2: ~50 working tools — done (included in the 242 registry + engines)
- Phase 3–6: keep adding handlers until 300, then 500+


## Akun otomatis, VIP, QRIS

Saat orang membuka website, akun free dibuat otomatis:

`Member free nailong #1`, `#2`, dst.

Password awal = username.

Ganti username/password di menu **Saya**. Username yang sudah dipakai akan ditolak.

### Owner / Admin

- Username: `NailongOwner`
- Password: `NailongAdmin#148`

Ganti di `js/config.js` → `owner`.

Owner bisa mengaktifkan VIP untuk username mana pun di `#/admin`.

### Paket VIP

- VIP 1 hari — Rp 5.000
- VIP 3 hari — Rp 12.000
- VIP 7 hari — Rp 25.000
- VIP Permanen — Rp 75.000

Ganti harga di `js/config.js` → `vipPlans`.

Ganti gambar QRIS: `assets/qris/qris.png`

Alur: member transfer → unggah bukti + username → owner tekan **Aktifkan**.
VIP tidak langsung hidup hanya karena foto diunggah, supaya orang tidak bisa palsukan transfer.

Jika waktu VIP habis, role otomatis kembali `member`.

### Menu tiga garis (kanan atas)

- Lapor bug
- Download APK
- Saluran WhatsApp resmi (`whatsappChannel` di config)
- Saya
- Upgrade VIP

### Status bar bawah video

Negara (timezone / IP), device (Android/iPhone/dll), browser, baterai perangkat (Chrome/Android), status online, role, tombol VVIP.

Baterai memakai Battery Status API. Safari iPhone sering memblokir API ini, maka tampil N/A.
