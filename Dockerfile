FROM node:20-alpine AS builder

WORKDIR /app

# 复制并构建前端
COPY client/package*.json ./client/
RUN cd client && npm install

COPY client ./client
RUN cd client && npm run build

# 安装后端生产依赖
COPY package*.json ./
RUN npm install --omit=dev

COPY server ./server
COPY README.md ./

EXPOSE 24840
ENV NODE_ENV=production
ENV PORT=24840

CMD ["node", "server/index.js"]
