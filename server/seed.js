const db = require('./db');

// 检查是否已有测试数据
const count = db.prepare('SELECT COUNT(*) as count FROM friends').get().count;

if (count === 0) {
  console.log('正在插入初始演示数据...');

  // 1. 插入好友生日（包含公历与农历）
  const insertFriend = db.prepare(`
    INSERT INTO friends (name, nickname, gender, is_lunar, birth_year, birth_month, birth_day, is_leap_month, tags, notes, avatar_color)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertFriend.run('林静', '小静', 'female', 1, 1998, 8, 15, 0, '闺蜜', '爱喝半糖奶茶，中秋节前后', '#18181b');
  insertFriend.run('张伟', '伟哥', 'male', 0, 1996, 9, 20, 0, '大学同学', '喜欢数码外设，准备送机械键盘', '#27272a');
  insertFriend.run('陈阿姨', '妈妈', 'female', 1, 1970, 10, 2, 0, '家人', '农历十月初二，记得提前订花和蛋糕', '#3f3f46');
  insertFriend.run('王浩', '浩子', 'male', 0, 2000, 10, 1, 0, '同事', '国庆节当天公历生日', '#52525b');
  insertFriend.run('李明', '大明', 'male', 0, 1995, 9, 14, 0, '发小', '今天正好是他的公历生日！', '#18181b');

  // 2. 插入几条按天日程
  const todayStr = new Date().toISOString().slice(0, 10);
  const insertSchedule = db.prepare(`
    INSERT INTO schedules (date, title, description, priority, is_completed)
    VALUES (?, ?, ?, ?, ?)
  `);

  insertSchedule.run(todayStr, '取快递 & 准备生日贺卡', '下班后到菜鸟驿站拿定制相框', 'high', 0);
  insertSchedule.run(todayStr, '晚上与好友视频通话', '祝大明生日快乐', 'normal', 0);
  insertSchedule.run('2026-09-20', '挑选张伟的生日礼物', '看一看罗技或客制化机械键盘', 'normal', 0);
  insertSchedule.run('2026-10-01', '国庆假期第一天 & 聚会', '全天无闹钟休息', 'low', 0);

  console.log('初始演示数据插入完成！');
} else {
  console.log('数据库已有数据，跳过初始数据填充。');
}
