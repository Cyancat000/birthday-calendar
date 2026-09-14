import type { Friend, Schedule, DayCalendarData } from '../types';

const API_BASE = '/api';

export const api = {
  // 好友接口
  async getFriends(): Promise<Friend[]> {
    const res = await fetch(`${API_BASE}/friends`);
    const json = await res.json();
    return json.data || [];
  },

  async createFriend(data: Partial<Friend>): Promise<Friend> {
    const res = await fetch(`${API_BASE}/friends`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || '创建失败');
    return json.data;
  },

  async updateFriend(id: number, data: Partial<Friend>): Promise<Friend> {
    const res = await fetch(`${API_BASE}/friends/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || '更新失败');
    return json.data;
  },

  async deleteFriend(id: number): Promise<void> {
    const res = await fetch(`${API_BASE}/friends/${id}`, { method: 'DELETE' });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || '删除失败');
  },

  // 日程接口
  async getSchedules(date?: string, month?: string): Promise<Schedule[]> {
    const params = new URLSearchParams();
    if (date) params.append('date', date);
    if (month) params.append('month', month);
    const res = await fetch(`${API_BASE}/schedules?${params.toString()}`);
    const json = await res.json();
    return json.data || [];
  },

  async createSchedule(data: Partial<Schedule>): Promise<Schedule> {
    const res = await fetch(`${API_BASE}/schedules`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || '创建失败');
    return json.data;
  },

  async updateSchedule(id: number, data: Partial<Schedule>): Promise<Schedule> {
    const res = await fetch(`${API_BASE}/schedules/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || '更新失败');
    return json.data;
  },

  async deleteSchedule(id: number): Promise<void> {
    const res = await fetch(`${API_BASE}/schedules/${id}`, { method: 'DELETE' });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || '删除失败');
  },

  // 月历聚合数据
  async getMonthData(year: number, month: number): Promise<{ [date: string]: DayCalendarData }> {
    const res = await fetch(`${API_BASE}/calendar/month-data?year=${year}&month=${month}`);
    const json = await res.json();
    return json.days || {};
  },

  // 备份与恢复
  async exportData(): Promise<any> {
    const res = await fetch(`${API_BASE}/export`);
    return await res.json();
  },

  async importData(data: any): Promise<void> {
    const res = await fetch(`${API_BASE}/import`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || '导入失败');
  }
};
