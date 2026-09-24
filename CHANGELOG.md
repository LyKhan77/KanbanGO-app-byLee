# Changelog

Semua perubahan penting pada proyek **KanbanGO!** didokumentasikan di berkas ini.

Format changelog ini mengacu pada [Keep a Changelog](https://keepachangelog.com/id/1.0.0/)
dan proyek ini menganut standar [Semantic Versioning (SemVer)](https://semver.org/spec/v2.0.0.html).

---

## [1.0.2] - 2026-09-24

### Added
- **Official Bohemian Leaf Branding Identity:**
  - Pembaruan menyeluruh aset visual resmi aplikasi (*official Bohemian Leaf branding logo*):
    - Ikon resolusi tinggi 512x512 (`resources/icon.png`)
    - Ikon multi-layer Windows executable & shortcut (`resources/icon.ico`)
    - Ikon baki sistem (*system tray*) 16x16 dan 32x32 (`resources/icon-16.png`, `resources/icon-32.png`)
    - Ikon antarmuka React pada WindowHeader (`src/renderer/src/assets/icon.png`)
  - Dokumen presentasi komprehensif resmi aplikasi 12 slide lanskap A4 (`temp/KanbanGO_App_Presentation.pdf` dan `temp/presentation.html`) berbasis tangkapan layar asli aplikasi (*real application screenshots*).

### Fixed
- **Zero Type 3 PDF Pattern Optimization:**
  - Mengganti seluruh karakter emoji dan glyph non-standar pada dokumen presentasi dengan pure vector inline SVG.
  - Mengeliminasi gradien dan bayangan blur kompleks menjadi palet solid Bohemian, menyelesaikan error `pattern_p0_4` pada PDF.js viewer VS Code secara definitif.
- **Pembaruan Dokumentasi Keamanan & Instalasi:**
  - Memperbarui tautan rilis dan panduan instalasi macOS Gatekeeper & Apple Silicon ad-hoc code signing di `README.md`.

---

## [1.0.1] - 2026-09-23

### Added
- **Official Brand Identity & App Icon:**
  - Integrasi berkas ikon resmi `resources/icon.png` (512x512) berestetika daun Bohemian modern sebagai sumber aset tunggal (*single source of truth*).
  - Konfigurasi `buildResources` dan multi-platform packaging icons (Windows `.ico`, macOS `.icns`, Linux `.png`) di `package.json`.
  - Integrasi ikon pada jendela `BrowserWindow` di Electron Main Process dan System Tray dengan fallback buffer cerdas.
  - Integrasi logo resmi pada komponen React `WindowHeader` dan favicon `index.html`.
  - Penyimpanan berkas tangkapan layar presentasi aplikasi resolusi tinggi di folder `temp/`.
- Penambahan kontrol `concurrency` pada alur kerja GitHub Actions (`.github/workflows/release.yml`) untuk mencegah eksekusi rilis yang tumpang tindih (*race condition*).
- Penambahan field `maintainer` eksplisit pada konfigurasi packaging Linux di `package.json`.
- Penguatan keamanan (*security hardening*) di Electron Main Process: mengaktifkan `sandbox: true`, memvalidasi protokol URL eksternal (`https:` dan `http:` saja), serta menambahkan listener `will-navigate` untuk mencegah navigasi ke domain asing.
- Dokumentasi panduan instalasi dan verifikasi lokal macOS Gatekeeper & Apple Silicon (*ad-hoc code signing*).

### Fixed
- Memperbaiki kegagalan pengemasan paket Debian Linux (`.deb`) pada runner Ubuntu dengan mendefinisikan objek `author` yang memuat alamat email valid (`kanbango.team@gmail.com`).
- Menghilangkan konflik duplikasi aset pada rilis macOS (`HTTP 422 Unprocessable Entity`) dengan beralih ke tag rilis baru yang bersih.

---

## [1.0.0] - 2026-09-23

### Added
- **Cross-Platform Packaging & Distribution:**
  - Konfigurasi `electron-builder` multi-OS:
    - Windows: NSIS Installer (`.exe`) dan Portable (`.exe`).
    - macOS: Apple Disk Image (`.dmg`) dan Archive (`.zip`).
    - Linux: Universal AppImage (`.AppImage`) dan Debian package (`.deb`).
- **In-App Auto-Updater:**
  - Integrasi `electron-updater` dengan GitHub Releases provider.
  - Dialog pembaruan versi berestetika Bohemian (`UpdateModal`) dengan 3 pilihan aksi pengguna:
    - **[Perbarui Sekarang]**: Mengunduh pembaruan di latar belakang dengan indikator bilah progres, ukuran berkas, dan kecepatan transfer.
    - **[Nanti Saja]**: Menutup dialog tanpa mengunduh.
    - **[Abaikan Versi Ini]**: Menyimpan nomor versi yang diabaikan ke IndexedDB Dexie untuk menyembunyikan popup otomatis versi tersebut di masa depan.
  - Proteksi `onBeforeQuit` pada proses keluar aplikasi agar proses instalasi update tidak terintersepsi oleh fitur close-to-tray.
  - Fitur pemeriksaan pembaruan manual melalui **Settings Modal** dan **Command Palette** yang dapat mengabaikan flag supresi.
- **Settings Modal:**
  - Dialog preferensi aplikasi dengan informasi versi aktif, ringkasan tema Bohemian, dan tombol cek pembaruan manual beserta umpan balik status interaktif.
- **Multi-Board Tab System & Drag-and-Drop:**
  - Navigasi tab papan kerja dinamis pada header jendela.
  - Urutan tab dapat disusun ulang dengan drag-and-drop halus via `@hello-pangea/dnd`.
  - Persistensi status tab yang dibuka (`openBoardIds`) dan tab aktif (`activeBoardId`) ke IndexedDB.
- **Calendar View:**
  - Tampilan kalender bulanan interaktif untuk memvisualisasikan kartu kerja berdasarkan tenggat waktu (*due date*).
  - Navigasi antar bulan (Bulan Lalu / Bulan Depan / Hari Ini).
  - Badge prioritas visual dan checkbox penyelesaian tugas langsung dari sel kalender.
- **Card Covers & Markdown Preview:**
  - Pilihan 6 warna cover kartu bertema Bohemian (*Terracotta, Sage, Sand, Warm Sand, Clay, Espresso*).
  - Parser Markdown prosedural mandiri tanpa pustaka pihak ketiga untuk preview deskripsi kartu secara aman.
- **Hardcore Persona Assistant:**
  - Profil pengguna (nama, avatar visual, peran/jabatan).
  - Mesin asisten produktivitas dengan briefing harian dan notifikasi motivasi berkala.
- **Web Audio API Sound Engine:**
  - Efek suara prosedural sintetis (klik, pop, drag start, drop, modal open/close) tanpa ketergantungan berkas audio eksternal.
- **Bohemian Command Palette (`Ctrl + K` / `Ctrl + P`):**
  - Pencarian fuzzy untuk board, kartu tugas, tagar `#`, dan aksi cepat navigasi.
- **Sistem Backup & Restore:**
  - Ekspor dan impor data seluruh board dan dependensinya ke format JSON dengan validasi skema ketat.
- **System Tray & Notifikasi Native:**
  - Ikon baki sistem dengan menu tray interaktif dan dukungan minimize/close-to-tray.
  - Notifikasi native desktop untuk pengingat tenggat waktu tugas.
- **CI/CD Automation:**
  - Workflow GitHub Actions (`.github/workflows/release.yml`) dengan strategi matrix 3 OS (`windows-latest`, `macos-latest`, `ubuntu-latest`) yang otomatis mengompilasi dan mengunggah artefak saat tag `v*.*.*` didorong.
- **Pengujian Menyeluruh:**
  - Suite pengujian otomatis Vitest dengan 30 berkas pengujian (201/201 tes lulus).
