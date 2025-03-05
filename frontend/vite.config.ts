import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: [
      {
        find: '@',
        replacement: '/src'
      }
    ]
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
        configure: (proxy, _options) => {
          // 代理配置
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            // 将前端的 cookie 传递给后端
            if (req.headers.cookie) {
              proxyReq.setHeader('Cookie', req.headers.cookie);
            }
          });

          proxy.on('proxyRes', (proxyRes, _req, _res) => {
            // 将后端的 cookie 传递给前端
            const cookies = proxyRes.headers['set-cookie'];
            if (cookies) {
              // 修改 cookie 的 SameSite 属性为 Lax
              const modifiedCookies = cookies.map(cookie =>
                cookie.replace(/^SameSite=\w+/, 'SameSite=Lax')
              );
              proxyRes.headers['set-cookie'] = modifiedCookies;
            }
          });
        }
      },
      // 代理B站图片请求 - i0.hdslb.com
      '^/biliimg/i0/.*': {
        target: 'https://i0.hdslb.com',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/biliimg\/i0/, ''),
        headers: {
          'Referer': 'https://www.bilibili.com'
        }
      },
      // 代理B站图片请求 - i1.hdslb.com
      '^/biliimg/i1/.*': {
        target: 'https://i1.hdslb.com',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/biliimg\/i1/, ''),
        headers: {
          'Referer': 'https://www.bilibili.com'
        }
      },
      // 代理B站图片请求 - i2.hdslb.com
      '^/biliimg/i2/.*': {
        target: 'https://i2.hdslb.com',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/biliimg\/i2/, ''),
        headers: {
          'Referer': 'https://www.bilibili.com'
        }
      },
      // 代理 B站图片请求 - archive.biliimg.com
      '^/biliimg/archive/.*': {
        target: 'https://archive.biliimg.com',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/biliimg\/archive/, ''),
        headers: {
          'Referer': 'https://www.bilibili.com'
        }
      },
      // 代理 B站图片请求 - s1.hdslb.com
      '^/biliimg/s1/.*': {
        target: 'https://s1.hdslb.com',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/biliimg\/s1/, ''),
        headers: {
          'Referer': 'https://www.bilibili.com'
        }
      }
    }
  }
})
