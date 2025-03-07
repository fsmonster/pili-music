# Bilibili Music Player

一个基于B站API的音乐播放器，可以播放B站收藏夹和合集中的音频。

## 项目结构

- `frontend`: Vue 3 + TypeScript + Element Plus 前端
- `backend`: Express.js 后端，用于代理B站API请求

## 本地开发

### 前端

```bash
cd frontend
npm install
npm run dev
```

### 后端

```bash
cd backend
npm install
npm run dev
```

## Docker部署

本项目支持使用Docker进行部署，使用docker-compose可以一键启动前后端服务。

```bash
# 构建并启动容器
docker-compose up -d --build

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down
```

## 技术栈

- 前端: Vue 3, TypeScript, Pinia, Element Plus
- 后端: Express.js, Axios
- 部署: Docker, Nginx

