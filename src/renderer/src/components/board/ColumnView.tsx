import React, { useState } from 'react';
import { Droppable } from '@hello-pangea/dnd';
import { Column, Card, ChecklistItem } from '../../../shared/types';
import { CardItem } from './CardItem';
import { Plus, MoreVertical, Trash2, Edit2, Check, X } from 'lucide-react';

interface ColumnViewProps {
  column: Column;
  cards: Card[];
  checklists: ChecklistItem[];
  onCardClick: (card: Card) => void;
  onAddCard: (columnId: string, title: string) => Promise<void>;
  onRenameColumn: (columnId: string, newTitle: string) => Promise<void>;
  onDeleteColumn: (columnId: string) => Promise<void>;
}

export const ColumnView: React.FC<ColumnViewProps> = ({
  column,
  cards,
  checklists,
  onCardClick,
  onAddCard,
  onRenameColumn,
  onDeleteColumn
}) => {
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [newCardTitle, setNewCardTitle] = useState('');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [columnTitle, setColumnTitle] = useState(column.title);
  const [showMenu, setShowMenu] = useState(false);

  const handleAddCardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCardTitle.trim()) return;
    await onAddCard(column.id, newCardTitle.trim());
    setNewCardTitle('');
    setIsAddingCard(false);
  };

  const handleRenameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (columnTitle.trim()) {
      await onRenameColumn(column.id, columnTitle.trim());
    }
    setIsEditingTitle(false);
  };

  return (
    <div className="w-80 shrink-0 bg-boho-sand/70 rounded-2xl border border-boho-canvas flex flex-col max-h-[calc(100vh-140px)] shadow-sm select-none">
      {/* Column Header */}
      <div className="p-3.5 pb-2.5 flex items-center justify-between border-b border-boho-canvas/50">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span
            className="w-2.5 h-2.5 rounded-full shrink-0"
            style={{ backgroundColor: column.accentColor || '#c86d51' }}
          />

          {isEditingTitle ? (
            <form onSubmit={handleRenameSubmit} className="flex items-center gap-1 flex-1">
              <input
                type="text"
                value={columnTitle}
                onChange={(e) => setColumnTitle(e.target.value)}
                autoFocus
                className="w-full px-2 py-0.5 text-xs font-serif font-bold bg-white border border-terracotta rounded"
              />
              <button type="submit" className="p-1 text-sage hover:bg-white rounded">
                <Check className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setIsEditingTitle(false)}
                className="p-1 text-boho-clay hover:bg-white rounded"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </form>
          ) : (
            <div className="flex items-center gap-2 truncate">
              <h3 className="font-serif font-bold text-sm text-boho-espresso truncate">
                {column.title}
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-white/80 text-boho-walnut border border-boho-canvas/60">
                {cards.length}
              </span>
            </div>
          )}
        </div>

        {/* Column Actions Menu */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1 text-boho-clay hover:text-boho-espresso hover:bg-white/60 rounded-lg transition-colors"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {showMenu && (
            <div className="absolute right-0 top-7 w-36 bg-white border border-boho-canvas rounded-xl shadow-lg p-1 z-30 font-sans text-xs">
              <button
                onClick={() => {
                  setShowMenu(false);
                  setIsEditingTitle(true);
                }}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 text-boho-espresso hover:bg-boho-sand rounded-lg transition-colors"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Ubah Nama</span>
              </button>
              <button
                onClick={() => {
                  setShowMenu(false);
                  if (confirm(`Hapus kolom "${column.title}" dan seluruh kartu di dalamnya?`)) {
                    onDeleteColumn(column.id);
                  }
                }}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Hapus Kolom</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Droppable Card List */}
      <Droppable droppableId={column.id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`p-3 space-y-2.5 overflow-y-auto flex-1 transition-colors ${
              snapshot.isDraggingOver ? 'bg-terracotta-light/30' : ''
            }`}
          >
            {cards.map((card, index) => (
              <CardItem
                key={card.id}
                card={card}
                index={index}
                checklists={checklists}
                onClick={() => onCardClick(card)}
              />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>

      {/* Add Card Footer */}
      <div className="p-3 pt-0">
        {isAddingCard ? (
          <form onSubmit={handleAddCardSubmit} className="space-y-2 bg-white p-2.5 rounded-xl border border-boho-canvas shadow-sm">
            <textarea
              value={newCardTitle}
              onChange={(e) => setNewCardTitle(e.target.value)}
              placeholder="Tulis judul tugas baru..."
              autoFocus
              rows={2}
              className="w-full px-2.5 py-1.5 text-xs bg-boho-linen/50 border border-boho-canvas rounded-lg focus:outline-none focus:border-terracotta resize-none"
            />
            <div className="flex justify-end gap-1.5">
              <button
                type="button"
                onClick={() => setIsAddingCard(false)}
                className="px-2.5 py-1 text-xs text-boho-clay hover:text-boho-espresso"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-3 py-1 bg-terracotta text-white text-xs font-medium rounded-lg hover:bg-terracotta-deep transition-colors"
              >
                Tambah
              </button>
            </div>
          </form>
        ) : (
          <button
            onClick={() => setIsAddingCard(true)}
            className="w-full flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-medium text-boho-walnut hover:text-terracotta hover:bg-white/80 rounded-xl border border-dashed border-boho-canvas hover:border-terracotta/60 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah Kartu</span>
          </button>
        )}
      </div>
    </div>
  );
};
