import React from 'react';
import { DailyBriefing } from '../../utils/assistantEngine';
import { Flame, Sparkles, CheckCircle2, X, ArrowRight } from 'lucide-react';

interface DailyBriefingBannerProps {
  briefing: DailyBriefing;
  onFocusCard: (cardId?: string) => void;
  onDismiss: () => void;
}

export const DailyBriefingBanner: React.FC<DailyBriefingBannerProps> = ({
  briefing,
  onFocusCard,
  onDismiss
}) => {
  const isHigh = briefing.urgency === 'high';
  const isMed = briefing.urgency === 'medium';

  return (
    <div className="mx-6 mt-4 p-4 rounded-2xl bg-white border border-boho-canvas shadow-md relative overflow-hidden font-sans select-none animate-fadeIn">
      {/* Top Accent Gradient */}
      <div
        className={`absolute top-0 left-0 right-0 h-1.5 ${
          isHigh
            ? 'bg-gradient-to-r from-terracotta via-amber-500 to-terracotta'
            : isMed
            ? 'bg-gradient-to-r from-amber-500 via-sage to-amber-500'
            : 'bg-gradient-to-r from-sage via-emerald-400 to-sage'
        }`}
      />

      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3.5 flex-1">
          {/* Icon Badge */}
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
              isHigh
                ? 'bg-terracotta-light text-terracotta border border-terracotta-border'
                : isMed
                ? 'bg-amber-100 text-amber-800 border border-amber-200'
                : 'bg-sage-light text-sage border border-sage-border'
            }`}
          >
            {isHigh ? (
              <Flame className="w-5 h-5" />
            ) : isMed ? (
              <Sparkles className="w-5 h-5" />
            ) : (
              <CheckCircle2 className="w-5 h-5" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span
                className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                  isHigh
                    ? 'bg-terracotta-light text-terracotta border-terracotta-border'
                    : isMed
                    ? 'bg-amber-50 text-amber-800 border-amber-200'
                    : 'bg-sage-light text-sage border-sage-border'
                }`}
              >
                Hardcore Daily Coach
              </span>
              <span className="text-xs font-serif font-bold text-boho-espresso">
                {briefing.headline}
              </span>
            </div>

            <p className="text-xs text-boho-walnut leading-relaxed mb-3">
              {briefing.message}
            </p>

            {/* Action buttons */}
            <div className="flex items-center gap-2.5">
              {briefing.highlightCardId && (
                <button
                  type="button"
                  onClick={() => onFocusCard(briefing.highlightCardId)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-terracotta hover:bg-terracotta-deep text-white text-xs font-semibold rounded-xl transition-all shadow-sm shadow-terracotta/20"
                >
                  <span>Mulai Sesi Fokus</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                type="button"
                onClick={onDismiss}
                className="px-3 py-1.5 bg-boho-sand hover:bg-boho-canvas text-boho-walnut text-xs font-medium rounded-xl border border-boho-canvas transition-colors"
              >
                Tutup Briefing
              </button>
            </div>
          </div>
        </div>

        {/* Close button */}
        <button
          type="button"
          onClick={onDismiss}
          className="p-1 text-boho-clay hover:text-boho-espresso rounded-lg hover:bg-boho-sand transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
