import { createFileRoute } from "@tanstack/react-router";
import AppLayout from "@/components/AppLayout";
import { Btn, Card, Chip } from "@/components/ui-kit";
import { Field, Input, TextArea } from "@/components/AuthLayout";
import { Camera, MapPin, Mail, Phone, Globe, Bell, Shield, Trash2, Heart } from "lucide-react";

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "Profile & settings — Traveloop" }, { name: "description", content: "Manage your profile, preferences and notifications." }] }),
  component: ProfilePage,
});

function ProfilePage() {
  return (
    <AppLayout title="Profile & settings" subtitle="Personalize your Traveloop experience">
      <div className="grid lg:grid-cols-[260px_1fr] gap-6">
        <aside>
          <Card className="p-3 sticky top-32 space-y-1">
            {[
              ["Personal info", true],
              ["Travel preferences", false],
              ["Saved destinations", false],
              ["Notifications", false],
              ["Privacy", false],
              ["Danger zone", false],
            ].map(([k, a]) => (
              <button key={k as string} className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition ${a ? "bg-accent text-accent-foreground" : "hover:bg-muted"}`}>{k}</button>
            ))}
          </Card>
        </aside>

        <div className="space-y-6">
          <Card className="overflow-hidden">
            <div className="h-32 bg-gradient-hero relative">
              <img src="https://images.unsplash.com/photo-1500835556837-99ac94a94552?auto=format&fit=crop&w=1400&q=60" className="w-full h-full object-cover opacity-30" alt="" />
            </div>
            <div className="p-6 -mt-12">
              <div className="flex flex-wrap items-end gap-4">
                <div className="relative">
                  <div className="h-24 w-24 rounded-2xl bg-gradient-ocean ring-4 ring-card grid place-items-center text-white font-display text-3xl font-bold">AS</div>
                  <button className="absolute bottom-1 right-1 h-7 w-7 rounded-lg bg-card border border-border grid place-items-center"><Camera className="h-3.5 w-3.5" /></button>
                </div>
                <div className="flex-1">
                  <h2 className="font-display text-2xl font-semibold">Alex Somerset</h2>
                  <div className="text-sm text-muted-foreground flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> Lisbon, Portugal · Joined 2024</div>
                </div>
                <Btn variant="outline">Edit cover</Btn>
              </div>
            </div>
          </Card>

          <Card className="p-6 space-y-5">
            <h3 className="font-display text-lg font-semibold">Personal information</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="First name"><Input defaultValue="Alex" /></Field>
              <Field label="Last name"><Input defaultValue="Somerset" /></Field>
              <Field label="Email"><div className="relative"><Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input defaultValue="alex.somerset@example.com" className="pl-10" /></div></Field>
              <Field label="Phone"><div className="relative"><Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input defaultValue="+351 912 345 678" className="pl-10" /></div></Field>
              <Field label="City"><Input defaultValue="Lisbon" /></Field>
              <Field label="Country"><Input defaultValue="Portugal" /></Field>
            </div>
            <Field label="Bio"><TextArea rows={3} defaultValue="Slow traveler. Coffee addict. Saving up for Patagonia." /></Field>
            <div className="flex justify-end gap-2"><Btn variant="ghost">Cancel</Btn><Btn>Save changes</Btn></div>
          </Card>

          <Card className="p-6">
            <h3 className="font-display text-lg font-semibold">Travel preferences</h3>
            <p className="text-sm text-muted-foreground mt-1">We'll personalize destination and activity recommendations.</p>
            <div className="mt-4">
              <div className="text-xs font-semibold uppercase text-muted-foreground mb-2">Trip styles</div>
              <div className="flex flex-wrap gap-2">
                {["Adventure","Food","Culture","Nature","Family","Budget","Luxury","Coastal","Slow travel"].map((t,i) =>
                  <Chip key={t} active={[0,1,2,8].includes(i)} color={(["coral","sunset","sky","emerald","default"][i % 5]) as any}>{t}</Chip>)}
              </div>
            </div>
            <div className="mt-5 grid sm:grid-cols-2 gap-4">
              <Field label="Language"><div className="relative"><Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input defaultValue="English (US)" className="pl-10" /></div></Field>
              <Field label="Currency"><Input defaultValue="USD ($)" /></Field>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="font-display text-lg font-semibold">Saved destinations</h3>
            <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {["Lisbon","Kyoto","Reykjavík","Cape Town","Hanoi","Queenstown"].map((c) => (
                <div key={c} className="p-3 rounded-xl border border-border flex items-center gap-3">
                  <Heart className="h-4 w-4 text-coral fill-coral" />
                  <span className="text-sm font-semibold flex-1">{c}</span>
                  <button className="text-xs text-muted-foreground hover:text-foreground">Remove</button>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="font-display text-lg font-semibold flex items-center gap-2"><Bell className="h-5 w-5" /> Notifications</h3>
            <div className="mt-4 space-y-3">
              {[
                ["Trip reminders","7 days before departure"],
                ["Budget alerts","When estimates change by 10%+"],
                ["Community activity","Likes, comments and saves"],
                ["Travel inspiration","Weekly Sunday digest"],
              ].map(([t, d], i) => (
                <label key={t} className="flex items-center justify-between p-3 rounded-xl hover:bg-muted/40">
                  <div>
                    <div className="text-sm font-semibold">{t}</div>
                    <div className="text-xs text-muted-foreground">{d}</div>
                  </div>
                  <input type="checkbox" defaultChecked={i < 3} className="h-5 w-9 appearance-none bg-muted rounded-full relative cursor-pointer transition checked:bg-primary
                    before:content-[''] before:absolute before:top-0.5 before:left-0.5 before:h-4 before:w-4 before:bg-card before:rounded-full before:transition checked:before:translate-x-4" />
                </label>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="font-display text-lg font-semibold flex items-center gap-2"><Shield className="h-5 w-5" /> Privacy</h3>
            <div className="mt-4 space-y-3">
              {[
                ["Public profile","Anyone can see trips you mark public"],
                ["Show activity in feed","Likes and saves appear in community"],
                ["Allow trip cloning","Others can copy your shared trips"],
              ].map(([t, d], i) => (
                <label key={t} className="flex items-center justify-between p-3 rounded-xl hover:bg-muted/40">
                  <div><div className="text-sm font-semibold">{t}</div><div className="text-xs text-muted-foreground">{d}</div></div>
                  <input type="checkbox" defaultChecked={i !== 1} className="h-5 w-9 appearance-none bg-muted rounded-full relative cursor-pointer transition checked:bg-primary before:content-[''] before:absolute before:top-0.5 before:left-0.5 before:h-4 before:w-4 before:bg-card before:rounded-full before:transition checked:before:translate-x-4" />
                </label>
              ))}
            </div>
          </Card>

          <Card className="p-6 border-destructive/30">
            <h3 className="font-display text-lg font-semibold text-destructive flex items-center gap-2"><Trash2 className="h-5 w-5" /> Danger zone</h3>
            <p className="text-sm text-muted-foreground mt-1">Permanently delete your account and all related data.</p>
            <Btn variant="outline" className="mt-4 border-destructive text-destructive hover:bg-destructive/10">Delete my account</Btn>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
