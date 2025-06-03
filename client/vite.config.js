import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import svgr from 'vite-plugin-svgr'

export default ({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return defineConfig({
    plugins: [
      react(),
      svgr({
        svgrOptions: {},
      }),
    ],
    base: '/', // 기본값 확인
    define: {
      'process.env': env,
    },
    resolve: {
      alias: [
        { find: "@", replacement: "/src" },
        { find: "@EditTemplate", replacement: "/src/Pages/EditTemplate" },
        { find: "@public", replacement: "/public" },
        { find: "@Guide", replacement: "/src/Pages/Guide" },
        { find: "@Qa_Page", replacement: "/src/Pages/Qa_Page" },
        { find: "@ApplyTemplate", replacement: "/src/Pages/ApplyTemplate" },
        { find: "@Components", replacement: "/src/Components" },
        { find: "@Pages", replacement: "/src/Pages" },
        { find: "@EditLocalizationEntries", replacement: "/src/Pages/EditLocalizationEntries" },
      ],
      
    },
  })
}
