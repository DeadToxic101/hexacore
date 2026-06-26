import { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    resolve: { alias: { '@shared': resolve('src/shared'), '@main': resolve('src/main') } },
    build: { outDir: 'out/main', lib: { entry: resolve('src/main/main.ts') } }
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
    resolve: { alias: { '@shared': resolve('src/shared'), '@main': resolve('src/main') } },
    build: { outDir: 'out/preload', lib: { entry: resolve('src/main/preload.ts') } }
  },
  renderer: {
    root: '.',
    resolve: { alias: { '@shared': resolve('src/shared'), '@renderer': resolve('src/renderer') } },
    plugins: [react()],
    build: {
      outDir: 'out/renderer',
      rollupOptions: { input: { index: resolve('index.html') } }
    }
  }
})
