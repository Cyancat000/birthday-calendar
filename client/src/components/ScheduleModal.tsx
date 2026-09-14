import React, { useState, useEffect } from 'react';
import { X, Calendar as CalendarIcon, CheckSquare, AlignLeft } from 'lucide-react';
import type { Schedule } from '../types';

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<Schedule>) => Promise<void>;
  defaultDate?: string;
  editingSchedule?: Schedule | null;
}

export const ScheduleModal: React.FC<ScheduleModalProps> = ({
  isOpen,
  onClose,
  onSave,
  defaultDate,
  editingSchedule,
}) => {
  const [date, setDate] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'low' | 'normal' | 'high'>('normal');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (editingSchedule) {
      setDate(editingSchedule.date);
      setTitle(editingSchedule.title);
      setDescription(editingSchedule.description || '');
      setPriority(editingSchedule.priority || 'normal');
    } else {
      setDate(defaultDate || new Date().toISOString().slice(0, 10));
      setTitle('');
      setDescription('');
      setPriority('normal');
    }
  }, [editingSchedule, defaultDate, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !date) return;
    setSubmitting(true);
    try {
      await onSave({
        date,
        title: title.trim(),
        description: description.trim() || undefined,
        priority,
      });
      onClose();
    } catch (err: any) {
      alert(err.message || '保存失败');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div 
        className="w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-zinc-200 overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-zinc-900 text-white flex items-center justify-center">
              <CheckSquare className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-zinc-900">
                {editingSchedule ? '编辑按天日程' : '新增按天日程'}
              </h2>
              <p className="text-xs text-zinc-400">无需小时分钟，专注当天安排</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-sm">
          <div>
            <label className="block text-xs font-medium text-zinc-600 mb-1 flex items-center gap-1.5">
              <CalendarIcon className="w-3.5 h-3.5 text-zinc-400" />
              日程日期
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:outline-none focus:border-zinc-900 text-zinc-900"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-600 mb-1">
              日程待办事项 <span className="text-zinc-900 font-bold">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="例如：取快递、为朋友选生日礼物..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:outline-none focus:border-zinc-900 text-zinc-900 placeholder:text-zinc-400"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-600 mb-1">优先级</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { key: 'low', label: '低' },
                { key: 'normal', label: '普通' },
                { key: 'high', label: '重要' },
              ].map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setPriority(item.key as any)}
                  className={`py-1.5 text-xs font-medium rounded-xl border transition ${
                    priority === item.key
                      ? 'bg-zinc-900 text-white border-zinc-900'
                      : 'bg-white text-zinc-600 border-zinc-200 hover:border-zinc-300'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-600 mb-1 flex items-center gap-1.5">
              <AlignLeft className="w-3.5 h-3.5 text-zinc-400" />
              详细说明 / 备注 (可选)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="添加相关地点、注意事项等..."
              className="w-full px-3 py-2 text-xs bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:outline-none focus:border-zinc-900 text-zinc-900 placeholder:text-zinc-400"
            />
          </div>

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
