import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { padZero } from '../utils/date';

interface CustomDatePickerProps {
  value: string; // YYYY-MM-DD
  onChange: (dateStr: string) => void;
}

export const CustomDatePicker: React.FC<CustomDatePickerProps> = ({ value, onChange }) => {
  const [initialYear, initialMonth] = value
    ? value.split('-').map(Number)
    : [new Date().getFullYear(), new Date().getMonth() + 1];

  const [viewYear, setViewYear] = useState<number>(initialYear);
  const [viewMonth, setViewMonth] = useState<number>(initialMonth);

  const daysInMonth = new Date(viewYear, viewMonth, 0).getDate();
  const firstDayOfWeek = new Date(viewYear, viewMonth - 1, 1).getDay();

  const handlePrev = () => {
    if (viewMonth === 1) {
      setViewYear(viewYear - 1);
      setViewMonth(12);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const handleNext = () => {
    if (viewMonth === 12) {
      setViewYear(viewYear + 1);
      setViewMonth(1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  const weekHeaders = ['日', '一', '二', '三', '四', '五', '六'];

  return (
    <div className="bg-zinc-50 border border-zinc-200/80 rounded-xl p-2.5 select-none space-y-2">
      {/* 头部导航 */}
      <div className="flex items-center justify-between px-1">
        <span className="text-xs font-bold text-zinc-800">
          {viewYear}年 {viewMonth}月
        </span>
        <div className="flex items-center space-x-1">
          <button
            type="button"
            onClick={handlePrev}
            className="p-1 rounded-lg hover:bg-zinc-200 text-zinc-600 transition"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={handleNext}
            className="p-1 rounded-lg hover:bg-zinc-200 text-zinc-600 transition"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 星期行 */}
      <div className="grid grid-cols-7 text-center text-[10px] font-semibold text-zinc-400">
        {weekHeaders.map((w, i) => (
          <div key={i}>{w}</div>
        ))}
      </div>

      {/* 日期格子 */}
      <div className="grid grid-cols-7 gap-1 text-center">
        {/* 前置空格 */}
        {Array.from({ length: firstDayOfWeek }).map((_, idx) => (
          <div key={`empty-${idx}`} className="h-7" />
        ))}

        {/* 当月日期 */}
        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((d) => {
          const dateString = `${viewYear}-${padZero(viewMonth)}-${padZero(d)}`;
          const isSelected = value === dateString;

          return (
            <button
              key={d}
              type="button"
              onClick={() => onChange(dateString)}
              className={`h-7 text-xs rounded-lg font-medium transition flex items-center justify-center ${
                isSelected
                  ? 'bg-zinc-900 text-white shadow-sm font-bold'
                  : 'text-zinc-700 hover:bg-zinc-200/70'
              }`}
            >
              {d}
            </button>
          );
        })}
      </div>
    </div>
  );
};
