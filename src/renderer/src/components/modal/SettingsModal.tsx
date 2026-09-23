import React, { useEffect } from 'react';
import { useKanban } from '../../context/KanbanContext';
import { Settings, X, RefreshCw, Feather, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';

export interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { settings, updaterStatus, currentAppVersion, checkForUpdates } = useKanban();

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const versionDisplay = `v${(currentAppVersion || '1.0.0').replace(/^v/i, '')}`;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Pengaturan Aplikasi"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-boho-linen border border-boho-canvas rounded-2xl p-6 shadow-2xl font-sans text-boho-espresso"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-boho-canvas/60 mb-5">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-terracotta" />
            <h2 className="text-xl font-serif font-bold text-boho-espresso">Pengaturan Aplikasi</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-boho-clay hover:text-boho-espresso rounded-lg transition-colors"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-5">
          {/* General App Info Section */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-boho-walnut">
              Preferensi Tampilan
            </h3>
            <div className="p-3 bg-white/70 border border-boho-canvas rounded-xl flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-boho-espresso">Tema Bohemian</div>
                <div className="text-xs text-boho-clay">Nuansa warna earthy, terracotta, dan sage yang menenangkan</div>
              </div>
              <span className="px-2.5 py-1 text-xs font-medium rounded-lg bg-terracotta-light text-terracotta border border-terracotta-border">
                {settings?.theme || 'bohemian-light'}
              </span>
            </div>
          </div>

          {/* Tentang & Pembaruan Aplikasi Section */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-boho-walnut">
              Tentang & Pembaruan Aplikasi
            </h3>
            <div className="bg-boho-sand/40 border border-boho-canvas rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-terracotta/10 border border-terracotta/20 flex items-center justify-center text-terracotta">
                    <Feather className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-serif font-bold text-sm text-boho-espresso">
                      KanbanGO Desktop
                    </h4>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="px-2 py-0.5 rounded-full text-xs font-mono font-medium bg-terracotta-light text-terracotta border border-terracotta-border">
                        {versionDisplay}
                      </span>
                      <span className="text-[11px] text-boho-clay">
                        Pembaruan otomatis dari GitHub Releases
                      </span>
                    </div>
                  </div>
                </div>

              <button
                type="button"
                onClick={() => checkForUpdates(true)}
                disabled={updaterStatus === 'checking' || updaterStatus === 'downloading'}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium text-white bg-terracotta hover:bg-terracotta-deep disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xs cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${updaterStatus === 'checking' || updaterStatus === 'downloading' ? 'animate-spin' : ''}`} />
                <span>Periksa Pembaruan</span>
              </button>
            </div>

            {/* Inline Status Text Feedback */}
            {updaterStatus === 'checking' && (
              <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50/80 px-3 py-2 rounded-lg border border-amber-200/60 animate-pulse">
                <RefreshCw className="w-3.5 h-3.5 animate-spin shrink-0" />
                <span>Sedang memeriksa pembaruan...</span>
              </div>
            )}

            {updaterStatus === 'not-available' && (
              <div className="flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50/80 px-3 py-2 rounded-lg border border-emerald-200/60">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
                <span>KanbanGO sudah menggunakan versi terbaru!</span>
              </div>
            )}

            {updaterStatus === 'error' && (
              <div className="flex items-center gap-2 text-xs text-rose-700 bg-rose-50/80 px-3 py-2 rounded-lg border border-rose-200/60">
                <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-600" />
                <span>Tidak dapat terhubung ke server pembaruan.</span>
              </div>
            )}

            {updaterStatus === 'available' && (
              <div className="flex items-center gap-2 text-xs text-blue-700 bg-blue-50/80 px-3 py-2 rounded-lg border border-blue-200/60">
                <Sparkles className="w-3.5 h-3.5 shrink-0 text-blue-600" />
                <span>Versi baru tersedia! Dialog pembaruan akan segera terbuka.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  </div>
);
};

export default SettingsModal;
