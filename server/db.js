const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const DATA_DIR = path.resolve(__dirname, '../data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const dbPath = path.join(DATA_DIR, 'calendar.db');
const db = new Database(dbPath);

// 开启 WAL 模式以提升并发与崩溃容灾能力
db.pragma('journal_mode = WAL');

// 初始化表结构
db.exec(`
  CREATE TABLE IF NOT EXISTS friends (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    nickname TEXT,
    gender TEXT DEFAULT 'unknown', -- 'male' | 'female' | 'unknown'
    is_lunar INTEGER NOT NULL DEFAULT 0, -- 0: 公历, 1: 农历
    birth_year INTEGER, -- 出生年份，可选（填了可算周岁和生肖）
    birth_month INTEGER NOT NULL, -- 出生月份 (1-12)
    birth_day INTEGER NOT NULL, -- 出生日期 (1-31)
    is_leap_month INTEGER NOT NULL DEFAULT 0, -- 若农历是否为闰月 (0: 否, 1: 是)
    tags TEXT, -- 标签，如 '家人', '朋友', '同事'
    notes TEXT, -- 备注，如喜欢吃什么、忌口等
    avatar_color TEXT, -- 头像背景色调 (黑白灰或低饱和色)
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS schedules (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL, -- 纯日期 YYYY-MM-DD
    title TEXT NOT NULL,
    description TEXT,
    priority TEXT DEFAULT 'normal', -- 'low', 'normal', 'high'
    is_completed INTEGER NOT NULL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX IF NOT EXISTS idx_schedules_date ON schedules(date);
  CREATE INDEX IF NOT EXISTS idx_friends_birth ON friends(birth_month, birth_day);
`);

module.exports = db;
