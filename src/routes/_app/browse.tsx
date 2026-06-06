import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { tmdbSearch } from "@/lib/tmdb.functions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MovieCard } from "@/components/movie-card";
import { Search } from "lucide-react";

export const Route = createFileRoute("/_app/browse")({
  head: () => ({ meta: [{ title: "Browse — Orzint" }] }),
  component: BrowsePage,
});

function BrowsePage() {
  const [q, setQ] = useState("");
  const searchFn = useServerFn(tmdbSearch);
  const m = useMutation({ mutationFn: (query: string) => searchFn({ data: { query } }) });

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl sm:text-4xl font-bold">Browse</h1>
        <p className="mt-1 text-muted-foreground">Search across millions of movies and series.</p>
      </header>

      <form onSubmit={(e) => { e.preventDefault(); if (q.trim()) m.mutate(q.trim()); }} className="flex gap-2 max-w-2xl">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search movies, series, actors…" className="pl-10 h-12 text-base" />
        </div>
        <Button type="submit" size="lg" className="bg-gradient-primary shadow-glow">Search</Button>
      </form>

      {m.isPending && <p className="text-muted-foreground">Searching…</p>}
      {m.data && m.data.results.length === 0 && <p className="text-muted-foreground">Nothing found. Try another keyword.</p>}
      {m.data && m.data.results.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-3 gap-y-6">
          {m.data.results.map((it: any) => <MovieCard key={`${it.id}-${it.media_type}`} item={it} />)}
        </div>
      )}

      {!m.data && !m.isPending && (
        <div className="rounded-xl border border-border bg-card/50 p-12 text-center">
          <Search className="h-10 w-10 mx-auto text-muted-foreground" />
          <p className="mt-3 text-muted-foreground">Type something above to start exploring.</p>
        </div>
      )}
    </div>
  );
}
