import { createFileRoute, useNavigate } from "@tanstack/react-router";
import AppLayout from "@/components/AppLayout";
import { Btn, Card, Chip } from "@/components/ui-kit";
import { Search, Star, Clock, Wallet, Plus, Check, X } from "lucide-react";
import { useState, useEffect } from "react";

type ActivitiesSearch = { tripId?: string; stopId?: string; cityId?: string };

export const Route = createFileRoute("/activities")({
  validateSearch: (search: Record<string, unknown>): ActivitiesSearch => ({
    tripId: search.tripId as string | undefined,
    stopId: search.stopId as string | undefined,
    cityId: search.cityId as string | undefined,
  }),
  head: () => ({ meta: [{ title: "Activity search — Traveloop" }, { name: "description", content: "Find activities to add to your trip." }] }),
  component: ActivitySearch,
});

function ActivitySearch() {
  const { tripId, stopId, cityId } = Route.useSearch();
  const navigate = useNavigate();
  
  const [activities, setActivities] = useState<any[]>([]);
  const [picked, setPicked] = useState<any[]>([]); // store whole objects
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchActs = async () => {
      try {
        let url = "http://localhost:5000/api/activities";
        if (cityId) url += `?cityId=${cityId}`;
        const res = await fetch(url);
        if (res.ok) setActivities(await res.json());
      } catch (e) { console.error(e); }
      setLoading(false);
    };
    fetchActs();
  }, [cityId]);

  const toggle = (act: any) => {
    setPicked(p => {
      if (p.find(x => x.id === act.id)) return p.filter(x => x.id !== act.id);
      return [...p, act];
    });
  };

  const handleSave = async () => {
    if (!tripId || !stopId) return;
    setSaving(true);
    const token = localStorage.getItem("token");
    try {
      for (const act of picked) {
        await fetch(`http://localhost:5000/api/stops/${stopId}/activities`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
          body: JSON.stringify({ tripId, activityId: act.id, activityDate: null })
        });
      }
      navigate({ to: "/itinerary-builder", search: { tripId } });
    } catch (e) {
      console.error(e);
      setSaving(false);
    }
  };

  if (!tripId || !stopId) return <AppLayout title="Error"><div className="p-10 text-center">Please select a stop from the Itinerary Builder first.</div></AppLayout>;

  return (
    <AppLayout title="Find things to do" subtitle="Browse activities to add to your itinerary">
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
              ["All", "default", true], ["Adventure", "coral", false], ["Food", "sunset", false], ["Culture", "sky", false],
              ["Sightseeing", "emerald", false],
            ].map(([n, c, a]: any) => <Chip key={n} color={c} active={a}>{n}</Chip>)}
          </div>

          {loading ? (
             <div className="text-center py-10 text-muted-foreground">Finding activities...</div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {activities.length === 0 && <div className="col-span-2 text-center py-10 text-muted-foreground">No activities found for this destination.</div>}
              {activities.map((a) => {
                const sel = picked.find(x => x.id === a.id);
                return (
                  <Card key={a.id} className="p-5 hover:border-primary/30 transition group">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <Chip color={a.category_name === "Food & Drink" ? "sunset" : a.category_name === "Adventure" ? "coral" : "sky"}>{a.category_name || "Activity"}</Chip>
                        <h3 className="font-display text-lg font-semibold mt-2">{a.name}</h3>
                      </div>
                      <div className="flex items-center gap-1 bg-sunset/10 text-sunset px-2 py-1 rounded-full text-xs font-bold">
                        <Star className="h-3 w-3 fill-sunset" /> {a.rating || "4.5"}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{a.description}</p>
                    <div className="flex flex-wrap gap-3 mt-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {a.duration_minutes} min</span>
                      <span className="flex items-center gap-1"><Wallet className="h-3 w-3" /> {Number(a.estimated_cost) === 0 ? "Free" : `$${a.estimated_cost}`}</span>
                    </div>
                    <div className="mt-4 flex gap-2">
                      <Btn size="sm" variant={sel ? "soft" : "primary"} className="flex-1" onClick={() => toggle(a)}>
                        {sel ? <><Check className="h-3.5 w-3.5" /> Added</> : <><Plus className="h-3.5 w-3.5" /> Add</>}
                      </Btn>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        <aside>
          <Card className="p-5 sticky top-32">
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Selected</div>
            <div className="font-display text-2xl font-semibold mt-1">{picked.length} {picked.length === 1 ? "activity" : "activities"}</div>
            <div className="mt-4 space-y-2">
              {picked.length === 0 && <div className="text-sm text-muted-foreground py-6 text-center">Pick activities to add them to your itinerary.</div>}
              {picked.map((a) => (
                <div key={a.id} className="flex items-center gap-2 p-2.5 rounded-lg bg-muted/50 border border-border">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold truncate">{a.name}</div>
                    <div className="text-[11px] text-muted-foreground">{a.duration_minutes}m · {Number(a.estimated_cost) === 0 ? "Free" : `$${a.estimated_cost}`}</div>
                  </div>
                  <button onClick={() => toggle(a)} className="text-muted-foreground hover:text-destructive"><X className="h-4 w-4" /></button>
                </div>
              ))}
            </div>
            {picked.length > 0 && <Btn className="w-full mt-4" onClick={handleSave} disabled={saving}>{saving ? "Saving..." : "Add to itinerary"}</Btn>}
          </Card>
        </aside>
      </div>
    </AppLayout>
  );
}
