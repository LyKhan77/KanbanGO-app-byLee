import { describe, it, expect, beforeEach } from 'vitest';
import 'fake-indexeddb/auto';
import { KanbanGODB } from '../src/renderer/src/db/db';
import { Board, Column, Card, ChecklistItem } from '../src/shared/types';

describe('KanbanGODB Local Storage', () => {
  let db: KanbanGODB;

  beforeEach(async () => {
    db = new KanbanGODB();
    await db.boards.clear();
    await db.columns.clear();
    await db.cards.clear();
    await db.checklists.clear();
    await db.settings.clear();
  });

  it('creates and retrieves a new board', async () => {
    const newBoard: Board = {
      id: 'board-1',
      title: 'Studio Workspace',
      description: 'Ruang kerja kreatif',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      isArchived: false
    };
    await db.boards.add(newBoard);
    const fetched = await db.boards.get('board-1');
    expect(fetched?.title).toBe('Studio Workspace');
  });

  it('creates columns and retrieves them sorted by order', async () => {
    const col1: Column = {
      id: 'c1',
      boardId: 'b1',
      title: 'To Do',
      order: 0,
      accentColor: '#c86d51'
    };
    const col2: Column = {
      id: 'c2',
      boardId: 'b1',
      title: 'Done',
      order: 1,
      accentColor: '#556b56'
    };
    await db.columns.bulkAdd([col2, col1]);
    const cols = await db.columns.where('boardId').equals('b1').sortBy('order');
    expect(cols.length).toBe(2);
    expect(cols[0].title).toBe('To Do');
    expect(cols[1].title).toBe('Done');
  });

  it('handles cards and subtask checklist items', async () => {
    const card: Card = {
      id: 'card-1',
      boardId: 'b1',
      columnId: 'c1',
      title: 'Rancang UI Bohemian',
      description: 'Detail desain',
      order: 0,
      priority: 'high',
      dueDate: '2026-09-25',
      tags: ['Design', 'Boho'],
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    await db.cards.add(card);

    const check1: ChecklistItem = {
      id: 'chk-1',
      cardId: 'card-1',
      text: 'Pilih palet terracotta & sage',
      isCompleted: true,
      order: 0
    };
    const check2: ChecklistItem = {
      id: 'chk-2',
      cardId: 'card-1',
      text: 'Setup tipografi serif',
      isCompleted: false,
      order: 1
    };
    await db.checklists.bulkAdd([check1, check2]);

    const items = await db.checklists.where('cardId').equals('card-1').sortBy('order');
    expect(items.length).toBe(2);
    expect(items[0].isCompleted).toBe(true);
    expect(items[1].isCompleted).toBe(false);
  });
});
