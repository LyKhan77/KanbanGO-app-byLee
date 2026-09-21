import { z } from 'zod';
import { Board, Column, Card, ChecklistItem } from '../../../shared/types';
import { KanbanGODB } from '../db/db';

const BoardSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  createdAt: z.number(),
  updatedAt: z.number(),
  isArchived: z.boolean()
});

const ColumnSchema = z.object({
  id: z.string(),
  boardId: z.string(),
  title: z.string(),
  order: z.number(),
  accentColor: z.string().optional()
});

const CardSchema = z.object({
  id: z.string(),
  boardId: z.string(),
  columnId: z.string(),
  title: z.string(),
  description: z.string(),
  order: z.number(),
  priority: z.enum(['low', 'medium', 'high', 'none']),
  dueDate: z.string().optional(),
  tags: z.array(z.string()),
  createdAt: z.number(),
  updatedAt: z.number()
});

const ChecklistItemSchema = z.object({
  id: z.string(),
  cardId: z.string(),
  text: z.string(),
  isCompleted: z.boolean(),
  order: z.number()
});

export const BackupSchema = z.object({
  version: z.number(),
  exportedAt: z.number(),
  board: BoardSchema,
  columns: z.array(ColumnSchema),
  cards: z.array(CardSchema),
  checklists: z.array(ChecklistItemSchema)
});

export type BackupData = z.infer<typeof BackupSchema>;

export function validateBackupJson(data: any): {
  success: boolean;
  data?: BackupData;
  error?: string;
} {
  const result = BackupSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, error: result.error.message };
}

export async function exportBoardData(boardId: string, db: KanbanGODB): Promise<string> {
  const board = await db.boards.get(boardId);
  if (!board) throw new Error('Board tidak ditemukan');

  const columns = await db.columns.where('boardId').equals(boardId).sortBy('order');
  const cards = await db.cards.where('boardId').equals(boardId).sortBy('order');
  const cardIds = cards.map((c) => c.id);
  const checklists = await db.checklists.where('cardId').anyOf(cardIds).sortBy('order');

  const payload: BackupData = {
    version: 1,
    exportedAt: Date.now(),
    board,
    columns,
    cards,
    checklists
  };

  return JSON.stringify(payload, null, 2);
}

export async function importBoardData(jsonString: string, db: KanbanGODB): Promise<string> {
  let parsed: any;
  try {
    parsed = JSON.parse(jsonString);
  } catch (e: any) {
    throw new Error('Format JSON tidak valid: ' + e.message);
  }

  const validation = validateBackupJson(parsed);
  if (!validation.success || !validation.data) {
    throw new Error('Validasi data gagal: ' + validation.error);
  }

  const { board, columns, cards, checklists } = validation.data;

  // Generate new IDs to prevent collision with existing data
  const newBoardId = 'board-imported-' + Date.now();
  const columnIdMap = new Map<string, string>();
  const cardIdMap = new Map<string, string>();

  const newBoard: Board = {
    ...board,
    id: newBoardId,
    title: `${board.title} (Impor)`,
    updatedAt: Date.now()
  };

  const newColumns: Column[] = columns.map((col) => {
    const newColId = 'col-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6);
    columnIdMap.set(col.id, newColId);
    return {
      ...col,
      id: newColId,
      boardId: newBoardId
    };
  });

  const newCards: Card[] = cards.map((card) => {
    const newCardId = 'card-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6);
    cardIdMap.set(card.id, newCardId);
    return {
      ...card,
      id: newCardId,
      boardId: newBoardId,
      columnId: columnIdMap.get(card.columnId) || card.columnId,
      updatedAt: Date.now()
    };
  });

  const newChecklists: ChecklistItem[] = checklists.map((chk) => ({
    ...chk,
    id: 'chk-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
    cardId: cardIdMap.get(chk.cardId) || chk.cardId
  }));

  await db.transaction('rw', [db.boards, db.columns, db.cards, db.checklists], async () => {
    await db.boards.add(newBoard);
    await db.columns.bulkAdd(newColumns);
    await db.cards.bulkAdd(newCards);
    await db.checklists.bulkAdd(newChecklists);
  });

  return newBoardId;
}
