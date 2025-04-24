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
        { find: "@Create_Template", replacement: "/src/Pages/Create_Template" },
        { find: "@public", replacement: "/public" },
        { find: "@Guide", replacement: "/src/Pages/Guide" },
        { find: "@Qa_Page", replacement: "/src/Pages/Qa_Page" },
        { find: "@ToBeApplied", replacement: "/src/Pages/ToBeApplied" },
        { find: "@Translation", replacement: "/src/Pages/Translation" },
        { find: "@Components", replacement: "/src/Components" },
        { find: "@Pages", replacement: "/src/Pages" },
        { find: "@Localization", replacement: "/src/Pages/Localization" },
        { find: "@DummyData", replacement: "/src/dummy_data" },
        { find: "@LocalizationComponent", replacement: "/src/Components/Localization" },
        { find: "@Hooks", replacement: "/src/hooks" },
      ],
      
    },
  })
}
