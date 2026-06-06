import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { useServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Sparkles, Send } from "lucide-react";

export const askCinemaAI = createServerFn({ method: "POST" })
  .inputValidator(z.object({ messages: z.array(z.object({ role: z.enum(["user", "assistant", "system"]), content: z.string() })).max(40) }))
  .handler(async ({ data }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("LOVABLE_API_KEY missing");
    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "You are Orzint's cinema companion. Help users discover movies and series, give recommendations, discuss plots without spoilers unless asked, and chat enthusiastically about cinema. Keep replies concise and friendly." },
          ...data.messages,
        ],
      }),
    });
    if (res.status === 429) return { reply: "I'm a bit busy — try again in a moment." };
    if (res.status === 402) return { reply: "AI credits exhausted. Please add more to keep chatting." };
    if (!res.ok) throw new Error(`AI error ${res.status}`);
    const json: any = await res.json();
    return { reply: json.choices?.[0]?.message?.content ?? "…" };
  });

export const Route = createFileRoute("/_app/chatbot")({
  head: () => ({ meta: [{ title: "AI Chat — Orzint" }] }),
  component: ChatbotPage,
});

function ChatbotPage() {
  const ask = useServerFn(askCinemaAI);
  const [msgs, setMsgs] = useState<{ role: "user" | "assistant"; content: string }[]>([
    { role: "assistant", content: "Hey! I'm your cinema companion. Ask me for recommendations, hidden gems, or what to watch tonight." },
  ]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  async function send() {
    if (!text.trim() || loading) return;
    const next = [...msgs, { role: "user" as const, content: text.trim() }];
    setMsgs(next); setText(""); setLoading(true);
    try {
      const r = await ask({ data: { messages: next } });
      setMsgs([...next, { role: "assistant", content: r.reply }]);
    } catch (e: any) {
      setMsgs([...next, { role: "assistant", content: "Hmm, something went wrong. Try again?" }]);
    } finally { setLoading(false); }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <header className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-gradient-primary shadow-glow flex items-center justify-center"><Sparkles className="h-5 w-5 text-primary-foreground" /></div>
        <div>
          <h1 className="text-2xl font-bold">Cinema Companion</h1>
          <p className="text-sm text-muted-foreground">Your AI movie expert.</p>
        </div>
      </header>

      <Card className="flex flex-col h-[calc(100vh-16rem)] overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {msgs.map((m, i) => (
            <div key={i} className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${m.role === "user" ? "ml-auto bg-gradient-primary text-primary-foreground" : "bg-secondary"}`}>{m.content}</div>
          ))}
          {loading && <div className="p-3 rounded-2xl bg-secondary text-sm text-muted-foreground w-fit">Thinking…</div>}
        </div>
        <form onSubmit={(e) => { e.preventDefault(); send(); }} className="p-3 border-t border-border flex gap-2">
          <Input value={text} onChange={(e) => setText(e.target.value)} placeholder="Recommend me a mind-bending thriller…" />
          <Button type="submit" disabled={loading} className="bg-gradient-primary"><Send className="h-4 w-4" /></Button>
        </form>
      </Card>
    </div>
  );
}
