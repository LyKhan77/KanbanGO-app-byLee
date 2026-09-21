import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { db } from '../db/db';
import { seedInitialData } from '../db/seed';
import { Board, Column, Card, ChecklistItem, UserProfile, AssistantConfig } from '../../../shared/types';
import { shouldTriggerDailyBriefing, getTodayDateString, getCurrentTimeString } from '../utils/scheduler';
import { generateDailyBriefing } from '../utils/assistantEngine';

interface KanbanContextType {
  boards: Board[];
  activeBoardId: string | null;
  activeBoard: Board | null;
  columns: Column[];
  cards: Card[];
  checklists: ChecklistItem[];
  profile: UserProfile;
  assistantConfig: AssistantConfig;
  isSidebarCollapsed: boolean;
  isProfileModalOpen: boolean;
  searchQuery: string;
  selectedPriority: string;
  selectedTag: string;
  setSearchQuery: (q: string) => void;
  setSelectedPriority: (p: string) => void;
  setSelectedTag: (t: string) => void;
  setIsSidebarCollapsed: (collapsed: boolean) => void;
  openProfileModal: () => void;
  closeProfileModal: () => void;
  setActiveBoardId: (id: string) => void;
  createBoard: (title: string, description?: string) => Promise<string>;
  updateBoard: (id: string, updates: Partial<Board>) => Promise<void>;
  deleteBoard: (id: string) => Promise<void>;
  createColumn: (title: string, accentColor?: string) => Promise<string>;
  updateColumn: (id: string, updates: Partial<Column>) => Promise<void>;
  deleteColumn: (id: string) => Promise<void>;
  reorderColumns: (reordered: Column[]) => Promise<void>;
  createCard: (columnId: string, title: string) => Promise<string>;
  updateCard: (id: string, updates: Partial<Card>) => Promise<void>;
  deleteCard: (id: string) => Promise<void>;
  moveCard: (cardId: string, targetColumnId: string, newOrder: number) => Promise<void>;
  createChecklist: (cardId: string, text: string) => Promise<string>;
  toggleChecklist: (id: string) => Promise<void>;
  deleteChecklist: (id: string) => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  updateAssistantConfig: (updates: Partial<AssistantConfig>) => Promise<void>;
  refreshData: () => Promise<void>;
}

export const KanbanContext = createContext<KanbanContextType | null>(null);

const DEFAULT_PROFILE: UserProfile = {
  id: 'profile-default',
  name: 'Lee Dev',
  roleTitle: 'Mindful Craftsman',
  avatarId: 'fox'
};

const DEFAULT_ASSISTANT: AssistantConfig = {
  isEnabled: true,
  reminderTime: '09:00',
  tone: 'hardcore'
};

export const KanbanProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [boards, setBoards] = useState<Board[]>([]);
  const [activeBoardId, setActiveBoardIdState] = useState<string | null>(null);
  const [columns, setColumns] = useState<Column[]>([]);
  const [cards, setCards] = useState<Card[]>([]);
  const [checklists, setChecklists] = useState<ChecklistItem[]>([]);
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [assistantConfig, setAssistantConfig] = useState<AssistantConfig>(DEFAULT_ASSISTANT);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [selectedTag, setSelectedTag] = useState('all');
  const [isInitialized, setIsInitialized] = useState(false);

  const refreshData = async () => {
    await seedInitialData(db);
    const rawBoards = await db.boards.toArray();
    const allBoards = rawBoards.filter((b) => !b.isArchived).sort((a, b) => a.createdAt - b.createdAt);
    setBoards(allBoards);

    const settings = await db.settings.get('default');
    if (settings) {
      if (settings.profile) setProfile(settings.profile);
      if (settings.assistant) setAssistantConfig(settings.assistant);
      if (settings.activeBoardId && allBoards.some((b) => b.id === settings.activeBoardId)) {
        setActiveBoardIdState(settings.activeBoardId);
      } else if (allBoards.length > 0) {
        setActiveBoardIdState(allBoards[0].id);
      }
    } else if (allBoards.length > 0) {
      setActiveBoardIdState(allBoards[0].id);
    }
    setIsInitialized(true);
  };

  useEffect(() => {
    refreshData();
  }, []);

  useEffect(() => {
    if (!activeBoardId) {
      setColumns([]);
      setCards([]);
      setChecklists([]);
      return;
    }

    const loadBoardDetails = async () => {
      const cols = await db.columns.where('boardId').equals(activeBoardId).sortBy('order');
      const crds = await db.cards.where('boardId').equals(activeBoardId).sortBy('order');
      const cardIds = crds.map((c) => c.id);
      const chks = await db.checklists.where('cardId').anyOf(cardIds).sortBy('order');

      setColumns(cols);
      setCards(crds);
      setChecklists(chks);
    };

    loadBoardDetails();
  }, [activeBoardId]);

  const setActiveBoardId = async (id: string) => {
    setActiveBoardIdState(id);
    const existing = await db.settings.get('default');
    if (existing) {
      await db.settings.update('default', { activeBoardId: id });
    }
  };

  const createBoard = async (title: string, description?: string) => {
    const id = 'board-' + Date.now();
    const newBoard: Board = {
      id,
      title,
      description,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      isArchived: false
    };
    await db.boards.add(newBoard);

    // Add default columns for new board
    const cols: Column[] = [
      { id: 'col-todo-' + id, boardId: id, title: 'Inspirasi', order: 0, accentColor: '#c86d51' },
      { id: 'col-craft-' + id, boardId: id, title: 'Sedang Dikerjakan', order: 1, accentColor: '#d4973b' },
      { id: 'col-done-' + id, boardId: id, title: 'Selesai', order: 2, accentColor: '#556b56' }
    ];
    await db.columns.bulkAdd(cols);

    await refreshData();
    await setActiveBoardId(id);
    return id;
  };

  const updateBoard = async (id: string, updates: Partial<Board>) => {
    await db.boards.update(id, { ...updates, updatedAt: Date.now() });
    await refreshData();
  };

  const deleteBoard = async (id: string) => {
    await db.boards.delete(id);
    const cols = await db.columns.where('boardId').equals(id).toArray();
    const colIds = cols.map((c) => c.id);
    await db.columns.where('boardId').equals(id).delete();

    const crds = await db.cards.where('boardId').equals(id).toArray();
    const cardIds = crds.map((c) => c.id);
    await db.cards.where('boardId').equals(id).delete();
    await db.checklists.where('cardId').anyOf(cardIds).delete();

    await refreshData();
  };

  const createColumn = async (title: string, accentColor: string = '#c86d51') => {
    if (!activeBoardId) return '';
    const id = 'col-' + Date.now();
    const nextOrder = columns.length;
    const col: Column = { id, boardId: activeBoardId, title, order: nextOrder, accentColor };
    await db.columns.add(col);
    setColumns((prev) => [...prev, col]);
    return id;
  };

  const updateColumn = async (id: string, updates: Partial<Column>) => {
    await db.columns.update(id, updates);
    setColumns((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
  };

  const deleteColumn = async (id: string) => {
    await db.columns.delete(id);
    const crds = await db.cards.where('columnId').equals(id).toArray();
    const cardIds = crds.map((c) => c.id);
    await db.cards.where('columnId').equals(id).delete();
    await db.checklists.where('cardId').anyOf(cardIds).delete();

    setColumns((prev) => prev.filter((c) => c.id !== id));
    setCards((prev) => prev.filter((c) => c.columnId !== id));
    setChecklists((prev) => prev.filter((ch) => !cardIds.includes(ch.cardId)));
  };

  const reorderColumns = async (reordered: Column[]) => {
    setColumns(reordered);
    await db.transaction('rw', db.columns, async () => {
      for (let i = 0; i < reordered.length; i++) {
        await db.columns.update(reordered[i].id, { order: i });
      }
    });
  };

  const createCard = async (columnId: string, title: string) => {
    if (!activeBoardId) return '';
    const id = 'card-' + Date.now();
    const colCards = cards.filter((c) => c.columnId === columnId);
    const newCard: Card = {
      id,
      boardId: activeBoardId,
      columnId,
      title,
      description: '',
      order: colCards.length,
      priority: 'none',
      tags: [],
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    await db.cards.add(newCard);
    setCards((prev) => [...prev, newCard]);
    return id;
  };

  const updateCard = async (id: string, updates: Partial<Card>) => {
    const patch = { ...updates, updatedAt: Date.now() };
    await db.cards.update(id, patch);
    setCards((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  };

  const deleteCard = async (id: string) => {
    await db.cards.delete(id);
    await db.checklists.where('cardId').equals(id).delete();
    setCards((prev) => prev.filter((c) => c.id !== id));
    setChecklists((prev) => prev.filter((ch) => ch.cardId !== id));
  };

  const moveCard = async (cardId: string, targetColumnId: string, newOrder: number) => {
    const card = cards.find((c) => c.id === cardId);
    if (!card) return;

    const sourceColumnId = card.columnId;
    const sameColumn = sourceColumnId === targetColumnId;

    let updatedCards = [...cards];
    if (sameColumn) {
      const colCards = updatedCards
        .filter((c) => c.columnId === sourceColumnId)
        .sort((a, b) => a.order - b.order);
      const oldIndex = colCards.findIndex((c) => c.id === cardId);
      if (oldIndex === -1) return;

      const [removed] = colCards.splice(oldIndex, 1);
      colCards.splice(newOrder, 0, removed);

      const idToOrder = new Map(colCards.map((c, i) => [c.id, i]));
      updatedCards = updatedCards.map((c) =>
        idToOrder.has(c.id) ? { ...c, order: idToOrder.get(c.id)! } : c
      );
    } else {
      const sourceCards = updatedCards
        .filter((c) => c.columnId === sourceColumnId && c.id !== cardId)
        .sort((a, b) => a.order - b.order);
      const destCards = updatedCards
        .filter((c) => c.columnId === targetColumnId)
        .sort((a, b) => a.order - b.order);

      const movedCard = { ...card, columnId: targetColumnId };
      destCards.splice(newOrder, 0, movedCard);

      const sourceMap = new Map(sourceCards.map((c, i) => [c.id, i]));
      const destMap = new Map(destCards.map((c, i) => [c.id, i]));

      updatedCards = updatedCards.map((c) => {
        if (c.id === cardId) return { ...movedCard, order: newOrder };
        if (sourceMap.has(c.id)) return { ...c, order: sourceMap.get(c.id)! };
        if (destMap.has(c.id)) return { ...c, order: destMap.get(c.id)! };
        return c;
      });
    }

    setCards(updatedCards);

    // Persist to Dexie
    await db.transaction('rw', db.cards, async () => {
      for (const c of updatedCards) {
        if (c.columnId === targetColumnId || c.columnId === sourceColumnId) {
          await db.cards.update(c.id, { columnId: c.columnId, order: c.order, updatedAt: Date.now() });
        }
      }
    });
  };

  const createChecklist = async (cardId: string, text: string) => {
    const id = 'chk-' + Date.now();
    const cardChks = checklists.filter((ch) => ch.cardId === cardId);
    const item: ChecklistItem = {
      id,
      cardId,
      text,
      isCompleted: false,
      order: cardChks.length
    };
    await db.checklists.add(item);
    setChecklists((prev) => [...prev, item]);
    return id;
  };

  const toggleChecklist = async (id: string) => {
    const item = checklists.find((ch) => ch.id === id);
    if (!item) return;
    const nextVal = !item.isCompleted;
    await db.checklists.update(id, { isCompleted: nextVal });
    setChecklists((prev) => prev.map((ch) => (ch.id === id ? { ...ch, isCompleted: nextVal } : ch)));
  };

  const deleteChecklist = async (id: string) => {
    await db.checklists.delete(id);
    setChecklists((prev) => prev.filter((ch) => ch.id !== id));
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    const updated = { ...profile, ...updates };
    setProfile(updated);
    const existing = await db.settings.get('default');
    if (existing) {
      await db.settings.update('default', { profile: updated });
    }
  };

  const updateAssistantConfig = async (updates: Partial<AssistantConfig>) => {
    setAssistantConfig((prev) => ({ ...prev, ...updates }));
    const existing = await db.settings.get('default');
    if (existing) {
      const mergedAssistant = { ...(existing.assistant || DEFAULT_ASSISTANT), ...updates };
      await db.settings.update('default', { assistant: mergedAssistant });
    }
  };

  const dispatchBriefingNotification = (
    profile: UserProfile,
    cards: Card[],
    columns: Column[]
  ) => {
    const briefing = generateDailyBriefing(profile, cards, columns);
    if (briefing && window.electronAPI?.showNotification) {
      window.electronAPI.showNotification({
        title: `🔥 Hardcore Coach: ${briefing.headline}`,
        body: briefing.message
      });
    }
    return briefing;
  };

  const stateRef = useRef({ profile, cards, columns, assistantConfig, updateAssistantConfig });
  useEffect(() => {
    stateRef.current = { profile, cards, columns, assistantConfig, updateAssistantConfig };
  });

  useEffect(() => {
    if (!isInitialized) return;

    const checkReminder = () => {
      const { profile, cards, columns, assistantConfig, updateAssistantConfig } = stateRef.current;
      const now = new Date();
      const todayDate = getTodayDateString(now);
      const currentTime = getCurrentTimeString(now);

      if (
        shouldTriggerDailyBriefing({
          isEnabled: assistantConfig.isEnabled,
          reminderTime: assistantConfig.reminderTime,
          lastBriefingDate: assistantConfig.lastBriefingDate,
          todayDate,
          currentTime
        })
      ) {
        dispatchBriefingNotification(profile, cards, columns);
        updateAssistantConfig({ lastBriefingDate: todayDate }).catch(console.error);
      }
    };

    checkReminder();
    const intervalId = setInterval(checkReminder, 30000);
    return () => clearInterval(intervalId);
  }, [isInitialized]);

  useEffect(() => {
    if (!window.electronAPI?.onTriggerBriefingFromTray) return;
    const unsubscribe = window.electronAPI.onTriggerBriefingFromTray(() => {
      const { profile, cards, columns } = stateRef.current;
      dispatchBriefingNotification(profile, cards, columns);
    });
    return () => {
      unsubscribe();
    };
  }, []);

  const activeBoard = boards.find((b) => b.id === activeBoardId) || null;

  return (
    <KanbanContext.Provider
      value={{
        boards,
        activeBoardId,
        activeBoard,
        columns,
        cards,
        checklists,
        profile,
        assistantConfig,
        isSidebarCollapsed,
        isProfileModalOpen,
        searchQuery,
        selectedPriority,
        selectedTag,
        setSearchQuery,
        setSelectedPriority,
        setSelectedTag,
        setIsSidebarCollapsed,
        openProfileModal: () => setIsProfileModalOpen(true),
        closeProfileModal: () => setIsProfileModalOpen(false),
        setActiveBoardId,
        createBoard,
        updateBoard,
        deleteBoard,
        createColumn,
        updateColumn,
        deleteColumn,
        reorderColumns,
        createCard,
        updateCard,
        deleteCard,
        moveCard,
        createChecklist,
        toggleChecklist,
        deleteChecklist,
        updateProfile,
        updateAssistantConfig,
        refreshData
      }}
    >
      {children}
    </KanbanContext.Provider>
  );
};

export const useKanban = () => {
  const ctx = useContext(KanbanContext);
  if (!ctx) throw new Error('useKanban must be used within KanbanProvider');
  return ctx;
};
