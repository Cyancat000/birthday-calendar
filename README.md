# 农历好友生日与按天日程日历 (Lunar Birthday Calendar)

现代浅色黑白灰极简风格，专为记录好友生日（公历/农历双轨推算）与按天日程待办而打造的移动端优先全栈 Web 应用。

---

## ✨ 核心特性

- 🌙 **公历与传统农历双轨支持**：
  - 完美支持公历、农历（含闰月）生日；
  - 自动实时推算下一次生日对应的公历日期、距今天数倒计时；
  - 自动推算即将迎来的实岁/周岁、出生生肖、公历星座。
- 📅 **纯按天日程待办**：
  - 专为按天规划打造，去除冗余的小时分钟设置，专注当天安排；
  - 支持优先级标记与一键完成打勾，清爽利落。
- 📱 **移动端优先与弹性布局（Anti-Overflow Architecture）**：
  - 月历网格严格固定单元格比例与高度（`h-14 sm:h-16`），节日/节气/农历单行溢出截断；
  - 采用黑白灰微型状态点（Dots）指示生日与日程，彻底杜绝小屏文本折行把日历撑高变形的通病；
  - 移动端支持「月历模式」与「近期生日流 (Timeline)」一键切换。
- 🖤 **浅色黑白灰现代美学 (Modern Monochrome)**：
  - 高级黑白灰阶（Zinc 50~900），搭配 Lucide 精致图标集与细腻微动效。
- 💾 **数据服务端持久化与备份**：
  - 基于 SQLite (`better-sqlite3`) 本地文件持久化，超轻量，极度节省服务器内存；
  - 支持一键导出 JSON 备份与 JSON 导入恢复。

---

## 🛠️ 技术栈选型

- **前端**：React 19 + TypeScript + Vite + Tailwind CSS + Lucide Icons + `lunar-javascript`
- **后端**：Node.js + Express + SQLite (`better-sqlite3`)
- **数据结构**：单仓全栈 (Single-Repo Fullstack)，前端编译后直接由后端静态托管，单个进程即可跑完所有功能。

---

## 🚀 快速启动指南

### 1. 克隆仓库与安装依赖

```bash
git clone git@github.com:Cyancat000/birthday-calendar.git
cd birthday-calendar

# 安装根目录及后端依赖
npm install

# 安装前端依赖
cd client && npm install && cd ..
```

### 2. 生产运行 (最简一键运行)

```bash
# 编译前端并启动全栈服务（默认端口 24840，可通过 PORT=xxxx 指定）
npm run build
npm start
```

访问 `http://localhost:24840` 即可使用！

### 3. 本地开发模式

```bash
# 同时启动后端热重载与前端 Vite 调试服务器
npm run dev
```

---

## 📦 Docker 部署 (可选)

项目根目录包含标准 Dockerfile，可一键容器化打包运行：

```bash
docker build -t lunar-calendar .
docker run -d -p 24840:24840 -v $(pwd)/data:/app/data --name lunar-calendar lunar-calendar
```

---

## 📄 许可证

MIT License.
