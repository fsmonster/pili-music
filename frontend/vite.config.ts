import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vitePluginVueDevtools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), vitePluginVueDevtools()],
  resolve: {
    alias: [
      {
        find: '@',
        replacement: '/src'
      }
    ]
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@use "@/assets/styles/index.scss" as *;`
      }
    }
  },
  server: {
    proxy: {
      // B 站 API 代理（不需要 Cookie 的请求）
      '^/biliapi/.*': {
        target: 'https://api.bilibili.com',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/biliapi/, '/x'), // 只去掉 `/biliapi`
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Referer': 'https://www.bilibili.com',
        },
      },
      
      // 本地 API 代理
      '^/api/.*': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
        // 简化代理配置，移除 Cookie 相关处理
        configure: (proxy, _options) => {
          // JWT 认证不需要处理 Cookie
          proxy.on('error', (err, _req, _res) => {
            console.error('代理请求错误:', err);
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
  },
  // 生产环境配置
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    // 生成环境移除 console 和 debugger
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    // 设置静态资源的基础路径
    // 在生产环境中，资源将从 /assets/ 路径加载
    // 这与 Nginx 配置中的路径对应
    assetsInlineLimit: 4096,
  }
})
