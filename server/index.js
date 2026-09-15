const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./db');
const { calculateNextBirthday, formatDate, padZero } = require('./birthdayUtils');
const { Solar, Lunar } = require('lunar-javascript');

const app = express();
const PORT = process.env.PORT || 24840;

app.use(cors());
app.use(express.json());

// 静态托管前端生产构建（如果存在）
const CLIENT_DIST = path.resolve(__dirname, '../client/dist');
app.use(express.static(CLIENT_DIST));

// ==================== 1. 好友生日 API ====================

// 获取所有好友列表（附带下一次生日倒计时、生肖、星座等计算属性）
app.get('/api/friends', (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM friends ORDER BY id DESC').all();
    const friendsWithNext = rows.map((f) => calculateNextBirthday(f));
    
    // 默认按照距下一次生日天数升序排序
    friendsWithNext.sort((a, b) => a.days_until - b.days_until);
    
    res.json({ success: true, data: friendsWithNext });
  } catch (err) {
    console.error('Error fetching friends:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 新增好友生日
app.post('/api/friends', (req, res) => {
  try {
    const {
      name,
      nickname,
      gender = 'unknown',
      is_lunar = 0,
      birth_year,
      birth_month,
      birth_day,
      is_leap_month = 0,
      tags,
      notes,
      avatar_color,
      avatar_seed,
    } = req.body;

    if (!name || !birth_month || !birth_day) {
      return res.status(400).json({ success: false, error: '姓名、月份、日期为必填项' });
    }

    const stmt = db.prepare(`
      INSERT INTO friends (
        name, nickname, gender, is_lunar, birth_year, birth_month, birth_day,
        is_leap_month, tags, notes, avatar_color, avatar_seed
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const info = stmt.run(
      name.trim(),
      nickname ? nickname.trim() : null,
      gender,
      is_lunar ? 1 : 0,
      birth_year ? parseInt(birth_year, 10) : null,
      parseInt(birth_month, 10),
      parseInt(birth_day, 10),
      is_leap_month ? 1 : 0,
      tags ? tags.trim() : null,
      notes ? notes.trim() : null,
      avatar_color || null,
      avatar_seed ? avatar_seed.trim() : null
    );

    const newRecord = db.prepare('SELECT * FROM friends WHERE id = ?').get(info.lastInsertRowid);
    const calculated = calculateNextBirthday(newRecord);
    res.json({ success: true, data: calculated });
  } catch (err) {
    console.error('Error creating friend:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 修改好友
app.put('/api/friends/:id', (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      nickname,
      gender,
      is_lunar,
      birth_year,
      birth_month,
      birth_day,
      is_leap_month,
      tags,
      notes,
      avatar_color,
      avatar_seed,
    } = req.body;

    const stmt = db.prepare(`
      UPDATE friends SET
        name = COALESCE(?, name),
        nickname = COALESCE(?, nickname),
        gender = COALESCE(?, gender),
        is_lunar = COALESCE(?, is_lunar),
        birth_year = ?,
        birth_month = COALESCE(?, birth_month),
        birth_day = COALESCE(?, birth_day),
        is_leap_month = COALESCE(?, is_leap_month),
        tags = ?,
        notes = ?,
        avatar_color = ?,
        avatar_seed = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    stmt.run(
      name ? name.trim() : null,
      nickname !== undefined ? nickname : null,
      gender || null,
      is_lunar !== undefined ? (is_lunar ? 1 : 0) : null,
      birth_year ? parseInt(birth_year, 10) : null,
      birth_month ? parseInt(birth_month, 10) : null,
      birth_day ? parseInt(birth_day, 10) : null,
      is_leap_month !== undefined ? (is_leap_month ? 1 : 0) : null,
      tags !== undefined ? tags : null,
      notes !== undefined ? notes : null,
      avatar_color || null,
      avatar_seed !== undefined ? (avatar_seed ? avatar_seed.trim() : null) : null,
      id
    );

    const updated = db.prepare('SELECT * FROM friends WHERE id = ?').get(id);
    if (!updated) {
      return res.status(404).json({ success: false, error: '未找到该好友' });
    }
    res.json({ success: true, data: calculateNextBirthday(updated) });
  } catch (err) {
    console.error('Error updating friend:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 删除好友
app.delete('/api/friends/:id', (req, res) => {
  try {
    const { id } = req.params;
    db.prepare('DELETE FROM friends WHERE id = ?').run(id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==================== 2. 按天日程 API ====================

// 获取指定月份或时间范围的日程
app.get('/api/schedules', (req, res) => {
  try {
    const { month, date } = req.query; // month 形如 2026-09，date 形如 2026-09-14
    let rows;
    if (date) {
      rows = db.prepare('SELECT * FROM schedules WHERE date = ? ORDER BY id ASC').all(date);
    } else if (month) {
      rows = db.prepare('SELECT * FROM schedules WHERE date LIKE ? ORDER BY date ASC, id ASC').all(`${month}%`);
    } else {
      rows = db.prepare('SELECT * FROM schedules ORDER BY date DESC, id DESC LIMIT 200').all();
    }
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 新增按天日程
app.post('/api/schedules', (req, res) => {
  try {
    const { date, title, description, priority = 'normal' } = req.body;
    if (!date || !title) {
      return res.status(400).json({ success: false, error: '日期和标题为必填项' });
    }

    const stmt = db.prepare(`
      INSERT INTO schedules (date, title, description, priority, is_completed)
      VALUES (?, ?, ?, ?, 0)
    `);

    const info = stmt.run(date, title.trim(), description ? description.trim() : '', priority);
    const newRecord = db.prepare('SELECT * FROM schedules WHERE id = ?').get(info.lastInsertRowid);
    res.json({ success: true, data: newRecord });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 更新日程（勾选完成状态、修改内容）
app.put('/api/schedules/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, priority, is_completed, date } = req.body;

    const stmt = db.prepare(`
      UPDATE schedules SET
        title = COALESCE(?, title),
        description = COALESCE(?, description),
        priority = COALESCE(?, priority),
        is_completed = COALESCE(?, is_completed),
        date = COALESCE(?, date),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    stmt.run(
      title !== undefined ? title.trim() : null,
      description !== undefined ? description.trim() : null,
      priority !== undefined ? priority : null,
      is_completed !== undefined ? (is_completed ? 1 : 0) : null,
      date !== undefined ? date : null,
      id
    );

    const updated = db.prepare('SELECT * FROM schedules WHERE id = ?').get(id);
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 删除日程
app.delete('/api/schedules/:id', (req, res) => {
  try {
    const { id } = req.params;
    db.prepare('DELETE FROM schedules WHERE id = ?').run(id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==================== 3. 聚合视图 API：获取月历元数据与事件点 ====================
// 传入 year & month，返回当月每天的好友生日（已将公历/农历换算为当月具体某天）与日程摘要
app.get('/api/calendar/month-data', (req, res) => {
  try {
    const year = parseInt(req.query.year, 10) || new Date().getFullYear();
    const month = parseInt(req.query.month, 10) || (new Date().getMonth() + 1);

    const monthStr = `${year}-${padZero(month)}`;
    const schedules = db.prepare('SELECT * FROM schedules WHERE date LIKE ?').all(`${monthStr}%`);
    const allFriends = db.prepare('SELECT * FROM friends').all();

    // 计算当月有多少天
    const daysInMonth = new Date(year, month, 0).getDate();
    const resultByDay = {};

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = formatDate(year, month, day);
      const solar = Solar.fromYmd(year, month, day);
      const lunar = solar.getLunar();

      resultByDay[dateStr] = {
        date: dateStr,
        day,
        lunarDayName: lunar.getDayInChinese(), // 如 '初一'、'十五'
        lunarMonthName: lunar.getMonthInChinese() + '月',
        jieQi: lunar.getJieQi() || null, // 节气（如 '秋分'）
        festivals: [
          ...solar.getFestivals(),
          ...lunar.getFestivals(),
        ],
        friends: [],
        schedules: [],
      };
    }

    // 填充日程
    schedules.forEach((sch) => {
      if (resultByDay[sch.date]) {
        resultByDay[sch.date].schedules.push(sch);
      }
    });

    // 匹配好友生日（公历直接比对月份日期，农历换算后比对）
    allFriends.forEach((friend) => {
      if (!friend.is_lunar) {
        // 公历生日：如果月份匹配
        if (friend.birth_month === month) {
          let d = friend.birth_day;
          if (month === 2 && d === 29 && daysInMonth === 28) d = 28;
          const key = formatDate(year, month, d);
          if (resultByDay[key]) {
            resultByDay[key].friends.push({
              ...friend,
              age: friend.birth_year ? year - friend.birth_year : null,
            });
          }
        }
      } else {
        // 农历生日：需要计算当前公历月内每一天的农历是否和好友农历出生月日一致
        // 优化方案：直接查当月第一天与最后一天的农历，在范围内匹配
        for (let day = 1; day <= daysInMonth; day++) {
          const solar = Solar.fromYmd(year, month, day);
          const lunar = solar.getLunar();
          const lMonth = lunar.getMonth(); // 负数代表闰月
          const lDay = lunar.getDay();

          let match = false;
          if (friend.is_leap_month) {
            // 如果出生在闰月，必须月份绝对值相同且为闰月，若当年没有对应闰月则不计（或在平月由下一次生日逻辑统一处理）
            if (Math.abs(lMonth) === friend.birth_month && lDay === friend.birth_day) {
              match = true;
            }
          } else {
            // 平月
            if (lMonth === friend.birth_month && lDay === friend.birth_day) {
              match = true;
            }
          }

          if (match) {
            const key = formatDate(year, month, day);
            resultByDay[key].friends.push({
              ...friend,
              age: friend.birth_year ? year - friend.birth_year : null,
            });
          }
        }
      }
    });

    res.json({
      success: true,
      year,
      month,
      days: resultByDay,
    });
  } catch (err) {
    console.error('Error in month-data:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==================== 4. 数据导入/导出与测试预置 ====================
app.get('/api/export', (req, res) => {
  try {
    const friends = db.prepare('SELECT * FROM friends').all();
    const schedules = db.prepare('SELECT * FROM schedules').all();
    res.json({
      success: true,
      data: {
        friends,
        schedules,
        export_time: new Date().toISOString(),
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/import', (req, res) => {
  try {
    const { friends, schedules } = req.body;
    const insertFriend = db.prepare(`
      INSERT INTO friends (name, nickname, gender, is_lunar, birth_year, birth_month, birth_day, is_leap_month, tags, notes, avatar_color)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const insertSchedule = db.prepare(`
      INSERT INTO schedules (date, title, description, priority, is_completed)
      VALUES (?, ?, ?, ?, ?)
    `);

    const transaction = db.transaction(() => {
      if (Array.isArray(friends)) {
        for (const f of friends) {
          insertFriend.run(
            f.name, f.nickname || null, f.gender || 'unknown', f.is_lunar ? 1 : 0,
            f.birth_year || null, f.birth_month, f.birth_day, f.is_leap_month ? 1 : 0,
            f.tags || null, f.notes || null, f.avatar_color || null
          );
        }
      }
      if (Array.isArray(schedules)) {
        for (const s of schedules) {
          insertSchedule.run(s.date, s.title, s.description || '', s.priority || 'normal', s.is_completed ? 1 : 0);
        }
      }
    });

    transaction();
    res.json({ success: true, message: '导入成功' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 捕获所有前端单页路由
app.get('*', (req, res) => {
  const indexPath = path.join(CLIENT_DIST, 'index.html');
  if (require('fs').existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.json({ message: 'Lunar Birthday Calendar API server running' });
  }
});

app.listen(PORT, '127.0.0.1', () => {
  console.log(`Calendar Backend running on http://127.0.0.1:${PORT}`);
});
