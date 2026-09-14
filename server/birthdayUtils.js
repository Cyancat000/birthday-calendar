const { Solar, Lunar } = require('lunar-javascript');

/**
 * 格式化补齐两位
 */
function padZero(n) {
  return n < 10 ? `0${n}` : `${n}`;
}

/**
 * 格式化为 YYYY-MM-DD
 */
function formatDate(year, month, day) {
  return `${year}-${padZero(month)}-${padZero(day)}`;
}

/**
 * 计算某个好友在指定基准日期（默认为今天）之后，下一次生日的信息
 * @param {Object} friend 好友数据
 * @param {Date} [baseDate=new Date()]
 */
function calculateNextBirthday(friend, baseDate = new Date()) {
  const currentYear = baseDate.getFullYear();
  const todayStr = formatDate(currentYear, baseDate.getMonth() + 1, baseDate.getDate());
  const todaySolar = Solar.fromDate(baseDate);

  let nextSolarDateStr = null;
  let nextSolarYear = null;
  let nextAge = null;
  let zodiac = null;
  let constellation = null;

  // 计算生肖与星座（基于出生年或生日本身）
  if (friend.birth_year) {
    if (friend.is_lunar) {
      try {
        const lunarBirth = Lunar.fromYmd(friend.birth_year, friend.birth_month, friend.birth_day);
        zodiac = lunarBirth.getYearShengXiao();
      } catch (e) {
        zodiac = null;
      }
    } else {
      try {
        const solarBirth = Solar.fromYmd(friend.birth_year, friend.birth_month, friend.birth_day);
        const lunarBirth = solarBirth.getLunar();
        zodiac = lunarBirth.getYearShengXiao();
        constellation = solarBirth.getXingZuo();
      } catch (e) {
        // ignore
      }
    }
  }

  // 找未来最近的生日，尝试当前年份与下一年
  for (let yearOffset = 0; yearOffset <= 1; yearOffset++) {
    const targetYear = currentYear + yearOffset;
    let targetSolar = null;

    if (friend.is_lunar) {
      // 农历生日：需要转换为该目标年的对应公历日期
      try {
        // 如果出生在闰月，先看当年是否有该闰月；如果没有，则使用对应平月
        let isLeap = Boolean(friend.is_leap_month);
        let lunarTarget;
        try {
          // Lunar.fromYmd(year, month, day) -> 如果闰月月份为负数，lunar-javascript 中负月表示闰月
          const monthParam = isLeap ? -friend.birth_month : friend.birth_month;
          lunarTarget = Lunar.fromYmd(targetYear, monthParam, friend.birth_day);
        } catch (err) {
          // 若当年无此闰月，退回平月
          lunarTarget = Lunar.fromYmd(targetYear, friend.birth_month, friend.birth_day);
        }
        targetSolar = lunarTarget.getSolar();
      } catch (e) {
        console.error(`Error calculating lunar birthday for ${friend.name} in year ${targetYear}:`, e);
      }
    } else {
      // 公历生日
      try {
        // 考虑平闰年 2月29日
        let day = friend.birth_day;
        if (friend.birth_month === 2 && day === 29) {
          const isLeapYear = (targetYear % 4 === 0 && targetYear % 100 !== 0) || (targetYear % 400 === 0);
          if (!isLeapYear) day = 28;
        }
        targetSolar = Solar.fromYmd(targetYear, friend.birth_month, day);
      } catch (e) {
        console.error(`Error calculating solar birthday for ${friend.name} in year ${targetYear}:`, e);
      }
    }

    if (targetSolar) {
      const solarDateStr = formatDate(targetSolar.getYear(), targetSolar.getMonth(), targetSolar.getDay());
      if (solarDateStr >= todayStr) {
        nextSolarDateStr = solarDateStr;
        nextSolarYear = targetSolar.getYear();
        if (friend.birth_year) {
          nextAge = nextSolarYear - friend.birth_year;
        }
        break;
      }
    }
  }

  // 如果今年和明年都没命中（比如跨到第三年极特殊情况），兜底再算一年
  if (!nextSolarDateStr) {
    const targetYear = currentYear + 2;
    if (!friend.is_lunar) {
      nextSolarDateStr = formatDate(targetYear, friend.birth_month, friend.birth_day);
    } else {
      try {
        const l = Lunar.fromYmd(targetYear, friend.birth_month, friend.birth_day);
        const s = l.getSolar();
        nextSolarDateStr = formatDate(s.getYear(), s.getMonth(), s.getDay());
      } catch (e) {}
    }
    if (friend.birth_year) {
      nextAge = targetYear - friend.birth_year;
    }
  }

  // 计算倒计时天数
  let diffDays = 0;
  if (nextSolarDateStr) {
    const todayMs = new Date(todaySolar.getYear(), todaySolar.getMonth() - 1, todaySolar.getDay()).getTime();
    const [ny, nm, nd] = nextSolarDateStr.split('-').map(Number);
    const targetMs = new Date(ny, nm - 1, nd).getTime();
    diffDays = Math.round((targetMs - todayMs) / (1000 * 60 * 60 * 24));
  }

  return {
    ...friend,
    next_solar_date: nextSolarDateStr,
    days_until: diffDays,
    next_age: nextAge,
    zodiac,
    constellation,
  };
}

module.exports = {
  calculateNextBirthday,
  padZero,
  formatDate,
};
