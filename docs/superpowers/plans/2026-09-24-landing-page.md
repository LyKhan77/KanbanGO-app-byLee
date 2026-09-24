# KanbanGO! Landing Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Membangun web landing page resmi untuk aplikasi KanbanGO! yang berestetika Bohemian Modern, dilengkapi demo mini-board interaktif bersuara taktil, tautan unduhan multi-platform cerdas (Windows, macOS, Linux), dan siap di-deploy secara instan ke Vercel.

**Architecture:** Web statis murni (*Static Site Generation*) menggunakan Vite 5, React 18, TypeScript, dan Tailwind CSS 3 yang terisolasi di direktori `landing/`. Menggunakan Web Audio API prosedural native untuk efek suara taktil tanpa berkas audio luar, serta `vercel.json` untuk optimasi caching dan SPA rewrite di Vercel Edge CDN.

**Tech Stack:** React 18, TypeScript, Vite 5, Tailwind CSS 3, Lucide React, Web Audio API, Vercel.

---

### File Structure Map

```text
landing/
├── index.html                  # Entry point HTML dengan meta tags SEO & OpenGraph lengkap
├── package.json                # Metadata & dependensi terisolasi (React 18, Tailwind, Lucide, Vitest)
├── vite.config.ts              # Konfigurasi bundler Vite
├── tailwind.config.js          # Token palet Bohemian resmi
├── postcss.config.js           # PostCSS autoprefixer & tailwind
├── tsconfig.json               # Konfigurasi compiler TypeScript
├── vercel.json                 # Routing SPA rewrites & caching header Vercel
├── public/
│   ├── favicon.ico             # Favicon daun Bohemian
│   ├── icon.png                # Logo resmi daun Bohemian 512x512
│   └── screenshots/            # Tangkapan layar nyata resolusi tinggi
├── src/
│   ├── main.tsx                # Bootstrap React 18
│   ├── App.tsx                 # Root layout & navigasi seksi
│   ├── index.css               # Gaya dasar Tailwind & Bohemian custom classes
│   ├── components/
│   │   ├── Navbar.tsx          # Sticky navbar dengan branding & tautan GitHub
│   │   ├── HeroSection.tsx     # Judul, dynamic download button, hero preview mockup
│   │   ├── ValuePillars.tsx    # 4 pilar (Offline, Bohemian, Zero Bloat, Privasi)
│   │   ├── InteractiveDemo.tsx # Mini Kanban board interaktif (bisa geser kartu + audio taktil)
│   │   ├── FeatureShowcase.tsx # Pameran fitur nyata (Multi-Board Tabs, Kalender, Card Cover, Palette)
│   │   ├── DownloadCenter.tsx  # Pusat unduhan Win, Mac (Gatekeeper guide), Linux
│   │   ├── OpenSourcePledge.tsx# Pernyataan privasi & transparansi open-source
│   │   └── Footer.tsx          # Branding resmi, rilis v1.0.3, hak cipta
│   └── utils/
│       ├── audio.ts            # Synthesizer audio prosedural Web Audio API
│       └── osDetector.ts       # Deteksi otomatis sistem operasi pengunjung
└── tests/
    ├── osDetector.test.ts      # Unit test logika deteksi OS
    └── audio.test.ts           # Unit test Web Audio synthesizer
```

---

### Task 1: Scaffolding Direktori `landing/` & Konfigurasi Build

**Files:**
- Create: `landing/package.json`
- Create: `landing/vite.config.ts`
- Create: `landing/tsconfig.json`
- Create: `landing/tailwind.config.js`
- Create: `landing/postcss.config.js`
- Create: `landing/vercel.json`
- Create: `landing/index.html`

- [ ] **Step 1: Buat `landing/package.json` dengan dependensi React 18, Tailwind CSS, Lucide React, dan Vitest**
- [ ] **Step 2: Buat `landing/vite.config.ts`, `landing/tsconfig.json`, dan `landing/postcss.config.js`**
- [ ] **Step 3: Buat `landing/tailwind.config.js` yang mengimpor seluruh token warna Bohemian resmi (`terracotta`, `sage`, `boho-sand`, `boho-linen`, `boho-walnut`, `boho-espresso`, `boho-canvas`)**
- [ ] **Step 4: Buat `landing/vercel.json` dengan SPA rewrite dan caching header**
- [ ] **Step 5: Buat `landing/index.html` dengan metadata SEO lengkap, title *"KanbanGO! — Offline-First Bohemian Desktop Kanban"*, dan OpenGraph tags**
- [ ] **Step 6: Jalankan `npm install` di dalam direktori `landing/`**
- [ ] **Step 7: Commit berkas scaffolding konfigurasi**

```bash
git add landing/
git commit -m "chore(landing): scaffold Vite React Tailwind project structure for landing page"
```

---

### Task 2: Modul Aset & Utilitas (OS Detector & Web Audio Synthesizer)

**Files:**
- Create: `landing/public/icon.png` (salin dari `resources/icon.png`)
- Create: `landing/public/favicon.ico` (salin dari `resources/icon.ico`)
- Create: `landing/public/screenshots/*` (salin dari `temp/screenshots/`)
- Create: `landing/src/utils/osDetector.ts`
- Create: `landing/src/utils/audio.ts`
- Create: `landing/tests/osDetector.test.ts`
- Create: `landing/tests/audio.test.ts`

- [ ] **Step 1: Salin aset gambar resmi dari `resources/` dan `temp/screenshots/` ke `landing/public/`**
- [ ] **Step 2: Tulis pengujian unit `landing/tests/osDetector.test.ts` untuk memvalidasi deteksi Windows, macOS, dan Linux dari userAgent**
- [ ] **Step 3: Implementasikan `landing/src/utils/osDetector.ts` hingga pengujian lulus**
- [ ] **Step 4: Tulis pengujian unit `landing/tests/audio.test.ts` untuk Web Audio synthesizer**
- [ ] **Step 5: Implementasikan `landing/src/utils/audio.ts` dengan oscillator prosedural Web Audio API murni (sound taktil & chime Bohemian)**
- [ ] **Step 6: Jalankan pengujian unit `npm test` di direktori `landing/`**
- [ ] **Step 7: Commit modul aset & utilitas**

```bash
git add landing/public/ landing/src/utils/ landing/tests/
git commit -m "feat(landing): implement OS detector, procedural audio synthesizer, and branding assets"
```

---

### Task 3: Komponen Navbar & Hero Section

**Files:**
- Create: `landing/src/components/Navbar.tsx`
- Create: `landing/src/components/HeroSection.tsx`

- [ ] **Step 1: Bangun komponen `Navbar.tsx` dengan layout sticky, logo daun Bohemian, tautan navigasi halus (*Fitur, Coba Demo, Keunggulan, Unduh*), tombol GitHub Star, dan tombol unduh cepat**
- [ ] **Step 2: Bangun komponen `HeroSection.tsx` yang memuat:**
  - Tagline inspiratif: *"Produktivitas yang Menenangkan, Kendali Penuh di Tangan Anda"*
  - Sub-judul: *"Aplikasi Kanban desktop offline-first dengan estetika Bohemian Modern, tanpa biaya langganan cloud..."*
  - Tombol unduhan dinamis sesuai OS pengunjung (`Unduh untuk Windows / macOS / Linux`) mengarah ke GitHub Releases v1.0.3
  - Tombol sekunder `[Coba Demo Interaktif]` (smooth scroll)
  - Mockup visual antarmuka KanbanGO! beresolusi tinggi dengan tab dan kolom Bohemian
- [ ] **Step 3: Commit komponen Navbar & HeroSection**

```bash
git add landing/src/components/Navbar.tsx landing/src/components/HeroSection.tsx
git commit -m "feat(landing): implement Navbar and dynamic HeroSection components"
```

---

### Task 4: Komponen Value Pillars & Feature Showcase

**Files:**
- Create: `landing/src/components/ValuePillars.tsx`
- Create: `landing/src/components/FeatureShowcase.tsx`

- [ ] **Step 1: Bangun `ValuePillars.tsx` dengan 4 kartu pilar bernuansa earthy:**
  - 🌿 100% Offline-First & Bebas Langganan Cloud
  - 🎨 Estetika Bohemian Modern yang Menenangkan
  - ⚡ Super Ringan & Bebas Dependensi Berat (Zero Bloat)
  - 🛡️ Privasi Mutlak & Cadangan Mandiri (Local Vault)
- [ ] **Step 2: Bangun `FeatureShowcase.tsx` dengan pameran fitur terstruktur dilengkapi screenshot nyata aplikasi:**
  - Multi-Board Tab Vault dengan DnD
  - Tampilan Kalender Bulanan Terpadu
  - Detail Kartu Komprehensif (Markdown Preview & Checklist)
  - Bohemian Command Palette (`Ctrl+K` / `Cmd+K`)
  - Daily Coach & Persona Widget
- [ ] **Step 3: Commit komponen ValuePillars & FeatureShowcase**

```bash
git add landing/src/components/ValuePillars.tsx landing/src/components/FeatureShowcase.tsx
git commit -m "feat(landing): implement ValuePillars and FeatureShowcase components"
```

---

### Task 5: Komponen Interactive Demo (Mini-Board Interaktif di Web)

**Files:**
- Create: `landing/src/components/InteractiveDemo.tsx`

- [ ] **Step 1: Rancang state lokal mini Kanban board (3 kolom: *🌱 Eksplorasi Ide*, *⚡ Sedang Dikerjakan*, *✨ Selesai*) dengan kartu-kartu demo bertema Bohemian**
- [ ] **Step 2: Tambahkan interaksi pemindahan kartu antar kolom (tombol panah cepat atau drag-and-drop sederhana)**
- [ ] **Step 3: Hubungkan setiap aksi (pindah kartu, centang subtask) dengan efek audio dari `src/utils/audio.ts`**
- [ ] **Step 4: Tambahkan tombol reset demo untuk mengembalikan papan ke status awal**
- [ ] **Step 5: Commit komponen InteractiveDemo**

```bash
git add landing/src/components/InteractiveDemo.tsx
git commit -m "feat(landing): implement InteractiveDemo mini-board with procedural audio"
```

---

### Task 6: Komponen Download Center, Open Source Pledge, & Footer

**Files:**
- Create: `landing/src/components/DownloadCenter.tsx`
- Create: `landing/src/components/OpenSourcePledge.tsx`
- Create: `landing/src/components/Footer.tsx`

- [ ] **Step 1: Bangun `DownloadCenter.tsx` dengan 3 kartu terstruktur:**
  - Windows: Installer NSIS (`.exe`) dan Portable standalone
  - macOS: Apple Disk Image (`.dmg`) dan Arsip (`.zip`) + Accordion petunjuk verifikasi Gatekeeper (`sudo xattr` & `sudo codesign`) dengan tombol copy satu-klik
  - Linux: Universal `.AppImage` dan Debian `.deb`
- [ ] **Step 2: Bangun `OpenSourcePledge.tsx` dengan pernyataan komitmen privasi lokal (Zero Analytics, Zero Tracking)**
- [ ] **Step 3: Bangun `Footer.tsx` dengan logo daun Bohemian, tautan repositori GitHub, rilis v1.0.3, dan hak cipta**
- [ ] **Step 4: Commit komponen unduhan & footer**

```bash
git add landing/src/components/DownloadCenter.tsx landing/src/components/OpenSourcePledge.tsx landing/src/components/Footer.tsx
git commit -m "feat(landing): implement DownloadCenter, OpenSourcePledge, and Footer components"
```

---

### Task 7: Integrasi Layout Root `App.tsx` & Verifikasi Build

**Files:**
- Modify: `landing/src/App.tsx`
- Modify: `landing/src/main.tsx`
- Modify: `landing/src/index.css`

- [ ] **Step 1: Hubungkan seluruh komponen di `landing/src/App.tsx` dalam susunan layout yang kohesif dan responsif**
- [ ] **Step 2: Jalankan `npm test` di direktori `landing/` untuk memverifikasi seluruh pengujian lulus**
- [ ] **Step 3: Jalankan `npm run build` di direktori `landing/` untuk memverifikasi bundel produksi statis berhasil dikompilasi ke `landing/dist`**
- [ ] **Step 4: Commit integrasi root aplikasi**

```bash
git add landing/src/App.tsx landing/src/main.tsx landing/src/index.css
git commit -m "feat(landing): integrate all components into root App layout and verify production build"
```

---

### Task 8: Dokumentasi & Panduan Deploy Vercel

**Files:**
- Create: `landing/README.md`
- Modify: `README.md` (tambahkan tautan ke landing page & instruksi deploy)

- [ ] **Step 1: Buat `landing/README.md` berisi panduan menjalankan lokal (`npm run dev`) dan cara deploy ke Vercel (Root Directory: `landing`)**
- [ ] **Step 2: Perbarui dokumentasi inti repositori `README.md`**
- [ ] **Step 3: Jalankan pengujian global di root (`npm test`) untuk memastikan proyek utama tidak terdampak**
- [ ] **Step 4: Commit dan push branch `feat/landing-page` ke remote GitHub**

```bash
git add landing/README.md README.md
git commit -m "docs: add Vercel deployment documentation for KanbanGO landing page"
git push origin feat/landing-page
```
