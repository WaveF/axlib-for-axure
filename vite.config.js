const path = require('path')
const { defineConfig } = require('vite')

const MODULE_NAME = 'axlib'
module.exports = defineConfig({
  build: {
    sourcemap: true,
    lib: {
      entry: path.resolve(__dirname, 'lib/main.js'),
      formats: ['es'],
      // formats: ['es', 'cjs', 'umd', 'iife'],
      name: MODULE_NAME,
      fileName: format => `axlib-v3.min.js`,
      // fileName: (format) => `${MODULE_NAME}.${format}.js`
    }
  }
})