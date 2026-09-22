import React from 'react';
import { useKanban } from '../../context/KanbanContext';
import { Minus, Square, X, Feather, Plus, Layout } from 'lucide-react';

export interface WindowHeaderProps {
  onOpenCommandPalette?: () => void;
}

export const WindowHeader: React.FC<WindowHeaderProps> = ({ onOpenCommandPalette }) => {
  const {
    boards,
    activeBoardId,
    openBoardIds,
    openBoardTab,
    closeBoardTab,
    createBoard
  } = useKanban();

  const handleMinimize = () => {
    window.electronAPI?.minimizeWindow?.();
  };

  const handleMaximize = () => {
    window.electronAPI?.maximizeWindow?.();
  };

  const handleClose = () => {
    window.electronAPI?.closeWindow?.();
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.app-no-drag')) return;
    window.electronAPI?.maximizeWindow?.();
  };

  const handleAddBoard = async () => {
    const title = `Board Baru ${(boards?.length || 0) + 1}`;
    await createBoard(title);
  };

  // Filter open boards
  const openBoards = (openBoardIds || [])
    .map((id) => boards?.find((b) => b.id === id))
    .filter((b): b is NonNullable<typeof b> => Boolean(b));

  return (
    <header
      onDoubleClick={handleDoubleClick}
      className="h-10 bg-boho-sand/70 border-b border-boho-canvas/80 flex items-center justify-between px-3 select-none app-drag font-sans text-xs gap-3"
    >
      {/* Brand & Tab Bar */}
      <div className="flex items-center gap-2 min-w-0 flex-1 overflow-hidden">
        {/* Brand Icon & Name (draggable) */}
        <div className="flex items-center gap-1.5 shrink-0 pr-2 border-r border-boho-canvas/60">
          <div className="w-5 h-5 rounded-full bg-terracotta/20 flex items-center justify-center text-terracotta">
            <Feather className="w-3.5 h-3.5" />
          </div>
          <span className="font-serif font-bold text-boho-espresso tracking-wide text-xs">
            KanbanGO!
          </span>
        </div>

        {/* Horizontal Tabs Container */}
        <div
          role="tablist"
          aria-label="Papan Kerja Terbuka"
          className="flex items-center gap-1 overflow-x-auto no-scrollbar app-no-drag py-1 flex-1"
          onWheel={(e) => {
            e.currentTarget.scrollLeft += e.deltaY;
          }}
        >
          {openBoards.map((board) => {
            const isActive = board.id === activeBoardId;
            return (
              <div
                key={board.id}
                role="tab"
                aria-selected={isActive}
                tabIndex={0}
                onClick={() => openBoardTab(board.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    openBoardTab(board.id);
                  }
                }}
                className={`group flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs transition-all cursor-pointer shrink-0 max-w-[160px] border focus:outline-none focus:ring-1 focus:ring-terracotta/50 ${
                  isActive
                    ? 'bg-white text-boho-espresso font-semibold border-terracotta/40 shadow-xs'
                    : 'bg-transparent text-boho-walnut hover:bg-boho-canvas/50 border-transparent'
                }`}
                title={board.title}
              >
                <Layout className={`w-3 h-3 shrink-0 ${isActive ? 'text-terracotta' : 'text-boho-clay'}`} />
                <span className="truncate flex-1">{board.title}</span>
                <button
                  type="button"
                  title="Tutup Tab"
                  aria-label={`Tutup tab ${board.title}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    closeBoardTab(board.id);
                  }}
                  className="w-4 h-4 flex items-center justify-center rounded-full opacity-60 group-hover:opacity-100 hover:bg-boho-canvas text-boho-clay hover:text-terracotta transition-all"
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              </div>
            );
          })}

          {/* Add Board Tab Button */}
          <button
            type="button"
            onClick={handleAddBoard}
            className="p-1 rounded-md text-boho-clay hover:text-terracotta hover:bg-boho-canvas/60 transition-colors shrink-0"
            title="Tambah Board Baru"
            aria-label="Tambah Board Baru"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Right section: Quick Switcher Button & Window Controls */}
      <div className="flex items-center gap-2 shrink-0">
        {onOpenCommandPalette && (
          <button
            type="button"
            onClick={onOpenCommandPalette}
            className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-boho-canvas/50 hover:bg-boho-canvas text-boho-walnut border border-boho-canvas/80 text-[11px] transition-colors app-no-drag"
            title="Buka Command Palette (Ctrl+K)"
          >
            <span className="text-xs font-mono font-medium">⌘K</span>
          </button>
        )}

        {/* Desktop Window Controls */}
        <div className="flex items-center gap-1 app-no-drag">
          <button
            type="button"
            aria-label="Minimize"
            onClick={handleMinimize}
            className="w-7 h-7 flex items-center justify-center rounded-md text-boho-walnut hover:bg-boho-canvas/60 transition-colors"
            title="Minimize"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            aria-label="Maximize"
            onClick={handleMaximize}
            className="w-7 h-7 flex items-center justify-center rounded-md text-boho-walnut hover:bg-boho-canvas/60 transition-colors"
            title="Maximize"
          >
            <Square className="w-3 h-3" />
          </button>
          <button
            type="button"
            aria-label="Close"
            onClick={handleClose}
            className="w-7 h-7 flex items-center justify-center rounded-md text-boho-walnut hover:bg-rose-500 hover:text-white transition-colors"
            title="Close"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
};
