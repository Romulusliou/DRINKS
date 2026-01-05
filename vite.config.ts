
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Cast process to any to resolve TS error: Property 'cwd' does not exist on type 'Process'
  const env = loadEnv(mode, (process as any).cwd(), '');
  return {
    // 重要：為了讓 GitHub Pages (https://username.github.io/REPO_NAME/) 能正常運作，
    // 必須設定 base 為 '/REPO_NAME/'。根據您的網址，這裡是 '/DRINKS/'。
    base: '/DRINKS/',
    plugins: [react()],
    define: {
      // 讓前端程式碼可以使用 process.env.API_KEY
      'process.env.API_KEY': JSON.stringify(env.API_KEY)
    }
  }
})
