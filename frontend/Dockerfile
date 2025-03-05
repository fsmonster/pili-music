# 构建阶段
FROM node:20-alpine AS build

# 设置工作目录
WORKDIR /app

# 复制package.json和package-lock.json
COPY package*.json ./

# 安装依赖
RUN npm ci

# 复制所有文件
COPY . .

# 构建应用
RUN npm run build

# 生产阶段
FROM nginx:stable-alpine

# 复制构建文件到Nginx服务目录
COPY --from=build /app/dist /usr/share/nginx/html

# 删除默认的nginx配置
RUN rm /etc/nginx/conf.d/default.conf

# 复制自定义的nginx配置
# 注意：nginx.conf将通过docker-compose的volumes挂载

# 暴露80端口
EXPOSE 80

# 启动Nginx
CMD ["nginx", "-g", "daemon off;"]
