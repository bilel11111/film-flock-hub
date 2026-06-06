import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";

export const Route = createFileRoute("/_app/messages")({
  head: () => ({ meta: [{ title: "Messages — Orzint" }] }),
  component: MessagesPage,
});

function MessagesPage() {
  const [me, setMe] = useState<string | null>(null);
  const [friends, setFriends] = useState<any[]>([]);
  const [active, setActive] = useState<any>(null);
  const [msgs, setMsgs] = useState<any[]>([]);
  const [text, setText] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return;
      setMe(u.user.id);
      const { data: fr } = await supabase.from("friendships").select("*");
      const ids = (fr ?? []).map((f) => (f.user_a === u.user!.id ? f.user_b : f.user_a));
      if (ids.length) {
        const { data: profs } = await supabase.from("profiles").select("*").in("id", ids);
        setFriends(profs ?? []);
      }
    })();
  }, []);

  useEffect(() => {
    if (!active || !me) return;
    (async () => {
      const { data } = await supabase.from("direct_messages").select("*")
        .or(`and(sender_id.eq.${me},receiver_id.eq.${active.id}),and(sender_id.eq.${active.id},receiver_id.eq.${me})`)
        .order("created_at", { ascending: true }).limit(200);
      setMsgs(data ?? []);
    })();
    const ch = supabase.channel(`dm-${active.id}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "direct_messages" }, (payload) => {
        const m: any = payload.new;
        if ((m.sender_id === me && m.receiver_id === active.id) || (m.sender_id === active.id && m.receiver_id === me)) {
          setMsgs((p) => [...p, m]);
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [active, me]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs]);

  async function send() {
    if (!text.trim() || !active || !me) return;
    const t = text.trim(); setText("");
    await supabase.from("direct_messages").insert({ sender_id: me, receiver_id: active.id, content: t });
  }

  return (
    <div className="grid md:grid-cols-[280px_1fr] gap-4 h-[calc(100vh-10rem)]">
      <Card className="p-2 overflow-y-auto">
        <h2 className="px-3 py-2 font-bold">Chats</h2>
        {friends.length === 0 && <p className="px-3 text-sm text-muted-foreground">Add friends to start chatting.</p>}
        {friends.map((f) => (
          <button key={f.id} onClick={() => setActive(f)} className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-smooth ${active?.id === f.id ? "bg-secondary" : "hover:bg-secondary/50"}`}>
            <div className="h-10 w-10 rounded-full bg-gradient-primary flex items-center justify-center font-bold shrink-0">{f.username[0].toUpperCase()}</div>
            <div className="min-w-0">
              <p className="font-medium truncate">@{f.username}</p>
              {f.watching_title && <p className="text-xs text-muted-foreground truncate">▶ {f.watching_title}</p>}
            </div>
          </button>
        ))}
      </Card>

      <Card className="flex flex-col overflow-hidden">
        {active ? (
          <>
            <div className="p-4 border-b border-border">
              <p className="font-bold">@{active.username}</p>
              {active.watching_title && <p className="text-xs text-muted-foreground">Now watching: {active.watching_title}</p>}
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {msgs.map((m) => (
                <div key={m.id} className={`max-w-[75%] p-3 rounded-2xl text-sm ${m.sender_id === me ? "ml-auto bg-gradient-primary text-primary-foreground" : "bg-secondary"}`}>
                  {m.content}
                </div>
              ))}
              <div ref={endRef} />
            </div>
            <form onSubmit={(e) => { e.preventDefault(); send(); }} className="p-3 border-t border-border flex gap-2">
              <Input value={text} onChange={(e) => setText(e.target.value)} placeholder="Type a message…" />
              <Button type="submit"><Send className="h-4 w-4" /></Button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">Select a friend to chat.</div>
        )}
      </Card>
    </div>
  );
}
