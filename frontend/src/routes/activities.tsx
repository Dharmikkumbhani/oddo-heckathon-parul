import { createFileRoute } from "@tanstack/react-router";
import AppLayout from "@/components/AppLayout";
import { Btn, Card, Chip } from "@/components/ui-kit";
import { activities } from "@/lib/sample-data";
import { Search, Star, Clock, Wallet, Plus, Check, X } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/activities")({
  head: () => ({ meta: [{ title: "Activity search — Traveloop" }, { name: "description", content: "Find activities to add to your trip." }] }),
  component: ActivitySearch,
});

function ActivitySearch() {
  const [picked, setPicked] = useState<string[]>([activities[0].name]);
  const toggle = (n: string) => setPicked((p) => p.includes(n) ? p.filter(x => x !== n) : [...p, n]);

  return (
    <AppLayout title="Find things to do" subtitle="Browse activities for Tokyo · Adding to Day 2">
      <div className="grid lg:grid-cols-[1fr_300px] gap-6">
        <div>
          <div className="flex flex-col md:flex-row gap-3 mb-5">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input placeholder="Try 'sushi class' or 'sunset hike'" className="w-full h-11 pl-11 pr-4 rounded-xl bg-card border border-input outline-none text-sm focus:border-ring" />
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-5">
            {[
              ["All", "default", true], ["Adventure", "coral", false], ["Food", "sunset", true], ["Culture", "sky", false],
              ["Nature", "emerald", false], ["Family", "default", false], ["Indoor", "default", false], ["Outdoor", "emerald", false],
            ].map(([n, c, a]: any) => <Chip key={n} color={c} active={a}>{n}</Chip>)}
          </div>

          <div className="flex flex-wrap gap-3 mb-5">
            <select className="h-9 px-3 rounded-lg bg-card border border-input text-xs"><option>Any duration</option><option>{"< 1 hr"}</option><option>1–3 hrs</option><option>Half day</option></select>
            <select className="h-9 px-3 rounded-lg bg-card border border-input text-xs"><option>Any cost</option><option>Free</option><option>{"< $50"}</option><option>$50–$150</option></select>
            <select className="h-9 px-3 rounded-lg bg-card border border-input text-xs"><option>Any rating</option><option>4+ stars</option><option>4.5+ stars</option></select>
            <select className="h-9 px-3 rounded-lg bg-card border border-input text-xs"><option>Sort: Recommended</option><option>Highest rated</option><option>Lowest cost</option></select>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {activities.map((a) => {
              const sel = picked.includes(a.name);
              return (
                <Card key={a.name} className="p-5 hover:shadow-elegant transition group">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <Chip color={a.category === "Food" ? "sunset" : a.category === "Adventure" ? "coral" : "sky"}>{a.category}</Chip>
                      <h3 className="font-display text-lg font-semibold mt-2">{a.name}</h3>
                    </div>
                    <div className="flex items-center gap-1 bg-sunset/10 text-sunset px-2 py-1 rounded-full text-xs font-bold">
                      <Star className="h-3 w-3 fill-sunset" /> {a.rating}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{a.desc}</p>
                  <div className="flex flex-wrap gap-3 mt-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {a.duration}</span>
                    <span className="flex items-center gap-1"><Wallet className="h-3 w-3" /> {a.cost}</span>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Btn size="sm" variant={sel ? "soft" : "primary"} className="flex-1" onClick={() => toggle(a.name)}>
                      {sel ? <><Check className="h-3.5 w-3.5" /> Added</> : <><Plus className="h-3.5 w-3.5" /> Add</>}
                    </Btn>
                    <Btn size="sm" variant="outline">Preview</Btn>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        <aside>
          <Card className="p-5 sticky top-32">
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Selected for Day 2</div>
            <div className="font-display text-2xl font-semibold mt-1">{picked.length} {picked.length === 1 ? "activity" : "activities"}</div>
            <div className="mt-4 space-y-2">
              {picked.length === 0 && <div className="text-sm text-muted-foreground py-6 text-center">Pick activities to add them to your itinerary.</div>}
              {picked.map((n) => {
                const a = activities.find(x => x.name === n)!;
                return (
                  <div key={n} className="flex items-center gap-2 p-2.5 rounded-lg bg-muted/50">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold truncate">{a.name}</div>
                      <div className="text-[11px] text-muted-foreground">{a.duration} · {a.cost}</div>
                    </div>
                    <button onClick={() => toggle(n)} className="text-muted-foreground hover:text-destructive"><X className="h-4 w-4" /></button>
                  </div>
                );
              })}
            </div>
            {picked.length > 0 && <Btn className="w-full mt-4">Add to itinerary</Btn>}
          </Card>
        </aside>
      </div>
    </AppLayout>
  );
}
