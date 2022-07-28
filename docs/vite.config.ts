import { defineConfig } from 'vite'
import Components from 'unplugin-vue-components/vite'
import Unocss from 'unocss/vite'

import presetUno from '@unocss/preset-uno'

export default defineConfig({
  plugins: [
    Components({
      include: [/\.vue/, /\.md/],
      dirs: '.vitepress/components',
      dts: '.vitepress/components.d.ts',
    }),
    Unocss({
      presets: [
        presetUno(),
      ],
    })
  ],
})
