import path from 'path'
import {defineConfig} from 'vite'
import monkey, {cdn} from 'vite-plugin-monkey'
import packageJson from './package.json'

// https://vitejs.dev/config/
export default defineConfig({
  esbuild: {
    jsxFactory: 'VM.h',
    jsxFragment: 'VM.Fragment',
    jsx: 'transform',
  },
  resolve: {
    alias: [
      {
        find: '@',
        replacement: path.resolve(__dirname, './src/'),
      },
    ],
  },
  plugins: [
    monkey({
      entry: 'src/main.jsx',
      userscript: {
        name: '原神米游社大地图更换宝箱标点样式',
        version: packageJson.version,
        author: 'WEGFan',
        description: '原神米游社大地图实时切换解谜宝箱的标点样式，可选择显示品质或获取方式',
        icon: 'https://webstatic.mihoyo.com/ys/app/interactive-map/mapicon.png',
        namespace: 'wegfan/genshin-impact-map-toggle-chest-marker-style',
        match: [
          'https://webstatic.mihoyo.com/ys/app/interactive-map/*',
        ],
        homepage: 'https://github.com/WEGFan/Genshin-Impact-Map-Toggle-Chest-Marker-Style',
        supportURL: 'https://github.com/WEGFan/Genshin-Impact-Map-Toggle-Chest-Marker-Style/issues',
      },
      build: {
        externalGlobals: {
          '@violentmonkey/dom': cdn.jsdelivr(`VM`, `dist/index.js`),
        },
      },
    }),
  ],
})
