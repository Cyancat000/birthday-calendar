import React from 'react';
import { CheckCircle2, Circle, Trash2, Edit3, AlertCircle } from 'lucide-react';
import type { Schedule } from '../types';

interface ScheduleCardProps {
  schedule: Schedule;
  onToggleComplete: (schedule: Schedule) => void;
  onEdit?: (schedule: Schedule) => void;
  onDelete?: (id: number) => void;
}

export const ScheduleCard: React.FC<ScheduleCardProps> = ({
  schedule,
  onToggleComplete,
  onEdit,
  onDelete,
}) => {
  const isDone = Boolean(schedule.is_completed);

  return (
    <div
      className={`group flex items-start justify-between gap-3 p-3 rounded-2xl border transition-all duration-200 min-w-0 ${
        isDone
          ? 'bg-zinc-50/60 border-zinc-200 text-zinc-400'
          : 'bg-white border-zinc-200 shadow-sm text-zinc-900 hover:border-zinc-300'
      }`}
    >
      {/* 勾选框 */}
      <button
        onClick={() => onToggleComplete(schedule)}
        className="mt-0.5 text-zinc-400 hover:text-zinc-900 transition flex-shrink-0"
      >
        {isDone ? (
          <CheckCircle2 className="w-5 h-5 text-zinc-900" />
        ) : (
          <Circle className="w-5 h-5 hover:text-zinc-600" />
        )}
      </button>

      {/* 主体文本 */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-2">
          <span
            className={`text-sm font-medium break-words ${
              isDone ? 'line-through text-zinc-400' : 'text-zinc-900'
            }`}
          >
            {schedule.title}
          </span>
          {schedule.priority === 'high' && !isDone && (
            <span className="flex-shrink-0 inline-flex items-center gap-0.5 text-[10px] px-1.5 py-0.2 rounded bg-red-50 text-red-600 font-medium border border-red-200/50">
              <AlertCircle className="w-2.5 h-2.5" />
              重要
            </span>
          )}
        </div>
        {schedule.description && (
          <p
            className={`text-xs mt-1 break-words line-clamp-2 ${
              isDone ? 'text-zinc-400' : 'text-zinc-500'
            }`}
          >
            {schedule.description}
          </p>
        )}
      </div>

      {/* 操作按钮 */}
      <div className="flex items-center space-x-1 flex-shrink-0 sm:opacity-0 group-hover:opacity-100 transition-opacity">
        {onEdit && (
          <button
            onClick={() => onEdit(schedule)}
            className="p-1 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition"
            title="编辑"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
        )}
        {onDelete && (
          <button
            onClick={() => {
              if (confirm('确认删除该日程吗？')) onDelete(schedule.id);
            }}
            className="p-1 text-zinc-400 hover:text-red-600 hover:bg-zinc-100 rounded-lg transition"
            title="删除"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
