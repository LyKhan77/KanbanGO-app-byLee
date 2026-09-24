# Panduan Kontribusi KanbanGO! 🌿

Terima kasih atas minat Anda untuk berkontribusi pada pengembangan **KanbanGO!**. Dokumen ini berisi panduan alur kerja, standar kode, dan etika kontribusi agar proyek tetap terstruktur, aman, dan berkualitas tinggi.

---

## 🔒 Kebijakan Branch & Review

Branch utama (`master`) berada dalam status **Protected**.
- **Tidak ada yang dapat melakukan `git push` langsung ke branch `master`.**
- Seluruh kontribusi **wajib** melalui alur **Pull Request (PR)**.
- Setiap PR wajib melewati verifikasi pengujian otomatis (CI) dan disetujui (*Approved*) oleh Lead Developer (`@LyKhan77`) sebelum dapat digabungkan (*merge*).

---

## 🚀 Alur Kerja Kontribusi (Git Workflow)

1. **Fork Repositori:**
   Klik tombol **Fork** di pojok kanan atas halaman repositori [GitHub KanbanGO!](https://github.com/LyKhan77/KanbanGO-app-byLee).

2. **Kloning Hasil Fork ke Komputer Lokal:**
   ```bash
   git clone https://github.com/<username-anda>/KanbanGO-app-byLee.git
   cd KanbanGO-app-byLee
   npm install
   ```

3. **Buat Branch Fitur Baru:**
   Gunakan konvensi penamaan branch berikut:
   - `feat/nama-fitur` (untuk penambahan fitur baru)
   - `fix/nama-bug` (untuk perbaikan kutu/masalah)
   - `docs/pembaruan-panduan` (untuk perbaikan dokumentasi)

   Contoh:
   ```bash
   git checkout -b feat/tambah-filter-label
   ```

4. **Kembangkan Kode & Verifikasi Lokal:**
   Pastikan seluruh pengujian otomatis dan build produksi lulus tanpa error:
   ```bash
   # Menjalankan 202+ pengujian otomatis Vitest
   npm test

   # Memverifikasi kompilasi bundel Electron-Vite
   npm run build
   ```

5. **Commit & Push Perubahan:**
   Buat commit yang rapi dan deskriptif:
   ```bash
   git commit -m "feat(filter): add tag filtering support on kanban board"
   git push origin feat/tambah-filter-label
   ```

6. **Buka Pull Request (PR):**
   - Buka halaman GitHub repositori asli dan klik **"Compare & pull request"**.
   - Isi formulir deskripsi PR sesuai checklist yang telah disediakan secara jujur dan lengkap.

---

## 📋 Aturan Mutlak & Standar Kode

Setiap kontributor **wajib** mematuhi aturan baku berikut:

1. **Dilarang Menambahkan Atribusi AI (*No AI Attribution*):**
   DILARANG menambahkan `Co-Authored-By: Claude ...`, `Generated with AI`, atau atribusi bot apa pun ke dalam pesan commit, deskripsi PR, komentar kode, maupun berkas repositori. Semua kontribusi dicatat murni atas nama akun pengembang Anda.
2. **Prinsip Offline-First:**
   Semua fitur harus dapat berjalan secara terisolasi tanpa koneksi internet. Penyimpanan lokal menggunakan Dexie.js (IndexedDB). Jangan menambahkan ketergantungan API pihak ketiga yang membutuhkan koneksi cloud konstan.
3. **Estetika Bohemian Modern:**
   Gunakan kelas token warna Tailwind kustom bernuansa earthy yang telah dikalibrasi (`bg-terracotta`, `bg-sage`, `bg-boho-sand`, `bg-boho-walnut`, `text-boho-espresso`). Hindari hardcoded warna hex sembarangan.
4. **Zero Bloat Dependencies:**
   Pertahankan performa tinggi aplikasi. Jangan menambahkan pustaka luar berukuran besar jika fungsionalitas dapat diselesaikan dengan kode native yang bersih.
5. **Aksesibilitas & Pintasan Keyboard:**
   Setiap modal dialog harus mendukung penutupan dengan tombol `Escape` dan navigasi keyboard yang ramah pengguna.

---

## 🧪 Pengujian Otomatis

Setiap PR akan otomatis diuji oleh sistem CI GitHub Actions ([`.github/workflows/ci.yml`](.github/workflows/ci.yml)) pada lingkungan Ubuntu dengan Node.js 20. Jika pengujian gagal, periksa log kesalahan, perbaiki di branch lokal Anda, lalu push kembali ke branch PR tersebut.

Terima kasih telah membantu menjadikan **KanbanGO!** lebih baik! 🚀
