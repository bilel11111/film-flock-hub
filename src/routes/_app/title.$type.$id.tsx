import { createFileRoute, Link } from "@tanstack/react-router";
import { Suspense } from "react";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { tmdbDetail } from "@/lib/tmdb.functions";
import { backdropUrl, posterUrl, titleOf, yearOf } from "@/lib/tmdb-utils";
import { Button } from "@/components/ui/button";
import { MovieCard } from "@/components/movie-card";
import { Play, Star, Calendar, Clock, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/_app/title/$type/$id")({
  parseParams: ({ type, id }) => ({ type: type as "movie" | "tv", id: Number(id) }),
  loader: () => null,
  component: TitlePage,
});

function TitlePage() {
  const { type, id } = Route.useParams();
  const fn = useServerFn(tmdbDetail);
  const opts = queryOptions({
    queryKey: ["tmdb", type, id],
    queryFn: () => fn({ data: { type, id } }),
    staleTime: 1000 * 60 * 10,
  });
  return (
    <Suspense fallback={<div className="text-muted-foreground">Loading…</div>}>
      <Inner opts={opts} type={type} id={id} />
    </Suspense>
  );
}

function Inner({ opts, type, id }: { opts: any; type: "movie" | "tv"; id: number }) {
  const { data } = useSuspenseQuery(opts) as { data: any };
  const d = data.detail;
  const trailer = data.videos.find((v: any) => v.site === "YouTube" && v.type === "Trailer");
  const bg = backdropUrl(d.backdrop_path);
  const poster = posterUrl(d.poster_path, "w500");
  const runtime = d.runtime ?? d.episode_run_time?.[0];

  // Curated watch link
  const [watchUrl, setWatchUrl] = useState<string | null>(null);
  useEffect(() => {
    supabase.from("curated_movies").select("watch_url").eq("tmdb_id", id).eq("media_type", type).maybeSingle()
      .then(({ data }) => setWatchUrl(data?.watch_url ?? null));
  }, [id, type]);

  async function setWatching() {
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) return;
    await supabase.from("profiles").update({
      watching_title: titleOf(d),
      watching_tmdb_id: id,
      watching_type: type,
      watching_updated_at: new Date().toISOString(),
    }).eq("id", u.user.id);
    toast.success(`Now watching: ${titleOf(d)}`);
  }

  return (
    <div className="space-y-10 -mt-6">
      <section className="relative -mx-4 sm:-mx-6 h-[50vh] min-h-[360px] overflow-hidden">
        {bg && <img src={bg} alt="" className="absolute inset-0 h-full w-full object-cover" />}
        <div className="absolute inset-0 bg-gradient-hero" />
      </section>

      <section className="grid md:grid-cols-[200px_1fr] gap-6 -mt-32 relative z-10">
        {poster && <img src={poster} alt={titleOf(d)} className="w-44 md:w-full rounded-xl shadow-elevated" />}
        <div>
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-balance">{titleOf(d)}</h1>
          {d.tagline && <p className="mt-1 italic text-muted-foreground">{d.tagline}</p>}
          <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            {d.vote_average ? <span className="flex items-center gap-1"><Star className="h-4 w-4 fill-primary text-primary" />{d.vote_average.toFixed(1)}</span> : null}
            <span className="flex items-center gap-1"><Calendar className="h-4 w-4" />{yearOf(d)}</span>
            {runtime ? <span className="flex items-center gap-1"><Clock className="h-4 w-4" />{runtime}m</span> : null}
            {d.genres?.map((g: any) => <span key={g.id} className="px-2 py-0.5 rounded-full bg-secondary text-xs">{g.name}</span>)}
          </div>
          <p className="mt-4 text-base leading-relaxed max-w-3xl">{d.overview}</p>

          <div className="mt-6 flex flex-wrap gap-3">
            {watchUrl ? (
              <a href={watchUrl} target="_blank" rel="noreferrer">
                <Button size="lg" className="bg-gradient-primary shadow-glow"><Play className="h-4 w-4 fill-current" />Watch now</Button>
              </a>
            ) : trailer ? (
              <a href={`https://www.youtube.com/watch?v=${trailer.key}`} target="_blank" rel="noreferrer">
                <Button size="lg" className="bg-gradient-primary shadow-glow"><Play className="h-4 w-4 fill-current" />Watch trailer</Button>
              </a>
            ) : null}
            <Button size="lg" variant="secondary" onClick={setWatching}>Set as "Now watching"</Button>
            <Link to="/messages"><Button size="lg" variant="outline"><Send className="h-4 w-4" />Share with friend</Button></Link>
          </div>
        </div>
      </section>

      {data.credits?.cast?.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold mb-4">Cast</h2>
          <div className="flex gap-4 overflow-x-auto scrollbar-hide -mx-4 px-4 pb-2">
            {data.credits.cast.slice(0, 15).map((c: any) => (
              <div key={c.id} className="w-[110px] shrink-0">
                <div className="aspect-[2/3] rounded-lg overflow-hidden bg-surface-elevated">
                  {c.profile_path ? <img src={posterUrl(c.profile_path, "w185") ?? ""} alt={c.name} loading="lazy" className="h-full w-full object-cover" /> : <div className="h-full w-full flex items-center justify-center text-xs text-muted-foreground">?</div>}
                </div>
                <p className="mt-2 text-sm font-medium line-clamp-1">{c.name}</p>
                <p className="text-xs text-muted-foreground line-clamp-1">{c.character}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {data.similar?.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-2xl font-bold">More like this</h2>
          <div className="flex gap-3 sm:gap-4 overflow-x-auto scrollbar-hide -mx-4 px-4 pb-2">
            {data.similar.map((it: any) => <MovieCard key={it.id} item={{ ...it, media_type: type }} />)}
          </div>
        </section>
      )}
    </div>
  );
}
