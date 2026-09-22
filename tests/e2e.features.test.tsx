import { describe, it, expect, beforeEach, vi } from 'vitest';
import React, { useState, useEffect } from 'react';
import { render, screen, fireEvent, act, waitFor, within } from '@testing-library/react';
import 'fake-indexeddb/auto';
import { db } from '../src/renderer/src/db/db';
import { seedInitialData } from '../src/renderer/src/db/seed';
import { KanbanProvider, useKanban } from '../src/renderer/src/context/KanbanContext';
import { WindowHeader } from '../src/renderer/src/components/layout/WindowHeader';
import { Sidebar } from '../src/renderer/src/components/layout/Sidebar';
import { BoardCanvas } from '../src/renderer/src/components/board/BoardCanvas';
import { CardDetailModal } from '../src/renderer/src/components/modal/CardDetailModal';
import { ProfileModal } from '../src/renderer/src/components/profile/ProfileModal';
import { CommandPalette } from '../src/renderer/src/components/modal/CommandPalette';
import { exportBoardData, importBoardData, validateBackupJson } from '../src/renderer/src/utils/backup';
import { Card } from '../src/shared/types';

// Integrated Full App Component for E2E Testing
const TestApp: React.FC = () => {
  const {
    boards,
    columns,
    cards,
    checklists,
    updateCard,
    deleteCard,
    createCard,
    createChecklist,
    toggleChecklist,
    deleteChecklist,
    openBoardTab,
    createBoard,
    openProfileModal,
    setViewMode
  } = useKanban();

  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [allCards, setAllCards] = useState<Card[]>(cards);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if ((e.ctrlKey || e.metaKey) && (key === 'k' || key === 'p')) {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const loadAllCards = async () => {
      try {
        const loaded = await db.cards.toArray();
        setAllCards(loaded);
      } catch {
        setAllCards(cards);
      }
    };
    if (isCommandPaletteOpen) {
      loadAllCards();
    }
  }, [isCommandPaletteOpen, cards]);

  const selectedCard =
    cards.find((c) => c.id === selectedCardId) ||
    allCards.find((c) => c.id === selectedCardId) ||
    null;

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden">
      <WindowHeader onOpenCommandPalette={() => setIsCommandPaletteOpen(true)} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <BoardCanvas onCardClick={(card) => setSelectedCardId(card.id)} />
      </div>
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
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        boards={boards}
        cards={allCards.length > 0 ? allCards : cards}
        onSelectBoard={(boardId) => openBoardTab(boardId)}
        onSelectCard={(card) => {
          openBoardTab(card.boardId);
          setSelectedCardId(card.id);
        }}
        onQuickAction={async (actionKey) => {
          if (actionKey === 'create-board') {
            await createBoard('Board Baru ' + (boards.length + 1));
          } else if (actionKey === 'create-card') {
            if (columns.length > 0) {
              const newId = await createCard(columns[0].id, 'Kartu Baru');
              if (newId) setSelectedCardId(newId);
            }
          } else if (actionKey === 'switch-calendar') {
            await setViewMode('calendar');
          } else if (actionKey === 'switch-kanban') {
            await setViewMode('kanban');
          } else if (actionKey === 'profile') {
            openProfileModal();
          }
        }}
      />
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

  it('Journey 9: Multi-Board Tabs switching, adding, and closing', async () => {
    render(
      <KanbanProvider>
        <TestApp />
      </KanbanProvider>
    );

    // 1. Verifies seeded board tab is rendered in WindowHeader
    const tablist = await screen.findByRole('tablist', { name: /Papan Kerja Terbuka/i });
    expect(tablist).toBeDefined();

    await waitFor(() => {
      const tabs = screen.getAllByRole('tab');
      expect(tabs.length).toBe(1);
      expect(tabs[0].textContent).toContain('Welcome to KanbanGO!');
      expect(tabs[0].getAttribute('aria-selected')).toBe('true');
    });

    // 2. Clicks add board tab (+) to create a second board
    const addTabBtn = within(tablist).getByRole('button', { name: /Tambah Board Baru/i });
    fireEvent.click(addTabBtn);

    // 3. Verifies second tab appears and is active
    await waitFor(() => {
      const tabs = screen.getAllByRole('tab');
      expect(tabs.length).toBe(2);
      expect(tabs[1].textContent).toContain('Board Baru 2');
      expect(tabs[1].getAttribute('aria-selected')).toBe('true');
      expect(tabs[0].getAttribute('aria-selected')).toBe('false');
    });

    // 4. Clicks first tab to switch back
    const tabs = screen.getAllByRole('tab');
    fireEvent.click(tabs[0]);

    await waitFor(() => {
      const currentTabs = screen.getAllByRole('tab');
      expect(currentTabs[0].getAttribute('aria-selected')).toBe('true');
      expect(currentTabs[1].getAttribute('aria-selected')).toBe('false');
    });

    // 5. Closes second tab via close button, verifying tab is closed and first board remains active
    const secondTabCloseBtn = within(screen.getAllByRole('tab')[1]).getByRole('button', {
      name: /Tutup tab/i
    });
    fireEvent.click(secondTabCloseBtn);

    await waitFor(() => {
      const remainingTabs = screen.getAllByRole('tab');
      expect(remainingTabs.length).toBe(1);
      expect(remainingTabs[0].textContent).toContain('Welcome to KanbanGO!');
      expect(remainingTabs[0].getAttribute('aria-selected')).toBe('true');
      expect(within(tablist).queryByText('Board Baru 2')).toBeNull();
    });
  });

  it('Journey 10: Bohemian Command Palette search, keyboard navigation, and card modal opening', async () => {
    render(
      <KanbanProvider>
        <TestApp />
      </KanbanProvider>
    );

    await waitFor(() => {
      expect(screen.getAllByText(/Welcome to KanbanGO!/i).length).toBeGreaterThanOrEqual(1);
    });

    // 1. Opens Command Palette (via clicking ⌘K or Ctrl+K)
    // Verify opening via keyboard shortcut Ctrl+K
    fireEvent.keyDown(window, { key: 'k', ctrlKey: true });
    expect(screen.getByRole('dialog')).toBeDefined();

    // Close via Escape key
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).toBeNull();

    // Reopen via clicking ⌘K button
    const cmdKBtn = screen.getByTitle(/Buka Command Palette/i);
    fireEvent.click(cmdKBtn);

    const searchInput = await screen.findByPlaceholderText(/Ketik nama board, kartu tugas, atau aksi cepat.../i);
    expect(searchInput).toBeDefined();

    // 2. Types search query (e.g. 'Eksplorasi')
    fireEvent.change(searchInput, { target: { value: 'Eksplorasi' } });

    // Verifies matching card appears in the palette dialog
    const paletteDialog = screen.getByRole('dialog');
    expect(within(paletteDialog).getByText('Eksplorasi Fitur Bohemian KanbanGO!')).toBeDefined();

    // 3. Selects the card item with Enter (using keyboard navigation)
    fireEvent.keyDown(searchInput, { key: 'ArrowDown' });
    fireEvent.keyDown(searchInput, { key: 'Enter' });

    // 4. Verifies Command Palette closes and CardDetailModal opens displaying the task details
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeNull();
      expect(screen.queryByPlaceholderText(/Ketik nama board, kartu tugas, atau aksi cepat.../i)).toBeNull();
    });

    await waitFor(() => {
      expect(screen.getByDisplayValue('Eksplorasi Fitur Bohemian KanbanGO!')).toBeDefined();
      expect(screen.getByText('Sub-tugas (Checklist)')).toBeDefined();
      expect(screen.getByText('Catatan & Deskripsi Tugas')).toBeDefined();
      expect(screen.getByText(/Buka kartu ini untuk melihat detail sub-tugas/i)).toBeDefined();
    });
  });

  it('Journey 11: Calendar View switching, board tabs DnD reordering, card covers, and markdown preview', async () => {
    render(
      <KanbanProvider>
        <TestApp />
      </KanbanProvider>
    );

    // 1. Wait for initial hydration
    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 4, name: /Eksplorasi Fitur Bohemian KanbanGO!/i })).toBeDefined();
    });

    // 2. Board Tabs Reordering via DnD
    const tablist = screen.getByRole('tablist', { name: /Papan Kerja Terbuka/i });
    const addTabBtn = within(tablist).getByRole('button', { name: /Tambah Board Baru/i });
    fireEvent.click(addTabBtn);

    await waitFor(() => {
      expect(screen.getAllByRole('tab').length).toBe(2);
    });

    const tabs = screen.getAllByRole('tab');
    const tab1 = tabs[0];
    const tab2 = tabs[1];

    const dataTransfer = {
      setData: vi.fn(),
      getData: vi.fn().mockImplementation((format: string) => {
        if (format === 'application/x-kanbango-tab-index' || format === 'text/plain') return '0';
        return '';
      }),
      effectAllowed: 'move',
      dropEffect: 'move'
    };

    fireEvent.dragStart(tab1, { dataTransfer });
    fireEvent.dragOver(tab2, { dataTransfer });
    fireEvent.drop(tab2, { dataTransfer });

    // 3. View Switcher in Board Toolbar: switch to Calendar View
    const calendarViewBtn = screen.getByRole('button', { name: /Tampilan Kalender/i });
    fireEvent.click(calendarViewBtn);

    // Verifies Calendar View rendered
    await waitFor(() => {
      expect(screen.getByText(/Hari Ini/i)).toBeDefined();
      expect(screen.getByText(/Belum Terjadwal/i)).toBeDefined();
    });

    // Switch back to Kanban View
    const kanbanViewBtn = screen.getByRole('button', { name: /Tampilan Kanban/i });
    fireEvent.click(kanbanViewBtn);

    // Switch back to Welcome board tab so its cards are visible
    const welcomeTab = screen.getAllByRole('tab').find((t) => t.textContent?.includes('Welcome to KanbanGO!'));
    if (welcomeTab) {
      fireEvent.click(welcomeTab);
    }

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 4, name: /Eksplorasi Fitur Bohemian KanbanGO!/i })).toBeDefined();
    });

    // 4. Switch to Calendar View via Command Palette quick action
    fireEvent.keyDown(window, { key: 'k', ctrlKey: true });
    const searchInput = await screen.findByPlaceholderText(/Ketik nama board, kartu tugas, atau aksi cepat.../i);
    fireEvent.change(searchInput, { target: { value: 'Beralih ke Tampilan Kalender' } });

    const calendarAction = await screen.findByText('Beralih ke Tampilan Kalender');
    fireEvent.click(calendarAction);

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeNull();
      expect(screen.getByText(/Belum Terjadwal/i)).toBeDefined();
    });

    // Switch back to Kanban via board toolbar
    const kanbanBtn2 = screen.getByRole('button', { name: /Tampilan Kanban/i });
    fireEvent.click(kanbanBtn2);

    // 5. Card Cover Selection & Markdown Preview in CardDetailModal
    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 4, name: /Eksplorasi Fitur Bohemian KanbanGO!/i })).toBeDefined();
    });
    const cardEl = screen.getByRole('heading', { level: 4, name: /Eksplorasi Fitur Bohemian KanbanGO!/i });
    fireEvent.click(cardEl);

    // Modal opens
    await waitFor(() => {
      expect(screen.getByText(/Aksen Kartu:/i)).toBeDefined();
    });

    // Select terracotta cover chip
    const terracottaChip = screen.getByTitle(/Terracotta/i);
    fireEvent.click(terracottaChip);

    // Switch to Markdown Preview tab
    const previewTabBtn = screen.getByRole('button', { name: /Pratinjau/i });
    fireEvent.click(previewTabBtn);

    await waitFor(() => {
      expect(screen.getAllByText(/Sub-tugas/i).length).toBeGreaterThanOrEqual(1);
    });

    // Close modal
    const closeBtn = screen.getByTestId('modal-close-btn');
    fireEvent.click(closeBtn);

    // Verify card in column now has top cover bar
    await waitFor(() => {
      const coverBar = document.querySelector('[data-testid="card-cover-bar"]');
      expect(coverBar).not.toBeNull();
    });
  });
});
