import { KanbanGODB } from './db';
import { Board, Column, Card, ChecklistItem, UserSettings } from '../../../shared/types';

export async function seedInitialData(db: KanbanGODB): Promise<void> {
  const count = await db.boards.count();
  if (count > 0) return;

  const boardId = 'welcome-board';
  const defaultBoard: Board = {
    id: boardId,
    title: 'Welcome to KanbanGO!',
    description: 'Papan panduan awal & inspirasi kerja mindful',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    isArchived: false
  };

  const colTodo: Column = {
    id: 'col-todo',
    boardId,
    title: 'Inspirasi (To Do)',
    order: 0,
    accentColor: '#c86d51'
  };

  const colCraft: Column = {
    id: 'col-craft',
    boardId,
    title: 'Sedang Dikerjakan (In Craft)',
    order: 1,
    accentColor: '#d4973b'
  };

  const colHarvest: Column = {
    id: 'col-harvest',
    boardId,
    title: 'Selesai (Harvested)',
    order: 2,
    accentColor: '#556b56'
  };

  const card1: Card = {
    id: 'card-welcome-1',
    boardId,
    columnId: 'col-craft',
    title: 'Eksplorasi Fitur Bohemian KanbanGO!',
    description: 'Buka kartu ini untuk melihat detail sub-tugas, tenggat waktu, dan label warna tanah.',
    order: 0,
    priority: 'high',
    dueDate: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
    tags: ['Eksplorasi', 'Boho'],
    createdAt: Date.now(),
    updatedAt: Date.now()
  };

  const card2: Card = {
    id: 'card-welcome-2',
    boardId,
    columnId: 'col-todo',
    title: 'Buat Board Baru untuk Proyek Anda',
    description: 'Gunakan tombol + New Board di sidebar sebelah kiri untuk memisahkan ruang kerja.',
    order: 0,
    priority: 'medium',
    tags: ['Workspace'],
    createdAt: Date.now(),
    updatedAt: Date.now()
  };

  const card3: Card = {
    id: 'card-welcome-3',
    boardId,
    columnId: 'col-harvest',
    title: 'Inisialisasi Database Offline Berhasil',
    description: 'Seluruh data tersimpan aman secara privat di komputer lokal Anda.',
    order: 0,
    priority: 'low',
    tags: ['Database', 'Offline'],
    createdAt: Date.now(),
    updatedAt: Date.now()
  };

  const check1: ChecklistItem = {
    id: 'chk-1',
    cardId: 'card-welcome-1',
    text: 'Coba geser kartu ini antar kolom (Drag & Drop)',
    isCompleted: false,
    order: 0
  };

  const check2: ChecklistItem = {
    id: 'chk-2',
    cardId: 'card-welcome-1',
    text: 'Klik kartu ini untuk mengedit judul dan deskripsi',
    isCompleted: true,
    order: 1
  };

  const defaultSettings: UserSettings = {
    id: 'default',
    activeBoardId: boardId,
    isSidebarCollapsed: false,
    profile: {
      id: 'profile-default',
      name: 'Sahabat Bohemian',
      roleTitle: 'Mindful Creator',
      avatarId: 'fox'
    },
    assistant: {
      isEnabled: true,
      reminderTime: '09:00',
      tone: 'hardcore'
    }
  };

  await db.boards.add(defaultBoard);
  await db.columns.bulkAdd([colTodo, colCraft, colHarvest]);
  await db.cards.bulkAdd([card1, card2, card3]);
  await db.checklists.bulkAdd([check1, check2]);
  await db.settings.add(defaultSettings);
}
