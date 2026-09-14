import React from 'react';
import { LUNAR_MONTH_NAMES, LUNAR_DAY_NAMES } from '../utils/lunarNames';

interface MonthDayGridPickerProps {
  isLunar: boolean;
  selectedMonth: number; // 1 - 12
  selectedDay: number;   // 1 - 31 (农历 1-30)
  onChange: (month: number, day: number) => void;
}

export const MonthDayGridPicker: React.FC<MonthDayGridPickerProps> = ({
  isLunar,
  selectedMonth,
  selectedDay,
  onChange,
}) => {
  // 农历最多30天，公历最多31天
  const daysCount = isLunar ? 30 : 31;

  return (
    <div className="space-y-3 select-none">
      {/* 1. 月份选择：二维紧凑网格 (4列 x 3行) */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] font-medium text-zinc-500">
            {isLunar ? '选择出生农历月份' : '选择出生公历月份'}
          </span>
          <span className="text-[11px] font-bold text-zinc-900">
            {isLunar ? LUNAR_MONTH_NAMES[selectedMonth - 1] : `${selectedMonth}月`}
          </span>
        </div>
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-1 p-1 bg-zinc-100/80 rounded-xl border border-zinc-200/60">
          {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => {
            const isSelected = selectedMonth === m;
            const label = isLunar ? LUNAR_MONTH_NAMES[m - 1] : `${m}月`;
            return (
              <button
                key={m}
                type="button"
                onClick={() => onChange(m, selectedDay > daysCount ? daysCount : selectedDay)}
                className={`py-1.5 text-xs font-medium rounded-lg transition-all text-center ${
                  isSelected
                    ? 'bg-zinc-900 text-white shadow-sm font-semibold'
                    : 'text-zinc-600 hover:text-zinc-900 hover:bg-white/60'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. 日期选择：二维紧凑网格 (6列 x 5行 / 7列) */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] font-medium text-zinc-500">
            {isLunar ? '选择出生农历日期' : '选择出生公历日期'}
          </span>
          <span className="text-[11px] font-bold text-zinc-900">
            {isLunar ? LUNAR_DAY_NAMES[selectedDay - 1] : `${selectedDay}日`}
          </span>
        </div>
        <div className="grid grid-cols-6 sm:grid-cols-8 gap-1 p-1 bg-zinc-100/80 rounded-xl border border-zinc-200/60 max-h-36 overflow-y-auto no-scrollbar">
          {Array.from({ length: daysCount }, (_, i) => i + 1).map((d) => {
            const isSelected = selectedDay === d;
            const label = isLunar ? LUNAR_DAY_NAMES[d - 1] : `${d}日`;
            return (
              <button
                key={d}
                type="button"
                onClick={() => onChange(selectedMonth, d)}
                className={`py-1.5 text-[11px] font-medium rounded-lg transition-all text-center ${
                  isSelected
                    ? 'bg-zinc-900 text-white shadow-sm font-semibold'
                    : 'text-zinc-600 hover:text-zinc-900 hover:bg-white/60'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
