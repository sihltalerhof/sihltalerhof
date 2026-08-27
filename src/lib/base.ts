/**
 * Prefixes a root-relative path with Astro's configured `base`, so internal
 * links and asset URLs work both when deployed at the domain root and when
 * deployed under a GitHub Pages project subpath (e.g. /sihltalerhof/).
 */
export function withBase(path: string): string {
  const base = import.meta.env.BASE_URL.replace(/\/+$/, '');
  const cleanPath = path.replace(/^\/+/, '');
  return cleanPath ? `${base}/${cleanPath}` : `${base}/`;
}
