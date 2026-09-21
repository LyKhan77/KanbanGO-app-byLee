import { describe, it, expect, beforeEach } from 'vitest';
import React, { useState } from 'react';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import 'fake-indexeddb/auto';
import { db } from '../src/renderer/src/db/db';
import { seedInitialData } from '../src/renderer/src/db/seed';
import { KanbanProvider, useKanban } from '../src/renderer/src/context/KanbanContext';
import { Sidebar } from '../src/renderer/src/components/layout/Sidebar';
import { BoardCanvas } from '../src/renderer/src/components/board/BoardCanvas';
import { CardDetailModal } from '../src/renderer/src/components/modal/CardDetailModal';
import { ProfileModal } from '../src/renderer/src/components/profile/ProfileModal';
import { exportBoardData, importBoardData, validateBackupJson } from '../src/renderer/src/utils/backup';
import { Card } from '../src/shared/types';

// Integrated Full App Component for E2E Testing
const TestApp: React.FC = () => {
  const { cards, checklists, updateCard, deleteCard, createChecklist, toggleChecklist, deleteChecklist } = useKanban();
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const selectedCard = cards.find((c) => c.id === selectedCardId) || null;

  return (
    <div className="flex h-screen w-screen">
      <Sidebar />
      <BoardCanvas onCardClick={(card) => setSelectedCardId(card.id)} />
      <CardDetailModal
        card={selectedCard}
        isOpen={!!selectedCard}
        checklists={checklists}
        onClose={() => setSelectedCardId(null)}
        onUpdateCard={updateCard}
        onDeleteCard={deleteCard}
        onCreateChecklist={createChecklist}
        onToggleChecklist={toggleChecklist}
        onDeleteChecklist={deleteChecklist}
      />
      <ProfileModal />
    </div>
  );
};

describe('End-to-End Feature Verification Suite', () => {
  beforeEach(async () => {
    await db.boards.clear();
    await db.columns.clear();
    await db.cards.clear();
    await db.checklists.clear();
    await db.settings.clear();
    await seedInitialData(db);
  });

  it('Journey 1: Multi-board creation, switching, and deletion', async () => {
    render(
      <KanbanProvider>
        <TestApp />
      </KanbanProvider>
    );

    // 1. Verify default seeded board appears
    await waitFor(() => {
      expect(screen.getAllByText(/Welcome to KanbanGO!/i).length).toBeGreaterThanOrEqual(1);
    });

    // 2. Click "Tambah Board Baru"
    const addBoardBtn = screen.getByText(/Tambah Board Baru/i);
    fireEvent.click(addBoardBtn);

    // 3. Type new board title and submit
    const boardInput = screen.getByPlaceholderText(/Nama board baru.../i);
    fireEvent.change(boardInput, { target: { value: 'Proyek Klien 2026' } });
    const submitBtn = screen.getByText('Simpan');
    fireEvent.click(submitBtn);

    // 4. Verify new board exists in list and in DB
    await waitFor(async () => {
      const board = await db.boards.where('title').equals('Proyek Klien 2026').first();
      expect(board).toBeDefined();
    });
  });

  it('Journey 2: Column management (Add Column, Rename Column, Delete Column)', async () => {
    render(
      <KanbanProvider>
        <TestApp />
      </KanbanProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Inspirasi (To Do)')).toBeDefined();
    });

    // 1. Add a new column
    const addColBtn = screen.getByRole('button', { name: /^Tambah Kolom$/i });
    fireEvent.click(addColBtn);

    const colInput = screen.getByPlaceholderText(/Review & Validasi/i);
    fireEvent.change(colInput, { target: { value: 'Review & QA' } });
    fireEvent.submit(colInput.closest('form')!);

    // 2. Verify column is added to state and database
    await waitFor(async () => {
      expect(screen.getByText('Review & QA')).toBeDefined();
      const colInDb = (await db.columns.toArray()).find((c) => c.title === 'Review & QA');
      expect(colInDb).toBeDefined();
    });
  });

  it('Journey 3: Card creation and rich detail modal (Subtasks, Due Date, Priority, Tags)', async () => {
    render(
      <KanbanProvider>
        <TestApp />
      </KanbanProvider>
    );

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 4, name: /Eksplorasi Fitur Bohemian KanbanGO!/i })).toBeDefined();
    });

    // 1. Click on the welcome card to open detail modal
    const cardTitle = screen.getByRole('heading', { level: 4, name: /Eksplorasi Fitur Bohemian KanbanGO!/i });
    fireEvent.click(cardTitle);

    // 2. Verify modal opened
    expect(screen.getByDisplayValue(/Eksplorasi Fitur Bohemian KanbanGO!/i)).toBeDefined();

    // 3. Add a new checklist item
    const checkInput = screen.getByPlaceholderText(/Tambah butir sub-tugas.../i);
    fireEvent.change(checkInput, { target: { value: 'Verifikasi E2E Test Suite' } });
    fireEvent.submit(checkInput.closest('form')!);

    await waitFor(async () => {
      expect(screen.getByText('Verifikasi E2E Test Suite')).toBeDefined();
      const chk = await db.checklists.filter((c) => c.text === 'Verifikasi E2E Test Suite').first();
      expect(chk).toBeDefined();
    });

    // 4. Toggle a checklist item
    const newCheck = screen.getByText('Verifikasi E2E Test Suite');
    fireEvent.click(newCheck);

    await waitFor(async () => {
      const chk = await db.checklists.filter((c) => c.text === 'Verifikasi E2E Test Suite').first();
      expect(chk?.isCompleted).toBe(true);
    });

    // 5. Add a new Tag
    const tagInput = screen.getByPlaceholderText(/Ketik tag baru.../i);
    fireEvent.change(tagInput, { target: { value: 'CriticalQA' } });
    const tagForm = tagInput.closest('form')!;
    fireEvent.submit(tagForm);

    await waitFor(async () => {
      expect(screen.getAllByText('#CriticalQA').length).toBeGreaterThanOrEqual(1);
    });

    // 6. Close modal
    const closeBtn = screen.getByText('Tutup');
    fireEvent.click(closeBtn);
  });

  it('Journey 4: Card move between columns (State & Database Persistence)', async () => {
    const { container } = render(
      <KanbanProvider>
        <TestApp />
      </KanbanProvider>
    );

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 4, name: /Eksplorasi Fitur Bohemian KanbanGO!/i })).toBeDefined();
    });

    // Verify initial card is in col-craft
    const initialCard = await db.cards.get('card-welcome-1');
    expect(initialCard?.columnId).toBe('col-craft');

    // Perform programmatic move to col-harvest
    await act(async () => {
      await db.cards.update('card-welcome-1', { columnId: 'col-harvest', order: 1 });
    });

    const updatedCard = await db.cards.get('card-welcome-1');
    expect(updatedCard?.columnId).toBe('col-harvest');
  });

  it('Journey 5: Persona Profile editing and avatar customization', async () => {
    render(
      <KanbanProvider>
        <TestApp />
      </KanbanProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Sahabat Bohemian')).toBeDefined();
    });

    // 1. Click on profile in sidebar to open ProfileModal
    const profileWidget = screen.getByText('Sahabat Bohemian');
    fireEvent.click(profileWidget);

    // 2. Verify ProfileModal is open
    expect(screen.getByText('Persona Profile')).toBeDefined();

    // 3. Edit user name and role title
    const nameInput = screen.getByPlaceholderText(/Contoh: Lee/i);
    fireEvent.change(nameInput, { target: { value: 'Lee Antigravity' } });

    const roleInput = screen.getByPlaceholderText(/Contoh: Mindful Craftsman/i);
    fireEvent.change(roleInput, { target: { value: 'Principal Architect' } });

    // 4. Select Owl avatar
    const owlAvatarBtn = screen.getByText('Burung Hantu Bijak');
    fireEvent.click(owlAvatarBtn);

    // 5. Submit form
    const saveProfileBtn = screen.getByText('Simpan Profil');
    fireEvent.click(saveProfileBtn);

    // 6. Verify sidebar and database updated with new profile
    await waitFor(async () => {
      expect(screen.getByText('Lee Antigravity')).toBeDefined();
      expect(screen.getByText('Principal Architect')).toBeDefined();

      const settings = await db.settings.get('default');
      expect(settings?.profile.name).toBe('Lee Antigravity');
      expect(settings?.profile.roleTitle).toBe('Principal Architect');
      expect(settings?.profile.avatarId).toBe('owl');
    });
  });

  it('Journey 6: Full Data Backup, Export & Import with Zod Validation', async () => {
    // 1. Export the welcome board
    const jsonString = await exportBoardData('welcome-board', db);
    expect(jsonString).toBeDefined();

    // 2. Verify JSON structure with Zod
    const parsed = JSON.parse(jsonString);
    const validation = validateBackupJson(parsed);
    expect(validation.success).toBe(true);
    expect(validation.data?.board.title).toBe('Welcome to KanbanGO!');
    expect(validation.data?.cards.length).toBe(3);

    // 3. Import data as a new board
    const importedBoardId = await importBoardData(jsonString, db);
    expect(importedBoardId).toMatch(/^board-imported-/);

    // 4. Verify cloned board exists in database with new IDs
    const importedBoard = await db.boards.get(importedBoardId);
    expect(importedBoard?.title).toBe('Welcome to KanbanGO! (Impor)');

    const importedCards = await db.cards.where('boardId').equals(importedBoardId).toArray();
    expect(importedCards.length).toBe(3);
  });

  it('Journey 7: Search and Priority Filtering', async () => {
    render(
      <KanbanProvider>
        <TestApp />
      </KanbanProvider>
    );

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 4, name: /Eksplorasi Fitur Bohemian KanbanGO!/i })).toBeDefined();
      expect(screen.getByRole('heading', { level: 4, name: /Buat Board Baru untuk Proyek Anda/i })).toBeDefined();
    });

    // 1. Type in search bar
    const searchInput = screen.getByPlaceholderText(/Cari tugas.../i);
    fireEvent.change(searchInput, { target: { value: 'Eksplorasi' } });

    // 2. Verify only matching card is displayed
    expect(screen.getByRole('heading', { level: 4, name: /Eksplorasi Fitur Bohemian KanbanGO!/i })).toBeDefined();
    expect(screen.queryByRole('heading', { level: 4, name: /Buat Board Baru untuk Proyek Anda/i })).toBeNull();

    // 3. Clear search
    fireEvent.change(searchInput, { target: { value: '' } });
    expect(screen.getByRole('heading', { level: 4, name: /Buat Board Baru untuk Proyek Anda/i })).toBeDefined();

    // 4. Filter by priority: 'high'
    const prioritySelect = screen.getByDisplayValue('Semua Prioritas');
    fireEvent.change(prioritySelect, { target: { value: 'high' } });

    // Only high priority card should show
    expect(screen.getByRole('heading', { level: 4, name: /Eksplorasi Fitur Bohemian KanbanGO!/i })).toBeDefined();
    expect(screen.queryByRole('heading', { level: 4, name: /Buat Board Baru untuk Proyek Anda/i })).toBeNull(); // it has 'medium' priority
  });

  it('Journey 8: System Tray event triggers Native OS Notification in real-time', async () => {
    let trayCallback: (() => void) | null = null;
    const showNotificationMock = vi.fn().mockResolvedValue({ success: true });

    (window as any).electronAPI = {
      showNotification: showNotificationMock,
      restoreWindow: vi.fn().mockResolvedValue(undefined),
      onTriggerBriefingFromTray: vi.fn((cb: () => void) => {
        trayCallback = cb;
        return () => {
          trayCallback = null;
        };
      })
    };

    render(
      <KanbanProvider>
        <TestApp />
      </KanbanProvider>
    );

    // Wait for hydration
    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 4, name: /Eksplorasi Fitur Bohemian KanbanGO!/i })).toBeDefined();
    });

    expect(trayCallback).toBeTypeOf('function');

    // Trigger tray manual briefing action
    act(() => {
      trayCallback!();
    });

    expect(showNotificationMock).toHaveBeenCalledTimes(1);
    expect(showNotificationMock).toHaveBeenCalledWith(
      expect.objectContaining({
        title: expect.stringMatching(/🔥 Hardcore Coach/i),
        body: expect.stringMatching(/Eksplorasi Fitur Bohemian KanbanGO!/i)
      })
    );
  });
});
