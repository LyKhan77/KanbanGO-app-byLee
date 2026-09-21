import Dexie, { Table } from 'dexie';
import { Board, Column, Card, ChecklistItem, UserSettings } from '../../../shared/types';

export class KanbanGODB extends Dexie {
  boards!: Table<Board, string>;
  columns!: Table<Column, string>;
  cards!: Table<Card, string>;
  checklists!: Table<ChecklistItem, string>;
  settings!: Table<UserSettings, string>;

  constructor() {
    super('KanbanGODatabase');
    this.version(1).stores({
      boards: 'id, title, isArchived, createdAt',
      columns: 'id, boardId, order',
      cards: 'id, boardId, columnId, order, priority, dueDate',
      checklists: 'id, cardId, order',
      settings: 'id'
    });
  }
}

export const db = new KanbanGODB();
