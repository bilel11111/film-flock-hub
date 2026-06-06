import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const TMDB_BASE = "https://api.themoviedb.org/3";

async function tmdb<T>(path: string, params: Record<string, string | number> = {}): Promise<T> {
  const token = process.env.TMDB_READ_TOKEN;
  if (!token) throw new Error("TMDB_READ_TOKEN is not configured");
  const url = new URL(`${TMDB_BASE}${path}`);
  url.searchParams.set("language", "en-US");
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, String(v));
  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${token}`, accept: "application/json" },
  });
  if (!res.ok) throw new Error(`TMDB ${res.status}`);
  return (await res.json()) as T;
}

export const tmdbHome = createServerFn({ method: "GET" }).handler(async () => {
  const [trending, popularMovies, popularTv, topMovies] = await Promise.all([
    tmdb<{ results: any[] }>("/trending/all/week"),
    tmdb<{ results: any[] }>("/movie/popular"),
    tmdb<{ results: any[] }>("/tv/popular"),
    tmdb<{ results: any[] }>("/movie/top_rated"),
  ]);
  return {
    trending: trending.results.slice(0, 20),
    popularMovies: popularMovies.results.slice(0, 20),
    popularTv: popularTv.results.slice(0, 20),
    topMovies: topMovies.results.slice(0, 20),
  };
});

export const tmdbSearch = createServerFn({ method: "POST" })
  .inputValidator(z.object({ query: z.string().min(1).max(200) }))
  .handler(async ({ data }) => {
    const res = await tmdb<{ results: any[] }>("/search/multi", { query: data.query });
    return { results: res.results.filter((r: any) => r.media_type !== "person").slice(0, 30) };
  });

export const tmdbDetail = createServerFn({ method: "POST" })
  .inputValidator(z.object({ type: z.enum(["movie", "tv"]), id: z.number().int() }))
  .handler(async ({ data }) => {
    const [detail, credits, videos, similar] = await Promise.all([
      tmdb<any>(`/${data.type}/${data.id}`),
      tmdb<any>(`/${data.type}/${data.id}/credits`),
      tmdb<any>(`/${data.type}/${data.id}/videos`),
      tmdb<any>(`/${data.type}/${data.id}/similar`),
    ]);
    return { detail, credits, videos: videos.results, similar: similar.results.slice(0, 12) };
  });
