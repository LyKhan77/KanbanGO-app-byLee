import React, { useState } from 'react';
import { useKanban } from '../../context/KanbanContext';
import {
  FolderKanban,
  Plus,
  PanelLeftClose,
  PanelLeftOpen,
  Trash2,
  Compass,
  Feather,
  Leaf,
  Sun,
  Sparkles,
  Heart,
  Download,
  Upload
} from 'lucide-react';

const AVATAR_ICONS: Record<string, React.ElementType> = {
  fox: Compass,
  owl: Feather,
  ginkgo: Leaf,
  sun: Sun,
  sparkles: Sparkles,
  heart: Heart
};

export const Sidebar: React.FC = () => {
  const {
    boards,
    activeBoardId,
    openBoardTab,
    createBoard,
    deleteBoard,
    profile,
    openProfileModal,
    isSidebarCollapsed,
    setIsSidebarCollapsed
  } = useKanban();

  const [isCreatingBoard, setIsCreatingBoard] = useState(false);
  const [newBoardTitle, setNewBoardTitle] = useState('');

  const AvatarIcon = AVATAR_ICONS[profile.avatarId] || Compass;

  const handleCreateBoardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBoardTitle.trim()) return;
    await createBoard(newBoardTitle.trim());
    setNewBoardTitle('');
    setIsCreatingBoard(false);
  };

  if (isSidebarCollapsed) {
    return (
      <aside className="w-16 bg-boho-sand/60 border-r border-boho-canvas flex flex-col items-center py-4 justify-between transition-all duration-300">
        <div className="flex flex-col items-center gap-4">
          <button
            onClick={() => setIsSidebarCollapsed(false)}
            className="p-2 text-boho-walnut hover:text-boho-espresso hover:bg-boho-canvas/50 rounded-xl transition-colors"
            title="Expand Sidebar"
          >
            <PanelLeftOpen className="w-5 h-5" />
          </button>
          <button
            onClick={() => setIsCreatingBoard(true)}
            className="w-10 h-10 rounded-xl bg-terracotta text-white flex items-center justify-center hover:bg-terracotta-deep transition-all shadow-sm"
            title="Tambah Board Baru"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        <button
          onClick={openProfileModal}
          className="w-10 h-10 rounded-full bg-terracotta-light text-terracotta flex items-center justify-center border border-terracotta-border hover:scale-105 transition-all"
          title={`Profil: ${profile.name}`}
        >
          <AvatarIcon className="w-5 h-5" />
        </button>
      </aside>
    );
  }

  return (
    <aside className="w-64 bg-boho-sand/60 border-r border-boho-canvas flex flex-col h-[calc(100vh-40px)] justify-between transition-all duration-300 select-none">
      {/* Top Header & Board Vault */}
      <div className="p-4 flex-1 overflow-y-auto">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-boho-canvas/60">
          <div className="flex items-center gap-2 text-boho-walnut">
            <FolderKanban className="w-4 h-4 text-terracotta" />
            <span className="text-xs font-serif font-bold uppercase tracking-wider text-boho-espresso">
              Board Vault
            </span>
          </div>
          <button
            onClick={() => setIsSidebarCollapsed(true)}
            className="p-1 text-boho-clay hover:text-boho-espresso rounded-lg transition-colors"
            title="Collapse Sidebar"
          >
            <PanelLeftClose className="w-4 h-4" />
          </button>
        </div>

        {/* Board list */}
        <div className="space-y-1.5 mb-4">
          {boards.map((b) => {
            const isActive = b.id === activeBoardId;
            return (
              <div
                key={b.id}
                onClick={() => openBoardTab(b.id)}
                className={`group flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-terracotta text-white shadow-md shadow-terracotta/20 font-serif'
                    : 'text-boho-espresso hover:bg-boho-canvas/40'
                }`}
              >
                <span className="truncate flex-1">{b.title}</span>
                {boards.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`Hapus board "${b.title}" beserta seluruh kolom dan tugasnya?`)) {
                        deleteBoard(b.id);
                      }
                    }}
                    className={`opacity-0 group-hover:opacity-100 p-1 rounded-md transition-opacity ${
                      isActive ? 'hover:bg-terracotta-deep text-white/90' : 'hover:bg-rose-100 text-rose-600'
                    }`}
                    title="Hapus Board"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Add Board Button or Input Form */}
        {isCreatingBoard ? (
          <form onSubmit={handleCreateBoardSubmit} className="space-y-2 p-2 bg-white/70 border border-boho-canvas rounded-xl">
            <input
              type="text"
              value={newBoardTitle}
              onChange={(e) => setNewBoardTitle(e.target.value)}
              placeholder="Nama board baru..."
              autoFocus
              className="w-full px-2.5 py-1.5 text-xs bg-white border border-boho-canvas rounded-lg focus:outline-none focus:border-terracotta"
            />
            <div className="flex justify-end gap-1.5">
              <button
                type="button"
                onClick={() => setIsCreatingBoard(false)}
                className="px-2.5 py-1 text-xs text-boho-clay hover:text-boho-espresso"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-3 py-1 bg-terracotta text-white text-xs font-medium rounded-lg hover:bg-terracotta-deep"
              >
                Simpan
              </button>
            </div>
          </form>
        ) : (
          <button
            onClick={() => setIsCreatingBoard(true)}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 border border-dashed border-boho-clay/60 hover:border-terracotta rounded-xl text-xs font-medium text-boho-walnut hover:text-terracotta transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah Board Baru</span>
          </button>
        )}
      </div>

      {/* Bottom Persona Profile Widget */}
      <div className="p-3 border-t border-boho-canvas/80 bg-boho-sand/90">
        <div
          onClick={openProfileModal}
          className="flex items-center gap-3 p-2 rounded-xl hover:bg-boho-canvas/50 cursor-pointer transition-colors"
          title="Klik untuk mengubah Persona Profile"
        >
          <div className="w-10 h-10 rounded-full bg-terracotta-light border border-terracotta-border flex items-center justify-center text-terracotta shrink-0 shadow-sm">
            <AvatarIcon className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-serif font-bold text-boho-espresso truncate">
              {profile.name}
            </h4>
            <p className="text-[11px] text-boho-clay truncate">
              {profile.roleTitle}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};
