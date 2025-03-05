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

## Zeabur部署

### 准备工作

1. 注册[Zeabur](https://zeabur.com)账号
2. 创建一个新项目
3. 将代码推送到GitHub仓库

### 部署步骤

1. 在Zeabur控制台中，点击"创建服务"
2. 选择"从GitHub导入"，并选择你的仓库
3. Zeabur会自动检测到Dockerfile，选择使用Docker部署
4. 设置环境变量：
   - `NODE_ENV`: production
   - `PORT`: 3000（后端服务端口）
   - 在后端服务的CORS配置中，将你的Zeabur域名添加到允许列表中

### 自定义域名

1. 在Zeabur控制台中，点击"域名"选项卡
2. 添加你的自定义域名
3. 按照指引配置DNS记录
4. 等待DNS生效后，你的应用就可以通过自定义域名访问了

### 注意事项

1. 在生产环境中，请确保更新后端的CORS配置，将你的Zeabur域名添加到允许列表中
2. 如果遇到跨域问题，请检查Nginx配置和后端CORS配置
3. B站API可能会有变化，如果遇到API请求失败，请检查B站API的最新文档

## 技术栈

- 前端: Vue 3, TypeScript, Pinia, Element Plus
- 后端: Express.js, Axios
- 部署: Docker, Nginx, Zeabur

## 许可证

MIT
