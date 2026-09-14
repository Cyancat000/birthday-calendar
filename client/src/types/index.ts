export interface Friend {
  id: number;
  name: string;
  nickname?: string;
  gender?: 'male' | 'female' | 'unknown';
  is_lunar: number; // 0: 公历, 1: 农历
  birth_year?: number;
  birth_month: number;
  birth_day: number;
  is_leap_month: number;
  tags?: string;
  notes?: string;
  avatar_color?: string;
  created_at?: string;
  // 计算属性
  next_solar_date?: string;
  days_until?: number;
  next_age?: number;
  age?: number;
  zodiac?: string;
  constellation?: string;
}

export interface Schedule {
  id: number;
  date: string; // YYYY-MM-DD
  title: string;
  description?: string;
  priority: 'low' | 'normal' | 'high';
  is_completed: number; // 0 | 1
  created_at?: string;
}

export interface DayCalendarData {
  date: string;
  day: number;
  lunarDayName: string;
  lunarMonthName: string;
  jieQi: string | null;
  festivals: string[];
  friends: Friend[];
  schedules: Schedule[];
}
