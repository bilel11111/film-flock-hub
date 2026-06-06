import { Link } from "@tanstack/react-router";
import { posterUrl, titleOf, yearOf, mediaTypeOf } from "@/lib/tmdb-utils";
import { Star } from "lucide-react";

export function MovieCard({ item }: { item: any }) {
  const type = mediaTypeOf(item);
  const poster = posterUrl(item.poster_path, "w342");
  return (
    <Link to="/title/$type/$id" params={{ type, id: String(item.id) }} className="group block w-[140px] sm:w-[170px] shrink-0">
      <div className="aspect-[2/3] rounded-lg overflow-hidden bg-surface-elevated shadow-card relative transition-smooth group-hover:scale-105 group-hover:shadow-glow">
        {poster ? (
          <img src={poster} alt={titleOf(item)} loading="lazy" className="h-full w-full object-cover" />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-xs text-muted-foreground">No image</div>
        )}
        {item.vote_average ? (
          <div className="absolute top-2 right-2 flex items-center gap-1 px-1.5 py-0.5 rounded bg-background/80 backdrop-blur text-[10px] font-semibold">
            <Star className="h-3 w-3 fill-primary text-primary" />{item.vote_average.toFixed(1)}
          </div>
        ) : null}
      </div>
      <div className="mt-2 px-0.5">
        <p className="text-sm font-medium leading-tight line-clamp-1">{titleOf(item)}</p>
        <p className="text-xs text-muted-foreground">{yearOf(item)} · {type === "tv" ? "Series" : "Movie"}</p>
      </div>
    </Link>
  );
}

export function MovieRow({ title, items }: { title: string; items: any[] }) {
  if (!items?.length) return null;
  return (
    <section className="space-y-3">
      <h2 className="text-xl sm:text-2xl font-bold tracking-tight">{title}</h2>
      <div className="flex gap-3 sm:gap-4 overflow-x-auto scrollbar-hide -mx-4 px-4 pb-2">
        {items.map((it) => <MovieCard key={`${it.id}-${it.media_type ?? ""}`} item={it} />)}
      </div>
    </section>
  );
}
