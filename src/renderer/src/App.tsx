import React, { useState, useEffect } from 'react';
import { KanbanProvider, useKanban } from './context/KanbanContext';
import { WindowHeader } from './components/layout/WindowHeader';
import { Sidebar } from './components/layout/Sidebar';
import { BoardCanvas } from './components/board/BoardCanvas';
import { CardDetailModal } from './components/modal/CardDetailModal';
import { ProfileModal } from './components/profile/ProfileModal';
import { CommandPalette } from './components/modal/CommandPalette';
import { Card } from '../../shared/types';
import { db } from './db/db';
import { exportBoardData, importBoardData } from './utils/backup';

const KanbanDashboard: React.FC = () => {
  const {
    boards,
    activeBoardId,
    columns,
    cards,
    checklists,
    updateCard,
    deleteCard,
    createCard,
    createColumn,
    createChecklist,
    toggleChecklist,
    deleteChecklist,
    openBoardTab,
    createBoard,
    openProfileModal,
    refreshData
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
        const validBoardIds = new Set(boards.map((b) => b.id));
        setAllCards(loaded.filter((c) => validBoardIds.has(c.boardId)));
      } catch {
        setAllCards(cards);
      }
    };
    if (isCommandPaletteOpen) {
      loadAllCards();
    }
  }, [isCommandPaletteOpen, cards, boards]);

  const handleExport = async () => {
    if (!activeBoardId) return;
    try {
      const jsonString = await exportBoardData(activeBoardId, db);
      const blob = new Blob([jsonString], { type: 'application/json' });
      if (typeof URL !== 'undefined' && URL.createObjectURL) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `kanbango-board-${activeBoardId}-${Date.now()}.json`;
        a.click();
        setTimeout(() => {
          if (URL.revokeObjectURL) {
            URL.revokeObjectURL(url);
          }
        }, 1000);
      }
    } catch (err: any) {
      console.error('Export failed:', err);
      if (typeof window !== 'undefined' && typeof window.alert === 'function') {
        window.alert('Gagal mengekspor data board: ' + (err?.message || 'Terjadi kesalahan'));
      }
    }
  };

  const handleImport = () => {
    if (typeof document === 'undefined') return;
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,application/json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      try {
        const text =
          typeof file.text === 'function'
            ? await file.text()
            : await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result as string);
                reader.onerror = reject;
                reader.readAsText(file);
              });
        const newBoardId = await importBoardData(text, db);
        await refreshData();
        await openBoardTab(newBoardId);
      } catch (err: any) {
        console.error('Import failed:', err);
        if (typeof window !== 'undefined' && typeof window.alert === 'function') {
          window.alert('Gagal mengimpor file cadangan: ' + (err?.message || 'Format tidak valid'));
        }
      }
    };
    input.click();
  };

  const selectedCard =
    cards.find((c) => c.id === selectedCardId) ||
    allCards.find((c) => c.id === selectedCardId) ||
    null;

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-boho-linen font-sans text-boho-espresso">
      {/* Custom Window Titlebar */}
      <WindowHeader onOpenCommandPalette={() => setIsCommandPaletteOpen(true)} />

      {/* Main Workspace Layout */}
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <BoardCanvas onCardClick={(card) => setSelectedCardId(card.id)} />
      </div>

      {/* Card Detail Modal */}
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

      {/* Persona Profile Modal */}
      <ProfileModal />

      {/* Bohemian Command Palette */}
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
            } else {
              const colId = await createColumn('Inspirasi');
              const newId = await createCard(colId, 'Kartu Baru');
              if (newId) setSelectedCardId(newId);
            }
          } else if (actionKey === 'export') {
            await handleExport();
          } else if (actionKey === 'import') {
            handleImport();
          } else if (actionKey === 'profile') {
            openProfileModal();
          }
        }}
      />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <KanbanProvider>
      <KanbanDashboard />
    </KanbanProvider>
  );
};

export default App;
