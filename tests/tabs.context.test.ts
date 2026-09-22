import { describe, it, expect, beforeEach } from 'vitest';
import 'fake-indexeddb/auto';
import { renderHook, act, waitFor } from '@testing-library/react';
import React from 'react';
import { db } from '../src/renderer/src/db/db';
import { seedInitialData } from '../src/renderer/src/db/seed';
import { KanbanProvider, useKanban } from '../src/renderer/src/context/KanbanContext';
import { resolveNextActiveTab } from '../src/renderer/src/utils/tabUtils';

describe('resolveNextActiveTab pure function', () => {
  it('advances to the next adjacent tab when closing the active tab in the middle', () => {
    const openTabs = ['board-1', 'board-2', 'board-3'];
    const result = resolveNextActiveTab(openTabs, 'board-2', 'board-2');

    expect(result).toEqual({
      updatedTabs: ['board-1', 'board-3'],
      nextActiveId: 'board-3'
    });
  });

  it('falls back to previous tab when closing the active tab at the end of the list', () => {
    const openTabs = ['board-1', 'board-2', 'board-3'];
    const result = resolveNextActiveTab(openTabs, 'board-3', 'board-3');

    expect(result).toEqual({
      updatedTabs: ['board-1', 'board-2'],
      nextActiveId: 'board-2'
    });
  });

  it('keeps the active tab unchanged when closing an inactive tab', () => {
    const openTabs = ['board-1', 'board-2', 'board-3'];
    const result = resolveNextActiveTab(openTabs, 'board-3', 'board-1');

    expect(result).toEqual({
      updatedTabs: ['board-1', 'board-2'],
      nextActiveId: 'board-1'
    });
  });

  it('returns empty tabs and null nextActiveId when closing the only open tab', () => {
    const openTabs = ['board-1'];
    const result = resolveNextActiveTab(openTabs, 'board-1', 'board-1');

    expect(result).toEqual({
      updatedTabs: [],
      nextActiveId: null
    });
  });

  it('returns unchanged tabs and activeId if the closed tab is not in open tabs', () => {
    const openTabs = ['board-1', 'board-2'];
    const result = resolveNextActiveTab(openTabs, 'board-nonexistent', 'board-1');

    expect(result).toEqual({
      updatedTabs: ['board-1', 'board-2'],
      nextActiveId: 'board-1'
    });
  });
});

describe('KanbanProvider Multi-Board Tabs Integration', () => {
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

  it('initializes openBoardIds with activeBoardId from database settings', async () => {
    const { result, unmount } = renderHook(() => useKanban(), { wrapper });

    await waitFor(() => {
      expect(result.current.openBoardIds.length).toBeGreaterThan(0);
    });

    expect(result.current.openBoardIds).toContain('welcome-board');
    expect(result.current.activeBoardId).toBe('welcome-board');

    const settings = await db.settings.get('default');
    expect(settings?.activeBoardId).toBe('welcome-board');
    expect(settings?.openBoardIds).toEqual(['welcome-board']);

    unmount();
  });

  it('opens a board tab and updates active board and Dexie settings', async () => {
    const { result, unmount } = renderHook(() => useKanban(), { wrapper });

    await waitFor(() => {
      expect(result.current.openBoardIds).toContain('welcome-board');
    });

    let newBoardId = '';
    await act(async () => {
      newBoardId = await result.current.createBoard('Second Board');
    });

    await waitFor(() => {
      expect(result.current.activeBoardId).toBe(newBoardId);
      expect(result.current.columns.length).toBe(3);
    });

    expect(result.current.openBoardIds).toContain(newBoardId);

    const settings = await db.settings.get('default');
    expect(settings?.openBoardIds).toContain(newBoardId);
    expect(settings?.activeBoardId).toBe(newBoardId);

    unmount();
  });

  it('advances to adjacent tab when closing the active tab', async () => {
    const { result, unmount } = renderHook(() => useKanban(), { wrapper });

    await waitFor(() => {
      expect(result.current.openBoardIds).toContain('welcome-board');
    });

    let board2 = '';
    let board3 = '';
    await act(async () => {
      board2 = await result.current.createBoard('Board 2');
    });
    await waitFor(() => {
      expect(result.current.activeBoardId).toBe(board2);
      expect(result.current.columns.length).toBe(3);
    });

    await act(async () => {
      board3 = await result.current.createBoard('Board 3');
    });
    await waitFor(() => {
      expect(result.current.activeBoardId).toBe(board3);
      expect(result.current.columns.length).toBe(3);
    });

    // Switch active tab to board2 (middle tab)
    await act(async () => {
      await result.current.openBoardTab(board2);
    });
    await waitFor(() => {
      expect(result.current.activeBoardId).toBe(board2);
    });

    // Close active tab board2 -> should advance to board3
    await act(async () => {
      await result.current.closeBoardTab(board2);
    });
    await waitFor(() => {
      expect(result.current.activeBoardId).toBe(board3);
    });

    expect(result.current.openBoardIds).toEqual(['welcome-board', board3]);

    const settings = await db.settings.get('default');
    expect(settings?.openBoardIds).toEqual(['welcome-board', board3]);
    expect(settings?.activeBoardId).toBe(board3);

    unmount();
  });

  it('keeps active tab unchanged when closing an inactive tab', async () => {
    const { result, unmount } = renderHook(() => useKanban(), { wrapper });

    await waitFor(() => {
      expect(result.current.openBoardIds).toContain('welcome-board');
    });

    let board2 = '';
    await act(async () => {
      board2 = await result.current.createBoard('Board 2');
    });
    await waitFor(() => {
      expect(result.current.activeBoardId).toBe(board2);
    });

    // Make welcome-board active
    await act(async () => {
      await result.current.openBoardTab('welcome-board');
    });
    await waitFor(() => {
      expect(result.current.activeBoardId).toBe('welcome-board');
    });

    // Close inactive tab board2
    await act(async () => {
      await result.current.closeBoardTab(board2);
    });

    expect(result.current.openBoardIds).toEqual(['welcome-board']);
    expect(result.current.activeBoardId).toBe('welcome-board');

    const settings = await db.settings.get('default');
    expect(settings?.openBoardIds).toEqual(['welcome-board']);
    expect(settings?.activeBoardId).toBe('welcome-board');

    unmount();
  });

  it('sets activeBoardId to null and openBoardIds to empty when closing the last open tab', async () => {
    const { result, unmount } = renderHook(() => useKanban(), { wrapper });

    await waitFor(() => {
      expect(result.current.openBoardIds).toEqual(['welcome-board']);
      expect(result.current.activeBoardId).toBe('welcome-board');
    });

    await act(async () => {
      await result.current.closeBoardTab('welcome-board');
    });

    expect(result.current.openBoardIds).toEqual([]);
    expect(result.current.activeBoardId).toBeNull();

    const settings = await db.settings.get('default');
    expect(settings?.openBoardIds).toEqual([]);
    expect(settings?.activeBoardId).toBeUndefined();

    unmount();
  });

  it('cleans up openBoardIds and updates active tab when a board is deleted', async () => {
    const { result, unmount } = renderHook(() => useKanban(), { wrapper });

    await waitFor(() => {
      expect(result.current.openBoardIds).toContain('welcome-board');
    });

    let board2 = '';
    await act(async () => {
      board2 = await result.current.createBoard('Board 2');
    });
    await waitFor(() => {
      expect(result.current.activeBoardId).toBe(board2);
    });

    expect(result.current.openBoardIds).toContain(board2);

    await act(async () => {
      await result.current.deleteBoard(board2);
    });
    await waitFor(() => {
      expect(result.current.activeBoardId).toBe('welcome-board');
    });

    expect(result.current.openBoardIds).not.toContain(board2);
    expect(result.current.openBoardIds).toContain('welcome-board');

    const settings = await db.settings.get('default');
    expect(settings?.openBoardIds).not.toContain(board2);
    expect(settings?.activeBoardId).toBe('welcome-board');

    unmount();
  });
});
