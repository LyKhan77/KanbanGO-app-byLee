import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { DailyBriefingBanner } from '../src/renderer/src/components/assistant/DailyBriefingBanner';
import { DailyBriefing } from '../src/renderer/src/utils/assistantEngine';

describe('DailyBriefingBanner Component', () => {
  it('renders hardcore motivational briefing message', () => {
    const mockBriefing: DailyBriefing = {
      urgency: 'high',
      headline: 'Waktu Tidak Menunggu!',
      message: 'Kamu punya 2 tugas mendesak hari ini.',
      highlightCardId: 'c1',
      stats: { totalActive: 2, highPriority: 1, overdue: 1, dueToday: 0 }
    };

    render(
      <DailyBriefingBanner
        briefing={mockBriefing}
        onFocusCard={() => {}}
        onDismiss={() => {}}
      />
    );

    expect(screen.getByText('Waktu Tidak Menunggu!')).toBeDefined();
    expect(screen.getByText(/2 tugas mendesak/i)).toBeDefined();
    expect(screen.getByText(/Mulai Sesi Fokus/i)).toBeDefined();
  });
});
