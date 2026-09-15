import React, { useMemo } from 'react';
import { createAvatar } from '@dicebear/core';
import * as lorelei from '@dicebear/lorelei';

interface LoreleiAvatarProps {
  seed: string;
  size?: number;
  className?: string;
}

export const LoreleiAvatar: React.FC<LoreleiAvatarProps> = ({
  seed,
  size = 44,
  className = '',
}) => {
  const avatarSvg = useMemo(() => {
    try {
      const avatar = createAvatar(lorelei, {
        seed: seed || 'default',
        // 严格黑白日漫调色预设
        skinColor: ['ffffff'],
        hairColor: ['000000'],
        eyebrowsColor: ['000000'],
        eyesColor: ['000000'],
        mouthColor: ['000000'],
        glassesColor: ['000000'],
        frecklesColor: ['000000'],
        earringsColor: ['000000'],
        hairAccessoriesColor: ['000000'],
      });
      return avatar.toDataUri();
    } catch (e) {
      console.error('Failed to generate avatar for seed:', seed, e);
      return '';
    }
  }, [seed]);

  return (
    <div
      style={{ width: size, height: size }}
      className={`relative overflow-hidden rounded-2xl bg-zinc-100/90 border border-zinc-200/80 flex items-center justify-center flex-shrink-0 select-none ${className}`}
    >
      {avatarSvg ? (
        <img
          src={avatarSvg}
          alt={seed}
          className="w-full h-full object-cover pointer-events-none"
          loading="lazy"
        />
      ) : (
        <span className="text-xs font-bold text-zinc-700 uppercase">
          {seed.slice(0, 1)}
        </span>
      )}
    </div>
  );
};
