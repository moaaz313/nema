import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

/** Root-relative base for local dev and most hosts. Set to `/<repo-name>/` for GitHub Pages project sites. */
const BASE = '/'

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

export default defineConfig({
  base: BASE,
  plugins: [vue(), tailwindcss(), m4aMimePlugin()],
})
