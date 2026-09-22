import { describe, it, expect, beforeEach } from 'vitest';
import 'fake-indexeddb/auto';
import { renderHook, act, waitFor } from '@testing-library/react';
import React from 'react';
import { db } from '../src/renderer/src/db/db';
import { seedInitialData } from '../src/renderer/src/db/seed';
import { KanbanProvider, useKanban } from '../src/renderer/src/context/KanbanContext';

describe('Multi-Board Tabs Context Logic', () => {
  beforeEach(async () => {
    await db.boards.clear();
    await db.columns.clear();
    await db.cards.clear();
    await db.checklists.clear();
    await db.settings.clear();
    await seedInitialData(db);
  });

  it('initializes openBoardIds with activeBoardId from database settings', async () => {
    const settings = await db.settings.get('default');
    expect(settings?.activeBoardId).toBeDefined();

    const openBoardIds = settings?.openBoardIds || [settings!.activeBoardId!];
    expect(openBoardIds.length).toBeGreaterThan(0);
    expect(openBoardIds).toContain(settings?.activeBoardId);
  });

  it('correctly calculates next active board when closing the active tab', () => {
    const openBoardIds = ['b1', 'b2', 'b3'];
    const activeBoardId = 'b2';

    const closedIndex = openBoardIds.indexOf(activeBoardId);
    const updatedTabs = openBoardIds.filter(id => id !== activeBoardId);

    const nextActiveId = updatedTabs[Math.min(closedIndex, updatedTabs.length - 1)];
    expect(nextActiveId).toBe('b3');
  });

  it('keeps remaining active tab unchanged when closing an inactive tab', () => {
    const openBoardIds = ['b1', 'b2', 'b3'];
    const activeBoardId = 'b1';

    const closedId = 'b3';
    const updatedTabs = openBoardIds.filter(id => id !== closedId);
    const nextActiveId = activeBoardId === closedId ? updatedTabs[0] : activeBoardId;

    expect(nextActiveId).toBe('b1');
    expect(updatedTabs).toEqual(['b1', 'b2']);
  });

  it('provides openBoardIds, openBoardTab, and closeBoardTab in KanbanContext', async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) =>
      React.createElement(KanbanProvider, null, children);
    const { result } = renderHook(() => useKanban(), { wrapper });

    await waitFor(() => {
      expect(result.current.openBoardIds.length).toBeGreaterThan(0);
    });

    expect(result.current.openBoardIds).toContain('welcome-board');

    // Create a second board
    let newBoardId = '';
    await act(async () => {
      newBoardId = await result.current.createBoard('Second Board');
    });

    expect(result.current.openBoardIds).toContain(newBoardId);
    expect(result.current.activeBoardId).toBe(newBoardId);

    // Verify Dexie settings persisted
    const settings = await db.settings.get('default');
    expect(settings?.openBoardIds).toContain(newBoardId);
    expect(settings?.activeBoardId).toBe(newBoardId);

    // Close the active tab
    await act(async () => {
      await result.current.closeBoardTab(newBoardId);
    });

    expect(result.current.openBoardIds).not.toContain(newBoardId);
    expect(result.current.activeBoardId).toBe('welcome-board');

    // Re-open tab
    await act(async () => {
      await result.current.openBoardTab(newBoardId);
    });

    expect(result.current.openBoardIds).toContain(newBoardId);
    expect(result.current.activeBoardId).toBe(newBoardId);

    // Delete board removes from openBoardIds and updates Dexie settings
    await act(async () => {
      await result.current.deleteBoard(newBoardId);
    });

    expect(result.current.openBoardIds).not.toContain(newBoardId);
    const settingsAfterDelete = await db.settings.get('default');
    expect(settingsAfterDelete?.openBoardIds).not.toContain(newBoardId);
  });
});
