# Spesifikasi Desain: KanbanGO! Web Landing Page 🌿

Dokumen ini mendefinisikan arsitektur teknis, struktur komponen, palet visual, dan alur interaksi untuk Landing Page resmi **KanbanGO!** yang akan di-deploy ke **Vercel**.

---

## 1. Ringkasan Proyek & Tujuan

### 1.1 Latar Belakang
**KanbanGO!** adalah aplikasi desktop produktivitas berbasis papan Kanban offline-first berestetika **Bohemian Modern** (*earthy tones*). Untuk memperkenalkan aplikasi ini kepada publik dan mempermudah distribusi installer multi-platform (Windows, macOS, Linux), dibutuhkan sebuah web landing page yang modern, berkecepatan tinggi, dan mencerminkan identitas visual aplikasi.

### 1.2 Tujuan Utama (*Goals*)
1. **Etalase Visual Bohemian Modern**: Menyajikan estetika hangat terkalibrasi (*terracotta*, *sage*, *sand*, *linen*, *walnut*) yang membedakan KanbanGO! dari aplikasi produktivitas korporat konvensional.
2. **Konversi Unduhan Cepat (Multi-Platform)**: Menyediakan tombol unduhan cerdas yang otomatis mendeteksi sistem operasi pengunjung (Windows, macOS, atau Linux) dan mengarahkan langsung ke paket rilis resmi di GitHub Releases (v1.0.3+).
3. **Demo Mini-Board Interaktif di Web**: Memberikan pengalaman taktil langsung di browser (pengunjung bisa mencoba memindahkan kartu tugas dan mendengarkan efek audio prosedural Web Audio API) sebelum mengunduh aplikasi desktop.
4. **Edukasi & Transparansi Keamanan**: Menjelaskan keunggulan *100% offline-first*, ketiadaan biaya langganan cloud (*zero subscription*), privasi data lokal, serta panduan verifikasi Gatekeeper macOS yang ramah.
5. **Kesiapan Deploy Vercel Instan**: Arsitektur statis murni yang di-cache di seluruh Vercel Edge CDN dengan performa Google Lighthouse 100/100 dan nol biaya server (*zero serverless cost*).

---

## 2. Arsitektur Teknis & Tech Stack

- **Framework & Bundler:** Vite 5 + React 18 + TypeScript
- **Styling:** Tailwind CSS 3 (menggunakan Bohemian design tokens resmi repositori)
- **Icons:** Lucide React (vector SVG murni)
- **Audio Engine:** Native Web Audio API procedural synthesizer (sama seperti `audio.ts` desktop, tanpa aset audio MP3/WAV luar)
- **Deployment Platform:** Vercel (Root Directory: `landing/`)
- **Hosting Strategy:** Pure Static Site Generation (SPA/SSG) dengan SPA rewrite di `vercel.json`

---

## 3. Struktur Direktori Proyek (`landing/`)

Landing page akan dibangun di dalam direktori `landing/` di root repositori:

```text
landing/
├── index.html                  # Entry HTML, SEO meta tags, OpenGraph, favicon daun Bohemian
├── package.json                # Dependensi terisolasi (React 18, Vite, Tailwind, Lucide)
├── vite.config.ts              # Konfigurasi bundler Vite
├── tailwind.config.js          # Token palet warna Bohemian terkalibrasi
├── tsconfig.json               # Konfigurasi TypeScript
├── vercel.json                 # Routing & caching header Vercel
├── public/
│   ├── favicon.ico             # Ikon favicon daun Bohemian
│   ├── icon.png                # Aset logo 512x512
│   └── screenshots/            # Tangkapan layar nyata resolusi tinggi dari desktop app
└── src/
    ├── main.tsx                # React entry point
    ├── App.tsx                 # Root layout dengan smooth scroll navigasi
    ├── index.css               # Tailwind directives & Bohemian base styles
    ├── components/
    │   ├── Navbar.tsx          # Sticky navigation bar dengan logo & link GitHub
    │   ├── HeroSection.tsx     # Judul utama, dynamic download button, hero preview
    │   ├── ValuePillars.tsx    # 4 pilar nilai (Offline, Bohemian, Zero Bloat, Privasi)
    │   ├── InteractiveDemo.tsx # Mini Kanban board (interaktif drag/click + audio taktil)
    │   ├── FeatureShowcase.tsx # Showcases fitur utama (Tabs DnD, Kalender, Card Cover, Palette)
    │   ├── DownloadCenter.tsx  # Pusat unduhan terstruktur (Win, Mac + Gatekeeper guide, Linux)
    │   ├── OpenSourcePledge.tsx# Komitmen privasi & lisensi open-source
    │   └── Footer.tsx          # Branding resmi, versi v1.0.3, hak cipta
    └── utils/
        ├── audio.ts            # Web Audio API procedural synthesizer
        └── osDetector.ts       # Deteksi otomatis sistem operasi pengunjung
```

---

## 4. Desain Visual & Token Palet Bohemian

Situs menggunakan kelas Tailwind kustom yang identik dengan aplikasi desktop:

| Token Warna | Nilai Hex | Penggunaan Utama |
| :--- | :--- | :--- |
| `terracotta` | `#c26d5c` | Aksen primer, tombol CTA download, highlight kartu aktif |
| `terracotta-dark` | `#b05d4d` | Hover state tombol primer |
| `sage` | `#78866b` | Aksen sekunder, status selesai, badge checklist |
| `boho-sand` | `#f3ede4` | Latar belakang seksi sekunder, container kartu |
| `boho-linen` | `#fdfbf7` | Latar belakang utama halaman web |
| `boho-canvas` | `#e4ded5` | Garis batas (*borders*), pemisah seksi |
| `boho-walnut` | `#5c4d43` | Teks judul sekunder, header kolom |
| `boho-espresso` | `#2e2620` | Teks utama (*body typography*) dengan kontras optimal |

---

## 5. Rincian Seksi Halaman (*Section Breakdown*)

### 5.1 Navbar
- **Posisi:** Sticky di bagian atas dengan efek `backdrop-blur-md` dan background semitransparan `#fdfbf7/90`.
- **Elemen:**
  - Logo daun resmi KanbanGO! + tipografi serif hangat *"KanbanGO!"*.
  - Tautan navigasi halus: *Fitur*, *Coba Demo*, *Keunggulan*, *Unduh*.
  - Tombol **GitHub Star** (tautan langsung ke repositori).
  - Tombol aksi cepat: **`Unduh App (v1.0.3)`**.

### 5.2 Hero Section
- **Kop Judul:**
  > *"Produktivitas yang Menenangkan, Kendali Penuh di Tangan Anda."*
- **Sub-judul:**
  > *Aplikasi Kanban desktop offline-first dengan estetika Bohemian Modern, tanpa biaya langganan cloud, dan data 100% tersimpan aman di perangkat lokal Anda.*
- **Tombol CTA Dinamis (`Hero CTA`):**
  - Menggunakan modul `osDetector.ts` untuk mendeteksi OS pengunjung secara otomatis:
    - Pengunjung Windows: Menampilkan **`Unduh untuk Windows (.exe)`**.
    - Pengunjung macOS: Menampilkan **`Unduh untuk macOS (.dmg)`**.
    - Pengunjung Linux: Menampilkan **`Unduh untuk Linux (.AppImage)`**.
  - Opsi dropdown *"Tersedia untuk Windows, macOS, dan Linux"*.
  - Tombol sekunder: **`[Coba Demo Interaktif]`** (scroll halus ke seksi demo).
- **Visual Preview:**
  - Mockup antarmuka KanbanGO! resolusi tinggi dengan kartu bertema alam, tab multi-board, dan daily coach banner.

### 5.3 Value Pillars (Pilar Keunggulan)
Empat kartu bernuansa earthy yang menyoroti keunggulan utama:
1. 🌿 **100% Offline-First & Bebas Langganan Cloud**: Tidak ada biaya bulanan, tidak membutuhkan akun, dan tidak bergantung pada koneksi internet.
2. 🎨 **Estetika Bohemian Modern yang Menenangkan**: Palet earthy hangat terkalibrasi untuk mengurangi kelelahan mata (*digital fatigue*) dan kecemasan kerja.
3. ⚡ **Ringan & Bebas Dependensi Berat**: Audio prosedural Web Audio API murni (zero external audio files), parser markdown native, hemat memori RAM.
4. 🛡️ **Privasi Mutlak & Cadangan Mandiri**: Data tersimpan di IndexedDB lokal perangkat Anda dengan fitur ekspor/impor JSON terenkapsulasi.

### 5.4 Interactive Mini-Board Demo
Fitur unggulan di mana pengunjung web dapat berinteraksi langsung:
- **3 Kolom Mini Kanban:** *🌱 Eksplorasi Ide*, *⚡ Sedang Dikerjakan*, *✨ Selesai*.
- **Interaksi:** Pengunjung dapat memindahkan kartu tugas antar kolom (klik tombol pindah cepat atau drag-and-drop).
- **Audio Sintetis Taktil:** Setiap perpindahan kartu atau centang tugas memicu efek audio Web Audio API bernada Bohemian (klik taktil dan denting akord santai).
- **Reset Button:** Tombol untuk mengembalikan data demo ke kondisi awal.

### 5.5 Feature Showcase (Pameran Fitur Utama)
Tampilan terstruktur dengan screenshot nyata aplikasi:
- **Multi-Board Tab Vault dengan DnD:** Kelola banyak proyek dalam satu jendela dengan navigasi tab dinamis di header.
- **Tampilan Kalender Bulanan Terpadu:** Beralih instan antara Kanban Board dan Monthly Calendar untuk melacak tenggat waktu visual.
- **Detail Kartu Komprehensif:** Markdown live preview, checklist bersarang dengan bilah progres, dan 6 pilihan cover bernuansa alam.
- **Bohemian Command Palette (`Ctrl+K` / `Cmd+K`):** Pencarian tugas fuzzy super cepat dan navigasi keyboard menyeluruh.
- **Hardcore Daily Coach & Persona Widget:** Briefing harian otomatis dan dorongan motivasi terukur.

### 5.6 Download Center (Pusat Unduhan Resmi)
Tiga kartu unduhan terstruktur lengkap dengan metadata rilis v1.0.3:
- **Windows**:
  - Tombol unduh utama: `KanbanGO-Setup-1.0.3.exe` (Installer NSIS).
  - Tautan alternatif: `KanbanGO-1.0.3.exe` (Portable standalone).
- **macOS**:
  - Tombol unduh utama: `KanbanGO-1.0.3-mac.dmg` (Apple Disk Image).
  - Tautan alternatif: `KanbanGO-1.0.3-mac.zip`.
  - **Accordion Panduan macOS Gatekeeper**: Menyediakan snippet perintah `sudo xattr` dan `sudo codesign` lengkap dengan tombol salin satu-klik.
- **Linux**:
  - Tombol unduh utama: `KanbanGO-1.0.3-linux.AppImage`.
  - Tautan alternatif: `KanbanGO-1.0.3-linux.deb` (Debian/Ubuntu).

### 5.7 Open Source & Privacy Pledge
- Komitmen tanpa pelacak (*zero analytics, zero telemetry, zero cookies*).
- Kode sumber terbuka di GitHub di bawah lisensi terbuka, bebas diaudit oleh siapa saja.

### 5.8 Footer
- Branding daun Bohemian resmi, navigasi tautan cepat, link GitHub repository, dan hak cipta.

---

## 6. Konfigurasi Vercel Deployment

Berkas `landing/vercel.json` akan memuat konfigurasi rewrite SPA statis dan header performa:

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

Petunjuk deploy Vercel untuk pengguna:
- **Root Directory:** `landing`
- **Framework Preset:** `Vite`
- **Build Command:** `npm run build`
- **Output Directory:** `dist`

---

## 7. Rencana Verifikasi & Pengujian Kualitas
1. **Verifikasi Tampilan Responsif:** Uji pada breakpoint mobile (375px), tablet (768px), dan desktop (1440px).
2. **Verifikasi Audio Synthesizer:** Memastikan Web Audio API terinisialisasi dengan benar pada interaksi pengguna pertama (*AudioContext resume on user gesture*).
3. **Verifikasi Tautan Unduhan:** Memastikan seluruh tautan mengarah tepat ke GitHub Releases `v1.0.3`.
4. **Verifikasi Build:** Memastikan `npm run build` di dalam folder `landing/` menghasilkan bundel statis bebas error.
