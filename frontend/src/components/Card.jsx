import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Clock, MessageSquare, Paperclip, Edit2, CheckSquare } from 'lucide-react';
import { format } from 'date-fns';

const Card = ({ card, isOverlay, onCardClick }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card._id, data: { ...card } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'Medium': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'Low': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  const calculateChecklistProgress = () => {
    if (!card.checklists || card.checklists.length === 0) return null;
    let total = 0;
    let completed = 0;
    card.checklists.forEach(list => {
      total += list.items.length;
      completed += list.items.filter(i => i.isCompleted).length;
    });
    if (total === 0) return null;
    return { total, completed, allDone: total === completed };
  };

  const checklistProgress = calculateChecklistProgress();

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => !isOverlay && onCardClick && onCardClick()}
      className={`bg-dark-800 p-3 rounded-lg border border-slate-700/50 hover:border-primary-500/50 cursor-pointer group shadow-sm transition-colors relative ${isOverlay ? 'ring-2 ring-primary-500 shadow-xl cursor-grabbing' : ''}`}
    >
      <div className="flex gap-2 mb-2 flex-wrap items-start pr-6">
        <div className="flex flex-wrap gap-2 flex-1">
          {card.labels && card.labels.map((label, idx) => (
            <span key={idx} className={`text-[10px] font-semibold px-2 py-0.5 rounded ${label.color} text-white`}>
              {label.text}
            </span>
          ))}
          {card.priority && (
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${getPriorityColor(card.priority)}`}>
              {card.priority}
            </span>
          )}
        </div>
        {!isOverlay && onCardClick && (
          <Edit2 size={14} className="absolute top-3 right-3 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity" />
        )}
      </div>

      <h4 className="text-sm font-medium text-slate-200 mb-2 leading-tight group-hover:text-white transition">
        {card.title}
      </h4>

      <div className="flex items-center gap-3 text-slate-400 mt-3 flex-wrap">
        {card.dueDate && (
          <div className="flex items-center gap-1 text-[11px] bg-dark-900 px-1.5 py-0.5 rounded border border-white/5">
            <Clock size={12} />
            <span>{format(new Date(card.dueDate), 'MMM d')}</span>
          </div>
        )}

        {card.description && (
          <div className="flex items-center gap-1 text-[11px]" title="This card has a description">
            <MessageSquare size={12} />
          </div>
        )}

        {checklistProgress && (
          <div className={`flex items-center gap-1 text-[11px] ${checklistProgress.allDone ? 'bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/30' : ''}`} title="Checklist items">
            <CheckSquare size={12} />
            <span>{checklistProgress.completed}/{checklistProgress.total}</span>
          </div>
        )}

        {card.comments && card.comments.length > 0 && (
          <div className="flex items-center gap-1 text-[11px]">
            <MessageSquare size={12} />
            <span>{card.comments.length}</span>
          </div>
        )}

        {card.attachments && card.attachments.length > 0 && (
          <div className="flex items-center gap-1 text-[11px]">
            <Paperclip size={12} />
            <span>{card.attachments.length}</span>
          </div>
        )}

        {card.assignees && card.assignees.length > 0 && (
          <div className="flex -space-x-1 ml-auto">
            {card.assignees.map((user, i) => (
              <div key={i} className="w-5 h-5 rounded-full bg-primary-600 border border-dark-800 flex items-center justify-center text-[9px] font-bold text-white">
                U
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Card;
