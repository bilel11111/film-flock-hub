import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { UserPlus, Check, X, Eye } from "lucide-react";

export const Route = createFileRoute("/_app/friends")({
  head: () => ({ meta: [{ title: "Friends — Orzint" }] }),
  component: FriendsPage,
});

function FriendsPage() {
  const [me, setMe] = useState<any>(null);
  const [searchId, setSearchId] = useState("");
  const [result, setResult] = useState<any>(null);
  const [requests, setRequests] = useState<any[]>([]);
  const [friends, setFriends] = useState<any[]>([]);

  async function load() {
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) return;
    const { data: p } = await supabase.from("profiles").select("*").eq("id", u.user.id).maybeSingle();
    setMe(p);
    const { data: reqs } = await supabase.from("friend_requests").select("*").eq("status", "pending");
    setRequests(reqs ?? []);
    const { data: fr } = await supabase.from("friendships").select("*");
    if (fr) {
      const ids = fr.map((f) => (f.user_a === u.user.id ? f.user_b : f.user_a));
      if (ids.length) {
        const { data: profs } = await supabase.from("profiles").select("*").in("id", ids);
        setFriends(profs ?? []);
      } else setFriends([]);
    }
  }
  useEffect(() => { load(); }, []);

  async function search() {
    if (!searchId.trim()) return;
    const { data } = await supabase.from("profiles").select("*").or(`username.eq.${searchId.trim().toLowerCase()},id.eq.${searchId.trim()}`).maybeSingle();
    setResult(data);
    if (!data) toast.error("No user found");
  }

  async function sendRequest(receiverId: string) {
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) return;
    const { error } = await supabase.from("friend_requests").insert({ sender_id: u.user.id, receiver_id: receiverId });
    if (error) toast.error(error.message); else toast.success("Request sent!");
  }

  async function accept(req: any) {
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) return;
    const [a, b] = [req.sender_id, req.receiver_id].sort();
    await supabase.from("friendships").insert({ user_a: a, user_b: b });
    await supabase.from("friend_requests").update({ status: "accepted" }).eq("id", req.id);
    toast.success("Friends!"); load();
  }

  async function reject(req: any) {
    await supabase.from("friend_requests").delete().eq("id", req.id);
    load();
  }

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl sm:text-4xl font-bold">Friends</h1>
        {me && <p className="mt-1 text-muted-foreground">Your ID: <span className="font-mono text-xs bg-secondary px-2 py-0.5 rounded">{me.id}</span> · username <span className="text-primary">@{me.username}</span></p>}
      </header>

      <Card className="p-6 bg-card">
        <h2 className="font-semibold mb-3">Find a friend</h2>
        <div className="flex gap-2">
          <Input value={searchId} onChange={(e) => setSearchId(e.target.value)} placeholder="Paste user ID or username" />
          <Button onClick={search}><UserPlus className="h-4 w-4" />Search</Button>
        </div>
        {result && (
          <div className="mt-4 flex items-center justify-between p-3 rounded-lg bg-surface-elevated">
            <div>
              <p className="font-medium">@{result.username}</p>
              <p className="text-xs text-muted-foreground">{result.display_name}</p>
            </div>
            <Button size="sm" onClick={() => sendRequest(result.id)}>Send request</Button>
          </div>
        )}
      </Card>

      {requests.length > 0 && (
        <section>
          <h2 className="text-xl font-bold mb-3">Pending requests</h2>
          <div className="space-y-2">
            {requests.map((r) => (
              <Card key={r.id} className="p-3 flex items-center justify-between">
                <p className="text-sm font-mono">{r.sender_id === me?.id ? `→ ${r.receiver_id}` : `← ${r.sender_id}`}</p>
                {r.receiver_id === me?.id && (
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => accept(r)}><Check className="h-4 w-4" /></Button>
                    <Button size="sm" variant="outline" onClick={() => reject(r)}><X className="h-4 w-4" /></Button>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="text-xl font-bold mb-3">Your friends ({friends.length})</h2>
        {friends.length === 0 ? (
          <p className="text-muted-foreground">No friends yet. Share your ID above.</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {friends.map((f) => (
              <Card key={f.id} className="p-4 flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-gradient-primary flex items-center justify-center font-bold">{f.username[0].toUpperCase()}</div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium">@{f.username}</p>
                  {f.watching_title && <p className="text-xs text-muted-foreground flex items-center gap-1"><Eye className="h-3 w-3" />{f.watching_title}</p>}
                </div>
                <Link to="/messages"><Button size="sm" variant="outline">Chat</Button></Link>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
