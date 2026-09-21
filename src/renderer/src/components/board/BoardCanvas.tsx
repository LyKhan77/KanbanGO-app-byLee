import React, { useState } from 'react';
import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import { useKanban } from '../../context/KanbanContext';
import { ColumnView } from './ColumnView';
import { Card } from '../../../shared/types';
import { DailyBriefingBanner } from '../assistant/DailyBriefingBanner';
import { generateDailyBriefing } from '../../utils/assistantEngine';
import { Search, Plus, Filter, Sparkles, Feather } from 'lucide-react';

interface BoardCanvasProps {
  onCardClick: (card: Card) => void;
}

export const BoardCanvas: React.FC<BoardCanvasProps> = ({ onCardClick }) => {
  const {
    activeBoard,
    columns,
    cards,
    checklists,
    profile,
    assistantConfig,
    updateAssistantConfig,
    moveCard,
    createColumn,
    updateColumn,
    deleteColumn,
    createCard,
    searchQuery,
    setSearchQuery,
    selectedPriority,
    setSelectedPriority,
    selectedTag,
    setSelectedTag
  } = useKanban();

  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState('');
  const [isBriefingDismissed, setIsBriefingDismissed] = useState(false);

  const today = new Date().toISOString().slice(0, 10);
  const showBriefing =
    assistantConfig.isEnabled &&
    !isBriefingDismissed &&
    assistantConfig.lastBriefingDate !== today &&
    columns.length > 0;

  const briefing = showBriefing
    ? generateDailyBriefing(profile, cards, columns)
    : null;

  if (!activeBoard) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center select-none">
        <Feather className="w-12 h-12 text-terracotta/40 mb-3 animate-pulse" />
        <h3 className="font-serif text-lg font-bold text-boho-espresso mb-1">
          Belum Ada Board yang Dipilih
        </h3>
        <p className="text-xs text-boho-clay max-w-sm">
          Pilih salah satu board di sidebar atau buat board baru untuk memulai alur kerja Anda.
        </p>
      </div>
    );
  }

  // Filter cards by search, priority, and tags
  const filteredCards = cards.filter((card) => {
    const matchesSearch =
      searchQuery === '' ||
      card.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      card.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      card.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesPriority =
      selectedPriority === 'all' || card.priority === selectedPriority;

    const matchesTag =
      selectedTag === 'all' || card.tags.includes(selectedTag);

    return matchesSearch && matchesPriority && matchesTag;
  });

  const allTags = Array.from(new Set(cards.flatMap((c) => c.tags)));

  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    moveCard(draggableId, destination.droppableId, destination.index);
  };

  const handleAddColumnSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newColumnTitle.trim()) return;
    await createColumn(newColumnTitle.trim());
    setNewColumnTitle('');
    setIsAddingColumn(false);
  };

  const handleFocusCard = (cardId?: string) => {
    if (!cardId) return;
    const target = cards.find((c) => c.id === cardId);
    if (target) onCardClick(target);
  };

  const handleDismissBriefing = () => {
    setIsBriefingDismissed(true);
    updateAssistantConfig({ lastBriefingDate: today });
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-40px)] overflow-hidden bg-boho-linen select-none">
      {/* Board Header Bar */}
      <div className="p-4 pb-3 bg-white/70 border-b border-boho-canvas flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-serif font-bold text-xl text-boho-espresso tracking-tight">
            {activeBoard.title}
          </h1>
          {activeBoard.description && (
            <p className="text-xs text-boho-clay mt-0.5">{activeBoard.description}</p>
          )}
        </div>

        {/* Filters and Search Bar */}
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-boho-clay" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari tugas..."
              className="pl-8 pr-3 py-1.5 text-xs bg-boho-sand/60 border border-boho-canvas rounded-xl focus:outline-none focus:border-terracotta focus:bg-white w-44 transition-all"
            />
          </div>

          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-boho-sand/60 border border-boho-canvas rounded-xl text-boho-walnut focus:outline-none focus:border-terracotta"
          >
            <option value="all">Semua Prioritas</option>
            <option value="high">Tinggi (High)</option>
            <option value="medium">Sedang (Medium)</option>
            <option value="low">Rendah (Low)</option>
          </select>

          {allTags.length > 0 && (
            <select
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-boho-sand/60 border border-boho-canvas rounded-xl text-boho-walnut focus:outline-none focus:border-terracotta"
            >
              <option value="all">Semua Tag</option>
              {allTags.map((tag) => (
                <option key={tag} value={tag}>
                  #{tag}
                </option>
              ))}
            </select>
          )}

          <button
            onClick={() => setIsAddingColumn(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-terracotta text-white font-medium text-xs rounded-xl hover:bg-terracotta-deep transition-all shadow-sm shadow-terracotta/20"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah Kolom</span>
          </button>
        </div>
      </div>

      {/* Hardcore Assistant Daily Briefing Banner */}
      {briefing && (
        <DailyBriefingBanner
          briefing={briefing}
          onFocusCard={handleFocusCard}
          onDismiss={handleDismissBriefing}
        />
      )}

      {/* Main Board Droppable Area */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex-1 p-6 overflow-x-auto flex gap-5 items-start">
          {columns.map((column) => (
            <ColumnView
              key={column.id}
              column={column}
              cards={filteredCards.filter((c) => c.columnId === column.id)}
              checklists={checklists}
              onCardClick={onCardClick}
              onAddCard={createCard}
              onRenameColumn={(id, title) => updateColumn(id, { title })}
              onDeleteColumn={deleteColumn}
            />
          ))}

          {isAddingColumn && (
            <form
              onSubmit={handleAddColumnSubmit}
              className="w-72 shrink-0 bg-white p-4 rounded-2xl border border-boho-canvas shadow-md space-y-3"
            >
              <h4 className="font-serif font-bold text-xs text-boho-espresso">
                Nama Kolom Baru
              </h4>
              <input
                type="text"
                value={newColumnTitle}
                onChange={(e) => setNewColumnTitle(e.target.value)}
                placeholder="Contoh: Review & Validasi..."
                autoFocus
                className="w-full px-3 py-1.5 text-xs bg-boho-linen/60 border border-boho-canvas rounded-lg focus:outline-none focus:border-terracotta"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddingColumn(false)}
                  className="px-3 py-1 text-xs text-boho-clay hover:text-boho-espresso"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1 bg-terracotta text-white text-xs font-medium rounded-lg hover:bg-terracotta-deep"
                >
                  Buat Kolom
                </button>
              </div>
            </form>
          )}

          {columns.length === 0 && !isAddingColumn && (
            <div className="m-auto flex flex-col items-center justify-center p-10 text-center border-2 border-dashed border-boho-canvas rounded-2xl">
              <Sparkles className="w-8 h-8 text-terracotta/40 mb-2" />
              <p className="text-xs font-medium text-boho-walnut mb-3">
                Belum ada kolom di board ini.
              </p>
              <button
                onClick={() => setIsAddingColumn(true)}
                className="px-4 py-2 bg-terracotta text-white rounded-xl text-xs font-medium shadow-sm hover:bg-terracotta-deep transition-all"
              >
                + Tambah Kolom Pertama
              </button>
            </div>
          )}
        </div>
      </DragDropContext>
    </div>
  );
};
