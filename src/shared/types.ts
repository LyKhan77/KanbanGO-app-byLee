// 1. Profil Pengguna (Persona)
export interface UserProfile {
  id: string;               // 'profile-default'
  name: string;             // misal: "Lee"
  roleTitle: string;        // misal: "Builder"
  avatarId: string;         // 'fox' | 'owl' | 'deer' | 'ginkgo' | 'custom'
  customAvatarUrl?: string; // Data URL jika upload lokal
}

// 2. Konfigurasi Asisten Harian
export interface AssistantConfig {
  isEnabled: boolean;
  reminderTime: string;     // format "09:00"
  tone: 'hardcore' | 'balanced' | 'gentle'; // Default: 'hardcore'
  lastBriefingDate?: string;// YYYY-MM-DD
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
  boardId: string;        // Relasi ke Board.id
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
  openBoardIds?: string[];
  isSidebarCollapsed: boolean;
  profile: UserProfile;
  assistant: AssistantConfig;
}
