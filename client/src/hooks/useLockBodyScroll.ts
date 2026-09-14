import { useEffect } from 'react';

/**
 * 当弹窗打开时，禁止背景页面（body）滚动，防止移动端穿透滑动
 */
export function useLockBodyScroll(lock: boolean) {
  useEffect(() => {
    if (!lock) return;

    const originalOverflow = document.body.style.overflow;
    const originalTouchAction = document.body.style.touchAction;

    document.body.style.overflow = 'hidden';
    document.body.style.touchAction = 'none';

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.touchAction = originalTouchAction;
    };
  }, [lock]);
}
