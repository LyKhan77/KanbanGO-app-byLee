import React, { useEffect } from 'react';
import { UpdaterStatus, UpdateInfo, UpdateProgress } from '../../../shared/types';
import { renderMarkdownToHtml } from '../../utils/markdown';
import { Sparkles, AlertCircle, X } from 'lucide-react';

export interface UpdateModalProps {
  isOpen: boolean;
  currentVersion?: string;
  updateInfo: UpdateInfo | null;
  status: UpdaterStatus;
  progress: UpdateProgress | null;
  errorMessage: string | null;
  onStartDownload: () => void;
  onInstall: () => void;
  onPostpone: () => void;
  onIgnoreVersion: (version: string) => void;
}

export const UpdateModal: React.FC<UpdateModalProps> = ({
  isOpen,
  currentVersion,
  updateInfo,
  status,
  progress,
  errorMessage,
  onStartDownload,
  onInstall,
  onPostpone,
  onIgnoreVersion
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onPostpone();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onPostpone]);

  if (!isOpen) return null;

  const headerTitle =
    status === 'downloaded' ? 'Pembaruan Siap Dipasang!' : 'Pembaruan Versi Tersedia';

  const stripLeadingV = (v?: string | null) => (v ? v.replace(/^v/i, '') : '');
  const currentVerDisplay = `v${stripLeadingV(currentVersion) || '1.0.0'}`;
  const targetVerDisplay = `v${stripLeadingV(updateInfo?.version) || 'Terbaru'}`;

  const rawNotes = updateInfo?.releaseNotes;
  const normalizedNotes =
    typeof rawNotes === 'string'
      ? rawNotes
      : Array.isArray(rawNotes)
        ? (rawNotes as any[]).map((n) => (typeof n === 'string' ? n : n?.note || '')).join('\n\n')
        : '';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="update-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 overflow-y-auto animate-fadeIn select-none"
      onClick={onPostpone}
    >
      <div
        className="w-full max-w-lg bg-[#fdfbf7] border border-[#e4ded5] rounded-2xl shadow-2xl p-6 font-sans text-boho-espresso max-h-[90vh] flex flex-col relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#faede9] border border-[#f2cfc4] flex items-center justify-center text-[#c26d5c]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 id="update-modal-title" className="font-serif font-bold text-base text-boho-espresso">
                {headerTitle}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="px-2 py-0.5 text-xs font-mono font-medium rounded-md bg-boho-sand text-boho-walnut border border-[#e4ded5]">
                  {currentVerDisplay}
                </span>
                <span className="text-xs text-boho-clay font-medium">➔</span>
                <span className="px-2 py-0.5 text-xs font-mono font-medium rounded-md bg-[#faede9] text-[#c26d5c] border border-[#f2cfc4]">
                  {targetVerDisplay}
                </span>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onPostpone}
            aria-label="Tutup modal"
            className="p-1 rounded-lg text-boho-clay hover:text-boho-espresso hover:bg-boho-sand transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Release Notes Changelog */}
        {normalizedNotes && (
          <div className="mt-4 flex-1 flex flex-col min-h-0">
            <p className="text-[11px] font-semibold text-boho-clay uppercase tracking-wider mb-1.5">
              Catatan Rilis
            </p>
            <div className="overflow-y-auto max-h-56 p-3 bg-white/70 border border-[#e4ded5] rounded-xl text-xs text-boho-walnut space-y-1">
              <div
                dangerouslySetInnerHTML={{
                  __html: renderMarkdownToHtml(normalizedNotes)
                }}
              />
            </div>
          </div>
        )}

        {/* Progress Bar (Downloading) */}
        {status === 'downloading' && (
          <div className="mt-4 p-3 bg-white/60 border border-[#e4ded5] rounded-xl space-y-2">
            <div className="flex justify-between items-center text-xs text-boho-walnut font-medium">
              <span>Mengunduh pembaruan...</span>
              <span className="font-mono text-[#c26d5c]">{progress?.percent ?? 0}%</span>
            </div>
            <div
              role="progressbar"
              aria-valuenow={Math.round(progress?.percent ?? 0)}
              aria-valuemin={0}
              aria-valuemax={100}
              className="w-full h-2.5 bg-[#e4ded5] rounded-full overflow-hidden"
            >
              <div
                className="h-full bg-[#c26d5c] transition-all duration-300 ease-out rounded-full"
                style={{ width: `${Math.min(100, Math.max(0, progress?.percent || 0))}%` }}
              />
            </div>
            {progress && progress.total > 0 && (
              <div className="flex justify-between text-[11px] text-boho-clay font-mono">
                <span>
                  {(progress.transferred / (1024 * 1024)).toFixed(1)} MB /{' '}
                  {(progress.total / (1024 * 1024)).toFixed(1)} MB
                </span>
                {progress.bytesPerSecond > 0 && (
                  <span>{(progress.bytesPerSecond / (1024 * 1024)).toFixed(1)} MB/s</span>
                )}
              </div>
            )}
          </div>
        )}

        {/* Error Banner */}
        {(status === 'error' || errorMessage) && (
          <div
            role="alert"
            className="mt-4 p-3 bg-red-50/80 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-red-700"
          >
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium">Gagal memperbarui aplikasi</p>
              <p className="text-red-600 mt-0.5">
                {errorMessage || 'Terjadi kesalahan saat memeriksa atau mengunduh pembaruan.'}
              </p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-6 flex items-center justify-between gap-3 pt-3 border-t border-[#e4ded5]">
          {status === 'available' ? (
            <>
              <button
                type="button"
                onClick={() => onIgnoreVersion(updateInfo?.version || '')}
                className="text-xs text-boho-clay hover:text-[#c26d5c] hover:underline transition-colors"
              >
                Abaikan Versi Ini
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onPostpone}
                  className="px-3.5 py-1.5 text-xs font-medium text-boho-walnut bg-[#f3ede4] hover:bg-[#e9e1d5] border border-[#e4ded5] rounded-xl transition-colors"
                >
                  Nanti Saja
                </button>
                <button
                  type="button"
                  onClick={onStartDownload}
                  className="px-4 py-1.5 text-xs font-medium text-white bg-[#c26d5c] hover:bg-[#b05d4d] rounded-xl shadow-sm transition-colors"
                >
                  Perbarui Sekarang
                </button>
              </div>
            </>
          ) : status === 'downloaded' ? (
            <div className="flex items-center justify-end gap-2 w-full">
              <button
                type="button"
                onClick={onPostpone}
                className="px-3.5 py-1.5 text-xs font-medium text-boho-walnut bg-[#f3ede4] hover:bg-[#e9e1d5] border border-[#e4ded5] rounded-xl transition-colors"
              >
                Nanti Saja
              </button>
              <button
                type="button"
                onClick={onInstall}
                className="px-4 py-1.5 text-xs font-medium text-white bg-[#c26d5c] hover:bg-[#b05d4d] rounded-xl shadow-sm transition-colors"
              >
                Mulai Ulang & Pasang
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-end gap-2 w-full">
              <button
                type="button"
                onClick={onPostpone}
                className="px-3.5 py-1.5 text-xs font-medium text-boho-walnut bg-[#f3ede4] hover:bg-[#e9e1d5] border border-[#e4ded5] rounded-xl transition-colors"
              >
                Nanti Saja
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
