import { Card, Column, UserProfile } from '../../../shared/types';
import { getTodayDateString } from './scheduler';

export interface DailyBriefing {
  urgency: 'high' | 'medium' | 'low';
  headline: string;
  message: string;
  highlightCardId?: string;
  stats: {
    totalActive: number;
    highPriority: number;
    overdue: number;
    dueToday: number;
  };
}

export function generateDailyBriefing(
  profile: UserProfile,
  cards: Card[],
  columns: Column[]
): DailyBriefing {
  const today = getTodayDateString(new Date());

  // Detect Done columns (title contains 'done', 'selesai', 'harvest', or highest order)
  const sortedCols = [...columns].sort((a, b) => a.order - b.order);
  const doneColIds = new Set(
    columns
      .filter((c) => /done|selesai|harvest/i.test(c.title))
      .map((c) => c.id)
  );
  if (doneColIds.size === 0 && sortedCols.length > 0) {
    doneColIds.add(sortedCols[sortedCols.length - 1].id);
  }

  const activeCards = cards.filter((c) => !doneColIds.has(c.columnId));
  const overdueCards = activeCards.filter((c) => c.dueDate && c.dueDate < today);
  const dueTodayCards = activeCards.filter((c) => c.dueDate && c.dueDate === today);
  const highPriorityActive = activeCards.filter((c) => c.priority === 'high');

  // Case 1: Urgent - Overdue or Due Today High Priority
  const urgentCard =
    overdueCards.find((c) => c.priority === 'high') ||
    dueTodayCards.find((c) => c.priority === 'high') ||
    overdueCards[0] ||
    dueTodayCards[0];

  if (urgentCard) {
    const isOverdue = urgentCard.dueDate && urgentCard.dueDate < today;
    return {
      urgency: 'high',
      headline: 'Waktu Tidak Menunggu!',
      message: `${profile.name}, ada tugas mendesak "${urgentCard.title}" yang ${
        isOverdue ? 'sudah melewati batas waktu' : 'tenggatnya hari ini'
      }! Singkirkan distraksi dan selesaikan ini sekarang!`,
      highlightCardId: urgentCard.id,
      stats: {
        totalActive: activeCards.length,
        highPriority: highPriorityActive.length,
        overdue: overdueCards.length,
        dueToday: dueTodayCards.length
      }
    };
  }

  // Case 2: High priority active exists but not overdue
  if (highPriorityActive.length > 0) {
    const target = highPriorityActive[0];
    return {
      urgency: 'high',
      headline: 'Fokus Prioritas Utama!',
      message: `${profile.name}, kamu memiliki ${highPriorityActive.length} tugas prioritas tinggi, terutama "${target.title}". Jangan tunda eksekusi!`,
      highlightCardId: target.id,
      stats: {
        totalActive: activeCards.length,
        highPriority: highPriorityActive.length,
        overdue: 0,
        dueToday: 0
      }
    };
  }

  // Case 3: Active cards exist without high urgency
  if (activeCards.length > 0) {
    return {
      urgency: 'medium',
      headline: 'Jaga Ritme Produktivitas!',
      message: `${profile.name}, ada ${activeCards.length} tugas menanti di antrean kerja. Mulai langkah pertama sekarang dan jaga momentum kerjamu!`,
      highlightCardId: activeCards[0]?.id,
      stats: {
        totalActive: activeCards.length,
        highPriority: 0,
        overdue: 0,
        dueToday: 0
      }
    };
  }

  // Case 4: All cards are done or board is clean
  return {
    urgency: 'low',
    headline: 'Papan Kerja Bersih & Tuntas!',
    message: `Luar biasa, ${profile.name}! Tidak ada tugas tertunda saat ini. Manfaatkan waktu untuk istirahat sejenak atau siapkan sasaran baru di Backlog.`,
    stats: {
      totalActive: 0,
      highPriority: 0,
      overdue: 0,
      dueToday: 0
    }
  };
}
