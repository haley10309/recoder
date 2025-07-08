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
        { find: "@public", replacement: "/public" },
        { find: "@Pages", replacement: "/src/Pages" },
        { find: "@Components", replacement: "/src/Components" },
        { find: "@ManageTemplates", replacement: "/src/Pages/ManageTemplates" },
        { find: "@ManageLocalizationEntries", replacement: "/src/Pages/ManageLocalizationEntries" },
        { find: "@TemplateMapping", replacement: "/src/Pages/TemplateMapping" },
        { find: "@Qa_Page", replacement: "/src/Pages/Qa_Page" },
        { find: "@Guide", replacement: "/src/Pages/Guide" },
      ],
    },
  })
}
