import { Solar } from 'lunar-javascript';

export function padZero(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}

export function formatDateStr(year: number, month: number, day: number): string {
  return `${year}-${padZero(month)}-${padZero(day)}`;
}

export function getTodayStr(): string {
  const d = new Date();
  return formatDateStr(d.getFullYear(), d.getMonth() + 1, d.getDate());
}

/**
 * 获取公历日期对应的农历精简描述（节日优先、其次节气、其次初一/农历日）
 */
export function getLunarDisplay(year: number, month: number, day: number): { text: string; isSpecial: boolean } {
  try {
    const solar = Solar.fromYmd(year, month, day);
    const lunar = solar.getLunar();

    // 1. 中国主要公历节日
    const sFestivals = solar.getFestivals();
    if (sFestivals.length > 0) {
      return { text: sFestivals[0], isSpecial: true };
    }

    // 2. 传统农历节日（春节、端午、中秋等）
    const lFestivals = lunar.getFestivals();
    if (lFestivals.length > 0) {
      return { text: lFestivals[0], isSpecial: true };
    }

    // 3. 二十四节气（立春、清明、秋分等）
    const jieQi = lunar.getJieQi();
    if (jieQi) {
      return { text: jieQi, isSpecial: true };
    }

    // 4. 初一显示月份（如 八月、九月）
    if (lunar.getDay() === 1) {
      return { text: `${lunar.getMonthInChinese()}月`, isSpecial: false };
    }

    // 5. 常规农历日（如 初二、廿五）
    return { text: lunar.getDayInChinese(), isSpecial: false };
  } catch (e) {
    return { text: '', isSpecial: false };
  }
}
