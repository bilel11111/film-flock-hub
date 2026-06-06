import { createFileRoute, redirect } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Trash2, Plus } from "lucide-react";

export const Route = createFileRoute("/_app/admin")({
  head: () => ({ meta: [{ title: "Admin — Orzint" }] }),
  beforeLoad: async () => {
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) throw redirect({ to: "/auth" });
    const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", u.user.id);
    if (!roles?.some((r) => r.role === "admin")) throw redirect({ to: "/home" });
  },
  component: AdminPage,
});

function AdminPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [movies, setMovies] = useState<any[]>([]);
  const [form, setForm] = useState({ title: "", tmdb_id: "", media_type: "movie", watch_url: "" });

  async function load() {
    const { data: p } = await supabase.from("profiles").select("*").order("created_at", { ascending: false }).limit(200);
    setUsers(p ?? []);
    const { data: m } = await supabase.from("curated_movies").select("*").order("created_at", { ascending: false }).limit(100);
    setMovies(m ?? []);
  }
  useEffect(() => { load(); }, []);

  async function addMovie() {
    if (!form.title || !form.watch_url) return toast.error("Title and watch URL required");
    const { data: u } = await supabase.auth.getUser();
    const { error } = await supabase.from("curated_movies").insert({
      title: form.title,
      tmdb_id: form.tmdb_id ? Number(form.tmdb_id) : null,
      media_type: form.media_type,
      watch_url: form.watch_url,
      added_by: u.user?.id,
    });
    if (error) toast.error(error.message);
    else { toast.success("Added"); setForm({ title: "", tmdb_id: "", media_type: "movie", watch_url: "" }); load(); }
  }

  async function deleteMovie(id: string) {
    await supabase.from("curated_movies").delete().eq("id", id);
    load();
  }

  async function deleteUser(id: string) {
    if (!confirm("Delete this user profile? Their auth account will need to be removed separately.")) return;
    const { error } = await supabase.from("profiles").delete().eq("id", id);
    if (error) toast.error(error.message); else { toast.success("Deleted"); load(); }
  }

  async function toggleAdmin(uid: string, isAdmin: boolean) {
    if (isAdmin) await supabase.from("user_roles").delete().eq("user_id", uid).eq("role", "admin");
    else await supabase.from("user_roles").insert({ user_id: uid, role: "admin" });
    load();
  }

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl sm:text-4xl font-bold">Admin</h1>
        <p className="mt-1 text-muted-foreground">Manage users and the curated movie catalog.</p>
      </header>

      <Card className="p-6">
        <h2 className="font-bold mb-3 flex items-center gap-2"><Plus className="h-4 w-4" />Add movie / series link</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          <div><Label>Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
          <div><Label>TMDB ID (optional)</Label><Input value={form.tmdb_id} onChange={(e) => setForm({ ...form, tmdb_id: e.target.value })} /></div>
          <div><Label>Type</Label>
            <select className="w-full h-10 rounded-md bg-input border border-border px-3 text-sm" value={form.media_type} onChange={(e) => setForm({ ...form, media_type: e.target.value })}>
              <option value="movie">Movie</option><option value="tv">Series</option>
            </select>
          </div>
          <div><Label>Watch URL</Label><Input value={form.watch_url} onChange={(e) => setForm({ ...form, watch_url: e.target.value })} placeholder="https://…" /></div>
        </div>
        <Button onClick={addMovie} className="mt-4 bg-gradient-primary">Add</Button>
      </Card>

      <section>
        <h2 className="text-xl font-bold mb-3">Curated catalog ({movies.length})</h2>
        <div className="space-y-2">
          {movies.map((m) => (
            <Card key={m.id} className="p-3 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="font-medium truncate">{m.title} <span className="text-xs text-muted-foreground">· {m.media_type}{m.tmdb_id ? ` · tmdb:${m.tmdb_id}` : ""}</span></p>
                <a href={m.watch_url} target="_blank" rel="noreferrer" className="text-xs text-primary truncate block">{m.watch_url}</a>
              </div>
              <Button size="sm" variant="outline" onClick={() => deleteMovie(m.id)}><Trash2 className="h-4 w-4" /></Button>
            </Card>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold mb-3">Users ({users.length})</h2>
        <div className="space-y-2">
          {users.map((u) => (
            <Card key={u.id} className="p-3 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="font-medium">@{u.username}</p>
                <p className="text-xs text-muted-foreground font-mono truncate">{u.id}</p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => toggleAdmin(u.id, false)}>Make admin</Button>
                <Button size="sm" variant="outline" onClick={() => deleteUser(u.id)}><Trash2 className="h-4 w-4" /></Button>
              </div>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
