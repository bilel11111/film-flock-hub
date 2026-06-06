export const TMDB_IMG = "https://image.tmdb.org/t/p";

export function posterUrl(path: string | null | undefined, size: "w185" | "w342" | "w500" | "original" = "w500") {
  if (!path) return null;
  return `${TMDB_IMG}/${size}${path}`;
}

export function backdropUrl(path: string | null | undefined, size: "w780" | "w1280" | "original" = "original") {
  if (!path) return null;
  return `${TMDB_IMG}/${size}${path}`;
}

export function titleOf(item: any): string {
  return item?.title || item?.name || "Untitled";
}

export function yearOf(item: any): string {
  const d = item?.release_date || item?.first_air_date;
  return d ? String(d).slice(0, 4) : "";
}

export function mediaTypeOf(item: any): "movie" | "tv" {
  if (item?.media_type === "tv" || item?.first_air_date) return "tv";
  return "movie";
}
