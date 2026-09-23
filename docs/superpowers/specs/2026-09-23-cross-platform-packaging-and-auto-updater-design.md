# Spesifikasi Desain: Cross-Platform Packaging & Auto-Updater KanbanGO

- **Tanggal**: 2026-09-23
- **Topik**: Cross-Platform Packaging (Windows, macOS, Linux) & Optional In-App Auto-Updater
- **Status**: Disetujui (Approved)

---

## 1. Latar Belakang & Tujuan
KanbanGO membutuhkan mekanisme distribusi lintas sistem operasi (Windows, macOS, dan Linux) serta sistem pembaruan versi (auto-update) yang transparan, opsional, dan ramah pengguna tanpa memaksa penginstalan tanpa izin (*non-intrusive*).

Tujuan utama spesifikasi ini:
1. Menentukan dan mengonfigurasi format ekstensi distribusi untuk Windows, macOS, dan Linux menggunakan `electron-builder`.
2. Menyediakan pipeline CI/CD GitHub Actions multi-platform (`.github/workflows/release.yml`) agar rilis untuk ketiga OS dapat dibuat secara otomatis di cloud saat tag rilis di-push.
3. Mengimplementasikan siklus pembaruan berbasis `electron-updater` dengan proteksi bandwidth (`autoDownload = false`).
4. Menyediakan antarmuka dialog pembaruan bergaya Bohemian (`UpdateModal`) dengan 3 opsi pengguna: **[Perbarui Sekarang]**, **[Nanti Saja]**, dan **[Abaikan Versi Ini]**.
5. Mengintegrasikan tombol manual *"Periksa Pembaruan"* di menu Pengaturan/About.

---

## 2. Format Ekstensi & Konfigurasi Packaging

### 2.1 Target File per Platform
- **Windows**:
  - `nsis`: Installer `.exe` (`KanbanGO!-Setup-<version>.exe`) dengan fitur desktop shortcut, start menu shortcut, dan dukungan differential auto-update.
  - `portable`: Executable standalone `.exe` (`KanbanGO!-Portable-<version>.exe`) tanpa instalasi.
- **macOS**:
  - `dmg`: File Apple Disk Image (`KanbanGO!-<version>.dmg`) dengan layout visual drag-to-Applications.
  - `zip`: File arsip `.zip` (`KanbanGO!-<version>-mac.zip`) yang wajib ada sebagai target download `electron-updater` di macOS.
  - Arsitektur target: `universal` (kompatibel chip Intel x64 dan Apple Silicon M1-M4).
- **Linux**:
  - `AppImage`: Universal portable executable (`KanbanGO!-<version>.AppImage`) yang berjalan di seluruh distro Linux modern.
  - `deb`: Paket installer native Debian/Ubuntu (`kanbango_<version>_amd64.deb`).

### 2.2 Konfigurasi `package.json`
Modifikasi blok `"build"` di `package.json`:
- Menambahkan konfigurasi `publish`:
  ```json
  "publish": {
    "provider": "github",
    "owner": "YOUR_GITHUB_USER",
    "repo": "KanbanGo2",
    "releaseType": "release"
  }
  ```
- Memperjelas target builder untuk NSIS, DMG, dan AppImage/Deb.

### 2.3 Workflow CI/CD Cloud (`.github/workflows/release.yml`)
- Trigger: Push git tag berformat `v*.*.*`.
- Matrix runner:
  - `windows-latest` ➔ Build `.exe` NSIS & Portable.
  - `macos-latest` ➔ Build `.dmg` & `.zip`.
  - `ubuntu-latest` ➔ Build `.AppImage` & `.deb`.
- Action `electron-builder --publish always` untuk otomatis merilis aset ke GitHub Releases bersama file manifest (`latest.yml`, `latest-mac.yml`, `latest-linux.yml`).

---

## 3. Arsitektur Backend & IPC (Main Process & Preload)

### 3.1 Modul Main Process (`src/main/updater.ts`)
- Menggunakan `electron-updater` (`autoUpdater`).
- Kebijakan unduhan:
  - `autoUpdater.autoDownload = false;` (wajib persetujuan user sebelum mendownload).
  - `autoUpdater.autoInstallOnAppQuit = false;` (mencegah install mendadak saat aplikasi ditutup biasa).
- Penanganan Lingkungan Non-Produksi / Pengujian:
  - Menyediakan *Mock Updater* atau bypass saat berjalan di mode development / testing (`npm test`), sehingga antarmuka IPC dan UI dapat diuji secara reliabel tanpa dependensi koneksi internet GitHub Releases.
- IPC Handlers (`ipcMain`):
  - `updater:check`: Memicu pengecekan rilis ke server rilis.
  - `updater:startDownload`: Memulai download file rilis setelah konfirmasi user.
  - `updater:quitAndInstall`: Memanggil `autoUpdater.quitAndInstall()` untuk merestart dan menerapkan pembaruan.
  - `updater:getAppVersion`: Mengembalikan versi aplikasi saat ini via `app.getVersion()`.
- IPC Emitters (`mainWindow.webContents.send`):
  - `updater:status`: Mengirim status transisi (`idle` | `checking` | `available` | `downloading` | `ready` | `error` | `up-to-date`).
  - `updater:info`: Mengirim metadata rilis (`version`, `releaseDate`, `releaseNotes`).
  - `updater:progress`: Mengirim data persentase (`percent`), kecepatan transfer (`bytesPerSecond`), dan ukuran (`transferred`, `total`).
  - `updater:error`: Mengirim pesan error ramah pengguna saat koneksi gagal atau offline.

### 3.2 Preload Context Bridge (`src/preload/index.ts` & `src/preload/index.d.ts`)
Mengekspos namespace `window.electronAPI.updater`:
```typescript
export interface UpdateInfo {
  version: string;
  releaseDate?: string;
  releaseNotes?: string;
}

export interface UpdateProgress {
  percent: number;
  bytesPerSecond: number;
  transferred: number;
  total: number;
}

export interface UpdaterAPI {
  check: (manualTrigger?: boolean) => Promise<{ success: boolean; message?: string }>;
  startDownload: () => Promise<void>;
  quitAndInstall: () => Promise<void>;
  getCurrentVersion: () => Promise<string>;
  onStatusChanged: (callback: (status: string, data?: any) => void) => () => void;
  onDownloadProgress: (callback: (progress: UpdateProgress) => void) => () => void;
  removeListeners: () => void;
}
```

---

## 4. Antarmuka Pengguna (Bohemian Update Modal) & Alur Interaksi

### 4.1 Desain Visual Modal (`src/renderer/src/components/modal/UpdateModal.tsx`)
- Container berlatar belakang hangat `#fdfbf7`, border `#e4ded5`, dan bayangan `shadow-2xl` dengan `rounded-2xl`.
- Header:
  - Icon `Sparkles` / `ArrowUpCircle` dengan chip warna Bohemian Terracotta (`#c26d5c`) atau Sage (`#768875`).
  - Judul: "Pembaruan Versi Tersedia".
  - Badge Perbandingan Versi: `v1.0.0` (saat ini) ➔ `v1.1.0` (terbaru).
- Konten Catatan Rilis:
  - Container berlatar `#f5f0eb` dengan scrollbar halus, merender teks markdown rilis via `renderMarkdownToHtml`.
- Indikator Status & Progress:
  - Saat mengunduh: Tampilkan progress bar Bohemian (background `#e4ded5` dengan fill bar Terracotta), teks persentase `%`, dan ukuran terunduh.
  - Saat selesai: Judul berubah menjadi "Pembaruan Siap Dipasang!".

### 4.2 Tiga Opsi Interaksi Pengguna
1. **[Perbarui Sekarang]** (Primary Button):
   - Memicu IPC `updater.startDownload()`.
   - Mengubah status modal ke mode downloading dengan progress bar aktif.
   - Setelah selesai, tombol berganti menjadi **[Mulai Ulang & Pasang]** yang memanggil `updater.quitAndInstall()`.
2. **[Nanti Saja]** (Secondary Button):
   - Menutup modal tanpa aksi pengunduhan.
   - Akan memunculkan kembali dialog saat aplikasi dibuka di sesi mendatang jika belum diperbarui.
3. **[Abaikan Versi Ini]** (Subtle Text Action):
   - Menyimpan `ignoredUpdateVersion = updateInfo.version` ke preferensi pengguna (`UserSettings` di Dexie).
   - Dialog pembaruan otomatis tidak akan mengganggu lagi untuk versi rilis tersebut.

### 4.3 Integrasi Pengaturan / About Modal
- Menampilkan versi aktif saat ini (misal `v1.0.0`).
- Tombol: **[🔄 Periksa Pembaruan]**.
- Feedback responsif:
  - Status "Sedang memeriksa pembaruan...".
  - Jika up-to-date: pesan ramah "KanbanGO Anda sudah menggunakan versi paling mutakhir!".
  - Jika ada update baru: membuka `UpdateModal` secara langsung (meskipun versi tersebut sempat diabaikan sebelumnya).

---

## 5. Model Data & Persistensi
Di `src/shared/types.ts`, perluasan `UserSettings`:
```typescript
export interface UserSettings {
  // ... properti eksisting ...
  ignoredUpdateVersion?: string;
}
```
Ketika pengguna mengklik *"Abaikan Versi Ini"*, `KanbanContext` memperbarui `userSettings.ignoredUpdateVersion` di Dexie.

---

## 6. Strategi Pengujian (Testing Strategy)
1. **Unit Tests (Backend & IPC)**:
   - Pengujian pemetaan status `updater.ts` dengan mock `autoUpdater` (checking, available, progress, downloaded, error).
   - Pengujian IPC message routing di preload.
2. **Component Tests (UpdateModal)**:
   - Pengujian rendering badge versi saat ini vs versi baru.
   - Pengujian rendering catatan rilis (markdown).
   - Pengujian klik tombol [Perbarui Sekarang] -> memicu handler download dan progress bar.
   - Pengujian klik tombol [Nanti Saja] -> menutup modal.
   - Pengujian klik tombol [Abaikan Versi Ini] -> menyimpan `ignoredUpdateVersion`.
3. **Integration Tests (Settings & Workflow)**:
   - Pengujian tombol "Periksa Pembaruan" di Settings modal.
   - Pengujian ignorasi versi otomatis vs pemeriksaan manual.
