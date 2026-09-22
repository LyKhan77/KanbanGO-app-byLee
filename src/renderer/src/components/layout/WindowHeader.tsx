import React from 'react';
import { useKanban } from '../../context/KanbanContext';
import { Minus, Square, X, Feather } from 'lucide-react';

export const WindowHeader: React.FC = () => {
  const { activeBoard } = useKanban();

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

  return (
    <header
      onDoubleClick={handleDoubleClick}
      className="h-10 bg-boho-sand/70 border-b border-boho-canvas/80 flex items-center justify-between px-3 select-none app-drag font-sans text-xs"
    >
      {/* Brand & Board info */}
      <div className="flex items-center gap-2">
        <div className="w-5 h-5 rounded-full bg-terracotta/20 flex items-center justify-center text-terracotta">
          <Feather className="w-3.5 h-3.5" />
        </div>
        <span className="font-serif font-bold text-boho-espresso tracking-wide text-sm">
          KanbanGO!
        </span>
        {activeBoard && (
          <>
            <span className="text-boho-clay">/</span>
            <span className="text-boho-walnut font-medium truncate max-w-[240px]">
              {activeBoard.title}
            </span>
          </>
        )}
      </div>

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
    </header>
  );
};
