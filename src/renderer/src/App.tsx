import React, { useState } from 'react';
import { KanbanProvider, useKanban } from './context/KanbanContext';
import { WindowHeader } from './components/layout/WindowHeader';
import { Sidebar } from './components/layout/Sidebar';
import { BoardCanvas } from './components/board/BoardCanvas';
import { CardDetailModal } from './components/modal/CardDetailModal';
import { ProfileModal } from './components/profile/ProfileModal';
import { Card } from '../../shared/types';

const KanbanDashboard: React.FC = () => {
  const {
    cards,
    checklists,
    updateCard,
    deleteCard,
    createChecklist,
    toggleChecklist,
    deleteChecklist
  } = useKanban();

  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);

  const selectedCard = cards.find((c) => c.id === selectedCardId) || null;

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-boho-linen font-sans text-boho-espresso">
      {/* Custom Window Titlebar */}
      <WindowHeader />

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
