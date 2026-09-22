import React, { useState, useEffect, useRef } from 'react';
import { Board, Card } from '../../../shared/types';
import { Search, Layout, CheckSquare, Plus, Download, Upload, User } from 'lucide-react';

export interface CommandItem {
  id: string;
  type: 'board' | 'card' | 'action';
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  action: () => void;
}

export interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  boards: Board[];
  cards: Card[];
  onSelectBoard: (boardId: string) => void;
  onSelectCard: (card: Card) => void;
  onQuickAction: (actionKey: 'create-board' | 'create-card' | 'export' | 'import' | 'profile') => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  boards,
  cards,
  onSelectBoard,
  onSelectCard,
  onQuickAction
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const cleanQuery = query.toLowerCase().trim();

  // 1. Boards
  const matchingBoards: CommandItem[] = (boards || [])
    .filter(
      (b) =>
        !cleanQuery ||
        b.title.toLowerCase().includes(cleanQuery) ||
        b.description?.toLowerCase().includes(cleanQuery)
    )
    .slice(0, 5)
    .map((b) => ({
      id: `board-${b.id}`,
      type: 'board',
      title: b.title,
      subtitle: 'Papan Kerja',
      icon: <Layout className="w-4 h-4 text-terracotta" />,
      action: () => {
        onSelectBoard(b.id);
        onClose();
      }
    }));

  // 2. Cards
  const matchingCards: CommandItem[] = (cards || [])
    .filter(
      (c) =>
        !cleanQuery ||
        c.title.toLowerCase().includes(cleanQuery) ||
        c.description?.toLowerCase().includes(cleanQuery) ||
        (Array.isArray(c.tags) && c.tags.some((t) => t.toLowerCase().includes(cleanQuery)))
    )
    .slice(0, 6)
    .map((c) => {
      const parentBoard = (boards || []).find((b) => b.id === c.boardId);
      return {
        id: `card-${c.id}`,
        type: 'card',
        title: c.title,
        subtitle: parentBoard ? `Kartu • ${parentBoard.title}` : 'Kartu Tugas',
        icon: <CheckSquare className="w-4 h-4 text-amber-600" />,
        action: () => {
          onSelectCard(c);
          onClose();
        }
      };
    });

  // 3. Quick Actions
  const quickActions: CommandItem[] = [
    {
      id: 'action-create-board',
      type: 'action',
      title: 'Buat Board Baru',
      subtitle: 'Tambah kanban board baru',
      icon: <Plus className="w-4 h-4 text-sage" />,
      action: () => {
        onQuickAction('create-board');
        onClose();
      }
    },
    {
      id: 'action-create-card',
      type: 'action',
      title: 'Buat Kartu Baru',
      subtitle: 'Tambah kartu di kolom pertama board aktif',
      icon: <CheckSquare className="w-4 h-4 text-sage" />,
      action: () => {
        onQuickAction('create-card');
        onClose();
      }
    },
    {
      id: 'action-export',
      type: 'action',
      title: 'Ekspor Cadangan Board (JSON)',
      subtitle: 'Unduh backup file JSON',
      icon: <Download className="w-4 h-4 text-boho-clay" />,
      action: () => {
        onQuickAction('export');
        onClose();
      }
    },
    {
      id: 'action-import',
      type: 'action',
      title: 'Impor Cadangan Board (JSON)',
      subtitle: 'Pulihkan data dari file JSON',
      icon: <Upload className="w-4 h-4 text-boho-clay" />,
      action: () => {
        onQuickAction('import');
        onClose();
      }
    },
    {
      id: 'action-profile',
      type: 'action',
      title: 'Buka Profil & Asisten',
      subtitle: 'Pengaturan nama, avatar, dan jam pengingat',
      icon: <User className="w-4 h-4 text-terracotta" />,
      action: () => {
        onQuickAction('profile');
        onClose();
      }
    }
  ].filter(
    (a) =>
      !cleanQuery ||
      a.title.toLowerCase().includes(cleanQuery) ||
      a.subtitle?.toLowerCase().includes(cleanQuery)
  );

  const allItems: CommandItem[] = [...matchingBoards, ...matchingCards, ...quickActions];

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (allItems.length > 0 ? (prev + 1) % allItems.length : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (allItems.length > 0 ? (prev - 1 + allItems.length) % allItems.length : 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (allItems[selectedIndex]) {
        allItems[selectedIndex].action();
      }
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-boho-espresso/40 backdrop-blur-xs flex justify-center pt-20 px-4 select-none animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl bg-white border border-boho-canvas rounded-2xl shadow-2xl overflow-hidden flex flex-col h-fit max-h-[75vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-boho-canvas">
          <Search className="w-4 h-4 text-terracotta shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            autoFocus
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Ketik nama board, kartu tugas, atau aksi cepat..."
            className="flex-1 text-sm bg-transparent outline-none text-boho-espresso placeholder-boho-clay"
          />
          <kbd className="px-1.5 py-0.5 text-[10px] font-mono text-boho-clay bg-boho-sand rounded border border-boho-canvas">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="p-2 overflow-y-auto space-y-1">
          {allItems.length === 0 ? (
            <div className="py-8 text-center text-xs text-boho-clay">
              Tidak ada hasil untuk &quot;{query}&quot;
            </div>
          ) : (
            allItems.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={item.id}
                  onClick={item.action}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-terracotta-light text-terracotta-deep font-medium'
                      : 'text-boho-espresso hover:bg-boho-sand/60'
                  }`}
                >
                  <div className="p-1 rounded-lg bg-white/80 shrink-0 shadow-2xs">
                    {item.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="truncate font-medium">{item.title}</div>
                    {item.subtitle && (
                      <div className="text-[10px] text-boho-clay truncate">{item.subtitle}</div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
