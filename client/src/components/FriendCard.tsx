import React from 'react';
import { Gift, Sparkles, Trash2, Edit3 } from 'lucide-react';
import type { Friend } from '../types';
import { LoreleiAvatar } from './LoreleiAvatar';

interface FriendCardProps {
  friend: Friend;
  onEdit?: (friend: Friend) => void;
  onDelete?: (id: number) => void;
}

export const FriendCard: React.FC<FriendCardProps> = ({ friend, onEdit, onDelete }) => {
  const isUpcomingSoon = friend.days_until !== undefined && friend.days_until <= 7;
  const isToday = friend.days_until === 0;

  const effectiveSeed = friend.avatar_seed && friend.avatar_seed.trim() !== '' ? friend.avatar_seed.trim() : friend.name;

  return (
    <div className="group relative bg-white border border-zinc-200/90 rounded-2xl p-4 shadow-sm hover:border-zinc-300 hover:shadow-md transition-all duration-200 min-w-0">
      <div className="flex items-start justify-between gap-2 min-w-0">
        {/* 左侧头像与主体信息 */}
        <div className="flex items-center space-x-3 min-w-0 flex-1">
          {/* 二次元黑白头像 */}
          <div className="relative flex-shrink-0">
            <LoreleiAvatar
              seed={effectiveSeed}
              size={44}
              className={isToday ? 'ring-2 ring-zinc-900 ring-offset-2' : ''}
            />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center space-x-1.5 flex-wrap">
              <span className="font-semibold text-zinc-900 text-sm truncate max-w-[120px] sm:max-w-[160px]">
                {friend.name}
              </span>
              {friend.nickname && (
                <span className="text-[11px] text-zinc-400 truncate max-w-[80px]">
                  ({friend.nickname})
                </span>
              )}
              {friend.tags && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-zinc-100 text-zinc-600 font-medium">
                  {friend.tags}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 mt-1 text-xs text-zinc-500 flex-wrap">
              <span className="inline-flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-300"></span>
                {friend.is_lunar ? '农历' : '公历'} {friend.is_leap_month ? '闰' : ''}{friend.birth_month}月{friend.birth_day}日
              </span>
              {friend.next_age !== undefined && friend.next_age !== null && (
                <span>· 将满 {friend.next_age} 岁</span>
              )}
              {friend.zodiac && (
                <span>· 属{friend.zodiac}</span>
              )}
              {friend.constellation && (
                <span>· {friend.constellation}</span>
              )}
            </div>
          </div>
        </div>

        {/* 右侧倒计时状态徽标 */}
        <div className="flex flex-col items-end flex-shrink-0">
          {isToday ? (
            <div className="flex items-center gap-1 px-2.5 py-1 bg-zinc-900 text-white rounded-full text-xs font-semibold shadow-sm animate-pulse">
              <Sparkles className="w-3.5 h-3.5" />
              <span>今天生日!</span>
            </div>
          ) : (
            <div className={`text-right ${isUpcomingSoon ? 'text-zinc-900' : 'text-zinc-500'}`}>
              <div className="text-[11px] text-zinc-400">下次生日</div>
              <div className="text-xs font-medium">
                <span className="font-bold text-base text-zinc-900">{friend.days_until}</span> 天后
              </div>
            </div>
          )}

          {/* 操作按钮 (hover 或移动端保持低调可用) */}
          <div className="flex items-center space-x-1 mt-2 sm:opacity-0 group-hover:opacity-100 transition-opacity">
            {onEdit && (
              <button
                onClick={() => onEdit(friend)}
                className="p-1 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition"
                title="编辑"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => {
                  if (confirm(`确认删除好友【${friend.name}】的生日记录吗？`)) {
                    onDelete(friend.id);
                  }
                }}
                className="p-1 text-zinc-400 hover:text-red-600 hover:bg-zinc-100 rounded-lg transition"
                title="删除"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 备注或礼物清单展示 (若有) */}
      {friend.notes && (
        <div className="mt-3 pt-2.5 border-t border-zinc-100 text-xs text-zinc-500 bg-zinc-50/70 p-2 rounded-xl flex items-start gap-1.5 min-w-0">
          <Gift className="w-3.5 h-3.5 text-zinc-400 flex-shrink-0 mt-0.5" />
          <p className="line-clamp-2 break-all">{friend.notes}</p>
        </div>
      )}
    </div>
  );
};
