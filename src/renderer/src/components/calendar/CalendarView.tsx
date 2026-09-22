import React, { useState, useMemo, useEffect } from 'react';
import { Card } from '../../../shared/types';
import { useKanban } from '../../context/KanbanContext';
import { db } from '../../db/db';
import {
  getMonthGridDays,
  formatYearMonthIndo,
  WEEKDAYS_SHORT_ID
} from '../../utils/calendar';
import { getCardCoverStyle } from '../../utils/colors';
import {
  ChevronLeft,
  ChevronRight,
  CalendarOff,
  Plus,
  X
} from 'lucide-react';

export interface CalendarViewProps {
  initialYear?: number;
  initialMonth?: number;
  onCardClick: (card: Card) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  initialYear,
  initialMonth,
  onCardClick
}) => {
  const { activeBoardId, cards, columns, updateCardDueDate, createCard } = useKanban();

  const [currentYear, setCurrentYear] = useState<number>(
    initialYear ?? new Date().getFullYear()
  );
  const [currentMonth, setCurrentMonth] = useState<number>(
    initialMonth ?? new Date().getMonth()
  );
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [scope, setScope] = useState<'current' | 'all'>('current');
  const [draggedCardId, setDraggedCardId] = useState<string | null>(null);
  const [dropTargetDate, setDropTargetDate] = useState<string | null>(null);
  const [quickAddDate, setQuickAddDate] = useState<string | null>(null);
  const [quickAddTitle, setQuickAddTitle] = useState('');
  const [isDrawerDropTarget, setIsDrawerDropTarget] = useState(false);
  const [allDbCards, setAllDbCards] = useState<Card[] | null>(null);

  useEffect(() => {
    let isMounted = true;
    if (scope === 'all') {
      if (typeof window !== 'undefined' && 'indexedDB' in window && window.indexedDB) {
        try {
          db.cards
            .toArray()
            .then((dbCards) => {
              if (!isMounted) return;
              if (dbCards && dbCards.length > 0) {
                setAllDbCards(dbCards);
              } else {
                setAllDbCards(null);
              }
            })
            .catch(() => {
              if (isMounted) setAllDbCards(null);
            });
        } catch {
          if (isMounted) setAllDbCards(null);
        }
      }
    } else {
      setAllDbCards(null);
    }
    return () => {
      isMounted = false;
    };
  }, [scope, cards]);

  const displayedCards = useMemo(() => {
    if (scope === 'all') {
      return allDbCards && allDbCards.length > 0 ? allDbCards : cards;
    }
    return activeBoardId ? cards.filter((c) => c.boardId === activeBoardId) : cards;
  }, [scope, allDbCards, cards, activeBoardId]);

  const gridDays = useMemo(
    () => getMonthGridDays(currentYear, currentMonth),
    [currentYear, currentMonth]
  );

  const unscheduledCards = useMemo(() => {
    return displayedCards.filter((card) => !card.dueDate || card.dueDate.trim() === '');
  }, [displayedCards]);

  const cardsByDate = useMemo(() => {
    const map = new Map<string, Card[]>();
    for (const card of displayedCards) {
      if (card.dueDate && card.dueDate.trim() !== '') {
        const list = map.get(card.dueDate) || [];
        list.push(card);
        map.set(card.dueDate, list);
      }
    }
    return map;
  }, [displayedCards]);

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentYear((y) => y - 1);
      setCurrentMonth(11);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentYear((y) => y + 1);
      setCurrentMonth(0);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const handleToday = () => {
    const now = new Date();
    setCurrentYear(now.getFullYear());
    setCurrentMonth(now.getMonth());
  };

  const handleQuickAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickAddTitle.trim() || !quickAddDate) return;
    const targetColumnId = columns.length > 0 ? columns[0].id : '';
    if (!targetColumnId) return;

    const trimmedTitle = quickAddTitle.trim();
    const dateToSet = quickAddDate;

    setQuickAddDate(null);
    setQuickAddTitle('');

    const newId = await (createCard as any)(targetColumnId, trimmedTitle, { dueDate: dateToSet });
    if (newId) {
      await updateCardDueDate(newId, dateToSet);
    }
  };

  const getPriorityDot = (priority: Card['priority']) => {
    switch (priority) {
      case 'high':
        return 'bg-terracotta';
      case 'medium':
        return 'bg-amber-500';
      case 'low':
        return 'bg-sage';
      default:
        return null;
    }
  };

  const handleCardDragStart = (e: React.DragEvent, cardId: string) => {
    e.stopPropagation();
    e.dataTransfer.setData('text/plain', cardId);
    e.dataTransfer.effectAllowed = 'move';
    setDraggedCardId(cardId);
  };

  const handleCardDragEnd = () => {
    setDraggedCardId(null);
    setDropTargetDate(null);
  };

  const handleCellDragOver = (e: React.DragEvent, dateString: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dropTargetDate !== dateString) {
      setDropTargetDate(dateString);
    }
  };

  const handleCellDragLeave = (e: React.DragEvent, dateString: string) => {
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    if (dropTargetDate === dateString) {
      setDropTargetDate(null);
    }
  };

  const handleCellDrop = async (e: React.DragEvent, dateString: string) => {
    e.preventDefault();
    const cardId = e.dataTransfer.getData('text/plain') || draggedCardId;
    setDraggedCardId(null);
    setDropTargetDate(null);
    if (cardId) {
      await updateCardDueDate(cardId, dateString);
    }
  };

  const handleDrawerDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (!isDrawerDropTarget) {
      setIsDrawerDropTarget(true);
    }
  };

  const handleDrawerDragLeave = (e: React.DragEvent) => {
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setIsDrawerDropTarget(false);
  };

  const handleDrawerDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const cardId = e.dataTransfer.getData('text/plain') || draggedCardId;
    setDraggedCardId(null);
    setIsDrawerDropTarget(false);
    if (cardId) {
      await updateCardDueDate(cardId, undefined);
    }
  };

  return (
    <div className="flex flex-col flex-1 h-full overflow-hidden bg-boho-linen select-none">
      {/* Calendar Toolbar */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-boho-canvas bg-white/60 backdrop-blur-xs gap-4 flex-wrap">
        {/* Month Navigation */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handlePrevMonth}
              title="Bulan Sebelumnya"
              aria-label="Bulan Sebelumnya"
              className="p-1.5 rounded-lg border border-boho-sand/60 bg-white/70 text-boho-walnut hover:text-boho-espresso hover:bg-boho-sand/40 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleNextMonth}
              title="Bulan Berikutnya"
              aria-label="Bulan Berikutnya"
              className="p-1.5 rounded-lg border border-boho-sand/60 bg-white/70 text-boho-walnut hover:text-boho-espresso hover:bg-boho-sand/40 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            type="button"
            onClick={handleToday}
            className="px-2.5 py-1 text-xs font-medium rounded-lg border border-boho-sand/60 bg-white/70 text-boho-walnut hover:text-boho-espresso hover:bg-boho-sand/40 transition-colors"
          >
            Hari Ini
          </button>

          <h2 className="font-serif text-lg font-bold text-boho-espresso tracking-wide ml-1">
            {formatYearMonthIndo(currentYear, currentMonth)}
          </h2>
        </div>

        {/* Right Toolbar Controls */}
        <div className="flex items-center gap-3">
          {/* Scope Filter Toggle */}
          <div className="flex items-center bg-boho-canvas/60 p-0.5 rounded-lg border border-boho-canvas/80 text-xs">
            <button
              type="button"
              onClick={() => setScope('current')}
              className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                scope === 'current'
                  ? 'bg-white text-boho-espresso shadow-xs'
                  : 'text-boho-walnut hover:text-boho-espresso'
              }`}
            >
              Papan Ini
            </button>
            <button
              type="button"
              onClick={() => setScope('all')}
              className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                scope === 'all'
                  ? 'bg-white text-boho-espresso shadow-xs'
                  : 'text-boho-walnut hover:text-boho-espresso'
              }`}
            >
              Semua Papan
            </button>
          </div>

          {/* Unscheduled Tasks Drawer Toggle */}
          <button
            type="button"
            onClick={() => setIsDrawerOpen((prev) => !prev)}
            onDragOver={handleDrawerDragOver}
            onDrop={handleDrawerDrop}
            aria-label="Belum Terjadwal"
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
              isDrawerOpen
                ? 'bg-terracotta text-white border-terracotta shadow-xs'
                : 'bg-white/80 text-boho-walnut border-boho-sand/60 hover:bg-boho-sand/30 hover:text-boho-espresso'
            }`}
          >
            <CalendarOff className="w-3.5 h-3.5" />
            <span>Belum Terjadwal</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold ${
                isDrawerOpen
                  ? 'bg-white/20 text-white'
                  : 'bg-boho-sand text-boho-espresso'
              }`}
            >
              {unscheduledCards.length}
            </span>
          </button>
        </div>
      </div>

      {/* Main Calendar View Body */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Calendar Grid Container */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          {/* Weekday Row Header */}
          <div className="grid grid-cols-7 border-b border-boho-canvas/60 bg-boho-canvas/30 text-center text-xs font-semibold text-boho-clay py-2">
            {WEEKDAYS_SHORT_ID.map((dayName) => (
              <div key={dayName}>{dayName}</div>
            ))}
          </div>

          {/* Days Grid Cells */}
          <div className="grid grid-cols-7 auto-rows-fr flex-1 border-t border-l border-boho-canvas/60 bg-boho-sand/10">
            {gridDays.map((day) => {
              const dayCards = cardsByDate.get(day.dateString) || [];
              const isDropTarget = dropTargetDate === day.dateString;

              return (
                <div
                  key={day.dateString}
                  data-testid={`calendar-day-${day.dateString}`}
                  onDragOver={(e) => handleCellDragOver(e, day.dateString)}
                  onDragLeave={(e) => handleCellDragLeave(e, day.dateString)}
                  onDrop={(e) => handleCellDrop(e, day.dateString)}
                  className={`group relative min-h-[100px] border border-boho-canvas/60 p-1.5 flex flex-col transition-colors ${
                    !day.isCurrentMonth
                      ? 'bg-boho-sand/20 text-boho-clay/50 opacity-60'
                      : 'bg-white/70 text-boho-espresso'
                  } ${day.isToday ? 'ring-2 ring-inset ring-terracotta/60 font-bold' : ''} ${
                    isDropTarget ? 'bg-terracotta/10 border-terracotta' : ''
                  }`}
                >
                  {/* Cell Header */}
                  <div className="flex items-center justify-between mb-1 select-none">
                    <span
                      className={`text-xs font-semibold ${
                        day.isToday ? 'text-terracotta font-bold' : ''
                      }`}
                    >
                      {day.dayNumber}
                    </span>
                    <button
                      type="button"
                      title="Tambah Tugas"
                      aria-label="Tambah Tugas"
                      onClick={() => {
                        setQuickAddDate(day.dateString);
                        setQuickAddTitle('');
                      }}
                      className="opacity-0 group-hover:opacity-100 hover:opacity-100 p-0.5 rounded text-boho-clay hover:text-boho-espresso hover:bg-boho-sand/40 transition-opacity"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Quick Add Inline Form */}
                  {quickAddDate === day.dateString && (
                    <form
                      onSubmit={handleQuickAddSubmit}
                      className="mb-1.5 flex flex-col gap-1 p-1.5 rounded-lg bg-white border border-terracotta/40 shadow-xs z-10"
                    >
                      <input
                        type="text"
                        autoFocus
                        placeholder="Judul kartu..."
                        value={quickAddTitle}
                        onChange={(e) => setQuickAddTitle(e.target.value)}
                        className="w-full text-xs px-2 py-1 border border-boho-sand/60 rounded focus:outline-none focus:border-terracotta text-boho-espresso"
                      />
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            setQuickAddDate(null);
                            setQuickAddTitle('');
                          }}
                          className="px-2 py-0.5 text-[11px] text-boho-clay hover:text-boho-espresso"
                        >
                          Batal
                        </button>
                        <button
                          type="submit"
                          disabled={!quickAddTitle.trim()}
                          className="px-2.5 py-0.5 text-[11px] bg-terracotta text-white rounded font-medium disabled:opacity-50 hover:bg-terracotta-hover transition-colors"
                        >
                          Simpan
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Cards List in Day Cell */}
                  <div className="flex flex-col gap-1 flex-1 overflow-y-auto">
                    {dayCards.map((card) => {
                      const coverStyle = getCardCoverStyle(card.coverColor);
                      return (
                        <div
                          key={card.id}
                          draggable={true}
                          onDragStart={(e) => handleCardDragStart(e, card.id)}
                          onDragEnd={handleCardDragEnd}
                          onClick={(e) => {
                            e.stopPropagation();
                            onCardClick(card);
                          }}
                          className={`group/card flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium cursor-grab active:cursor-grabbing border shadow-2xs transition-all hover:shadow-xs hover:border-terracotta/40 ${
                            draggedCardId === card.id ? 'opacity-40' : 'opacity-100'
                          }`}
                          style={{
                            backgroundColor:
                              card.coverColor && card.coverColor !== 'none'
                                ? coverStyle.bgTint
                                : '#ffffff',
                            borderColor:
                              card.coverColor && card.coverColor !== 'none'
                                ? coverStyle.border
                                : '#e0d2bf',
                            borderLeftWidth:
                              card.coverColor && card.coverColor !== 'none' ? '3px' : '1px',
                            borderLeftColor:
                              card.coverColor && card.coverColor !== 'none'
                                ? coverStyle.accent
                                : undefined
                          }}
                        >
                          {getPriorityDot(card.priority) && (
                            <span
                              className={`w-1.5 h-1.5 rounded-full shrink-0 ${getPriorityDot(
                                card.priority
                              )}`}
                            />
                          )}
                          <span className="truncate text-boho-espresso text-[11px] leading-tight flex-1">
                            {card.title}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Unscheduled Tasks Drawer */}
        {isDrawerOpen && (
          <div
            data-testid="unscheduled-drawer"
            onDragOver={handleDrawerDragOver}
            onDragLeave={handleDrawerDragLeave}
            onDrop={handleDrawerDrop}
            className={`w-72 lg:w-80 border-l border-boho-canvas/80 bg-boho-sand/20 backdrop-blur-xs flex flex-col transition-all shrink-0 z-10 ${
              isDrawerDropTarget ? 'bg-terracotta/10 ring-2 ring-inset ring-terracotta/60' : ''
            }`}
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between p-3 border-b border-boho-canvas/60 bg-white/40">
              <div className="flex items-center gap-2">
                <CalendarOff className="w-4 h-4 text-boho-clay" />
                <h3 className="text-sm font-bold text-boho-espresso">Belum Terjadwal</h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-boho-sand text-boho-espresso font-semibold">
                  {unscheduledCards.length}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsDrawerOpen(false)}
                aria-label="Tutup Panel"
                className="p-1 rounded-lg text-boho-clay hover:text-boho-espresso hover:bg-boho-sand/40 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Drop Zone Helper Guidance */}
            <div className="px-3 pt-2.5 pb-1 text-[11px] text-boho-clay">
              Tarik kartu ke panel ini untuk menghapus tanggal jadwal.
            </div>

            {/* Unscheduled Cards List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {unscheduledCards.length === 0 ? (
                <div className="text-center py-8 text-xs text-boho-clay italic">
                  Semua tugas sudah memiliki jadwal.
                </div>
              ) : (
                unscheduledCards.map((card) => {
                  const coverStyle = getCardCoverStyle(card.coverColor);
                  return (
                    <div
                      key={card.id}
                      draggable={true}
                      onDragStart={(e) => handleCardDragStart(e, card.id)}
                      onDragEnd={handleCardDragEnd}
                      onClick={() => onCardClick(card)}
                      className={`group p-2.5 bg-white rounded-lg border border-boho-canvas cursor-grab active:cursor-grabbing hover:border-terracotta/60 hover:shadow-xs transition-all ${
                        draggedCardId === card.id ? 'opacity-40' : 'opacity-100'
                      }`}
                      style={{
                        backgroundColor:
                          card.coverColor && card.coverColor !== 'none'
                            ? coverStyle.bgTint
                            : '#ffffff',
                        borderColor:
                          card.coverColor && card.coverColor !== 'none'
                            ? coverStyle.border
                            : undefined,
                        borderLeftWidth:
                          card.coverColor && card.coverColor !== 'none' ? '3px' : '1px',
                        borderLeftColor:
                          card.coverColor && card.coverColor !== 'none'
                            ? coverStyle.accent
                            : undefined
                      }}
                    >
                      <div className="flex items-center gap-1.5 mb-1">
                        {getPriorityDot(card.priority) && (
                          <span
                            className={`w-1.5 h-1.5 rounded-full shrink-0 ${getPriorityDot(
                              card.priority
                            )}`}
                          />
                        )}
                        <span className="text-xs font-medium text-boho-espresso truncate flex-1">
                          {card.title}
                        </span>
                      </div>
                      {card.tags && card.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {card.tags.slice(0, 2).map((tag, idx) => (
                            <span
                              key={idx}
                              className="text-[10px] px-1.5 py-0.2 rounded bg-boho-sand/40 text-boho-clay font-medium"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
