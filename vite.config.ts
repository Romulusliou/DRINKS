
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // 透過 @types/node，這裡的 process.cwd() 現在是合法的 TS 語法
  const env = loadEnv(mode, process.cwd(), '');
  return {
    // Vercel 部署通常使用根目錄，因此移除 '/DRINKS/' 設定
    plugins: [react()],
    define: {
      // 讓前端程式碼可以使用 process.env.API_KEY
      'process.env.API_KEY': JSON.stringify(env.API_KEY)
    }
  }
})
