# Spesifikasi Desain: KanbanGO! Desktop Application

**Tanggal:** 2026-09-21  
**Status:** Draf Tinjauan  
**Penulis:** Antigravity & User  
**Tema Estetika:** Bohemian (Boho Chic / Warm Organic)  
**Platform:** Desktop (Electron + React + TypeScript)

---

## 1. Ringkasan Eksekutif & Tujuan Proyek

**KanbanGO!** adalah aplikasi manajemen tugas Kanban berbasis desktop yang dirancang khusus dengan filosofi **100% Offline-First** dan berbalut estetika **Bohemian (Boho Chic / Warm Organic)**. Berbeda dengan aplikasi manajemen proyek korporat yang kaku dan serba putih-biru, KanbanGO! menghadirkan pengalaman kerja yang hangat, tenang (*mindful productivity*), dan estetis tanpa mengorbankan kecepatan, keandalan, dan privasi data lokal pengguna.

### Tujuan Utama
1. **Privasi & Kecepatan Mutlak**: Beroperasi 100% offline secara lokal di komputer pengguna tanpa perlu registrasi akun, login, atau koneksi internet.
2. **Kenyamanan Visual (Bohemian Aesthetics)**: Menggunakan palet warna earthy (terracotta, sage green, linen, sand) dan tipografi dual-engine (serif untuk headings dan sans-serif tajam untuk isi tugas) yang mengurangi ketegangan mata.
3. **Organisasi Fleksibel**: Mendukung pengelolaan banyak papan kerja (*Multi-Board*), penataan kolom yang sepenuhnya dapat dikustomisasi (*customizable columns*), dan fitur esensial kartu tugas (prioritas, tenggat waktu, tag warna, serta checklist sub-tugas).
4. **Interaktivitas Hidup & Natural**: Menggantikan seluruh emoji dengan ikon vektor SVG elegan (*Lucide Icons*) serta dilengkapi animasi pergerakan natural bertema organik.

---

## 2. Riset & Arsitektur Tech Stack

### Pilihan Teknologi Terpilih
Berdasarkan analisis kesiapan lingkungan sistem (tersedianya Node.js v24 dan npm v10), arsitektur yang dipilih adalah:

| Komponen | Teknologi | Alasan Pemilihan |
|---|---|---|
| **Runtime Desktop** | Electron | Menghadirkan kapabilitas aplikasi desktop native (window state, IPC file access, menu) dengan kestabilan tinggi di Windows/macOS/Linux. |
| **Build Tool & Bundler** | Vite + electron-vite | Menyediakan *Hot Module Replacement* (HMR) berkecepatan tinggi dan konfigurasi terintegrasi antara proses main, preload, dan renderer. |
| **UI Framework** | React 18 / 19 + TypeScript | Ekosistem komponen matang, type-safety ketat, dan pengelolaan state reaktif yang teruji. |
| **Mesin Styling** | Tailwind CSS | Konfigurasi mudah untuk custom design tokens bertema Bohemian dan responsive utility classes. |
| **Drag & Drop Engine** | `@hello-pangea/dnd` | Fork resmi dan aktif dari react-beautiful-dnd dengan performa drag-and-drop kartu terbaik, fluid physics, dan aksesibilitas keyboard. |
| **Sistem Ikon** | `lucide-react` | Paket ikon vektor SVG bersih, konsisten, bergaris halus (*stroke 1.75px*), menggantikan emoji mentah. |
| **Mesin Animasi** | Framer Motion & CSS Springs | Menghasilkan pergerakan natural, riak partikel kelopak daun saat tugas selesai, dan efek tinta goresan checklist. |
| **Penyimpanan Lokal** | Dexie.js (IndexedDB Native) | Database ACID offline-first berkecepatan tinggi, tanpa risiko kompilasi binary C++ (*zero native build mismatch*), mendukung indexing dan export/import JSON. |
| **Validasi Skema** | Zod | Memvalidasi integritas file cadangan JSON sebelum dimasukkan ke database untuk mencegah korupsi data. |
| **Pengujian** | Vitest + React Testing Library | Framework pengujian cepat dan modern untuk unit testing logic serta component testing. |

---

## 3. Sistem Desain Bohemian (Visual Identity & Motion)

### 3.1 Token Palet Warna Bohemian
```css
:root {
  /* Earthy Terracotta (Aksen Aksi Utama & Peringatan) */
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

### 3.2 Tipografi Dual-Engine
* **Serif Headings (`Georgia, Playfair Display, serif`)**: Digunakan untuk judul board, nama kolom, label modal, dan heading utama untuk membangkitkan kesan artistik dan sastrawi.
* **Modern Sans-Serif (`Inter, system-ui, sans-serif`)**: Digunakan untuk teks isi kartu tugas, deskripsi panjang, input formulir, dan rincian checklist agar kenyamanan membaca tetap maksimal.

### 3.3 Sistem Ikon Vektor (`lucide-react`)
Menggantikan seluruh emoji karakter dengan ikon vektor profesional:
* **Board & Proyek**: `<FolderKanban />`, `<LayoutDashboard />`, `<BookOpen />`, `<Feather />`, `<Compass />`.
* **Kolom & Alur**: `<Layers />`, `<CircleDot />`, `<Clock />`, `<CheckCircle2 />`, `<MoreVertical />`.
* **Kartu & Metadata**: `<Calendar />`, `<Tag />`, `<ListTodo />`, `<AlertCircle />`, `<CheckSquare />`, `<Plus />`, `<Trash2 />`, `<Edit3 />`.

### 3.4 Desain Gerak & Animasi Organik (Natural Motion)
1. **Organic Spring Drag & Drop**: Saat kartu diangkat untuk digeser, kartu membesar lembut (*scale: 1.02*), miring 1.5° mengikuti momentum kursor, dan menghasilkan bayangan lembut bergaya *diffused warm sunlight* (`box-shadow: 0 14px 28px rgba(59,50,42,0.12)`).
2. **Ink-Fill Checklist Stroke**: Saat sub-tugas dicentang, garis coret dan ikon centang menganimasikan goresan tinta mengalir (*SVG stroke-dashoffset transition*) 200ms.
3. **Gentle Leaf Completion Ripple**: Ketika kartu dipindahkan ke kolom paling akhir (*Done/Harvested*), muncul riak partikel daun/kelopak bernuansa terracotta & sage green yang melayang lembut selama 1.2 detik.
4. **Breathing Empty State**: Ketika sebuah kolom atau board belum memiliki kartu, ilustrasi garis botani memiliki animasi melayang perlahan (*gentle breeze floating effect*).

---

## 4. Struktur Direktori Proyek

```text
KanbanGo2/
├── docs/
│   └── superpowers/
│       └── specs/
│           └── 2026-09-21-kanbango-desktop-design.md
├── src/
│   ├── main/
│   │   ├── index.ts               # Inisialisasi jendela Electron & lifecycle
│   │   ├── windowManager.ts       # Manajemen state ukuran dan posisi window
│   │   └── ipc/
│   │       ├── backupHandlers.ts  # Export & import file JSON lokal
│   │       └── dialogHandlers.ts  # Native OS file dialogs
│   ├── preload/
│   │   ├── index.ts               # Secure contextBridge exposure
│   │   └── index.d.ts             # Tipe window.electronAPI
│   ├── renderer/
│   │   ├── src/
│   │   │   ├── assets/            # Aset grafis & font
│   │   │   ├── components/
│   │   │   │   ├── layout/
│   │   │   │   │   ├── WindowHeader.tsx  # Custom titlebar & window controls
│   │   │   │   │   └── Sidebar.tsx       # Board vault & collapsible navigation
│   │   │   │   ├── board/
│   │   │   │   │   ├── BoardCanvas.tsx   # Canvas scroll horizontal
│   │   │   │   │   ├── BoardHeader.tsx   # Judul board, search bar, add column
│   │   │   │   │   ├── ColumnView.tsx    # Droppable column container
│   │   │   │   │   └── CardItem.tsx      # Draggable card item
│   │   │   │   ├── modal/
│   │   │   │   │   ├── CardDetailModal.tsx # Form edit kartu, checklist, due date
│   │   │   │   │   └── BoardModal.tsx      # Modal buat/edit board
│   │   │   │   └── common/
│   │   │   │       ├── Badge.tsx         # Bohemian priority & tag chips
│   │   │   │       ├── Button.tsx        # Styled organic buttons
│   │   │   │       ├── ErrorBoundary.tsx # Fallback crash protection
│   │   │   │       └── Toast.tsx         # Bohemian alert toasts
│   │   │   ├── db/
│   │   │   │   ├── db.ts          # Definisi Dexie.js database
│   │   │   │   └── seed.ts        # Data awal demonstrasi (Welcome Board)
│   │   │   ├── hooks/
│   │   │   │   ├── useKanban.ts   # State management utama (CRUD boards, cols, cards)
│   │   │   │   └── useFilter.ts   # Logika pencarian & filter kartu
│   │   │   ├── types/
│   │   │   │   └── kanban.ts      # TypeScript interfaces
│   │   │   ├── styles/
│   │   │   │   └── index.css      # Tailwind imports & Bohemian CSS custom properties
│   │   │   ├── App.tsx            # Root component layout
│   │   │   └── main.tsx           # React DOM root entry
│   │   └── index.html
│   └── shared/
│       └── types.ts               # IPC interface types & data models
├── electron.vite.config.ts        # Konfigurasi terpadu Vite
├── package.json
└── tsconfig.json
```

---

## 5. Skema Data & Model Entitas

### 5.1 Definisi Database Dexie.js
Database lokal diberi nama `KanbanGODatabase` dengan skema versi 1:

```typescript
// src/shared/types.ts

export interface Board {
  id: string;             // UUID v4
  title: string;          // Judul board, misal: "Pekerjaan Studio", "Karya Tulis"
  description?: string;
  createdAt: number;      // Timestamp (ms)
  updatedAt: number;
  isArchived: boolean;
}

export interface Column {
  id: string;             // UUID v4
  boardId: string;        // Relasi ke Board.id
  title: string;          // misal: "Inspirasi", "Sedang Dikerjakan", "Selesai"
  order: number;          // Posisi indeks urutan (0, 1, 2...)
  accentColor?: string;   // Warna badge kolom
}

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

export interface ChecklistItem {
  id: string;             // UUID v4
  cardId: string;         // Relasi ke Card.id
  text: string;           // Rincian sub-tugas
  isCompleted: boolean;   // Status selesai
  order: number;          // Urutan sub-tugas
}

export interface UserSettings {
  id: string;             // 'default'
  activeBoardId?: string;
  isSidebarCollapsed: boolean;
}
```

### 5.2 Pengindeksan Dexie (`src/renderer/src/db/db.ts`)
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
    this.version(1).stores({
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

## 6. Aliran Data & Interaksi Pengguna

### 6.1 Unidirectional Data Flow & Optimistic Updates
1. **Drag-and-Drop Kartu**:
   * Saat kartu digeser dari Kolom A ke Kolom B (atau diubah urutannya di dalam kolom yang sama), fungsi `onDragEnd` pada `@hello-pangea/dnd` langsung memicu pembaruan state lokal React secara *optimistic* (< 5ms).
   * Kartu berpindah seketika tanpa flicker visual.
   * Secara asinkron di latar belakang, transaksi Dexie `db.transaction('rw', db.cards, ...)` memperbarui nilai `columnId` dan `order` seluruh kartu terkait.
   * Jika terjadi kegagalan database yang tidak terduga, state UI dikembalikan ke posisi semula (*revert*) dan toast notifikasi peringatan ditampilkan.
2. **Auto-Save Input Kartu**:
   * Pada modal detail kartu, perubahan judul, deskripsi, dan checklist menggunakan teknik *debounced auto-save* (300ms) sehingga pengguna tidak perlu menekan tombol "Simpan" manual setiap kali mengubah detail tugas.

### 6.2 Sistem Pencadangan Data (Backup & Portabilitas)
* **Format Cadangan**: JSON terstruktur mencakup metadata board, kolom, kartu, dan item checklist.
* **Validasi Zod**: Sebelum proses *import* dijalankan, skema file JSON divalidasi ketat menggunakan Zod parser. Jika file rusak atau tidak valid, aplikasi menampilkan pesan error yang ramah dan menolak mutasi database.
* **Pencadangan Otomatis**: Setiap 24 jam atau saat aplikasi ditutup, aplikasi dapat membuat berkas snapshot cadangan di folder `AppData/Roaming/KanbanGO/backups/`.

---

## 7. Penanganan Error & Keandalan (Resilience)

1. **React Error Boundary**:
   * Komponen `ErrorBoundary` membungkus kanvas board utama. Jika terjadi error render pada kartu atau plugin, aplikasi tidak akan menghasilkan "layar putih kosong" (*white screen of death*).
   * Ditampilkan layar pemulihan bergaya Bohemian dengan pesan ramah, ilustrasi daun, dan tombol *Pulihkan & Muat Ulang Board*.
2. **Isolated Preload Security**:
   * `contextIsolation: true` dan `nodeIntegration: false`. Komunikasi native OS sepenuhnya dibatasi hanya melalui API terdaftar di `window.electronAPI`.
3. **Graceful Empty & Delete States**:
   * Penghapusan board atau kolom menyertakan dialog konfirmasi yang jelas agar pengguna tidak kehilangan tugas secara tidak sengaja. Menghapus board secara kaskade (*cascade delete*) akan membersihkan kolom, kartu, dan checklist terkait.

---

## 8. Strategi Pengujian (Testing Strategy)

1. **Unit Testing (Vitest)**:
   * Menguji kalkulasi reorder urutan kartu: `reorderList(list, startIndex, endIndex)`.
   * Menguji penghitungan persentase penyelesaian checklist: `calculateProgress(items)`.
   * Menguji validasi parser JSON backup menggunakan Zod schema validator.
2. **Component Testing (React Testing Library)**:
   * Memverifikasi render kartu tugas (`CardItem`) lengkap dengan priority badge, checklist counter, dan tag.
   * Menguji interaksi penambahan kartu baru dari tombol *+ Tambah Kartu*.
   * Menguji pencarian dan pemfilteran kartu berdasarkan teks judul dan prioritas.
3. **E2E & Launch Testing**:
   * Memastikan Electron window dapat diinisialisasi dan menampilkan *Welcome Board* default pada instalasi baru (*first launch seed data*).

---

## 9. Rencana Tonggak Pelaksanaan (Implementation Milestones)

* **Milestone 1**: Scaffolding proyek Electron + Vite + React + TypeScript + Tailwind CSS & setup tema Bohemian.
* **Milestone 2**: Implementasi layer basis data lokal Dexie.js, skema entitas, dan hook `useKanban`.
* **Milestone 3**: Pengembangan antarmuka utama (Sidebar Board Vault, Custom Titlebar, Canvas Kolom, dan Kartu).
* **Milestone 4**: Integrasi Drag-and-Drop (`@hello-pangea/dnd`) dan animasi motion organik.
* **Milestone 5**: Implementasi Modal Detail Kartu (Checklist interaktif, Priority, Due Date, Tagging) & Auto-Save.
* **Milestone 6**: Fitur Pencarian/Filter, Backup/Export/Import JSON dengan validasi Zod.
* **Milestone 7**: Pengujian Unit/Komponen, penyempurnaan visual, dan pengemasan installer desktop (.exe).