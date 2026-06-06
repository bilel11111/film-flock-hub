import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { Suspense } from "react";
import { tmdbHome } from "@/lib/tmdb.functions";
import { MovieRow, MovieCard } from "@/components/movie-card";
import { backdropUrl, titleOf } from "@/lib/tmdb-utils";
import { Link } from "@tanstack/react-router";
import { Play, Info } from "lucide-react";
import { Button } from "@/components/ui/button";

const homeQuery = queryOptions({
  queryKey: ["tmdb", "home"],
  queryFn: () => tmdbHome(),
  staleTime: 1000 * 60 * 10,
});

export const Route = createFileRoute("/_app/home")({
  head: () => ({ meta: [{ title: "Home — Orzint" }] }),
  loader: ({ context }) => context.queryClient.ensureQueryData(homeQuery),
  component: HomePage,
});

function HomePage() {
  return (
    <Suspense fallback={<div className="text-muted-foreground">Loading cinema…</div>}>
      <HomeInner />
    </Suspense>
  );
}

function HomeInner() {
  const { data } = useSuspenseQuery(homeQuery);
  const feat = data.trending[0];
  const bg = backdropUrl(feat?.backdrop_path);
  const featType = feat?.media_type === "tv" ? "tv" : "movie";

  return (
    <div className="space-y-10">
      {/* Featured */}
      {feat && (
        <section className="relative -mx-4 sm:-mx-6 -mt-6 h-[55vh] min-h-[400px] overflow-hidden">
          {bg && <img src={bg} alt="" className="absolute inset-0 h-full w-full object-cover" />}
          <div className="absolute inset-0 bg-gradient-hero" />
          <div className="absolute inset-x-0 bottom-0 p-6 sm:p-12 max-w-3xl">
            <span className="inline-block px-2 py-1 rounded text-[10px] font-semibold tracking-wider uppercase bg-primary/20 text-primary border border-primary/30">Trending now</span>
            <h1 className="mt-3 text-4xl sm:text-6xl font-bold tracking-tight text-balance">{titleOf(feat)}</h1>
            <p className="mt-3 text-base text-muted-foreground line-clamp-3 max-w-2xl">{feat.overview}</p>
            <div className="mt-6 flex gap-3">
              <Link to="/title/$type/$id" params={{ type: featType, id: String(feat.id) }}>
                <Button size="lg" className="bg-gradient-primary hover:opacity-90 shadow-glow">
                  <Play className="h-4 w-4 fill-current" />Watch
                </Button>
              </Link>
              <Link to="/title/$type/$id" params={{ type: featType, id: String(feat.id) }}>
                <Button size="lg" variant="secondary">
                  <Info className="h-4 w-4" />More info
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      <MovieRow title="Trending this week" items={data.trending} />
      <MovieRow title="Popular movies" items={data.popularMovies} />
      <MovieRow title="Popular series" items={data.popularTv} />
      <MovieRow title="Top rated" items={data.topMovies} />
    </div>
  );
}
