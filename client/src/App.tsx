import React, { useState, useEffect, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  Cake,
  CheckSquare,
  Plus,
  Users,
  Clock,
  Sparkles,
  Download,
  Upload,
  CalendarDays,
} from 'lucide-react';
import { CalendarGrid } from './components/CalendarGrid';
import { FriendCard } from './components/FriendCard';
import { ScheduleCard } from './components/ScheduleCard';
import { FriendModal } from './components/FriendModal';
import { ScheduleModal } from './components/ScheduleModal';
import { api } from './api';
import type { Friend, Schedule, DayCalendarData } from './types';
import { getTodayStr } from './utils/date';
import { Solar } from 'lunar-javascript';

export function App() {
  const todayStr = useMemo(() => getTodayStr(), []);
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [currentYear, setCurrentYear] = useState<number>(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState<number>(new Date().getMonth() + 1);

  // 数据状态
  const [monthData, setMonthData] = useState<{ [date: string]: DayCalendarData }>({});
  const [allFriends, setAllFriends] = useState<Friend[]>([]);

  // 模态框状态
  const [isFriendModalOpen, setIsFriendModalOpen] = useState(false);
  const [editingFriend, setEditingFriend] = useState<Friend | null>(null);

  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);

  // 移动端当前主视图切换：'calendar' (日历+详情) | 'timeline' (近期生日流)
  const [activeTab, setActiveTab] = useState<'calendar' | 'timeline'>('calendar');

  // 加载月历及好友数据
  const loadCalendarData = async (year: number, month: number) => {
    try {
      const [mData, friends] = await Promise.all([
        api.getMonthData(year, month),
        api.getFriends(),
      ]);
      setMonthData(mData);
      setAllFriends(friends);
    } catch (err) {
      console.error('Failed to load calendar data', err);
    }
  };

  useEffect(() => {
    loadCalendarData(currentYear, currentMonth);
  }, [currentYear, currentMonth]);

  // 月份切换
  const handlePrevMonth = () => {
    if (currentMonth === 1) {
      setCurrentYear(currentYear - 1);
      setCurrentMonth(12);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentYear(currentYear + 1);
      setCurrentMonth(1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const handleToday = () => {
    const d = new Date();
    setCurrentYear(d.getFullYear());
    setCurrentMonth(d.getMonth() + 1);
    setSelectedDate(todayStr);
  };

  // 选中日期的元数据（农历、生肖、好友生日、日程等）
  const selectedDayMeta = useMemo(() => {
    const meta = monthData[selectedDate];
    if (meta) return meta;

    // 针对不在当前月份缓存的选定日期进行实时计算
    try {
      const [y, m, d] = selectedDate.split('-').map(Number);
      const solar = Solar.fromYmd(y, m, d);
      const lunar = solar.getLunar();
      return {
        date: selectedDate,
        day: d,
        lunarDayName: lunar.getDayInChinese(),
        lunarMonthName: lunar.getMonthInChinese() + '月',
        jieQi: lunar.getJieQi() || null,
        festivals: [...solar.getFestivals(), ...lunar.getFestivals()],
        friends: [],
        schedules: [],
      } as DayCalendarData;
    } catch {
      return null;
    }
  }, [selectedDate, monthData]);

  // 排序获取近期即将过生日的好友（7天内或近期生日）
  const upcomingFriends = useMemo(() => {
    return allFriends.filter((f) => f.days_until !== undefined && f.days_until >= 0 && f.days_until <= 30);
  }, [allFriends]);

  // 今日过生日的好友
  const todayBirthdays = useMemo(() => {
    return allFriends.filter((f) => f.days_until === 0);
  }, [allFriends]);

  // 保存好友
  const handleSaveFriend = async (data: Partial<Friend>) => {
    if (editingFriend) {
      await api.updateFriend(editingFriend.id, data);
    } else {
      await api.createFriend(data);
    }
    loadCalendarData(currentYear, currentMonth);
  };

  // 删除好友
  const handleDeleteFriend = async (id: number) => {
    await api.deleteFriend(id);
    loadCalendarData(currentYear, currentMonth);
  };

  // 保存日程
  const handleSaveSchedule = async (data: Partial<Schedule>) => {
    if (editingSchedule) {
      await api.updateSchedule(editingSchedule.id, data);
    } else {
      await api.createSchedule(data);
    }
    loadCalendarData(currentYear, currentMonth);
  };

  // 切换日程完成状态
  const handleToggleSchedule = async (schedule: Schedule) => {
    await api.updateSchedule(schedule.id, {
      is_completed: schedule.is_completed ? 0 : 1,
    });
    loadCalendarData(currentYear, currentMonth);
  };

  // 删除日程
  const handleDeleteSchedule = async (id: number) => {
    await api.deleteSchedule(id);
    loadCalendarData(currentYear, currentMonth);
  };

  // 导出 JSON 数据
  const handleExport = async () => {
    try {
      const res = await api.exportData();
      const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `calendar-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
    } catch (e) {
      alert('导出失败');
    }
  };

  // 导入 JSON 数据
  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const json = JSON.parse(text);
      await api.importData(json);
      alert('导入数据成功');
      loadCalendarData(currentYear, currentMonth);
    } catch (err: any) {
      alert('导入失败: ' + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] text-zinc-900 pb-20 sm:pb-12">
      {/* 顶部导航 Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-zinc-200/80">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-zinc-900 text-white flex items-center justify-center shadow-sm">
              <CalendarDays className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-sm sm:text-base font-bold tracking-tight text-zinc-900 leading-none">
                好友生日与日程
              </h1>
              <span className="text-[10px] text-zinc-400">农历阳历双轨 · 移动端优先</span>
            </div>
          </div>

          {/* 顶部快捷操作 */}
          <div className="flex items-center space-x-2">
            <label className="p-2 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 rounded-xl cursor-pointer transition" title="导入备份">
              <Upload className="w-4 h-4" />
              <input type="file" accept=".json" onChange={handleImport} className="hidden" />
            </label>
            <button
              onClick={handleExport}
              className="p-2 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 rounded-xl transition"
              title="导出备份"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setEditingFriend(null);
                setIsFriendModalOpen(true);
              }}
              className="inline-flex items-center space-x-1 px-3 py-1.5 bg-zinc-900 text-white rounded-xl text-xs font-semibold shadow-sm hover:bg-zinc-800 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>加生日</span>
            </button>
          </div>
        </div>
      </header>

      {/* 主体容器 */}
      <main className="max-w-4xl mx-auto px-3 sm:px-6 pt-4 space-y-4">
        {/* 今天生日 Banner (若有) */}
        {todayBirthdays.length > 0 && (
          <div className="bg-zinc-900 text-white rounded-2xl p-4 shadow-sm flex items-center justify-between animate-fade-in">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-zinc-100" />
              </div>
              <div>
                <div className="text-xs text-zinc-400 font-medium">今天是好友生日</div>
                <div className="text-sm font-bold mt-0.5">
                  {todayBirthdays.map((f) => f.name).join('、')} 正在过生日，送句祝福吧！
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 移动端视图切换 Tabs (日历总览 / 近期生日流) */}
        <div className="flex sm:hidden p-1 bg-zinc-100 rounded-xl gap-1">
          <button
            onClick={() => setActiveTab('calendar')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg flex items-center justify-center space-x-1.5 transition ${
              activeTab === 'calendar'
                ? 'bg-white text-zinc-900 shadow-sm'
                : 'text-zinc-500 hover:text-zinc-800'
            }`}
          >
            <CalendarIcon className="w-3.5 h-3.5" />
            <span>月历视图</span>
          </button>
          <button
            onClick={() => setActiveTab('timeline')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg flex items-center justify-center space-x-1.5 transition ${
              activeTab === 'timeline'
                ? 'bg-white text-zinc-900 shadow-sm'
                : 'text-zinc-500 hover:text-zinc-800'
            }`}
          >
            <Cake className="w-3.5 h-3.5" />
            <span>近期生日 ({allFriends.length})</span>
          </button>
        </div>

        {/* 核心响应式双栏布局 */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
          {/* 左侧栏：日历面板 (移动端在 calendar tab 时展示) */}
          <div className={`md:col-span-7 space-y-3 ${activeTab === 'calendar' ? 'block' : 'hidden sm:block'}`}>
            <CalendarGrid
              year={currentYear}
              month={currentMonth}
              selectedDate={selectedDate}
              monthData={monthData}
              onSelectDate={(date) => setSelectedDate(date)}
              onPrevMonth={handlePrevMonth}
              onNextMonth={handleNextMonth}
              onToday={handleToday}
            />

            {/* 图例说明 */}
            <div className="flex items-center justify-between text-[11px] text-zinc-400 px-2">
              <div className="flex items-center space-x-3">
                <span className="flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-zinc-900"></span>
                  <span>好友生日</span>
                </span>
                <span className="flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full border border-zinc-400 bg-zinc-200"></span>
                  <span>按天日程</span>
                </span>
              </div>
              <span>严格固定行高 · 防折行挤占</span>
            </div>
          </div>

          {/* 右侧栏：所选日期联动详情面板 + 日程安排 */}
          <div className={`md:col-span-5 space-y-4 ${activeTab === 'calendar' ? 'block' : 'hidden sm:block'}`}>
            {/* 选中日期详情卡片 */}
            <div className="bg-white border border-zinc-200/90 rounded-2xl p-4 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
                <div>
                  <div className="text-base font-bold text-zinc-900 flex items-center gap-1.5">
                    {selectedDate}
                    {selectedDate === todayStr && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-900 text-white font-medium">
                        今天
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-zinc-500 mt-0.5">
                    农历 {selectedDayMeta?.lunarMonthName}{selectedDayMeta?.lunarDayName}
                    {selectedDayMeta?.jieQi && ` · ${selectedDayMeta.jieQi}`}
                    {selectedDayMeta?.festivals && selectedDayMeta.festivals.length > 0 && ` · ${selectedDayMeta.festivals.join(' ')}`}
                  </div>
                </div>

                {/* 添加日程按钮 */}
                <button
                  onClick={() => {
                    setEditingSchedule(null);
                    setIsScheduleModalOpen(true);
                  }}
                  className="p-1.5 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 rounded-xl transition flex items-center gap-1 text-xs font-medium border border-zinc-200"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>加日程</span>
                </button>
              </div>

              {/* 该日好友生日列表 */}
              <div>
                <div className="text-xs font-semibold text-zinc-600 mb-2 flex items-center gap-1">
                  <Cake className="w-3.5 h-3.5 text-zinc-500" />
                  <span>当天生日好友</span>
                </div>
                {selectedDayMeta?.friends && selectedDayMeta.friends.length > 0 ? (
                  <div className="space-y-2">
                    {selectedDayMeta.friends.map((friend) => (
                      <FriendCard
                        key={friend.id}
                        friend={friend}
                        onEdit={(f) => {
                          setEditingFriend(f);
                          setIsFriendModalOpen(true);
                        }}
                        onDelete={handleDeleteFriend}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-zinc-400 py-2 text-center bg-zinc-50 rounded-xl">
                    该天没有好友生日
                  </div>
                )}
              </div>

              {/* 该日日程列表 */}
              <div>
                <div className="text-xs font-semibold text-zinc-600 mb-2 flex items-center gap-1">
                  <CheckSquare className="w-3.5 h-3.5 text-zinc-500" />
                  <span>按天待办日程</span>
                </div>
                {selectedDayMeta?.schedules && selectedDayMeta.schedules.length > 0 ? (
                  <div className="space-y-2">
                    {selectedDayMeta.schedules.map((schedule) => (
                      <ScheduleCard
                        key={schedule.id}
                        schedule={schedule}
                        onToggleComplete={handleToggleSchedule}
                        onEdit={(s) => {
                          setEditingSchedule(s);
                          setIsScheduleModalOpen(true);
                        }}
                        onDelete={handleDeleteSchedule}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-zinc-400 py-3 text-center bg-zinc-50 rounded-xl">
                    暂无日程待办，点击右上角快速添加
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 移动端 Timeline 独立视图：即将到来的生日 */}
          <div className={`col-span-12 space-y-3 ${activeTab === 'timeline' ? 'block' : 'hidden'}`}>
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold text-zinc-600 uppercase tracking-wider">
                全部好友生日清单 ({allFriends.length})
              </span>
              <button
                onClick={() => {
                  setEditingFriend(null);
                  setIsFriendModalOpen(true);
                }}
                className="text-xs text-zinc-900 font-semibold hover:underline flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                添加好友
              </button>
            </div>

            {allFriends.length === 0 ? (
              <div className="bg-white rounded-2xl border border-zinc-200 p-8 text-center text-zinc-400 space-y-2">
                <Users className="w-8 h-8 mx-auto text-zinc-300" />
                <p className="text-xs">还没有添加任何好友生日</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {allFriends.map((f) => (
                  <FriendCard
                    key={f.id}
                    friend={f}
                    onEdit={(item) => {
                      setEditingFriend(item);
                      setIsFriendModalOpen(true);
                    }}
                    onDelete={handleDeleteFriend}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 桌面端下方：未来30天即将到来的生日横向滚动/列表条 */}
        <div className="hidden sm:block pt-4">
          <div className="flex items-center justify-between mb-3 px-1">
            <span className="text-xs font-bold text-zinc-700 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-zinc-500" />
              未来 30 天过生日的好友 ({upcomingFriends.length})
            </span>
            <span className="text-xs text-zinc-400">自动实时推算公历/农历下一次交汇日</span>
          </div>

          {upcomingFriends.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {upcomingFriends.map((friend) => (
                <FriendCard
                  key={friend.id}
                  friend={friend}
                  onEdit={(f) => {
                    setEditingFriend(f);
                    setIsFriendModalOpen(true);
                  }}
                  onDelete={handleDeleteFriend}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-zinc-200/90 p-4 text-center text-xs text-zinc-400">
              未来 30 天内暂无好友过生日
            </div>
          )}
        </div>
      </main>

      {/* 弹窗组件 */}
      <FriendModal
        isOpen={isFriendModalOpen}
        onClose={() => setIsFriendModalOpen(false)}
        onSave={handleSaveFriend}
        editingFriend={editingFriend}
      />

      <ScheduleModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        onSave={handleSaveSchedule}
        defaultDate={selectedDate}
        editingSchedule={editingSchedule}
      />
    </div>
  );
}

export default App;
