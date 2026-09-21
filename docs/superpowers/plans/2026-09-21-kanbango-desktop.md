# KanbanGO! Desktop Application Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Membangun aplikasi desktop Kanban offline-first berestetika Bohemian (Boho Chic / Warm Organic) lengkap dengan Persona Profile dan Hardcore Personal Daily Reminder Assistant untuk Windows, macOS, dan Linux.

**Architecture:** Menggunakan arsitektur multi-proses Electron terisolasi (Main & Preload) dengan renderer React + Vite + TypeScript. Penyimpanan lokal berbasis Dexie.js (IndexedDB ACID engine) dengan pencadangan file JSON dan validasi Zod. Seluruh komponen visual menggunakan Tailwind CSS kustom, sistem ikon vektor `lucide-react`, dan physics drag-and-drop `@hello-pangea/dnd`.

**Tech Stack:** Electron 30+, Vite 5+, React 18/19, TypeScript, Tailwind CSS, Dexie.js, `@hello-pangea/dnd`, `lucide-react`, Zod, Vitest.

---

## Peta File & Tanggung Jawab

| File | Tanggung Jawab |
|---|---|
| `package.json` | Konfigurasi dependensi Electron, React, Tailwind, Dexie, testing, dan build scripts. |
| `electron.vite.config.ts` | Konfigurasi bundler Vite untuk Electron Main, Preload, dan Renderer. |
| `src/shared/types.ts` | Kontrak tipe data bersama: `Board`, `Column`, `Card`, `ChecklistItem`, `UserProfile`, `UserSettings`. |
| `src/main/index.ts` | Lifecycle jendela desktop Electron, window state, IPC listeners file dialog. |
| `src/preload/index.ts` | Context bridge aman mengekspos `window.electronAPI`. |
| `src/renderer/src/styles/index.css` | Token palet Bohemian (`terracotta`, `sage`, `linen`, `sand`) dan typography styles. |
| `src/renderer/src/db/db.ts` | Definisi kelas `KanbanGODB` (Dexie.js) dan seeder data awal. |
| `src/renderer/src/utils/assistantEngine.ts` | Mesin analisis offline heuristic untuk overdue tasks, high-priority stagnation, dan briefing hardcore. |
| `src/renderer/src/context/KanbanContext.tsx` | State management reaktif utama (boards, columns, cards, active board, persona profile). |
| `src/renderer/src/components/layout/WindowHeader.tsx` | Custom window titlebar bergaya Bohemian dengan tombol minimize/maximize/close. |
| `src/renderer/src/components/layout/Sidebar.tsx` | Sidebar board vault, tombol tambah board, backup/export/import, dan persona profile widget. |
| `src/renderer/src/components/profile/ProfileModal.tsx` | Modal pengaturan nama pengguna dan pemilihan avatar Bohemian. |
| `src/renderer/src/components/board/BoardCanvas.tsx` | Kanvas board horizontal scrollable dengan header, pencarian, dan tombol tambah kolom. |
| `src/renderer/src/components/board/ColumnView.tsx` | Wadah kolom droppable dengan header, action menu, dan list kartu. |
| `src/renderer/src/components/board/CardItem.tsx` | Komponen kartu draggable dengan priority badge, due date, checklist progress bar, dan animasi spring. |
| `src/renderer/src/components/modal/CardDetailModal.tsx` | Modal detail kartu dengan live checklist, priority picker, datepicker, dan debounced auto-save. |
| `src/renderer/src/components/assistant/DailyBriefingBanner.tsx` | Banner asisten harian bergaya hardcore coach di bagian atas board. |
| `src/renderer/src/utils/backup.ts` | Logika export dan import JSON terverifikasi skema Zod. |

---

### Task 1: Inisialisasi Proyek & Setup Konfigurasi Bohemian

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `electron.vite.config.ts`
- Create: `tailwind.config.js`
- Create: `postcss.config.js`
- Create: `src/renderer/index.html`
- Create: `src/renderer/src/styles/index.css`
- Test: `tests/setup.test.ts`

- [ ] **Step 1: Tulis tes konfigurasi environment Vitest**

```typescript
// tests/setup.test.ts
import { describe, it, expect } from 'vitest';

describe('Project Environment Setup', () => {
  it('verifies test environment is active and running', () => {
    expect(true).toBe(true);
  });
});
```

- [ ] **Step 2: Jalankan tes untuk memastikan gagal sebelum setup**

Run: `npx vitest run tests/setup.test.ts`  
Expected: FAIL (package.json belum ada atau vitest belum terpasang).

- [ ] **Step 3: Buat `package.json`, `electron.vite.config.ts`, `tailwind.config.js`, dan dependensi**

Buat `package.json` dengan scripts dev/build dan dependencies:
- `electron`, `electron-vite`, `vite`
- `react`, `react-dom`, `@types/react`, `@types/react-dom`
- `typescript`, `tailwindcss`, `postcss`, `autoprefixer`
- `dexie`, `@hello-pangea/dnd`, `lucide-react`, `zod`
- `vitest`, `@testing-library/react`, `jsdom`

Buat `tailwind.config.js` dengan palet Bohemian:
```javascript
module.exports = {
  content: ['./src/renderer/index.html', './src/renderer/src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        terracotta: {
          DEFAULT: '#c86d51',
          deep: '#8c4c36',
          light: '#faede9',
          border: '#f2cfc4'
        },
        sage: {
          DEFAULT: '#556b56',
          deep: '#3a5c3a',
          light: '#eef4ee',
          border: '#c9dcc9'
        },
        boho: {
          linen: '#fdfbf7',
          sand: '#f4ede2',
          card: '#ffffff',
          canvas: '#e0d2bf',
          espresso: '#3b322a',
          walnut: '#5a4c3f',
          clay: '#8c7b6c'
        }
      },
      fontFamily: {
        serif: ['Georgia', 'Cambria', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif']
      }
    }
  },
  plugins: []
};
```

Install dependensi via npm.

- [ ] **Step 4: Jalankan tes Vitest**

Run: `npx vitest run tests/setup.test.ts`  
Expected: PASS

- [ ] **Step 5: Commit konfigurasi awal**

```bash
git add package.json tsconfig.json electron.vite.config.ts tailwind.config.js postcss.config.js src/renderer/ tests/
git commit -m "chore: scaffold electron vite react project with bohemian tailwind setup"
```

---

### Task 2: Definisi Tipe Bersama & Layer Database Dexie.js

**Files:**
- Create: `src/shared/types.ts`
- Create: `src/renderer/src/db/db.ts`
- Create: `src/renderer/src/db/seed.ts`
- Test: `tests/db.test.ts`

- [ ] **Step 1: Tulis tes CRUD Database Dexie lokal**

```typescript
// tests/db.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import 'fake-indexeddb/auto';
import { KanbanGODB } from '../src/renderer/src/db/db';

describe('KanbanGODB Local Storage', () => {
  let db: KanbanGODB;

  beforeEach(async () => {
    db = new KanbanGODB();
    await db.boards.clear();
  });

  it('creates and retrieves a new board', async () => {
    const newBoard = {
      id: 'board-1',
      title: 'Studio Workspace',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      isArchived: false
    };
    await db.boards.add(newBoard);
    const fetched = await db.boards.get('board-1');
    expect(fetched?.title).toBe('Studio Workspace');
  });
});
```

- [ ] **Step 2: Jalankan tes untuk memverifikasi kegagalan**

Run: `npx vitest run tests/db.test.ts`  
Expected: FAIL (KanbanGODB belum didefinisikan).

- [ ] **Step 3: Implementasikan `types.ts`, `db.ts`, dan `seed.ts`**

Tulis model data `Board`, `Column`, `Card`, `ChecklistItem`, `UserProfile`, `UserSettings` pada `src/shared/types.ts`.
Tulis implementasi `KanbanGODB` pada `src/renderer/src/db/db.ts` dengan skema versi 2 dan tabel yang diindeks.
Tulis data bibit default (*welcome board*) pada `seed.ts` yang otomatis terisi pada instalasi baru.

- [ ] **Step 4: Jalankan tes untuk memverifikasi kelulusan**

Run: `npx vitest run tests/db.test.ts`  
Expected: PASS

- [ ] **Step 5: Commit layer database**

```bash
git add src/shared/types.ts src/renderer/src/db/ tests/db.test.ts
git commit -m "feat: implement Dexie database layer with seed data and schema"
```

---

### Task 3: Mesin Asisten Harian Hardcore (Offline Heuristic Engine)

**Files:**
- Create: `src/renderer/src/utils/assistantEngine.ts`
- Test: `tests/assistantEngine.test.ts`

- [ ] **Step 1: Tulis tes unit untuk algoritma analisis asisten hardcore**

```typescript
// tests/assistantEngine.test.ts
import { describe, it, expect } from 'vitest';
import { generateDailyBriefing } from '../src/renderer/src/utils/assistantEngine';
import { Card, UserProfile } from '../src/shared/types';

describe('Hardcore Daily Reminder Engine', () => {
  const mockProfile: UserProfile = {
    id: 'user-1',
    name: 'Lee',
    roleTitle: 'Builder',
    avatarId: 'fox'
  };

  it('generates urgent callout when there are overdue or today-due high priority cards', () => {
    const today = new Date().toISOString().slice(0, 10);
    const mockCards: Card[] = [
      {
        id: 'c1',
        boardId: 'b1',
        columnId: 'col-todo',
        title: 'Selesaikan Arsitektur Database',
        description: '',
        order: 0,
        priority: 'high',
        dueDate: today,
        tags: ['Backend'],
        createdAt: Date.now(),
        updatedAt: Date.now()
      }
    ];

    const briefing = generateDailyBriefing(mockProfile, mockCards, []);
    expect(briefing.urgency).toBe('high');
    expect(briefing.message).toContain('Lee');
    expect(briefing.highlightCardId).toBe('c1');
  });
});
```

- [ ] **Step 2: Jalankan tes untuk memverifikasi kegagalan**

Run: `npx vitest run tests/assistantEngine.test.ts`  
Expected: FAIL (`generateDailyBriefing` belum ada).

- [ ] **Step 3: Implementasikan logika evaluasi kartu & template kalimat hardcore**

Di `assistantEngine.ts`:
- Filter kartu yang `dueDate <= today` dan berada di luar kolom `Done`.
- Filter kartu dengan prioritas `high` yang belum bergerak.
- Bangun pesan dorongan bertema *hardcore productivity coach* yang menyapa nama pengguna secara personal.

- [ ] **Step 4: Jalankan tes untuk memverifikasi kelulusan**

Run: `npx vitest run tests/assistantEngine.test.ts`  
Expected: PASS

- [ ] **Step 5: Commit mesin asisten**

```bash
git add src/renderer/src/utils/assistantEngine.ts tests/assistantEngine.test.ts
git commit -m "feat: implement hardcore offline assistant heuristic engine"
```

---

### Task 4: Custom Window Header, Sidebar, & Persona Profile Modal

**Files:**
- Create: `src/renderer/src/components/layout/WindowHeader.tsx`
- Create: `src/renderer/src/components/layout/Sidebar.tsx`
- Create: `src/renderer/src/components/profile/ProfileModal.tsx`
- Create: `src/renderer/src/context/KanbanContext.tsx`
- Test: `tests/Sidebar.test.tsx`

- [ ] **Step 1: Tulis tes render Sidebar dan widget profil pengguna**

```typescript
// tests/Sidebar.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { Sidebar } from '../src/renderer/src/components/layout/Sidebar';
import { KanbanContext } from '../src/renderer/src/context/KanbanContext';

describe('Sidebar Component', () => {
  it('renders active boards and user persona profile', () => {
    const mockContextVal: any = {
      boards: [{ id: 'b1', title: 'Studio Project', isArchived: false }],
      activeBoardId: 'b1',
      profile: { id: 'p1', name: 'Lee', roleTitle: 'Builder', avatarId: 'fox' },
      setActiveBoardId: () => {}
    };

    render(
      <KanbanContext.Provider value={mockContextVal}>
        <Sidebar />
      </KanbanContext.Provider>
    );

    expect(screen.getByText('Studio Project')).toBeDefined();
    expect(screen.getByText('Lee')).toBeDefined();
  });
});
```

- [ ] **Step 2: Jalankan tes untuk memverifikasi kegagalan**

Run: `npx vitest run tests/Sidebar.test.tsx`  
Expected: FAIL.

- [ ] **Step 3: Implementasikan komponen WindowHeader, Sidebar, ProfileModal, dan Context**

- `WindowHeader.tsx`: Titlebar desktop minimalis bernuansa warm linen dengan tombol kontrol window (`minimize`, `maximize`, `close`) via IPC.
- `Sidebar.tsx`: Daftar board dengan tombol tambah, navigasi ganti board, tombol backup/export, dan badge avatar profil di bagian bawah.
- `ProfileModal.tsx`: Pilihan avatar Bohemian (Flora/Fauna SVG) dan input nama pengguna yang tersimpan ke Dexie.
- `KanbanContext.tsx`: Mengatur state global papan kerja dan profil.

- [ ] **Step 4: Jalankan tes untuk memverifikasi kelulusan**

Run: `npx vitest run tests/Sidebar.test.tsx`  
Expected: PASS

- [ ] **Step 5: Commit komponen layout & profile**

```bash
git add src/renderer/src/components/layout/ src/renderer/src/components/profile/ src/renderer/src/context/ tests/Sidebar.test.tsx
git commit -m "feat: add window header, board vault sidebar, and persona profile modal"
```

---

### Task 5: Kanvas Board, Manajemen Kolom & Drag-and-Drop Kartu

**Files:**
- Create: `src/renderer/src/components/board/BoardCanvas.tsx`
- Create: `src/renderer/src/components/board/ColumnView.tsx`
- Create: `src/renderer/src/components/board/CardItem.tsx`
- Test: `tests/CardItem.test.tsx`

- [ ] **Step 1: Tulis tes untuk komponen kartu tugas (`CardItem`)**

```typescript
// tests/CardItem.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { CardItem } from '../src/renderer/src/components/board/CardItem';
import { Card } from '../src/shared/types';

describe('CardItem Component', () => {
  it('renders task title, high priority badge, and tag', () => {
    const mockCard: Card = {
      id: 'c1',
      boardId: 'b1',
      columnId: 'col1',
      title: 'Tugas Desain Bohemian',
      description: 'Deskripsi lengkap',
      order: 0,
      priority: 'high',
      tags: ['Design'],
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    render(<CardItem card={mockCard} index={0} onClick={() => {}} />);
    expect(screen.getByText('Tugas Desain Bohemian')).toBeDefined();
    expect(screen.getByText('Design')).toBeDefined();
  });
});
```

- [ ] **Step 2: Jalankan tes untuk memverifikasi kegagalan**

Run: `npx vitest run tests/CardItem.test.tsx`  
Expected: FAIL.

- [ ] **Step 3: Implementasikan kanvas horizontal, ColumnView, CardItem, dan integrasi `@hello-pangea/dnd`**

- `CardItem.tsx`: Draggable item dengan priority tag warna Bohemian, label tag, checklist ratio, dan due date.
- `ColumnView.tsx`: Droppable column dengan header nama kolom, tombol tambah kartu, dan menu titik tiga (rename/delete).
- `BoardCanvas.tsx`: Area DragDropContext utama dengan scroll horizontal mulus, search bar, dan tombol tambah kolom.

- [ ] **Step 4: Jalankan tes untuk memverifikasi kelulusan**

Run: `npx vitest run tests/CardItem.test.tsx`  
Expected: PASS

- [ ] **Step 5: Commit kanvas dan interaksi drag-and-drop**

```bash
git add src/renderer/src/components/board/ tests/CardItem.test.tsx
git commit -m "feat: implement kanban canvas, columns, card items with drag and drop"
```

---

### Task 6: Modal Detail Kartu, Checklist Interaktif & Debounced Auto-Save

**Files:**
- Create: `src/renderer/src/components/modal/CardDetailModal.tsx`
- Create: `src/renderer/src/hooks/useDebounce.ts`
- Test: `tests/CardDetailModal.test.tsx`

- [ ] **Step 1: Tulis tes interaksi checklist dan modal detail kartu**

```typescript
// tests/CardDetailModal.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { CardDetailModal } from '../src/renderer/src/components/modal/CardDetailModal';
import { Card } from '../src/shared/types';

describe('CardDetailModal Component', () => {
  it('renders card title in editing view and checklist container', () => {
    const mockCard: Card = {
      id: 'c1',
      boardId: 'b1',
      columnId: 'col1',
      title: 'Uji Coba Modal Detail',
      description: 'Catatan detail',
      order: 0,
      priority: 'medium',
      tags: [],
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    render(
      <CardDetailModal
        card={mockCard}
        isOpen={true}
        onClose={() => {}}
        onUpdateCard={() => {}}
      />
    );

    expect(screen.getByDisplayValue('Uji Coba Modal Detail')).toBeDefined();
    expect(screen.getByText(/Sub-tugas/i)).toBeDefined();
  });
});
```

- [ ] **Step 2: Jalankan tes untuk memverifikasi kegagalan**

Run: `npx vitest run tests/CardDetailModal.test.tsx`  
Expected: FAIL.

- [ ] **Step 3: Implementasikan CardDetailModal dan checklist management**

- Input judul kartu dan textarea deskripsi dengan auto-save debounced 300ms.
- Dropdown pemilih prioritas bergaya Bohemian (None, Low, Medium, High).
- Input tanggal batas waktu (*Date Picker*).
- Komponen checklist sub-tugas: tambah item baru, toggle centang selesai dengan ink-stroke animation, dan hapus item.

- [ ] **Step 4: Jalankan tes untuk memverifikasi kelulusan**

Run: `npx vitest run tests/CardDetailModal.test.tsx`  
Expected: PASS

- [ ] **Step 5: Commit modal detail kartu**

```bash
git add src/renderer/src/components/modal/CardDetailModal.tsx src/renderer/src/hooks/useDebounce.ts tests/CardDetailModal.test.tsx
git commit -m "feat: implement card detail modal with interactive checklists and auto-save"
```

---

### Task 7: Daily Briefing Banner & Integrasi Hardcore Reminder

**Files:**
- Create: `src/renderer/src/components/assistant/DailyBriefingBanner.tsx`
- Modify: `src/renderer/src/components/board/BoardCanvas.tsx`
- Test: `tests/DailyBriefingBanner.test.tsx`

- [ ] **Step 1: Tulis tes banner asisten harian**

```typescript
// tests/DailyBriefingBanner.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { DailyBriefingBanner } from '../src/renderer/src/components/assistant/DailyBriefingBanner';

describe('DailyBriefingBanner Component', () => {
  it('renders hardcore motivational briefing message', () => {
    const mockBriefing = {
      urgency: 'high' as const,
      headline: 'Waktu Tidak Menunggu!',
      message: 'Kamu punya 2 tugas mendesak hari ini.',
      highlightCardId: 'c1'
    };

    render(
      <DailyBriefingBanner
        briefing={mockBriefing}
        onFocusCard={() => {}}
        onDismiss={() => {}}
      />
    );

    expect(screen.getByText('Waktu Tidak Menunggu!')).toBeDefined();
    expect(screen.getByText(/2 tugas mendesak/i)).toBeDefined();
  });
});
```

- [ ] **Step 2: Jalankan tes untuk memverifikasi kegagalan**

Run: `npx vitest run tests/DailyBriefingBanner.test.tsx`  
Expected: FAIL.

- [ ] **Step 3: Implementasikan DailyBriefingBanner dan integrasikan di BoardCanvas**

- Desain banner dengan aksen terracotta dan gradient hangat, menampilkan pesan hardcore coach.
- Tombol `[Fokus Tugas Ini Sekarang]` yang otomatis membuka modal kartu terkait.
- Tombol tutup (`Dismiss`) yang menandai `lastBriefingDate` hari ini agar tidak berulang.

- [ ] **Step 4: Jalankan tes untuk memverifikasi kelulusan**

Run: `npx vitest run tests/DailyBriefingBanner.test.tsx`  
Expected: PASS

- [ ] **Step 5: Commit integrasi asisten harian**

```bash
git add src/renderer/src/components/assistant/ tests/DailyBriefingBanner.test.tsx
git commit -m "feat: add daily hardcore assistant briefing banner with task focus trigger"
```

---

### Task 8: Fitur Pencadangan (Export/Import JSON) & Validasi Skema Zod

**Files:**
- Create: `src/renderer/src/utils/backup.ts`
- Test: `tests/backup.test.ts`

- [ ] **Step 1: Tulis tes validasi skema backup Zod**

```typescript
// tests/backup.test.ts
import { describe, it, expect } from 'vitest';
import { validateBackupJson } from '../src/renderer/src/utils/backup';

describe('Backup Validation Logic', () => {
  it('validates a valid board backup JSON payload', () => {
    const validData = {
      version: 1,
      exportedAt: Date.now(),
      boards: [{ id: 'b1', title: 'Test Board', isArchived: false, createdAt: 1, updatedAt: 1 }],
      columns: [],
      cards: [],
      checklists: []
    };
    const result = validateBackupJson(validData);
    expect(result.success).toBe(true);
  });

  it('rejects an invalid backup payload', () => {
    const invalidData = { corrupted: true };
    const result = validateBackupJson(invalidData);
    expect(result.success).toBe(false);
  });
});
```

- [ ] **Step 2: Jalankan tes untuk memverifikasi kegagalan**

Run: `npx vitest run tests/backup.test.ts`  
Expected: FAIL.

- [ ] **Step 3: Implementasikan validasi Zod dan generator ekspor JSON**

- Skema Zod untuk `BackupSchema`.
- Fungsi `exportBoardToJson(boardId)` yang mengompilasi seluruh kolom, kartu, dan checklist terkait ke file JSON.
- Fungsi `importBoardFromJson(jsonString)` yang memvalidasi skema sebelum memasukkannya ke Dexie.

- [ ] **Step 4: Jalankan tes untuk memverifikasi kelulusan**

Run: `npx vitest run tests/backup.test.ts`  
Expected: PASS

- [ ] **Step 5: Commit sistem backup**

```bash
git add src/renderer/src/utils/backup.ts tests/backup.test.ts
git commit -m "feat: implement JSON backup export/import with strict Zod validation"
```

---

### Task 9: Electron Main Process, Native IPC, & Konfigurasi Multi-OS Build

**Files:**
- Create: `src/main/index.ts`
- Create: `src/preload/index.ts`
- Modify: `package.json` (konfigurasi build electron-builder untuk Windows, macOS, Linux)
- Test: `tests/electron.smoke.test.ts`

- [ ] **Step 1: Tulis smoke test untuk verifikasi main process file dan preload signature**

```typescript
// tests/electron.smoke.test.ts
import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Electron Configuration Smoke Test', () => {
  it('verifies main and preload source files exist', () => {
    expect(fs.existsSync(path.resolve(__dirname, '../src/main/index.ts'))).toBe(true);
    expect(fs.existsSync(path.resolve(__dirname, '../src/preload/index.ts'))).toBe(true);
  });
});
```

- [ ] **Step 2: Jalankan tes untuk memverifikasi kegagalan**

Run: `npx vitest run tests/electron.smoke.test.ts`  
Expected: FAIL.

- [ ] **Step 3: Implementasikan Main Process, Preload ContextBridge, dan konfigurasi Electron Builder**

- `src/main/index.ts`: BrowserWindow configuration (frameless/titlebar overlay, window state recovery, native OS notification dispatch).
- `src/preload/index.ts`: Mengekspos method window controls (`minimize`, `maximize`, `close`, `saveBackup`, `loadBackup`).
- Konfigurasi target platform di `package.json`:
  - `win`: target `nsis`, `portable`
  - `mac`: target `dmg`, `zip`, kategori `public.app-category.productivity`
  - `linux`: target `AppImage`, `deb`

- [ ] **Step 4: Jalankan tes untuk memverifikasi kelulusan**

Run: `npx vitest run tests/electron.smoke.test.ts`  
Expected: PASS

- [ ] **Step 5: Commit konfigurasi desktop multi-OS**

```bash
git add src/main/ src/preload/ package.json tests/electron.smoke.test.ts
git commit -m "feat: implement electron main/preload bridge and cross-platform build configs"
```

---

### Task 10: Pengujian Terpadu & Verifikasi Akhir

**Files:**
- Test: Seluruh unit dan component tests di folder `tests/`
- Build verification: `npm run build`

- [ ] **Step 1: Jalankan seluruh suite tes pengujian otomatis**

Run: `npm test`  
Expected: Seluruh unit test (db, assistantEngine, layout, modal, backup, smoke test) lulus 100%.

- [ ] **Step 2: Verifikasi proses bundling build Vite & TypeScript**

Run: `npm run build`  
Expected: Berhasil menghasilkan output terkompilasi di `out/main`, `out/preload`, dan `out/renderer` tanpa error tipe.

- [ ] **Step 3: Commit dan tag rilis awal**

```bash
git add .
git commit -m "chore: complete all implementation milestones and verify test suites"
```