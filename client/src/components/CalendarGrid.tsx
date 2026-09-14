import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { DayCalendarData } from '../types';
import { getLunarDisplay, padZero } from '../utils/date';

interface CalendarGridProps {
  year: number;
  month: number; // 1-12
  selectedDate: string; // YYYY-MM-DD
  monthData: { [date: string]: DayCalendarData };
  onSelectDate: (date: string) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onToday: () => void;
}

export const CalendarGrid: React.FC<CalendarGridProps> = ({
  year,
  month,
  selectedDate,
  monthData,
  onSelectDate,
  onPrevMonth,
  onNextMonth,
  onToday,
}) => {
  const weekHeaders = ['日', '一', '二', '三', '四', '五', '六'];

  // 计算当月第一天是周几
  const firstDayOfWeek = new Date(year, month - 1, 1).getDay();
  // 计算当月有多少天
  const daysInMonth = new Date(year, month, 0).getDate();
  // 计算上个月总天数以填充第一周空白
  const daysInPrevMonth = new Date(year, month - 1, 0).getDate();

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${padZero(today.getMonth() + 1)}-${padZero(today.getDate())}`;

  // 构建展示的日历格子数组
  const cells = [];

  // 上月占位格
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const prevDay = daysInPrevMonth - i;
    const prevMonthVal = month === 1 ? 12 : month - 1;
    const prevYearVal = month === 1 ? year - 1 : year;
    const dateStr = `${prevYearVal}-${padZero(prevMonthVal)}-${padZero(prevDay)}`;
    cells.push({
      dateStr,
      day: prevDay,
      isCurrentMonth: false,
      isPrevMonth: true,
    });
  }

  // 当月格子
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${padZero(month)}-${padZero(d)}`;
    cells.push({
      dateStr,
      day: d,
      isCurrentMonth: true,
    });
  }

  // 下月补齐至 35 或 42 格
  const totalSlots = cells.length <= 35 ? 35 : 42;
  const remaining = totalSlots - cells.length;
  for (let n = 1; n <= remaining; n++) {
    const nextMonthVal = month === 12 ? 1 : month + 1;
    const nextYearVal = month === 12 ? year + 1 : year;
    const dateStr = `${nextYearVal}-${padZero(nextMonthVal)}-${padZero(n)}`;
    cells.push({
      dateStr,
      day: n,
      isCurrentMonth: false,
      isNextMonth: true,
    });
  }

  return (
    <div className="bg-white rounded-2xl border border-zinc-200/90 shadow-sm overflow-hidden min-w-0">
      {/* 日历头部：切换年/月 & 今日按钮 */}
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-zinc-100">
        <div className="flex items-center space-x-2">
          <span className="text-base font-bold text-zinc-900 tracking-tight">
            {year} 年 {month} 月
          </span>
          <button
            onClick={onToday}
            className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-700 transition"
          >
            今天
          </button>
        </div>

        <div className="flex items-center space-x-1">
          <button
            onClick={onPrevMonth}
            className="p-1.5 rounded-lg hover:bg-zinc-100 text-zinc-600 transition"
            title="上个月"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={onNextMonth}
            className="p-1.5 rounded-lg hover:bg-zinc-100 text-zinc-600 transition"
            title="下个月"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 星期表头 */}
      <div className="grid grid-cols-7 border-b border-zinc-100 bg-zinc-50/50 text-center py-2 text-xs font-semibold text-zinc-400">
        {weekHeaders.map((w, idx) => (
          <div key={idx} className={idx === 0 || idx === 6 ? 'text-zinc-400' : 'text-zinc-600'}>
            {w}
          </div>
        ))}
      </div>

      {/* 日期网格 - 重点：严格固定单元格高度，绝对防止文本换行撑破外框 */}
      <div className="grid grid-cols-7 divide-x divide-y divide-zinc-100/80">
        {cells.map((cell, idx) => {
          const isSelected = cell.dateStr === selectedDate;
          const isToday = cell.dateStr === todayStr;
          const dayMeta = monthData[cell.dateStr];
          const hasFriendBirthday = dayMeta && dayMeta.friends && dayMeta.friends.length > 0;
          const hasSchedules = dayMeta && dayMeta.schedules && dayMeta.schedules.length > 0;

          // 计算农历显示文案
          let lunarText = '';
          let isSpecial = false;
          if (dayMeta) {
            if (dayMeta.festivals && dayMeta.festivals.length > 0) {
              lunarText = dayMeta.festivals[0];
              isSpecial = true;
            } else if (dayMeta.jieQi) {
              lunarText = dayMeta.jieQi;
              isSpecial = true;
            } else {
              lunarText = dayMeta.lunarDayName === '初一' ? dayMeta.lunarMonthName : dayMeta.lunarDayName;
            }
          } else {
            const [y, m, d] = cell.dateStr.split('-').map(Number);
            const res = getLunarDisplay(y, m, d);
            lunarText = res.text;
            isSpecial = res.isSpecial;
          }

          return (
            <button
              key={idx}
              type="button"
              onClick={() => onSelectDate(cell.dateStr)}
              className={`relative flex flex-col items-center justify-between p-1 transition-all select-none min-w-0
                h-14 sm:h-16
                ${!cell.isCurrentMonth ? 'opacity-30 bg-zinc-50/40' : 'hover:bg-zinc-50/80'}
                ${isSelected ? 'ring-2 ring-zinc-900 ring-inset z-10 bg-zinc-50' : ''}
              `}
            >
              {/* 今日标识小圆点或底色 */}
              <div className="flex items-center justify-center w-full min-w-0">
                <span
                  className={`text-xs sm:text-sm font-semibold inline-flex items-center justify-center w-6 h-6 rounded-full transition ${
                    isToday
                      ? 'bg-zinc-900 text-white shadow-sm'
                      : isSelected
                      ? 'text-zinc-900 font-bold'
                      : cell.isCurrentMonth
                      ? 'text-zinc-800'
                      : 'text-zinc-400'
                  }`}
                >
                  {cell.day}
                </span>
              </div>

              {/* 农历 / 节日 / 节气精简显示：强制单行截断，坚决杜绝折行撑裂高度 */}
              <div className="w-full text-center px-0.5 min-w-0">
                <span
                  className={`block text-[10px] leading-tight truncate w-full ${
                    isSpecial
                      ? 'text-zinc-900 font-semibold'
                      : 'text-zinc-400 font-normal'
                  }`}
                  title={lunarText}
                >
                  {lunarText}
                </span>
              </div>

              {/* 好友生日 & 日程点标指示器（防撑高核心：用微型点标表示） */}
              <div className="flex items-center justify-center space-x-1 h-2 min-w-0">
                {hasFriendBirthday && (
                  <span
                    className="w-1.5 h-1.5 rounded-full bg-zinc-900 flex-shrink-0 animate-bounce"
                    title={`好友生日 (${dayMeta.friends.map(f => f.name).join(', ')})`}
                  />
                )}
                {hasSchedules && (
                  <span
                    className="w-1.5 h-1.5 rounded-full border border-zinc-400 bg-zinc-200 flex-shrink-0"
                    title={`日程待办 (${dayMeta.schedules.length}项)`}
                  />
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
