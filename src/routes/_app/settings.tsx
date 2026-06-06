import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/settings")({
  head: () => ({ meta: [{ title: "Settings — Orzint" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const [profile, setProfile] = useState<any>(null);
  const [display, setDisplay] = useState("");
  const [bio, setBio] = useState("");
  const [avatar, setAvatar] = useState("");

  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return;
      const { data } = await supabase.from("profiles").select("*").eq("id", u.user.id).maybeSingle();
      setProfile(data);
      setDisplay(data?.display_name ?? "");
      setBio(data?.bio ?? "");
      setAvatar(data?.avatar_url ?? "");
    })();
  }, []);

  async function save() {
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) return;
    const { error } = await supabase.from("profiles").update({ display_name: display, bio, avatar_url: avatar }).eq("id", u.user.id);
    if (error) toast.error(error.message); else toast.success("Saved");
  }

  async function clearWatching() {
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) return;
    await supabase.from("profiles").update({ watching_title: null, watching_tmdb_id: null, watching_type: null }).eq("id", u.user.id);
    toast.success("Cleared");
  }

  if (!profile) return <p className="text-muted-foreground">Loading…</p>;

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-3xl sm:text-4xl font-bold">Settings</h1>
      <Card className="p-6 space-y-4">
        <div>
          <Label>Your ID (share to receive friend requests)</Label>
          <Input readOnly value={profile.id} className="font-mono text-xs" />
        </div>
        <div>
          <Label>Username</Label>
          <Input readOnly value={`@${profile.username}`} />
        </div>
        <div>
          <Label htmlFor="display">Display name</Label>
          <Input id="display" value={display} onChange={(e) => setDisplay(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="avatar">Avatar URL</Label>
          <Input id="avatar" value={avatar} onChange={(e) => setAvatar(e.target.value)} placeholder="https://…" />
        </div>
        <div>
          <Label htmlFor="bio">Bio</Label>
          <Textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)} rows={3} />
        </div>
        <div className="flex gap-2">
          <Button onClick={save} className="bg-gradient-primary">Save</Button>
          {profile.watching_title && <Button variant="outline" onClick={clearWatching}>Stop "Now watching"</Button>}
        </div>
      </Card>
    </div>
  );
}
