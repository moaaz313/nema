/**
 * Resolve a public-folder path for the current Vite base.
 * @param {string} path e.g. "/images/photo-1.png" or "audio/music.m4a"
 */
export function assetUrl(path) {
  const normalized = path.replace(/^\//, '')
  return `${import.meta.env.BASE_URL}${normalized}`
}
