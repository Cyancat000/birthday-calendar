import React, { useState, useEffect } from 'react';
import { X, Calendar as CalendarIcon, User, Tag, FileText } from 'lucide-react';
import type { Friend } from '../types';
import { Solar, Lunar } from 'lunar-javascript';

interface FriendModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<Friend>) => Promise<void>;
  editingFriend?: Friend | null;
}

export const FriendModal: React.FC<FriendModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingFriend,
}) => {
  const [name, setName] = useState('');
  const [nickname, setNickname] = useState('');
  const [isLunar, setIsLunar] = useState(false);
  const [birthYear, setBirthYear] = useState<number | ''>('');
  const [birthMonth, setBirthMonth] = useState<number>(1);
  const [birthDay, setBirthDay] = useState<number>(1);
  const [isLeapMonth, setIsLeapMonth] = useState(false);
  const [tags, setTags] = useState('朋友');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [previewInfo, setPreviewInfo] = useState('');

  useEffect(() => {
    if (editingFriend) {
      setName(editingFriend.name || '');
      setNickname(editingFriend.nickname || '');
      setIsLunar(Boolean(editingFriend.is_lunar));
      setBirthYear(editingFriend.birth_year || '');
      setBirthMonth(editingFriend.birth_month || 1);
      setBirthDay(editingFriend.birth_day || 1);
      setIsLeapMonth(Boolean(editingFriend.is_leap_month));
      setTags(editingFriend.tags || '朋友');
      setNotes(editingFriend.notes || '');
    } else {
      setName('');
      setNickname('');
      setIsLunar(false);
      setBirthYear('');
      const today = new Date();
      setBirthMonth(today.getMonth() + 1);
      setBirthDay(today.getDate());
      setIsLeapMonth(false);
      setTags('朋友');
      setNotes('');
    }
  }, [editingFriend, isOpen]);

  // 动态计算公农历对应预览
  useEffect(() => {
    if (!birthMonth || !birthDay) return;
    try {
      const currentYear = new Date().getFullYear();
      if (isLunar) {
        // 输入是农历，预览当年对应公历
        try {
          const l = Lunar.fromYmd(currentYear, isLeapMonth ? -birthMonth : birthMonth, birthDay);
          const s = l.getSolar();
          setPreviewInfo(`${currentYear}年农历生日对应公历为: ${s.getYear()}年${s.getMonth()}月${s.getDay()}日`);
        } catch {
          setPreviewInfo('该农历日期在当年需要换算');
        }
      } else {
        // 输入是公历，预览对应农历
        try {
          const s = Solar.fromYmd(currentYear, birthMonth, birthDay);
          const l = s.getLunar();
          setPreviewInfo(`对应农历: ${l.getMonthInChinese()}月${l.getDayInChinese()} (${l.getYearShengXiao()}年)`);
        } catch {
          setPreviewInfo('');
        }
      }
    } catch {
      setPreviewInfo('');
    }
  }, [isLunar, birthYear, birthMonth, birthDay, isLeapMonth]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);
    try {
      await onSave({
        name: name.trim(),
        nickname: nickname.trim() || undefined,
        is_lunar: isLunar ? 1 : 0,
        birth_year: birthYear ? Number(birthYear) : undefined,
        birth_month: Number(birthMonth),
        birth_day: Number(birthDay),
        is_leap_month: isLeapMonth ? 1 : 0,
        tags: tags.trim() || undefined,
        notes: notes.trim() || undefined,
      });
      onClose();
    } catch (err: any) {
      alert(err.message || '保存失败');
    } finally {
      setSubmitting(false);
    }
  };

  const tagPresets = ['朋友', '家人', '闺蜜/兄弟', '同事', '同学', '伴侣'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div 
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-zinc-200 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 头部 */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-zinc-900 text-white flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-zinc-900">
                {editingFriend ? '编辑好友生日' : '添加好友生日'}
              </h2>
              <p className="text-xs text-zinc-400">支持公历与传统农历生日精准推算</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 表单内容 */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4 text-sm">
          {/* 姓名与昵称 */}
          <div className="grid grid-cols-2 gap-3">
            <div className="min-w-0">
              <label className="block text-xs font-medium text-zinc-600 mb-1.5">
                姓名 <span className="text-zinc-900 font-bold">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="例如: 张伟"
                className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 text-zinc-900 placeholder:text-zinc-400 transition"
              />
            </div>
            <div className="min-w-0">
              <label className="block text-xs font-medium text-zinc-600 mb-1.5">昵称 / 称谓</label>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="例如: 伟哥、老张"
                className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 text-zinc-900 placeholder:text-zinc-400 transition"
              />
            </div>
          </div>

          {/* 生日历法选择 Toggle */}
          <div>
            <label className="block text-xs font-medium text-zinc-600 mb-1.5">生日历法</label>
            <div className="grid grid-cols-2 p-1 bg-zinc-100 rounded-xl gap-1">
              <button
                type="button"
                onClick={() => setIsLunar(false)}
                className={`py-1.5 text-xs font-medium rounded-lg transition-all ${
                  !isLunar
                    ? 'bg-white text-zinc-900 shadow-sm'
                    : 'text-zinc-500 hover:text-zinc-900'
                }`}
              >
                公历 / 阳历生日
              </button>
              <button
                type="button"
                onClick={() => setIsLunar(true)}
                className={`py-1.5 text-xs font-medium rounded-lg transition-all ${
                  isLunar
                    ? 'bg-white text-zinc-900 shadow-sm'
                    : 'text-zinc-500 hover:text-zinc-900'
                }`}
              >
                农历 / 阴历生日
              </button>
            </div>
          </div>

          {/* 生日具体选择 */}
          <div className="p-3.5 bg-zinc-50 rounded-xl border border-zinc-100 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-zinc-700 flex items-center gap-1.5">
                <CalendarIcon className="w-3.5 h-3.5 text-zinc-500" />
                {isLunar ? '农历出生日期' : '公历出生日期'}
              </span>
              {isLunar && (
                <label className="flex items-center space-x-1.5 cursor-pointer text-xs text-zinc-600">
                  <input
                    type="checkbox"
                    checked={isLeapMonth}
                    onChange={(e) => setIsLeapMonth(e.target.checked)}
                    className="w-3.5 h-3.5 rounded text-zinc-900 focus:ring-zinc-900 accent-zinc-900"
                  />
                  <span>闰月</span>
                </label>
              )}
            </div>

            <div className="grid grid-cols-3 gap-2">
              {/* 年份（可选） */}
              <div className="min-w-0">
                <label className="block text-[11px] text-zinc-400 mb-1">出生年份(可选)</label>
                <input
                  type="number"
                  min="1920"
                  max="2035"
                  value={birthYear}
                  onChange={(e) => setBirthYear(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="如 1998"
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-zinc-200 rounded-lg focus:outline-none focus:border-zinc-900"
                />
              </div>

              {/* 月份 */}
              <div className="min-w-0">
                <label className="block text-[11px] text-zinc-400 mb-1">月份 *</label>
                <select
                  value={birthMonth}
                  onChange={(e) => setBirthMonth(Number(e.target.value))}
                  className="w-full px-2 py-1.5 text-xs bg-white border border-zinc-200 rounded-lg focus:outline-none focus:border-zinc-900"
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                    <option key={m} value={m}>
                      {isLunar ? `${m}月` : `${m}月`}
                    </option>
                  ))}
                </select>
              </div>

              {/* 日期 */}
              <div className="min-w-0">
                <label className="block text-[11px] text-zinc-400 mb-1">日期 *</label>
                <select
                  value={birthDay}
                  onChange={(e) => setBirthDay(Number(e.target.value))}
                  className="w-full px-2 py-1.5 text-xs bg-white border border-zinc-200 rounded-lg focus:outline-none focus:border-zinc-900"
                >
                  {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                    <option key={d} value={d}>
                      {isLunar ? `${d}日` : `${d}日`}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {previewInfo && (
              <p className="text-[11px] text-zinc-500 bg-white/80 p-2 rounded-lg border border-zinc-100/80">
                💡 {previewInfo}
              </p>
            )}
          </div>

          {/* 分组标签 */}
          <div>
            <label className="block text-xs font-medium text-zinc-600 mb-1.5 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-zinc-500" />
              标签分组
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {tagPresets.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setTags(preset)}
                  className={`text-[11px] px-2.5 py-1 rounded-full border transition ${
                    tags === preset
                      ? 'bg-zinc-900 text-white border-zinc-900'
                      : 'bg-white text-zinc-600 border-zinc-200 hover:border-zinc-300'
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="自定义标签或直接选择"
              className="w-full px-3 py-1.5 text-xs bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:outline-none focus:border-zinc-900"
            />
          </div>

          {/* 备注信息 */}
          <div>
            <label className="block text-xs font-medium text-zinc-600 mb-1.5 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-zinc-500" />
              礼物愿望 / 喜好与忌口备注
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="例如：喜欢机械键盘，不吃香菜，常喝乌龙茶..."
              className="w-full px-3 py-2 text-xs bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:outline-none focus:border-zinc-900 text-zinc-900 placeholder:text-zinc-400"
            />
          </div>

          {/* 底部按钮 */}
          <div className="pt-2 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-zinc-600 hover:bg-zinc-100 rounded-xl transition"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 text-xs font-medium bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl shadow-sm transition disabled:opacity-50"
            >
              {submitting ? '保存中...' : '确认保存'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
