import { describe, it, expect, beforeEach } from 'vitest';
import 'fake-indexeddb/auto';
import { renderHook, act, waitFor } from '@testing-library/react';
import React from 'react';
import { db } from '../src/renderer/src/db/db';
import { Card, CardCoverColor, BoardViewMode } from '../src/shared/types';
import { KanbanProvider, useKanban } from '../src/renderer/src/context/KanbanContext';
import { seedInitialData } from '../src/renderer/src/db/seed';
import { reorderTabs } from '../src/renderer/src/utils/tabUtils';

describe('KanbanContext Expansion & Dexie Persistence Baseline', () => {
  beforeEach(async () => {
    await db.boards.clear();
    await db.columns.clear();
    await db.cards.clear();
    await db.checklists.clear();
    await db.settings.clear();
  });

  describe('reorderTabs pure utility', () => {
    it('moves index 0 to index 2 in ["b1", "b2", "b3", "b4"] producing ["b2", "b3", "b1", "b4"]', () => {
      const openBoardIds = ['b1', 'b2', 'b3', 'b4'];
      const result = reorderTabs(openBoardIds, 0, 2);
      expect(result).toEqual(['b2', 'b3', 'b1', 'b4']);
    });

    it('moves index 2 to index 0 producing ["b3", "b1", "b2", "b4"]', () => {
      const openBoardIds = ['b1', 'b2', 'b3', 'b4'];
      const result = reorderTabs(openBoardIds, 2, 0);
      expect(result).toEqual(['b3', 'b1', 'b2', 'b4']);
    });

    it('handles boundary conditions: out-of-bounds, negative, or identical indices as no-op', () => {
      const openBoardIds = ['b1', 'b2', 'b3', 'b4'];
      expect(reorderTabs(openBoardIds, 1, 1)).toEqual(openBoardIds);
      expect(reorderTabs(openBoardIds, -1, 2)).toEqual(openBoardIds);
      expect(reorderTabs(openBoardIds, 0, -1)).toEqual(openBoardIds);
      expect(reorderTabs(openBoardIds, 0, 5)).toEqual(openBoardIds);
      expect(reorderTabs(openBoardIds, 4, 1)).toEqual(openBoardIds);
    });
  });

  describe('Dexie database card updates', () => {
    it('updates card dueDate in Dexie database', async () => {
      const cardId = 'card-due-1';
      const initialCard: Card = {
        id: cardId,
        boardId: 'board-1',
        columnId: 'col-1',
        title: 'Task with Due Date',
        description: 'Testing due date update',
        order: 0,
        priority: 'high',
        tags: ['test'],
        createdAt: 1000,
        updatedAt: 1000
      };

      await db.cards.add(initialCard);

      const newDueDate = '2026-10-31';
      const updatedAt = Date.now();
      await db.cards.update(cardId, { dueDate: newDueDate, updatedAt });

      const fetched = await db.cards.get(cardId);
      expect(fetched?.dueDate).toBe('2026-10-31');
      expect(fetched?.updatedAt).toBe(updatedAt);
    });

    it('updates card coverColor in Dexie database', async () => {
      const cardId = 'card-cover-1';
      const initialCard: Card = {
        id: cardId,
        boardId: 'board-1',
        columnId: 'col-1',
        title: 'Task with Cover Color',
        description: 'Testing cover color update',
        order: 0,
        priority: 'low',
        tags: [],
        createdAt: 1000,
        updatedAt: 1000
      };

      await db.cards.add(initialCard);

      const coverColor: CardCoverColor = 'terracotta';
      const updatedAt = Date.now();
      await db.cards.update(cardId, { coverColor, updatedAt });

      const fetched = await db.cards.get(cardId);
      expect(fetched?.coverColor).toBe('terracotta');
      expect(fetched?.updatedAt).toBe(updatedAt);
    });
  });

  describe('Dexie database settings persistence', () => {
    it('persists activeViewMode in Dexie db.settings', async () => {
      await db.settings.put({
        id: 'default',
        isSidebarCollapsed: false,
        activeViewMode: 'kanban',
        profile: {
          id: 'profile-default',
          name: 'Lee Dev',
          roleTitle: 'Mindful Craftsman',
          avatarId: 'fox'
        },
        assistant: {
          isEnabled: true,
          reminderTime: '09:00',
          tone: 'hardcore'
        }
      });

      const mode: BoardViewMode = 'calendar';
      await db.settings.update('default', { activeViewMode: mode });

      const settings = await db.settings.get('default');
      expect(settings?.activeViewMode).toBe('calendar');
    });
  });
});

describe('KanbanProvider Expanded Features Integration', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) =>
    React.createElement(KanbanProvider, null, children);

  beforeEach(async () => {
    await db.boards.clear();
    await db.columns.clear();
    await db.cards.clear();
    await db.checklists.clear();
    await db.settings.clear();
    await seedInitialData(db);
  });

  it('provides default viewMode as kanban and updates/persists via setViewMode', async () => {
    const { result, unmount } = renderHook(() => useKanban(), { wrapper });

    await waitFor(() => {
      expect(result.current.openBoardIds.length).toBeGreaterThan(0);
    });

    expect(result.current.viewMode).toBe('kanban');

    await act(async () => {
      await result.current.setViewMode('calendar');
    });

    expect(result.current.viewMode).toBe('calendar');
    const settings = await db.settings.get('default');
    expect(settings?.activeViewMode).toBe('calendar');

    unmount();
  });

  it('reorders board tabs in state and persists to db.settings', async () => {
    const { result, unmount } = renderHook(() => useKanban(), { wrapper });

    await waitFor(() => {
      expect(result.current.openBoardIds.length).toBeGreaterThan(0);
    });

    let b2 = '';
    let b3 = '';
    let b4 = '';
    await act(async () => {
      b2 = await result.current.createBoard('Board 2');
    });
    await waitFor(() => {
      expect(result.current.openBoardIds).toContain(b2);
    });

    await act(async () => {
      b3 = await result.current.createBoard('Board 3');
    });
    await waitFor(() => {
      expect(result.current.openBoardIds).toContain(b3);
    });

    await act(async () => {
      b4 = await result.current.createBoard('Board 4');
    });
    await waitFor(() => {
      expect(result.current.openBoardIds).toContain(b4);
    });

    expect(result.current.openBoardIds).toEqual(['welcome-board', b2, b3, b4]);

    // Reorder: index 0 ('welcome-board') to index 2
    await act(async () => {
      await result.current.reorderBoardTabs(0, 2);
    });

    expect(result.current.openBoardIds).toEqual([b2, b3, 'welcome-board', b4]);

    const settings = await db.settings.get('default');
    expect(settings?.openBoardIds).toEqual([b2, b3, 'welcome-board', b4]);

    // Test no-op if same index or out of bounds
    await act(async () => {
      await result.current.reorderBoardTabs(1, 1);
      await result.current.reorderBoardTabs(-1, 2);
      await result.current.reorderBoardTabs(0, 10);
    });

    expect(result.current.openBoardIds).toEqual([b2, b3, 'welcome-board', b4]);

    unmount();
  });

  it('updates card dueDate in state and persists to db.cards', async () => {
    const { result, unmount } = renderHook(() => useKanban(), { wrapper });

    await waitFor(() => {
      expect(result.current.cards.length).toBeGreaterThan(0);
    });

    const cardId = result.current.cards[0].id;
    const testDueDate = '2026-11-20';

    await act(async () => {
      await result.current.updateCardDueDate(cardId, testDueDate);
    });

    const cardInState = result.current.cards.find((c) => c.id === cardId);
    expect(cardInState?.dueDate).toBe(testDueDate);

    const cardInDb = await db.cards.get(cardId);
    expect(cardInDb?.dueDate).toBe(testDueDate);

    // Test empty string normalization: "" clears to undefined
    await act(async () => {
      await result.current.updateCardDueDate(cardId, '');
    });
    expect(result.current.cards.find((c) => c.id === cardId)?.dueDate).toBeUndefined();
    expect((await db.cards.get(cardId))?.dueDate).toBeUndefined();

    // Test whitespace string normalization: "   " clears to undefined
    await act(async () => {
      await result.current.updateCardDueDate(cardId, testDueDate);
    });
    expect(result.current.cards.find((c) => c.id === cardId)?.dueDate).toBe(testDueDate);

    await act(async () => {
      await result.current.updateCardDueDate(cardId, '   ');
    });
    expect(result.current.cards.find((c) => c.id === cardId)?.dueDate).toBeUndefined();
    expect((await db.cards.get(cardId))?.dueDate).toBeUndefined();

    // Also test clearing dueDate with explicit undefined
    await act(async () => {
      await result.current.updateCardDueDate(cardId, testDueDate);
      await result.current.updateCardDueDate(cardId, undefined);
    });
    expect(result.current.cards.find((c) => c.id === cardId)?.dueDate).toBeUndefined();
    expect((await db.cards.get(cardId))?.dueDate).toBeUndefined();

    // Non-existent card ID does not throw or crash
    await act(async () => {
      await result.current.updateCardDueDate('non-existent-card', '2026-12-31');
    });

    unmount();
  });

  it('updates card coverColor in state and persists to db.cards', async () => {
    const { result, unmount } = renderHook(() => useKanban(), { wrapper });

    await waitFor(() => {
      expect(result.current.cards.length).toBeGreaterThan(0);
    });

    const cardId = result.current.cards[0].id;
    const testColor: CardCoverColor = 'terracotta';

    await act(async () => {
      await result.current.updateCardCoverColor(cardId, testColor);
    });

    const cardInState = result.current.cards.find((c) => c.id === cardId);
    expect(cardInState?.coverColor).toBe('terracotta');

    const cardInDb = await db.cards.get(cardId);
    expect(cardInDb?.coverColor).toBe('terracotta');

    // Non-existent card ID does not throw or crash
    await act(async () => {
      await result.current.updateCardCoverColor('non-existent-card', 'moss');
    });

    unmount();
  });
});
