import gfm from '@bytemd/plugin-gfm'
import highlight from '@bytemd/plugin-highlight-ssr'
import math from '@bytemd/plugin-math-ssr'
import mediumZoom from '@bytemd/plugin-medium-zoom'
import zhCN from 'bytemd/locales/zh_Hans.json'

export const mdPlugins = {
  plugins: [ 
    gfm(),
    highlight(),
    math(),
    mediumZoom()
  ],
  language: zhCN
}