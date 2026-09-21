import React from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { Card, ChecklistItem } from '../../../shared/types';
import { Calendar, Tag, CheckSquare, AlertCircle } from 'lucide-react';
import { getTodayDateString } from '../../utils/scheduler';

interface CardItemProps {
  card: Card;
  index: number;
  checklists?: ChecklistItem[];
  onClick: () => void;
}

export const CardItem: React.FC<CardItemProps> = ({ card, index, checklists = [], onClick }) => {
  const today = getTodayDateString(new Date());
  const isOverdue = card.dueDate && card.dueDate < today;
  const isDueToday = card.dueDate && card.dueDate === today;

  const cardChecklists = checklists.filter((ch) => ch.cardId === card.id);
  const completedCount = cardChecklists.filter((ch) => ch.isCompleted).length;

  const getPriorityStyle = () => {
    switch (card.priority) {
      case 'high':
        return 'bg-terracotta-light text-terracotta border-terracotta-border';
      case 'medium':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'low':
        return 'bg-sage-light text-sage border-sage-border';
      default:
        return null;
    }
  };

  const priorityStyle = getPriorityStyle();

  return (
    <Draggable draggableId={card.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={onClick}
          className={`group p-3.5 bg-white rounded-xl border border-boho-canvas/80 cursor-grab active:cursor-grabbing select-none transition-all duration-200 ${
            snapshot.isDragging
              ? 'shadow-2xl ring-2 ring-terracotta/40 rotate-[1.5deg] scale-[1.02] bg-boho-linen'
              : 'hover:border-terracotta/60 hover:shadow-md'
          }`}
          style={{
            ...provided.draggableProps.style
          }}
        >
          {/* Priority & Due Date Badges */}
          <div className="flex items-center justify-between gap-1.5 mb-2">
            {priorityStyle && (
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${priorityStyle}`}>
                <AlertCircle className="w-2.5 h-2.5" />
                <span className="capitalize">{card.priority}</span>
              </span>
            )}

            {card.dueDate && (
              <span
                className={`inline-flex items-center gap-1 text-[10px] font-medium ml-auto px-2 py-0.5 rounded-full ${
                  isOverdue
                    ? 'bg-rose-100 text-rose-800 font-semibold'
                    : isDueToday
                    ? 'bg-amber-100 text-amber-900 font-semibold'
                    : 'bg-boho-sand text-boho-walnut'
                }`}
              >
                <Calendar className="w-2.5 h-2.5" />
                <span>{card.dueDate}</span>
              </span>
            )}
          </div>

          {/* Title */}
          <h4 className="text-sm font-medium text-boho-espresso leading-snug line-clamp-2 mb-2 group-hover:text-terracotta-deep transition-colors">
            {card.title}
          </h4>

          {/* Bottom metadata: Tags & Checklist count */}
          <div className="flex items-center justify-between gap-2 pt-1 border-t border-boho-canvas/40 text-[11px] text-boho-clay">
            {/* Tags */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {card.tags.slice(0, 3).map((tag, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md bg-boho-sand text-boho-walnut text-[10px]"
                >
                  <Tag className="w-2 h-2" />
                  <span>{tag}</span>
                </span>
              ))}
              {card.tags.length > 3 && (
                <span className="text-[10px] text-boho-clay">+{card.tags.length - 3}</span>
              )}
            </div>

            {/* Checklist count */}
            {cardChecklists.length > 0 && (
              <div
                className={`inline-flex items-center gap-1 text-[10px] font-medium ${
                  completedCount === cardChecklists.length ? 'text-sage font-semibold' : 'text-boho-clay'
                }`}
              >
                <CheckSquare className="w-3 h-3" />
                <span>
                  {completedCount}/{cardChecklists.length}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </Draggable>
  );
};
