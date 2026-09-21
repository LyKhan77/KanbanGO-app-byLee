# Spesifikasi Desain: KanbanGO! Desktop Application

**Tanggal:** 2026-09-21  
**Status:** Draf Tinjauan (Revisi 2: Tambahan Persona Profile, Hardcore Assistant, & Dukungan Multi-OS)  
**Penulis:** Antigravity & User  
**Tema Estetika:** Bohemian (Boho Chic / Warm Organic)  
**Platform:** Cross-Platform Desktop (Windows, macOS, Linux via Electron + React + TypeScript)

---

## 1. Ringkasan Eksekutif & Tujuan Proyek

**KanbanGO!** adalah aplikasi manajemen tugas Kanban berbasis desktop yang dirancang dengan filosofi **100% Offline-First**, berbalut estetika **Bohemian (Boho Chic / Warm Organic)**, serta dilengkapi **Hardcore Personal Productivity Assistant**. Berbeda dengan aplikasi manajemen proyek korporat yang kaku dan serba putih-biru, KanbanGO! menghadirkan pengalaman kerja yang hangat, menenangkan secara visual (*mindful productivity*), namun memiliki asisten harian yang tegas dan disiplin untuk menjaga fokus pengguna.

### Tujuan Utama
1. **Privasi & Kecepatan Mutlak**: Beroperasi 100% offline di komputer pengguna tanpa perlu registrasi akun, server cloud, atau koneksi internet.
2. **Kenyamanan Visual (Bohemian Aesthetics)**: Menggunakan palet warna earthy (terracotta, sage green, linen, sand) dan tipografi dual-engine (serif untuk headings dan sans-serif tajam untuk isi tugas) yang ramah di mata.
3. **Cross-Platform Sejati**: Mendukung sistem operasi **Windows**, **macOS**, dan **Linux** secara penuh dari satu basis kode terpadu.
4. **Persona Profile & Hardcore Daily Reminder**: Profil personal (nama & avatar) yang disapa setiap hari oleh *Hardcore Interactive Assistant*—mesin analisis harian lokal tanpa ketergantungan API cloud yang membedah board pengguna dan memberikan dorongan disiplin tegas.
5. **Interaktivitas Hidup & Natural**: Menggantikan seluruh emoji dengan ikon vektor SVG elegan (*Lucide Icons*) serta animasi pergerakan natural bertema organik.

---

## 2. Dukungan Sistem Operasi (Cross-Platform Support)

Aplikasi **KanbanGO!** mendukung tiga platform desktop utama secara native melalui packaging `electron-builder`:

| Sistem Operasi | Format Distribusi Output | Keterangan Dukungan |
|---|---|---|
| **Windows** | `.exe` (NSIS Installer) & Portable `.exe` | Dukungan Windows 10/11 64-bit, terintegrasi dengan notifikasi native Windows Toast. |
| **macOS** | `.dmg` & `.app` (Universal Binary) | Mendukung chip Apple Silicon (M1/M2/M3/M4) dan Intel x64, terintegrasi dengan Apple Notification Center & dark/light chrome. |
| **Linux** | `.AppImage`, `.deb`, `.rpm` | Mendukung distribusi Ubuntu/Debian, Fedora, Arch, dan distro Linux modern lainnya dengan freedesktop notifications. |

Seluruh logika UI (React, Dexie.js, Tailwind, CSS) dan logika desktop (IPC, sistem file lokal) berjalan secara konsisten dan identik di ketiga OS tersebut.

---

## 3. Riset & Arsitektur Tech Stack

| Komponen | Teknologi | Alasan Pemilihan |
|---|---|---|
| **Runtime Desktop** | Electron | Menghadirkan kapabilitas cross-platform native (window state, IPC file access, native notifications). |
| **Build Tool & Bundler** | Vite + electron-vite | *Hot Module Replacement* (HMR) kilat dan konfigurasi terintegrasi antara proses main, preload, dan renderer. |
| **UI Framework** | React 18 / 19 + TypeScript | Ekosistem komponen matang, type-safety ketat, dan pengelolaan state reaktif. |
| **Mesin Styling** | Tailwind CSS | Pengelolaan desain kustom bertema Bohemian dan utility classes modular. |
| **Drag & Drop Engine** | `@hello-pangea/dnd` | Performa drag-and-drop kartu terbaik, fluid physics, dan aksesibilitas keyboard. |
| **Sistem Ikon** | `lucide-react` | Paket ikon vektor SVG bersih, konsisten, bergaris halus (*stroke 1.75px*), bebas emoji mentah. |
| **Mesin Animasi** | Framer Motion & CSS Springs | Pergerakan natural, partikel kelopak daun saat tugas selesai, dan efek goresan tinta checklist. |
| **Penyimpanan Lokal** | Dexie.js (IndexedDB Native) | Database ACID offline-first berkecepatan tinggi, tanpa risiko kompilasi binary C++, mendukung indexing dan backup JSON. |
| **Mesin Asisten Lokal** | Local Heuristic Rules Engine | Mesin analisis offline berbasis aturan cerdas yang memproses data tenggat waktu, prioritas, dan stagnasi kartu tanpa cloud. |
| **Validasi Skema** | Zod | Memvalidasi integritas file cadangan JSON sebelum dipulihkan ke database. |
| **Pengujian** | Vitest + React Testing Library | Framework pengujian cepat dan modern untuk unit testing logic serta component testing. |

---

## 4. Fitur Utama & Inovasi Baru

### 4.1 Persona Profile (Profil Pengguna & Avatar)
* **Atribut Profil**: Pengguna dapat menentukan **Nama Pengguna** (misal: "Lee"), **Role/Title** (misal: "Creator", "Builder", "Developer"), serta memilih **Avatar Karakter**.
* **Pilihan Avatar Bohemian**: Koleksi avatar vektor berkarakter natural/fauna mistis (Rubah Hutan, Burung Hantu Bijak, Rusa, Kucing Liar, Daun Ginkgo, Pena Bulu) atau opsi unggah foto lokal mandiri.
* **Integrasi**: Profil pengguna terpampang di pojok bawah sidebar dan menjadi subjek sapaan personal dari Hardcore Assistant.

### 4.2 Hardcore Daily Reminder & Interactive Assistant (100% Offline)
* **Filosofi "Hardcore Coach"**:
  Asisten ini tidak bersikap pasif atau formal membosankan, melainkan bertindak seperti *ruthless personal productivity coach* yang tegas, fokus, dan memotivasi tanpa basa-basi.
* **Mesin Analisis Board Lokal (Heuristic Engine)**:
  Setiap hari saat aplikasi dibuka (atau pada jadwal waktu yang ditentukan, default: pukul 09:00), asisten memindai database lokal:
  1. *Overdue Scanner*: Mendeteksi tugas yang melewati tenggat waktu.
  2. *High Priority Stagnation*: Mendeteksi tugas prioritas tinggi yang masih tertahan di kolom To Do/Backlog tanpa progres.
  3. *Momentum Tracker*: Menghitung rasio kartu selesai hari ini/minggu ini untuk memberikan dorongan semangat.
* **Karakter Percakapan & Briefing Harian**:
  * *Contoh 1 (Jika ada tugas kritis tertunda)*: *"Waktu tidak menunggu, [Nama]! Ada 2 tugas kritis yang tenggatnya hari ini, termasuk '[Judul Tugas]'. Jangan sentuh hal sepele sebelum ini tuntas. Buka fokus sekarang!"*
  * *Contoh 2 (Jika semua tugas lancar)*: *"Papan bersih, [Nama]. Kamu mengeksekusi 3 tugas kemarin dengan rapi. Jangan berpuas diri, pilih target berikutnya di Backlog dan eksekusi sekarang."*
  * *Contoh 3 (Jika banyak kartu menumpuk)*: *"Kolom To Do kamu terlalu penuh (7 kartu)! Hentikan menambah tugas baru, mulai bersihkan satu per satu!"*
* **Bentuk Antarmuka Asisten**:
  * **Daily Briefing Banner**: Muncul anggun di bagian atas board saat pertama kali dibuka pada hari itu, dapat ditutup (*dismiss*) atau langsung klik tombol `[Fokus Tugas Ini]` untuk langsung membuka kartu terkait.
  * **Native OS Desktop Notification**: Memunculkan notifikasi sistem operasi di pojok layar komputer pada jam yang dijadwalkan.

---

## 5. Sistem Desain Bohemian (Visual Identity & Motion)

### 5.1 Token Palet Warna Bohemian
```css
:root {
  /* Earthy Terracotta (Aksen Aksi Utama, Peringatan & Hardcore Callout) */
  --color-terracotta-primary: #c86d51;
  --color-terracotta-deep: #8c4c36;
  --color-terracotta-light: #faede9;
  --color-terracotta-border: #f2cfc4;

  /* Botanical Sage Green (Sukses, Progres, & Selesai) */
  --color-sage-primary: #556b56;
  --color-sage-deep: #3a5c3a;
  --color-sage-light: #eef4ee;
  --color-sage-border: #c9dcc9;

  /* Linen, Parchment & Sand (Latar Belakang Organik) */
  --color-bg-linen: #fdfbf7;       /* Background jendela utama */
  --color-bg-sand: #f4ede2;        /* Background kolom & card detail */
  --color-bg-card: #ffffff;        /* Background kartu tugas */
  --color-border-canvas: #e0d2bf;  /* Garis tepi halus */

  /* Tipografi & Kontras */
  --color-text-espresso: #3b322a;  /* Teks utama (kontras tinggi, hangat) */
  --color-text-walnut: #5a4c3f;    /* Teks sekunder */
  --color-text-clay: #8c7b6c;      /* Teks keterangan/placeholder */

  /* Priority Badges */
  --badge-high-bg: #faede9;
  --badge-high-text: #c86d51;
  --badge-med-bg: #fef8ed;
  --badge-med-text: #d4973b;
  --badge-low-bg: #eef4ee;
  --badge-low-text: #556b56;
}
```

### 5.2 Tipografi Dual-Engine
* **Serif Headings (`Georgia, Playfair Display, serif`)**: Digunakan untuk judul board, nama kolom, label modal, dan heading utama untuk membangkitkan kesan artistik dan sastrawi.
* **Modern Sans-Serif (`Inter, system-ui, sans-serif`)**: Digunakan untuk teks isi kartu tugas, deskripsi panjang, input formulir, dan rincian checklist agar kenyamanan membaca tetap maksimal.

### 5.3 Sistem Ikon Vektor (`lucide-react`)
Menggantikan seluruh emoji karakter dengan ikon vektor profesional bergaris halus (*stroke 1.75px*):
* **Board & Proyek**: `<FolderKanban />`, `<LayoutDashboard />`, `<BookOpen />`, `<Feather />`, `<Compass />`.
* **Kolom & Alur**: `<Layers />`, `<CircleDot />`, `<Clock />`, `<CheckCircle2 />`, `<MoreVertical />`.
* **Kartu & Metadata**: `<Calendar />`, `<Tag />`, `<ListTodo />`, `<AlertCircle />`, `<CheckSquare />`, `<Plus />`, `<Trash2 />`, `<Edit3 />`.
* **Persona & Asisten**: `<User />`, `<Sparkles />`, `<Flame />`, `<ShieldAlert />`, `<Bell />`.

### 5.4 Desain Gerak & Animasi Organik (Natural Motion)
1. **Organic Spring Drag & Drop**: Saat kartu diangkat untuk digeser, kartu membesar lembut (*scale: 1.02*), miring 1.5° mengikuti momentum kursor, dan menghasilkan bayangan lembut bergaya *diffused warm sunlight* (`box-shadow: 0 14px 28px rgba(59,50,42,0.12)`).
2. **Ink-Fill Checklist Stroke**: Saat sub-tugas dicentang, garis coret dan ikon centang menganimasikan goresan tinta mengalir (*SVG stroke-dashoffset transition*) 200ms.
3. **Gentle Leaf Completion Ripple**: Ketika kartu dipindahkan ke kolom paling akhir (*Done/Harvested*), muncul riak partikel daun/kelopak bernuansa terracotta & sage green yang melayang lembut selama 1.2 detik.
4. **Breathing Empty State**: Ketika sebuah kolom atau board belum memiliki kartu, ilustrasi garis botani memiliki animasi melayang perlahan (*gentle breeze floating effect*).

---

## 6. Skema Data & Model Entitas

```typescript
// src/shared/types.ts

// 1. Profil Pengguna (Persona)
export interface UserProfile {
  id: string;               // 'profile-default'
  name: string;             // misal: "Lee"
  roleTitle: string;        // misal: "Lead Craftsman"
  avatarId: string;         // 'fox' | 'owl' | 'deer' | 'ginkgo' | 'custom'
  customAvatarUrl?: string; // Data URL jika upload lokal
}

// 2. Konfigurasi Asisten Harian
export interface AssistantConfig {
  isEnabled: boolean;
  reminderTime: string;     // format "09:00"
  tone: 'hardcore' | 'balanced' | 'gentle'; // Default: 'hardcore'
  lastBriefingDate?: string;// YYYY-MM-DD (mencegah spam berkali-kali di hari sama)
}

// 3. Entitas Papan Kerja (Board)
export interface Board {
  id: string;             // UUID v4
  title: string;          // Judul board, misal: "Pekerjaan Studio", "Karya Tulis"
  description?: string;
  createdAt: number;      // Timestamp (ms)
  updatedAt: number;
  isArchived: boolean;
}

// 4. Entitas Kolom Status (Column)
export interface Column {
  id: string;             // UUID v4
  boardId: string;        // Relasi ke Board.id
  title: string;          // misal: "Inspirasi", "Sedang Dikerjakan", "Selesai"
  order: number;          // Posisi indeks urutan (0, 1, 2...)
  accentColor?: string;   // Warna badge kolom
}

// 5. Entitas Kartu Tugas (Card)
export interface Card {
  id: string;             // UUID v4
  boardId: string;        // Relasi ke Board.id (untuk kueri cepat)
  columnId: string;       // Relasi ke Column.id
  title: string;          // Judul ringkas tugas
  description: string;    // Catatan detail / penjelasan
  order: number;          // Urutan kartu di dalam kolom (0, 1, 2...)
  priority: 'low' | 'medium' | 'high' | 'none';
  dueDate?: string;       // Format tanggal: 'YYYY-MM-DD'
  tags: string[];         // Label kategori (misal: ["Desain", "Riset"])
  createdAt: number;
  updatedAt: number;
}

// 6. Entitas Sub-Tugas (ChecklistItem)
export interface ChecklistItem {
  id: string;             // UUID v4
  cardId: string;         // Relasi ke Card.id
  text: string;           // Rincian sub-tugas
  isCompleted: boolean;   // Status selesai
  order: number;          // Urutan sub-tugas
}

// 7. Pengaturan Sistem
export interface UserSettings {
  id: string;             // 'default'
  activeBoardId?: string;
  isSidebarCollapsed: boolean;
  profile: UserProfile;
  assistant: AssistantConfig;
}
```

### Pengindeksan Dexie (`src/renderer/src/db/db.ts`)
```typescript
import Dexie, { Table } from 'dexie';
import { Board, Column, Card, ChecklistItem, UserSettings } from '@shared/types';

export class KanbanGODB extends Dexie {
  boards!: Table<Board, string>;
  columns!: Table<Column, string>;
  cards!: Table<Card, string>;
  checklists!: Table<ChecklistItem, string>;
  settings!: Table<UserSettings, string>;

  constructor() {
    super('KanbanGODatabase');
    this.version(2).stores({
      boards: 'id, title, isArchived, createdAt',
      columns: 'id, boardId, order',
      cards: 'id, boardId, columnId, order, priority, dueDate',
      checklists: 'id, cardId, order',
      settings: 'id'
    });
  }
}

export const db = new KanbanGODB();
```

---

## 7. Rencana Tonggak Pelaksanaan (Implementation Milestones)

* **Milestone 1**: Scaffolding proyek cross-platform Electron + Vite + React + TypeScript + Tailwind CSS & setup tema Bohemian.
* **Milestone 2**: Basis data lokal Dexie.js (Schema v2), seeding data awal, dan hook state `useKanban`.
* **Milestone 3**: Komponen Persona Profile (modal edit nama & pemilih avatar) dan navigasi Sidebar.
* **Milestone 4**: Kanvas Board, kustomisasi kolom, kartu tugas, dan integrasi Drag-and-Drop (`@hello-pangea/dnd`) dengan animasi organik.
* **Milestone 5**: Modal Detail Kartu (Checklist interaktif, Priority, Due Date, Tagging) dengan debounced auto-save.
* **Milestone 6**: Hardcore Daily Reminder Engine (analisis data tugas offline, daily briefing banner, dan notifikasi sistem desktop).
* **Milestone 7**: Pencarian/Filter, Backup/Export/Import JSON dengan validasi Zod.
* **Milestone 8**: Pengujian Unit/Komponen dan pengemasan installer cross-platform (.exe Windows, .dmg macOS, .AppImage Linux).