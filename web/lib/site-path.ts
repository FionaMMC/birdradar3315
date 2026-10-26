/** Public-file and native-link paths; Next Link/router add basePath themselves. */
const BASE_PATH = (process.env.NEXT_PUBLIC_BASE_PATH ?? "").replace(/\/+$/, "");

/** Prefix root-relative paths without changing external, relative or fragment URLs. */
export function sitePath(path: string): string {
  if (!BASE_PATH || !path.startsWith("/") || path.startsWith("//")) return path;
  if (path === BASE_PATH || path.startsWith(`${BASE_PATH}/`) || path.startsWith(`${BASE_PATH}?`) || path.startsWith(`${BASE_PATH}#`)) return path;
  return `${BASE_PATH}${path}`;
}

export function assetUrl(path: string): string {
  return sitePath(path);
}

/** Keep map return URLs in the same logical route space as Next Link/router. */
export function stripBasePath(path: string): string {
  if (!BASE_PATH) return path;
  if (path === BASE_PATH) return "/";
  if (path.startsWith(`${BASE_PATH}/`)) return path.slice(BASE_PATH.length);
  if (path.startsWith(`${BASE_PATH}?`) || path.startsWith(`${BASE_PATH}#`)) return `/${path.slice(BASE_PATH.length)}`;
  return path;
}
