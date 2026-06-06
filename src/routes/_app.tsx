import { createFileRoute, Outlet, redirect, Link, useNavigate, useLocation } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { Film, Home, Search, Users, MessageCircle, Sparkles, Settings, LogOut, Shield } from "lucide-react";
import logo from "@/assets/orzint-logo.png";

export const Route = createFileRoute("/_app")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/auth" });
    return { user: data.user };
  },
  component: AppLayout,
});

function AppLayout() {
  const { profile, isAdmin } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();

  async function signOut() {
    await supabase.auth.signOut();
    nav({ to: "/auth" });
  }

  const links = [
    { to: "/home", label: "Home", icon: Home },
    { to: "/browse", label: "Browse", icon: Search },
    { to: "/friends", label: "Friends", icon: Users },
    { to: "/messages", label: "Messages", icon: MessageCircle },
    { to: "/chatbot", label: "AI Chat", icon: Sparkles },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Top nav */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-background/80 border-b border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <Link to="/home" className="flex items-center gap-2 shrink-0">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-primary shadow-glow">
              <Film className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold tracking-tight hidden sm:inline">Orzint</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {links.map((l) => {
              const active = loc.pathname.startsWith(l.to);
              return (
                <Link key={l.to} to={l.to} className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-smooth ${active ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"}`}>
                  <l.icon className="h-4 w-4" />{l.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            {isAdmin && (
              <Link to="/admin" className="hidden sm:flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-md bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-smooth">
                <Shield className="h-3.5 w-3.5" />Admin
              </Link>
            )}
            <Link to="/settings" className="p-2 rounded-md hover:bg-secondary transition-smooth" aria-label="Settings">
              <Settings className="h-4 w-4" />
            </Link>
            <button onClick={signOut} className="p-2 rounded-md hover:bg-secondary transition-smooth" aria-label="Sign out">
              <LogOut className="h-4 w-4" />
            </button>
            <Link to="/settings" className="flex items-center gap-2 ml-1 pl-3 border-l border-border">
              <div className="h-8 w-8 rounded-full bg-gradient-primary flex items-center justify-center text-sm font-semibold">
                {profile?.username?.[0]?.toUpperCase() ?? "?"}
              </div>
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 py-6 pb-24 md:pb-12">
        <Outlet />
      </main>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-background/95 backdrop-blur-xl border-t border-border">
        <div className="grid grid-cols-5">
          {links.map((l) => {
            const active = loc.pathname.startsWith(l.to);
            return (
              <Link key={l.to} to={l.to} className={`flex flex-col items-center gap-1 py-2.5 text-[10px] font-medium transition-smooth ${active ? "text-primary" : "text-muted-foreground"}`}>
                <l.icon className="h-5 w-5" />{l.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
