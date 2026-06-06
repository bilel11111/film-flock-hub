import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Film, Users, MessageCircle, Sparkles } from "lucide-react";
import heroImg from "@/assets/cinema-hero.jpg";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Orzint — Movies & Series with Friends" },
      { name: "description", content: "Discover, chat, and share movies with friends on Orzint. Powered by a cinematic AI companion." },
    ],
  }),
  beforeLoad: async () => {
    if (typeof window === "undefined") return;
    const { data } = await supabase.auth.getSession();
    if (data.session) throw redirect({ to: "/home" });
  },
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <header className="absolute top-0 inset-x-0 z-20 px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-lg bg-gradient-primary shadow-glow flex items-center justify-center"><Film className="h-4 w-4 text-primary-foreground" /></div>
          <span className="text-xl font-bold">Orzint</span>
        </div>
        <Link to="/auth"><Button variant="secondary">Sign in</Button></Link>
      </header>

      <section className="relative min-h-screen flex items-center justify-center px-6">
        <img src={heroImg} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/40" />
        <div className="relative text-center max-w-3xl">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase bg-primary/20 text-primary border border-primary/30">Cinema, social</span>
          <h1 className="mt-5 text-5xl sm:text-7xl font-bold tracking-tight text-balance">Watch together,<br /><span className="bg-gradient-primary bg-clip-text text-transparent">even when apart.</span></h1>
          <p className="mt-5 text-lg text-muted-foreground max-w-xl mx-auto">Browse millions of films and series, chat with friends in real time, surprise them with a movie pick, and chat with an AI that knows cinema.</p>
          <div className="mt-8 flex gap-3 justify-center">
            <Link to="/auth"><Button size="lg" className="bg-gradient-primary shadow-glow">Get started — free</Button></Link>
          </div>
        </div>
      </section>

      <section className="px-6 py-20 max-w-6xl mx-auto grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { icon: Film, t: "Browse everything", d: "Search across TMDB's full catalog with rich detail pages." },
          { icon: Users, t: "Friend by ID", d: "Share your ID, add friends, and see what they're watching." },
          { icon: MessageCircle, t: "Real-time chat", d: "Message friends and share movies as surprise picks." },
          { icon: Sparkles, t: "AI companion", d: "Get recommendations from your personal cinema expert." },
        ].map((f) => (
          <div key={f.t} className="p-6 rounded-xl bg-card border border-border">
            <f.icon className="h-6 w-6 text-primary" />
            <h3 className="mt-3 font-bold">{f.t}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{f.d}</p>
          </div>
        ))}
      </section>

      <footer className="border-t border-border px-6 py-8 text-center text-sm text-muted-foreground">© Orzint</footer>
    </div>
  );
}
