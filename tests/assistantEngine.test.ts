import { describe, it, expect } from 'vitest';
import { generateDailyBriefing } from '../src/renderer/src/utils/assistantEngine';
import { Card, Column, UserProfile } from '../src/shared/types';

describe('Hardcore Daily Reminder Engine', () => {
  const mockProfile: UserProfile = {
    id: 'user-1',
    name: 'Lee',
    roleTitle: 'Builder',
    avatarId: 'fox'
  };

  const columns: Column[] = [
    { id: 'col-todo', boardId: 'b1', title: 'To Do', order: 0 },
    { id: 'col-doing', boardId: 'b1', title: 'In Progress', order: 1 },
    { id: 'col-done', boardId: 'b1', title: 'Done', order: 2 }
  ];

  it('generates urgent callout when there is an overdue or today-due high priority card', () => {
    const today = new Date().toISOString().slice(0, 10);
    const mockCards: Card[] = [
      {
        id: 'c1',
        boardId: 'b1',
        columnId: 'col-todo',
        title: 'Selesaikan Arsitektur Database',
        description: '',
        order: 0,
        priority: 'high',
        dueDate: today,
        tags: ['Backend'],
        createdAt: Date.now(),
        updatedAt: Date.now()
      }
    ];

    const briefing = generateDailyBriefing(mockProfile, mockCards, columns);
    expect(briefing.urgency).toBe('high');
    expect(briefing.message).toContain('Lee');
    expect(briefing.message).toContain('Selesaikan Arsitektur Database');
    expect(briefing.highlightCardId).toBe('c1');
  });

  it('generates motivational push when all high priority tasks are clear but tasks are in backlog', () => {
    const mockCards: Card[] = [
      {
        id: 'c2',
        boardId: 'b1',
        columnId: 'col-todo',
        title: 'Merapikan Dokumentasi',
        description: '',
        order: 0,
        priority: 'low',
        tags: ['Docs'],
        createdAt: Date.now(),
        updatedAt: Date.now()
      }
    ];

    const briefing = generateDailyBriefing(mockProfile, mockCards, columns);
    expect(briefing.urgency).toBe('medium');
    expect(briefing.message).toContain('Lee');
  });

  it('recognizes clean board and gives sharp praise', () => {
    const mockCards: Card[] = [
      {
        id: 'c3',
        boardId: 'b1',
        columnId: 'col-done',
        title: 'Setup Database',
        description: '',
        order: 0,
        priority: 'high',
        tags: [],
        createdAt: Date.now(),
        updatedAt: Date.now()
      }
    ];

    const briefing = generateDailyBriefing(mockProfile, mockCards, columns);
    expect(briefing.urgency).toBe('low');
    expect(briefing.message).toContain('Lee');
    expect(briefing.headline).toMatch(/bersih|tuntas|luar biasa/i);
  });
});
