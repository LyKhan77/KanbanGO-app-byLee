# KanbanGO! 🌿

> **Offline-first Desktop Kanban Application with Bohemian Aesthetic & Hardcore Persona Assistant.**

[![CI/CD Release](https://github.com/LyKhan77/KanbanGO-app-byLee/actions/workflows/release.yml/badge.svg)](https://github.com/LyKhan77/KanbanGO-app-byLee/actions)
[![Latest Release](https://img.shields.io/github/v/release/LyKhan77/KanbanGO-app-byLee?color=c26d5c&label=Release)](https://github.com/LyKhan77/KanbanGO-app-byLee/releases/latest)
[![Tests](https://img.shields.io/badge/Tests-201%20Passed-78866b?logo=vitest&logoColor=white)](https://github.com/LyKhan77/KanbanGO-app-byLee/actions)
[![Platform](https://img.shields.io/badge/Platform-Windows%20%7C%20macOS%20%7C%20Linux-e4ded5)](https://github.com/LyKhan77/KanbanGO-app-byLee/releases)

---

## 📖 Ringkasan Proyek (Overview)

**KanbanGO!** adalah aplikasi desktop produktivitas Kanban mandiri (*standalone desktop app*) berkecepatan tinggi yang dibangun di atas fondasi **Electron**, **React 18**, **TypeScript**, dan **Tailwind CSS**. Mengusung tema visual **Bohemian Modern** bernuansa earthy tones (*terracotta, sage, sand, walnut, linen*), KanbanGO! dirancang untuk memberikan pengalaman manajemen tugas yang menenangkan, bebas distorsi, sepenuhnya privat, dan dapat diandalkan secara offline tanpa ketergantungan cloud pihak ketiga.

Dilengkapi dengan **Asisten Persona Hardcore** cerdas, sistem tab multi-board yang dapat diatur urutannya dengan drag-and-drop, visualisasi kalender interaktif, backup JSON instan, pemutar audio sintetis Web Audio API tanpa dependensi berkas suara eksternal, serta sistem auto-updater mandiri berbasis GitHub Releases.

---

## ✨ Fitur Utama (Key Features)

### 1. 🎨 Bohemian Earthy Aesthetic & Desain Responsif
- Palet warna hangat yang terkalibrasi (*Terracotta `#c26d5c`*, *Sage `#78866b`*, *Boho Sand `#f3ede4`*, *Boho Linen `#fdfbf7`*, dan *Walnut `#5c4d43`*).
- Custom window titlebar frameless dengan tombol kontrol jendela bergaya Bohemian.
- Sidebar yang dapat di-collapse untuk memaksimalkan ruang kerja visual papan tugas.

### 2. 🗂️ Multi-Board Vault & Tab Drag-and-Drop
- Kelola berbagai proyek secara terisolasi dalam satu vault.
- Tab bar dinamis di header jendela dengan kemampuan **Drag-and-Drop (DnD)** untuk menyusun ulang urutan tab kerja.
- Manajemen kolom kustom: tambah, ubah nama, hapus, dan atur prioritas kartu tugas.

### 3. 📅 Tampilan Kalender (Calendar View)
- Beralih fleksibel antara mode **Kanban Board** dan **Calendar View**.
- Grid kalender bulanan interaktif dengan navigasi bulan, indikator badge tenggat waktu (*due date*), serta checkbox penyelesaian tugas langsung dari kalender.

### 4. 📝 Card Covers & Markdown Preview
- 6 pilihan warna cover kartu bernuansa Bohemian (*Terracotta, Sage, Sand, Warm Sand, Clay, Espresso*).
- Markdown parser mandiri tanpa dependensi luar: mendukung heading, bold, italic, list, dan code snippet secara instan.
- Subtasks / Checklist interaktif dengan progress indicator visual per kartu.

### 5. 🧘 Hardcore Persona Assistant & Audio Synthesizer
- Personalisasi profil pengguna (nama, avatar hewan/alam, peran).
- Asisten produktivitas dengan briefing harian dan dorongan motivasi berkala.
- **Synthesized Web Audio API**: Efek suara taktil (klik, pop, drag, drop, modal) yang di-sintesis secara prosedural tanpa aset MP3 eksternal.

### 6. 🔍 Bohemian Command Palette (`Ctrl + K` / `Ctrl + P`)
- Akses cepat global untuk mencari board, kartu tugas berdasarkan judul atau tagar (`#tag`), navigasi kalender, backup data, dan periksa update.
- Navigasi keyboard penuh (`ArrowUp`, `ArrowDown`, `Enter`, `Escape`).

### 7. 💾 Cadangan & Pemulihan Mandiri (Backup & Restore)
- Ekspor seluruh struktur board beserta kolom, kartu, checklist, dan metadata ke dalam berkas format JSON terenkapsulasi.
- Impor data aman dengan validasi skema menyeluruh dan auto-repair timestamp.

### 8. 🔔 Integrasi System Tray & Notifikasi Native
- Bekerja di latar belakang dengan System Tray icon (dukungan minimize-to-tray & close-to-tray).
- Notifikasi native desktop untuk pengingat tenggat waktu kartu dan briefing asisten.

### 9. 🚀 Auto-Updater & Distribusi Lintas Platform
- In-App Auto-Updater terintegrasi dengan GitHub Releases (`electron-updater`).
- Pilihan pengguna yang ramah dan tidak memaksa: **[Perbarui Sekarang]**, **[Nanti Saja]**, dan **[Abaikan Versi Ini]**.
- Paket rilis otomatis untuk Windows (`.exe` NSIS & Portable), macOS (`.dmg` & `.zip`), dan Linux (`.AppImage` & `.deb`).

---

## 📦 Unduh Aplikasi (Download)

Unduh installer versi terbaru langsung dari halaman rilis resmi:
👉 **[Halaman Rilis KanbanGO! di GitHub](https://github.com/LyKhan77/KanbanGO-app-byLee/releases/latest)**

| Sistem Operasi | Format Unduhan | Keterangan |
| :--- | :--- | :--- |
| **Windows** | `KanbanGO-Setup-1.0.1.exe` | Installer interaktif Windows standar (NSIS) |
| | `KanbanGO-1.0.1.exe` | Portable executable (langsung jalan) |
| **macOS** | `KanbanGO-1.0.1-mac.dmg` | Apple Disk Image (drag-and-drop ke Applications) |
| | `KanbanGO-1.0.1-mac.zip` | Arsip aplikasi terkompresi |
| **Linux** | `KanbanGO-1.0.1-linux.AppImage` | Berkas executable universal Linux (`chmod +x`) |
| | `KanbanGO-1.0.1-linux.deb` | Paket instalasi Debian / Ubuntu |

### 🍏 Catatan Khusus Pengguna macOS (Gatekeeper)

Jika Anda melihat peringatan seperti *"KanbanGO cannot be opened because Apple cannot check it for malicious software"* atau *"Move to Bin"*, hal ini adalah perilaku standar sistem keamanan **macOS Gatekeeper** untuk aplikasi open-source independen yang belum memiliki sertifikat berbayar Apple Developer ID.

Aplikasi ini 100% aman dan bebas malware. Gunakan salah satu cara mudah berikut untuk membukanya:

1. **Cara Cepat via Terminal (Direkomendasikan):**
   Buka **Terminal** di Mac Anda dan jalankan perintah:
   ```bash
   xattr -cr /Applications/KanbanGO.app
   ```
   *(Perintah ini melepas flag karantina unduhan browser, setelah itu aplikasi dapat diklik dan dibuka langsung selamanya).*

2. **Cara via System Settings (Pengaturan Sistem):**
   - Buka **System Settings** ➔ pilih **Privacy & Security** (Privasi & Keamanan).
   - Gulir ke bawah ke bagian **Security**, Anda akan melihat pemberitahuan tentang KanbanGO.
   - Klik tombol **"Open Anyway"** (Tetap Buka), masukkan password Mac / Touch ID Anda, lalu klik **"Open"**.

3. **Cara via Klik Kanan di Finder:**
   - Buka folder **Applications** di Finder.
   - Tahan tombol **Control** lalu klik ikon **KanbanGO** (atau klik kanan) ➔ pilih **Open** ➔ klik **Open** pada kotak dialog.

---

## 🛠️ Stack Teknologi

- **Runtime & Desktop Core:** Electron 31, Node.js 20
- **Frontend Framework:** React 18, TypeScript, Vite (via `electron-vite`)
- **Styling & UI:** Tailwind CSS, Lucide Icons, clsx
- **Drag-and-Drop:** `@hello-pangea/dnd`
- **Database Lokal:** Dexie.js (IndexedDB wrapper)
- **Audio:** Web Audio API (native procedural oscillator synthesizer)
- **Auto-Updater:** `electron-updater` (GitHub Releases Provider)
- **Packaging:** `electron-builder`
- **Testing:** Vitest, Testing Library (React & DOM), fake-indexeddb

---

## 💻 Memulai Pengembangan Lokal (Quick Start)

### Prasyarat
- [Node.js](https://nodejs.org/) v20 atau lebih baru
- [npm](https://www.npmjs.com/) v9 atau lebih baru
- Git

### Instalasi & Menjalankan Dev Server
```bash
# 1. Clone repositori
git clone https://github.com/LyKhan77/KanbanGO-app-byLee.git
cd KanbanGO-app-byLee

# 2. Pasang dependensi
npm install

# 3. Jalankan mode pengembangan
npm run dev
```

### Menjalankan Pengujian (Testing)
```bash
# Menjalankan seluruh 201 pengujian otomatis
npm test
```

### Mengompilasi Build Produksi
```bash
# Mengompilasi bundel Vite (Main, Preload, Renderer)
npm run build

# Mengemas installer sesuai sistem operasi lokal:
npm run build:win     # Windows (NSIS & Portable)
npm run build:mac     # macOS (DMG & ZIP)
npm run build:linux   # Linux (AppImage & DEB)
```

---

## 📄 Lisensi & Kontribusi

Dikelola dan dipublikasikan secara mandiri oleh tim pengembang **KanbanGO!**.  
Semua hak cipta dan kepemilikan kode dilindungi di bawah kepemilikan repositori [LyKhan77/KanbanGO-app-byLee](https://github.com/LyKhan77/KanbanGO-app-byLee).
