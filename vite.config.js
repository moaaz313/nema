import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

/** GitHub Pages project site: https://moaaz313.github.io/nema/ */
const GITHUB_PAGES_BASE = '/nema/'

/** Serve .m4a with audio/mp4 so browsers decode voice notes correctly */
function m4aMimePlugin() {
  const setMime = (req, res, next) => {
    if (req.url && /\.m4a($|\?)/i.test(req.url)) {
      res.setHeader('Content-Type', 'audio/mp4')
    }
    next()
  }
  return {
    name: 'm4a-mime',
    configureServer(server) {
      server.middlewares.use(setMime)
    },
    configurePreviewServer(server) {
      server.middlewares.use(setMime)
    },
  }
}

export default defineConfig(({ command }) => ({
  // Dev: '/' so http://localhost:5173/ works. Build/preview: '/nema/' for GitHub Pages.
  base: command === 'serve' ? '/' : GITHUB_PAGES_BASE,
  plugins: [vue(), tailwindcss(), m4aMimePlugin()],
}))
