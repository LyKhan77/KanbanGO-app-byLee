# KanbanGO! — Official Web Landing Page 🌿

Situs web landing page resmi untuk aplikasi desktop **KanbanGO!**, dibangun dengan estetika **Bohemian Modern** (*earthy tones*), demo mini-board interaktif bersuara taktil, dan siap di-deploy secara instan ke **Vercel**.

---

## 🛠️ Tech Stack

- **Framework & Bundler:** Vite 5 + React 18 + TypeScript
- **Styling:** Tailwind CSS 3 (Bohemian design tokens resmi)
- **Icons:** Lucide React
- **Audio Engine:** Native Web Audio API (procedural oscillator synthesizer, zero external audio assets)
- **Deployment Platform:** Vercel (Static Site Generation / Edge CDN)
- **Testing:** Vitest 1.6

---

## 🚀 Menjalankan Secara Lokal

1. Masuk ke direktori `landing`:
   ```bash
   cd landing
   ```

2. Pasang dependensi:
   ```bash
   npm install
   ```

3. Jalankan server pengembang lokal:
   ```bash
   npm run dev
   ```

4. Jalankan pengujian unit:
   ```bash
   npm test
   ```

5. Buat bundel produksi statis:
   ```bash
   npm run build
   ```

---

## 🌐 Panduan Deploy ke Vercel

Situs ini dirancang untuk dapat di-deploy ke Vercel secara langsung dari repositori GitHub:

1. Buka dashboard [Vercel](https://vercel.com) dan pilih **Add New... > Project**.
2. Hubungkan repositori GitHub **`KanbanGO-app-byLee`**.
3. Pada pengaturan proyek (**Project Settings**):
   - **Framework Preset:** `Vite`
   - **Root Directory:** Edit dan arahkan ke `landing`
   - **Build Command:** `npm run build` (otomatis)
   - **Output Directory:** `dist` (otomatis)
   - **Install Command:** `npm install` (otomatis)
4. Klik **Deploy**.

File `vercel.json` sudah menyediakan konfigurasi rewrite rute SPA (`/(.*) -> /index.html`) dan caching header optimal untuk aset statis di Vercel Edge CDN.

---

## 📦 Struktur Direktori

```text
landing/
├── index.html              # Entry HTML dengan metadata SEO & OpenGraph lengkap
├── package.json            # Dependensi terisolasi
├── vite.config.ts          # Konfigurasi bundler Vite 5
├── tailwind.config.js      # Token palet Bohemian resmi
├── tsconfig.json           # Konfigurasi TypeScript
├── vercel.json             # Konfigurasi routing & caching Vercel
├── public/
│   ├── favicon.ico         # Favicon daun Bohemian
│   ├── icon.png            # Logo resmi 512x512
│   └── screenshots/        # Tangkapan layar antarmuka resolusi tinggi
├── src/
│   ├── main.tsx            # Bootstrap React 18
│   ├── App.tsx             # Root layout halaman
│   ├── index.css           # Styling dasar Tailwind & Bohemian custom classes
│   ├── components/
│   │   ├── Navbar.tsx      # Sticky navbar dengan branding & navigasi
│   │   ├── HeroSection.tsx # Hero dengan deteksi OS otomatis & CTA unduh
│   │   ├── ValuePillars.tsx# 4 pilar keunggulan (Offline, Bohemian, Zero Bloat, Privasi)
│   │   ├── InteractiveDemo.tsx # Mini Kanban board interaktif + efek audio taktil
│   │   ├── FeatureShowcase.tsx # Pameran fitur dengan screenshot nyata
│   │   ├── DownloadCenter.tsx  # Pusat unduhan Windows, macOS (Gatekeeper guide), Linux
│   │   ├── OpenSourcePledge.tsx# Komitmen privasi & lisensi open source
│   │   └── Footer.tsx      # Branding, versi rilis, dan hak cipta
│   └── utils/
│       ├── audio.ts        # Synthesizer audio prosedural Web Audio API
│       └── osDetector.ts   # Deteksi sistem operasi pengunjung (Windows/macOS/Linux)
└── tests/
    ├── audio.test.ts       # Pengujian unit Web Audio synthesizer
    └── osDetector.test.ts  # Pengujian unit deteksi sistem operasi
```
