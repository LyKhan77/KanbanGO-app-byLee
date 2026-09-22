import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import 'fake-indexeddb/auto';
import { CalendarView } from '../src/renderer/src/components/calendar/CalendarView';
import {
  getMonthGridDays,
  formatYearMonthIndo,
  formatDateToIso,
  MONTH_NAMES_ID,
  WEEKDAYS_SHORT_ID
} from '../src/renderer/src/utils/calendar';
import { KanbanContext } from '../src/renderer/src/context/KanbanContext';
import { Card } from '../src/shared/types';

describe('Calendar Date Utilities', () => {
  it('generates 35 or 42 calendar grid days for a given year and month', () => {
    const days = getMonthGridDays(2026, 8); // September 2026 (0-indexed: 8)
    expect(days.length % 7).toBe(0);
    expect(days.length).toBeGreaterThanOrEqual(35);

    // Day 1 of September 2026 is Tuesday
    const sepFirst = days.find((d) => d.dateString === '2026-09-01');
    expect(sepFirst).toBeDefined();
    expect(sepFirst?.isCurrentMonth).toBe(true);
    expect(sepFirst?.dayNumber).toBe(1);

    // Padding day from August 2026
    const augLast = days.find((d) => d.dateString === '2026-08-31');
    expect(augLast).toBeDefined();
    expect(augLast?.isCurrentMonth).toBe(false);
  });

  it('correctly handles month with 28 days starting on Monday', () => {
    // February 2021 starts on Monday and has 28 days
    const days = getMonthGridDays(2021, 1);
    expect(days.length % 7).toBe(0);
    expect(days.length).toBeGreaterThanOrEqual(35);
  });

  it('formats month and year in Indonesian', () => {
    expect(formatYearMonthIndo(2026, 8)).toBe('September 2026');
    expect(formatYearMonthIndo(2025, 0)).toBe('Januari 2025');
  });

  it('formats date to ISO YYYY-MM-DD string', () => {
    const d = new Date(2026, 8, 5);
    expect(formatDateToIso(d)).toBe('2026-09-05');
  });

  it('exports Indonesian month names and weekday constants', () => {
    expect(MONTH_NAMES_ID).toHaveLength(12);
    expect(MONTH_NAMES_ID[0]).toBe('Januari');
    expect(WEEKDAYS_SHORT_ID).toHaveLength(7);
    expect(WEEKDAYS_SHORT_ID[0]).toBe('Sen');
  });
});

describe('CalendarView Component', () => {
  const mockCards: Card[] = [
    {
      id: 'c1',
      boardId: 'b1',
      columnId: 'col1',
      title: 'Review Sprint',
      description: '',
      order: 0,
      priority: 'high',
      dueDate: '2026-09-15',
      coverColor: 'terracotta',
      tags: ['Sprint'],
      createdAt: 1000,
      updatedAt: 1000
    },
    {
      id: 'c2',
      boardId: 'b1',
      columnId: 'col1',
      title: 'Task Belum Terjadwal',
      description: '',
      order: 1,
      priority: 'low',
      coverColor: 'none',
      tags: ['Backlog'],
      createdAt: 2000,
      updatedAt: 2000
    },
    {
      id: 'c3',
      boardId: 'b2',
      columnId: 'col2',
      title: 'Task Papan Sebelah',
      description: '',
      order: 0,
      priority: 'none',
      dueDate: '2026-09-15',
      coverColor: 'sage',
      tags: ['Other'],
      createdAt: 3000,
      updatedAt: 3000
    }
  ];

  const mockUpdateCardDueDate = vi.fn();
  const mockCreateCard = vi.fn().mockResolvedValue('card-new-id');
  const mockOnCardClick = vi.fn();

  const mockContextValue = {
    boards: [
      { id: 'b1', title: 'Board Proyek Utama' },
      { id: 'b2', title: 'Board Sampingan' }
    ],
    activeBoardId: 'b1',
    activeBoard: { id: 'b1', title: 'Board Proyek Utama' },
    columns: [{ id: 'col1', boardId: 'b1', title: 'To Do', order: 0 }],
    cards: mockCards,
    updateCardDueDate: mockUpdateCardDueDate,
    createCard: mockCreateCard
  } as any;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders calendar month navigation, weekdays, and scheduled cards on date cells', () => {
    render(
      <KanbanContext.Provider value={mockContextValue}>
        <CalendarView
          initialYear={2026}
          initialMonth={8}
          onCardClick={mockOnCardClick}
        />
      </KanbanContext.Provider>
    );

    expect(screen.getByText('September 2026')).toBeDefined();
    expect(screen.getByText('Sen')).toBeDefined();
    expect(screen.getByText('Min')).toBeDefined();
    expect(screen.getByText('Review Sprint')).toBeDefined();
  });

  it('navigates next month, previous month, and resets to today', () => {
    render(
      <KanbanContext.Provider value={mockContextValue}>
        <CalendarView
          initialYear={2026}
          initialMonth={8}
          onCardClick={mockOnCardClick}
        />
      </KanbanContext.Provider>
    );

    expect(screen.getByText('September 2026')).toBeDefined();

    // Next month -> Oktober 2026
    const nextBtn = screen.getByTitle('Bulan Berikutnya');
    fireEvent.click(nextBtn);
    expect(screen.getByText('Oktober 2026')).toBeDefined();

    // Previous month -> September 2026
    const prevBtn = screen.getByTitle('Bulan Sebelumnya');
    fireEvent.click(prevBtn);
    expect(screen.getByText('September 2026')).toBeDefined();

    // Hari Ini button
    const todayBtn = screen.getByRole('button', { name: /Hari Ini/i });
    fireEvent.click(todayBtn);
    const now = new Date();
    const expectedTodayHeader = formatYearMonthIndo(now.getFullYear(), now.getMonth());
    expect(screen.getByText(expectedTodayHeader)).toBeDefined();
  });

  it('opens card detail when clicking a scheduled card', () => {
    render(
      <KanbanContext.Provider value={mockContextValue}>
        <CalendarView
          initialYear={2026}
          initialMonth={8}
          onCardClick={mockOnCardClick}
        />
      </KanbanContext.Provider>
    );

    const cardPill = screen.getByText('Review Sprint');
    fireEvent.click(cardPill);
    expect(mockOnCardClick).toHaveBeenCalledWith(expect.objectContaining({ id: 'c1' }));
  });

  it('handles drag and drop to reschedule card to a new date cell', async () => {
    render(
      <KanbanContext.Provider value={mockContextValue}>
        <CalendarView
          initialYear={2026}
          initialMonth={8}
          onCardClick={mockOnCardClick}
        />
      </KanbanContext.Provider>
    );

    const cardPill = screen.getByText('Review Sprint');
    fireEvent.dragStart(cardPill, {
      dataTransfer: {
        setData: vi.fn(),
        effectAllowed: 'move'
      }
    });

    // Find the cell for 2026-09-20
    const targetCell = screen.getByTestId('calendar-day-2026-09-20');
    fireEvent.dragOver(targetCell, { dataTransfer: { dropEffect: 'move' } });
    await act(async () => {
      fireEvent.drop(targetCell, {
        dataTransfer: {
          getData: (type: string) => (type === 'text/plain' ? 'c1' : '')
        }
      });
    });

    expect(mockUpdateCardDueDate).toHaveBeenCalledWith('c1', '2026-09-20');
  });

  it('toggles unscheduled tasks drawer and shows cards without due date', () => {
    render(
      <KanbanContext.Provider value={mockContextValue}>
        <CalendarView
          initialYear={2026}
          initialMonth={8}
          onCardClick={mockOnCardClick}
        />
      </KanbanContext.Provider>
    );

    const drawerBtn = screen.getByRole('button', { name: /Belum Terjadwal/i });
    fireEvent.click(drawerBtn);

    expect(screen.getByText('Task Belum Terjadwal')).toBeDefined();

    // Clicking drawer card triggers onCardClick
    fireEvent.click(screen.getByText('Task Belum Terjadwal'));
    expect(mockOnCardClick).toHaveBeenCalledWith(expect.objectContaining({ id: 'c2' }));
  });

  it('clears due date when dragging a scheduled card to unscheduled drawer', async () => {
    render(
      <KanbanContext.Provider value={mockContextValue}>
        <CalendarView
          initialYear={2026}
          initialMonth={8}
          onCardClick={mockOnCardClick}
        />
      </KanbanContext.Provider>
    );

    const drawerBtn = screen.getByRole('button', { name: /Belum Terjadwal/i });
    fireEvent.click(drawerBtn);

    const drawerDropArea = screen.getByTestId('unscheduled-drawer');
    fireEvent.dragOver(drawerDropArea, { dataTransfer: { dropEffect: 'move' } });
    await act(async () => {
      fireEvent.drop(drawerDropArea, {
        dataTransfer: {
          getData: (type: string) => (type === 'text/plain' ? 'c1' : '')
        }
      });
    });

    expect(mockUpdateCardDueDate).toHaveBeenCalledWith('c1', undefined);
  });

  it('toggles scope between current board and all boards', async () => {
    render(
      <KanbanContext.Provider value={mockContextValue}>
        <CalendarView
          initialYear={2026}
          initialMonth={8}
          onCardClick={mockOnCardClick}
        />
      </KanbanContext.Provider>
    );

    // In current board scope ('b1'), 'Task Papan Sebelah' (from 'b2') should not be visible
    expect(screen.queryByText('Task Papan Sebelah')).toBeNull();

    // Switch to Semua Papan
    const allBoardBtn = screen.getByRole('button', { name: /Semua Papan/i });
    await act(async () => {
      fireEvent.click(allBoardBtn);
    });

    // Now 'Task Papan Sebelah' should be visible
    expect(screen.getByText('Task Papan Sebelah')).toBeDefined();

    // Switch back to Papan Ini
    const currentBoardBtn = screen.getByRole('button', { name: /Papan Ini/i });
    await act(async () => {
      fireEvent.click(currentBoardBtn);
    });

    expect(screen.queryByText('Task Papan Sebelah')).toBeNull();
  });

  it('allows quick adding a card directly to a date cell', async () => {
    render(
      <KanbanContext.Provider value={mockContextValue}>
        <CalendarView
          initialYear={2026}
          initialMonth={8}
          onCardClick={mockOnCardClick}
        />
      </KanbanContext.Provider>
    );

    const targetCell = screen.getByTestId('calendar-day-2026-09-10');
    const quickAddBtn = targetCell.querySelector('button[aria-label="Tambah Tugas"]');
    expect(quickAddBtn).toBeDefined();
    fireEvent.click(quickAddBtn!);

    const input = screen.getByPlaceholderText('Judul kartu...');
    fireEvent.change(input, { target: { value: 'Kartu Baru Rapat' } });

    const submitBtn = screen.getByRole('button', { name: /Simpan/i });
    await act(async () => {
      fireEvent.click(submitBtn);
    });

    expect(mockCreateCard).toHaveBeenCalledWith(
      'col1',
      'Kartu Baru Rapat',
      expect.objectContaining({ dueDate: '2026-09-10' })
    );
  });
});
