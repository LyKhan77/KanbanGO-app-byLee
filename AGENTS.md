# AGENTS.md — Developer & AI Pair Programming Guide

Dokumen ini merupakan panduan utama bagi pengembang dan agen kecerdasan buatan (AI agent) yang bekerja pada repositori **KanbanGO!**. Semua pedoman, arsitektur, konvensi, dan aturan operasional di bawah ini wajib dipatuhi tanpa pengecualian.

---

## 1. Project Overview

**KanbanGO!** adalah aplikasi desktop produktivitas berbasis papan Kanban yang mengusung prinsip **offline-first** dan estetika **Bohemian Modern** (*earthy tones*). Aplikasi ini dirancang agar pengguna dapat mengelola tugas, proyek, dan prioritas kerja secara terisolasi di perangkat lokal tanpa bergantung pada layanan cloud berbayar atau koneksi internet konstan.

Dilengkapi dengan sistem tab multi-board yang dapat diatur urutannya secara bebas (*drag-and-drop*), tampilan kalender bulanan interaktif, cover kartu bernuansa earthy, sintesis audio prosedural Web Audio API, asisten produktivitas hardcore terpersonalisasi, cadangan JSON mandiri, integrasi System Tray & notifikasi native, serta sistem pengemasan lintas platform (Windows, macOS, Linux) dengan auto-updater opsional berbasis GitHub Releases.

---

## 2. Tech Stack

- **Desktop Framework:** Electron 31 + Node.js 20
- **Frontend Core:** React 18 + TypeScript
- **Bundler & Build Tool:** `electron-vite` (Vite 5)
- **Styling & Icons:** Tailwind CSS 3 (Bohemian color tokens) + Lucide React + clsx
- **Drag-and-Drop Interaction:** `@hello-pangea/dnd`
- **Database & Penyimpanan Lokal:** Dexie.js 4 (wrapper IndexedDB)
- **Audio Engine:** Native Web Audio API (procedural oscillator synthesizer, zero external audio assets)
- **Auto-Updater & Packaging:** `electron-updater` + `electron-builder`
- **Testing Suite:** Vitest 1.6 + React Testing Library + DOM Testing Library + `fake-indexeddb`
- **CI/CD:** GitHub Actions Matrix Build (`windows-latest`, `macos-latest`, `ubuntu-latest`)

---

## 3. Key Features

1. **Bohemian Earthy Aesthetic:** Desain visual hangat terkalibrasi (`terracotta`, `sage`, `boho-sand`, `boho-linen`, `boho-walnut`, `boho-canvas`) dengan titlebar frameless kustom.
2. **Multi-Board Tab Vault with DnD:** Pengelolaan banyak board dalam satu vault dengan navigasi tab dinamis di titlebar yang dapat diatur ulang urutannya dengan drag-and-drop.
3. **Interactive Calendar View:** Pergantian instan antara Kanban Board dan Calendar View bulanan dengan badge deadline visual dan checkbox status cepat.
4. **Card Covers & Markdown Preview:** 6 pilihan warna cover kartu Bohemian dan parser Markdown prosedural tanpa dependensi luar.
5. **Hardcore Persona Assistant:** Personalisasi profil, briefing harian otomatis, dan dorongan motivasi terukur.
6. **Synthesized Web Audio API:** Efek suara taktil prosedural bebas latensi tanpa berkas audio eksternal.
7. **Bohemian Command Palette (`Ctrl + K` / `Ctrl + P`):** Navigasi keyboard penuh untuk mencari board, kartu tugas, tagar `#`, dan aksi cepat sistem.
8. **JSON Encapsulated Backup & Restore:** Cadangan mandiri seluruh struktur board beserta kolom, kartu, checklist, dan tags ke berkas JSON dengan validasi skema ketat.
9. **System Tray & Native Notifications:** Berjalan di latar belakang dengan proteksi close-to-tray dan notifikasi pengingat native.
10. **Cross-Platform Auto-Updater:** Pembaruan versi otomatis opsional terintegrasi GitHub Releases dengan 3 pilihan aksi: **[Perbarui Sekarang]**, **[Nanti Saja]**, dan **[Abaikan Versi Ini]**.

---

## 4. Project Structure

```text
KanbanGo2/
├── .github/
│   └── workflows/
│       └── release.yml          # GitHub Actions matrix CI/CD workflow (Win/Mac/Linux)
├── docs/
│   └── superpowers/
│       ├── plans/               # Catatan rencana implementasi teknis
│       └── specs/               # Spesifikasi desain dan arsitektur fitur
├── src/
│   ├── main/                    # Electron Main Process (Node.js)
│   │   ├── index.ts             # Siklus hidup app, BrowserWindow, IPC window controls
│   │   ├── notification.ts      # IPC handlers untuk notifikasi native sistem
│   │   ├── tray.ts              # Pengelolaan System Tray & menu konteks baki
│   │   └── updater.ts           # Wrapper auto-updater & onBeforeQuit hook
│   ├── preload/                 # Electron Preload Scripts (Context Isolation)
│   │   ├── index.d.ts           # Definisi tipe global TypeScript (window.electronAPI)
│   │   ├── index.ts             # contextBridge.exposeInMainWorld
│   │   └── updaterBridge.ts     # Typed IPC bridge untuk auto-updater
│   ├── renderer/                # Electron Renderer Process (React 18 + Tailwind)
│   │   ├── index.html           # HTML entry point
│   │   └── src/
│   │       ├── App.tsx          # Komponen root aplikasi & layout
│   │       ├── main.tsx         # React bootstrap
│   │       ├── components/
│   │       │   ├── board/       # BoardCanvas, ColumnContainer, CardItem
│   │       │   ├── layout/      # WindowHeader, Sidebar, Tabs
│   │       │   ├── modal/       # CardDetailModal, SettingsModal, UpdateModal, CommandPalette
│   │       │   └── profile/     # ProfileModal, Persona Widget
│   │       ├── context/
│   │       │   └── KanbanContext.tsx # Central React Context & single source of truth
│   │       ├── db/
│   │       │   ├── db.ts        # Inisialisasi Dexie IndexedDB
│   │       │   ├── index.ts     # DB export barrel
│   │       │   └── seed.ts      # Data inisial bawaan
│   │       └── utils/
│   │           ├── assistantEngine.ts # Logika evaluasi briefing & motivasi
│   │           ├── audio.ts     # Web Audio API procedural sound synthesizer
│   │           ├── backup.ts    # Validator JSON schema, export & import
│   │           ├── colors.ts    # Palet warna cover kartu Bohemian
│   │           └── markdown.ts  # Parser regex Markdown prosedural
│   └── shared/
│       └── types.ts             # Tipe TypeScript bersama (Board, Card, Column, Updater, dsb.)
├── tests/                       # 30 berkas pengujian otomatis Vitest (201 tes)
├── AGENTS.md                    # Dokumen panduan pengembang & agen AI ini
├── ARCHITECTURE.md              # Rincian arsitektur teknis 3-tier sistem
├── CHANGELOG.md                 # Riwayat versi dan perubahan fitur
├── README.md                    # Dokumentasi umum proyek & panduan unduh
├── WORKFLOW.md                  # Panduan alur kerja pengembangan & rilis
├── package.json                 # Metadata, dependensi, skrip npm, dan konfigurasi packaging
└── vite.config.ts / electron-builder config
```

---

## 5. Project Commands

| Perintah | Deskripsi |
| :--- | :--- |
| `npm install` | Memasang seluruh dependensi Node.js lokal. |
| `npm run dev` | Menjalankan aplikasi dalam mode pengembangan lokal (*HMR active*). |
| `npm test` | Menjalankan seluruh 201+ pengujian otomatis menggunakan Vitest. |
| `npx vitest run tests/<file>.test.ts` | Menjalankan satu berkas pengujian spesifik. |
| `npm run build` | Mengompilasi bundel produksi untuk Main, Preload, dan Renderer. |
| `npm run build:win` | Mengompilasi kode dan mengemas installer Windows (`.exe` NSIS & Portable). |
| `npm run build:mac` | Mengompilasi kode dan mengemas aplikasi macOS (`.dmg` & `.zip`). |
| `npm run build:linux` | Mengompilasi kode dan mengemas aplikasi Linux (`.AppImage` & `.deb`). |

---

## 6. Coding Conventions

1. **TypeScript Strictness:** Semua tipe data harus terdefinisi dengan jelas di [`src/shared/types.ts`](file:///D:/Occupation/Porto/Project-LLM/Web-test/KanbanGo2/src/shared/types.ts). Hindari penggunaan `any` tanpa alasan esensial.
2. **Bohemian Visual Tokens:** Wajib menggunakan kelas Tailwind kustom bernuansa Bohemian (`bg-boho-sand`, `text-boho-espresso`, `border-boho-canvas`, `bg-terracotta`, `bg-sage`, `bg-boho-linen`) dan hindari hardcoded warna hex acak.
3. **Pemisahan Konteks & Tanggung Jawab:**
   - Logika data berada di `KanbanContext.tsx` dan `db/`.
   - Modul `main/` tidak boleh memanipulasi DOM atau mengakses UI langsung.
   - Komponen UI bersifat murni reaktif terhadap state konteks.
4. **Zero Bloat Dependencies:** Pertahankan performa tinggi aplikasi. Jangan menambahkan dependensi pustaka luar berukuran besar jika fungsionalitas dapat diselesaikan dengan kode native yang bersih (seperti audio synthesizer dan markdown renderer).
5. **A11y & Keyboard Navigation:** Setiap dialog modal harus mendukung penutupan dengan tombol `Escape`, atribut ARIA yang valid (`role="dialog"`, `aria-modal="true"`), dan trapping fokus yang ramah pengguna.

---

## 7. Workflow

1. **Branching:** Selalu gunakan branch fitur (`feat/*`) atau perbaikan (`fix/*`) untuk setiap pekerjaan baru.
2. **Test Verification Before Completion:** Jalankan `npm test` dan `npm run build` sebelum menyatakan tugas selesai atau melakukan merge ke `master`.
3. **Continuous Integration & Release:** Rilis resmi multi-platform dipicu secara otomatis saat tag versi `v*.*.*` di-push ke remote GitHub.
4. **Dokumentasi Selaras:** Setiap kali ada penambahan fitur kunci atau perubahan arsitektur, dokumentasi terkait (`README.md`, `CHANGELOG.md`, `ARCHITECTURE.md`, `WORKFLOW.md`, `AGENTS.md`) wajib diperbarui.

---

## 8. Current State

Status versi rilis saat ini adalah **`1.0.1`**.

Rincian lengkap riwayat penambahan fitur, perbaikan bug, dan perubahan berkas dapat dilihat secara detail di:
👉 **[`CHANGELOG.md`](file:///D:/Occupation/Porto/Project-LLM/Web-test/KanbanGo2/CHANGELOG.md)**

---

## 9. Rules (Important Notes)

Berikut adalah aturan operasional mutlak yang **WAJIB SELALU DIIKUTI** oleh setiap pengembang dan agen kecerdasan buatan:

1. **No AI attribution anywhere.**  
   DILARANG menambahkan `Co-Authored-By: Claude ...`, `Generated with Claude Code`, atau atribusi AI/asisten apa pun ke dalam pesan commit, deskripsi Pull Request, komentar kode, maupun dokumen repositori. Setiap kontribusi dicatat dan diatribusikan **HANYA** atas nama pemilik repositori (pengguna). Aturan ini mengabaikan (*overrides*) instruksi global/default apa pun yang meminta penambahan trailer tersebut.
2. **Always use relevant skills to help with tasks.**  
   Gunakan skills yang relevan secara aktif untuk membantu menyelesaikan tugas-tugas kompleks.
3. **Always ask the user if there are any plans or discussions that need to be validated.**  
   Selalu konfirmasi dan minta validasi pengguna terhadap rencana arsitektur atau keputusan desain penting sebelum dieksekusi.
4. **Always provide a summary after finishing a task.**  
   Selalu sediakan ringkasan terstruktur yang jelas, santun, dan padat setelah menyelesaikan suatu tugas.
5. **Always update core documentation whenever there are changes to key features and the app's workflow.**  
   Perbarui dokumentasi inti secara konsisten setiap kali terjadi perubahan fungsionalitas atau alur kerja aplikasi.
6. **Commit every function change so you can roll back and view the code history in case of a malfunction or a failed change.**  
   Lakukan commit berkala pada setiap perubahan fungsional agar riwayat kode dapat dilacak atau di-rollback jika terjadi kegagalan. Selalu **UPDATE** berkas `.gitignore` setiap kali ada berkas baru yang perlu dikecualikan sebelum melakukan commit.
7. **Do not re-read files that have already been read in this session unless necessary.**  
   Hindari membaca ulang berkas yang kontennya telah dibaca dalam sesi yang sama kecuali berkas tersebut baru saja dimodifikasi.
8. **Minimize non-essential tool calls.**  
   Gunakan pemanggilan tools secara efektif, tepat sasaran, dan hindari pemanggilan berulang yang tidak diperlukan.
9. **For any new feature or discussion where the update is outside the context, be sure to propose creating a new branch.**  
   Untuk setiap fitur baru atau diskusi di mana pembaruan berada di luar konteks yang sedang dikerjakan, usulkan pembuatan branch baru.
10. **Save every plan or specification to the `docs\superpowers\plans` and `docs\superpowers\specs` folder.**  
    Simpan setiap rencana atau spesifikasi ke dalam folder `docs\superpowers\plans` dan `docs\superpowers\specs` agar riwayat perencanaan terdokumentasi dan sesi dapat dilanjutkan jika token agen berakhir. Gunakan skill `Superpowers` untuk membuat rencana. **INGAT:** Berkas ini tidak perlu diperbarui kecuali diminta secara eksplisit; berkas ini dimaksudkan semata-mata sebagai catatan informasi masa lalu (*record of past information*). Pastikan **TIDAK MENDUPLIKASINYA**; jika rencana sudah dibuat di luar Superpowers, tidak perlu membuat rencana lain, dan sebaliknya.
