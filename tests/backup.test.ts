import { describe, it, expect } from 'vitest';
import { validateBackupJson, BackupData } from '../src/renderer/src/utils/backup';

describe('Backup Validation Logic', () => {
  it('validates a valid board backup JSON payload', () => {
    const validData: BackupData = {
      version: 1,
      exportedAt: Date.now(),
      board: {
        id: 'b1',
        title: 'Test Board',
        isArchived: false,
        createdAt: Date.now(),
        updatedAt: Date.now()
      },
      columns: [
        { id: 'c1', boardId: 'b1', title: 'To Do', order: 0 }
      ],
      cards: [
        {
          id: 'card1',
          boardId: 'b1',
          columnId: 'c1',
          title: 'Card 1',
          description: '',
          order: 0,
          priority: 'high',
          tags: [],
          createdAt: Date.now(),
          updatedAt: Date.now()
        }
      ],
      checklists: []
    };

    const result = validateBackupJson(validData);
    expect(result.success).toBe(true);
  });

  it('rejects an invalid backup payload', () => {
    const invalidData = { corrupted: true };
    const result = validateBackupJson(invalidData);
    expect(result.success).toBe(false);
  });
});
