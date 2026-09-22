import React, { useState, useEffect } from 'react';
import { Card, ChecklistItem } from '../../../shared/types';
import {
  X,
  Calendar,
  Tag,
  AlertCircle,
  CheckSquare,
  Square,
  Plus,
  Trash2,
  Check
} from 'lucide-react';
import { CARD_COVER_COLORS } from '../../utils/colors';
import { renderMarkdownToHtml } from '../../utils/markdown';

interface CardDetailModalProps {
  card: Card | null;
  isOpen: boolean;
  checklists: ChecklistItem[];
  onClose: () => void;
  onUpdateCard: (id: string, updates: Partial<Card>) => void;
  onDeleteCard: (id: string) => void;
  onCreateChecklist: (cardId: string, text: string) => Promise<string>;
  onToggleChecklist: (id: string) => void;
  onDeleteChecklist: (id: string) => void;
}

export const CardDetailModal: React.FC<CardDetailModalProps> = ({
  card,
  isOpen,
  checklists,
  onClose,
  onUpdateCard,
  onDeleteCard,
  onCreateChecklist,
  onToggleChecklist,
  onDeleteChecklist
}) => {
  if (!isOpen || !card) return null;

  const [title, setTitle] = useState(card.title);
  const [description, setDescription] = useState(card.description);
  const [priority, setPriority] = useState(card.priority);
  const [dueDate, setDueDate] = useState(card.dueDate || '');
  const [newTagInput, setNewTagInput] = useState('');
  const [newChecklistText, setNewChecklistText] = useState('');
  const [descriptionTab, setDescriptionTab] = useState<'write' | 'preview'>('write');

  useEffect(() => {
    setTitle(card.title);
    setDescription(card.description);
    setPriority(card.priority);
    setDueDate(card.dueDate || '');
  }, [card]);

  // Debounced auto-save for title & description
  useEffect(() => {
    const timer = setTimeout(() => {
      if (title !== card.title || description !== card.description) {
        onUpdateCard(card.id, { title, description });
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [title, description]);

  const handlePriorityChange = (newPriority: 'low' | 'medium' | 'high' | 'none') => {
    setPriority(newPriority);
    onUpdateCard(card.id, { priority: newPriority });
  };

  const handleDueDateChange = (newDate: string) => {
    setDueDate(newDate);
    onUpdateCard(card.id, { dueDate: newDate || undefined });
  };

  const handleAddTag = (e: React.FormEvent) => {
    e.preventDefault();
    const tag = newTagInput.trim();
    if (tag && !card.tags.includes(tag)) {
      const updatedTags = [...card.tags, tag];
      onUpdateCard(card.id, { tags: updatedTags });
      setNewTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const updatedTags = card.tags.filter((t) => t !== tagToRemove);
    onUpdateCard(card.id, { tags: updatedTags });
  };

  const handleAddChecklist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChecklistText.trim()) return;
    await onCreateChecklist(card.id, newChecklistText.trim());
    setNewChecklistText('');
  };

  const cardChecklists = checklists.filter((ch) => ch.cardId === card.id);
  const completedChecklists = cardChecklists.filter((ch) => ch.isCompleted);
  const progressPercent =
    cardChecklists.length > 0
      ? Math.round((completedChecklists.length / cardChecklists.length) * 100)
      : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 overflow-y-auto animate-fadeIn select-none">
      <div className="w-full max-w-2xl bg-boho-linen border border-boho-canvas rounded-2xl shadow-2xl p-6 font-sans text-boho-espresso max-h-[90vh] flex flex-col">
        {/* Header with Title Input & Close Button */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-boho-canvas/60">
          <div className="flex-1 min-w-0">
            {/* Bohemian Cover Color Chips */}
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs text-boho-clay font-medium">Aksen Kartu:</span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {CARD_COVER_COLORS.map((c) => (
                  <button
                    key={c.key}
                    type="button"
                    title={c.label}
                    onClick={() => onUpdateCard(card.id, { coverColor: c.key })}
                    className={`w-5 h-5 rounded-full border transition-all flex items-center justify-center ${
                      (card.coverColor || 'none') === c.key
                        ? 'ring-2 ring-offset-1 ring-terracotta scale-110'
                        : 'hover:scale-105 opacity-80 hover:opacity-100'
                    }`}
                    style={{
                      backgroundColor: c.key === 'none' ? '#fdfbf7' : c.accent,
                      borderColor: c.key === 'none' ? '#d4c5b3' : c.accent
                    }}
                  >
                    {(card.coverColor || 'none') === c.key && (
                      <Check className={`w-3 h-3 ${c.key === 'none' ? 'text-boho-espresso' : 'text-white'}`} />
                    )}
                  </button>
                ))}
              </div>
            </div>

            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Judul kartu tugas..."
              className="w-full font-serif font-bold text-xl text-boho-espresso bg-transparent border-b border-transparent hover:border-boho-clay focus:border-terracotta focus:outline-none transition-colors px-1"
            />
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-boho-clay hover:text-boho-espresso rounded-xl hover:bg-boho-sand transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto py-4 space-y-6 pr-1">
          {/* Metadata Row: Priority & Due Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Priority Picker */}
            <div className="bg-white/80 p-3.5 rounded-xl border border-boho-canvas">
              <label className="block text-xs font-semibold uppercase tracking-wider text-boho-walnut mb-2 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-terracotta" />
                <span>Prioritas Tugas</span>
              </label>
              <div className="flex gap-1.5">
                {(['none', 'low', 'medium', 'high'] as const).map((p) => {
                  const isSelected = priority === p;
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => handlePriorityChange(p)}
                      className={`flex-1 py-1.5 px-2 text-xs font-medium rounded-lg capitalize border transition-all ${
                        isSelected
                          ? p === 'high'
                            ? 'bg-terracotta text-white border-terracotta shadow-sm'
                            : p === 'medium'
                            ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                            : p === 'low'
                            ? 'bg-sage text-white border-sage shadow-sm'
                            : 'bg-boho-walnut text-white border-boho-walnut shadow-sm'
                          : 'bg-boho-sand/60 text-boho-walnut border-boho-canvas hover:bg-white'
                      }`}
                    >
                      {p === 'none' ? 'Biasa' : p}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Due Date Picker */}
            <div className="bg-white/80 p-3.5 rounded-xl border border-boho-canvas">
              <label className="block text-xs font-semibold uppercase tracking-wider text-boho-walnut mb-2 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-sage" />
                <span>Batas Waktu (Tenggat)</span>
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => handleDueDateChange(e.target.value)}
                className="w-full px-3 py-1.5 bg-boho-sand/40 border border-boho-canvas rounded-lg text-xs font-medium text-boho-espresso focus:outline-none focus:border-terracotta"
              />
            </div>
          </div>

          {/* Tags Management */}
          <div className="bg-white/80 p-3.5 rounded-xl border border-boho-canvas">
            <label className="block text-xs font-semibold uppercase tracking-wider text-boho-walnut mb-2 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-terracotta" />
              <span>Label & Tag Kategori</span>
            </label>
            <div className="flex flex-wrap items-center gap-1.5 mb-2.5">
              {card.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-boho-sand text-boho-espresso text-xs font-medium border border-boho-canvas"
                >
                  <span>#{tag}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="text-boho-clay hover:text-rose-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              {card.tags.length === 0 && (
                <span className="text-xs text-boho-clay italic">Belum ada label tag.</span>
              )}
            </div>
            <form onSubmit={handleAddTag} className="flex gap-2">
              <input
                type="text"
                value={newTagInput}
                onChange={(e) => setNewTagInput(e.target.value)}
                placeholder="Ketik tag baru..."
                className="px-3 py-1 text-xs bg-boho-sand/40 border border-boho-canvas rounded-lg flex-1 focus:outline-none focus:border-terracotta"
              />
              <button
                type="submit"
                className="px-3 py-1 bg-boho-sand hover:bg-boho-canvas text-boho-espresso text-xs font-medium rounded-lg border border-boho-canvas transition-colors"
              >
                + Tambah Tag
              </button>
            </form>
          </div>

          {/* Description */}
          <div className="bg-white/80 p-3.5 rounded-xl border border-boho-canvas">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-boho-walnut">
                Catatan & Deskripsi Tugas
              </label>
              <div className="flex items-center bg-boho-sand/60 rounded-lg p-0.5 border border-boho-canvas text-xs">
                <button
                  type="button"
                  onClick={() => setDescriptionTab('write')}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                    descriptionTab === 'write'
                      ? 'bg-white text-boho-espresso shadow-sm font-semibold'
                      : 'text-boho-clay hover:text-boho-espresso'
                  }`}
                >
                  Tulis
                </button>
                <button
                  type="button"
                  onClick={() => setDescriptionTab('preview')}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                    descriptionTab === 'preview'
                      ? 'bg-white text-boho-espresso shadow-sm font-semibold'
                      : 'text-boho-clay hover:text-boho-espresso'
                  }`}
                >
                  Pratinjau
                </button>
              </div>
            </div>

            {descriptionTab === 'write' ? (
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Tuliskan catatan detail, referensi, atau instruksi pengerjaan..."
                rows={4}
                className="w-full px-3 py-2 text-xs bg-boho-linen/60 border border-boho-canvas rounded-lg focus:outline-none focus:border-terracotta resize-y leading-relaxed text-boho-espresso"
              />
            ) : (
              <div
                className="min-h-[96px] p-3 text-xs bg-boho-linen/40 border border-boho-canvas rounded-lg text-boho-espresso overflow-y-auto leading-relaxed"
                dangerouslySetInnerHTML={{
                  __html: renderMarkdownToHtml(description) || '<p class="text-boho-clay italic">Tidak ada deskripsi.</p>'
                }}
              />
            )}
          </div>

          {/* Interactive Checklist Subtasks */}
          <div className="bg-white/80 p-3.5 rounded-xl border border-boho-canvas">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-boho-walnut flex items-center gap-1.5">
                <CheckSquare className="w-3.5 h-3.5 text-sage" />
                <span>Sub-tugas (Checklist)</span>
              </label>
              {cardChecklists.length > 0 && (
                <span className="text-xs font-serif font-bold text-sage">
                  {completedChecklists.length}/{cardChecklists.length} Selesai ({progressPercent}%)
                </span>
              )}
            </div>

            {/* Progress Bar */}
            {cardChecklists.length > 0 && (
              <div className="w-full h-1.5 bg-boho-sand rounded-full overflow-hidden mb-3">
                <div
                  className="h-full bg-sage transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            )}

            {/* Checklist Items */}
            <div className="space-y-1.5 mb-3">
              {cardChecklists.map((chk) => (
                <div
                  key={chk.id}
                  className="group flex items-center justify-between gap-2.5 p-2 rounded-lg hover:bg-boho-sand/50 transition-colors"
                >
                  <div
                    onClick={() => onToggleChecklist(chk.id)}
                    className="flex items-center gap-2.5 cursor-pointer flex-1 min-w-0"
                  >
                    {chk.isCompleted ? (
                      <div className="w-4 h-4 rounded bg-sage text-white flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3" />
                      </div>
                    ) : (
                      <div className="w-4 h-4 rounded border border-boho-clay/80 shrink-0 hover:border-sage" />
                    )}
                    <span
                      className={`text-xs text-boho-espresso truncate ${
                        chk.isCompleted ? 'line-through text-boho-clay italic' : ''
                      }`}
                    >
                      {chk.text}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => onDeleteChecklist(chk.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-boho-clay hover:text-rose-600 rounded transition-opacity"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add Checklist Form */}
            <form onSubmit={handleAddChecklist} className="flex gap-2">
              <input
                type="text"
                value={newChecklistText}
                onChange={(e) => setNewChecklistText(e.target.value)}
                placeholder="Tambah butir sub-tugas..."
                className="px-3 py-1.5 text-xs bg-boho-sand/40 border border-boho-canvas rounded-lg flex-1 focus:outline-none focus:border-terracotta"
              />
              <button
                type="submit"
                className="flex items-center gap-1 px-3 py-1.5 bg-sage text-white text-xs font-medium rounded-lg hover:bg-sage-deep transition-colors shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah</span>
              </button>
            </form>
          </div>
        </div>

        {/* Footer with Delete and Close Actions */}
        <div className="pt-4 border-t border-boho-canvas/60 flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              if (confirm(`Hapus kartu tugas "${card.title}"?`)) {
                onDeleteCard(card.id);
                onClose();
              }
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span>Hapus Kartu</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-boho-sand hover:bg-boho-canvas text-boho-espresso text-xs font-medium rounded-xl border border-boho-canvas transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
