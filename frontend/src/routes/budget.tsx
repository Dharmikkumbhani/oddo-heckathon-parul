import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import AppLayout from "@/components/AppLayout";
import { Btn, Card, Chip } from "@/components/ui-kit";
import { Plane, Bed, Camera, Utensils, Package, AlertTriangle, Edit3, Save } from "lucide-react";

type BudgetSearch = { tripId?: string };

export const Route = createFileRoute("/budget")({
  validateSearch: (search: Record<string, unknown>): BudgetSearch => ({ tripId: search.tripId as string | undefined }),
  head: () => ({ meta: [{ title: "Trip budget — Traveloop" }, { name: "description", content: "See your full trip cost breakdown and stay on budget." }] }),
  component: BudgetPage,
});

const defaultCats = [
  { icon: Bed, label: "Stay", color: "bg-primary", hex: "#1f7a8c" },
  { icon: Plane, label: "Transport", color: "bg-coral", hex: "#e76f51" },
  { icon: Camera, label: "Activity", color: "bg-emerald", hex: "#2a9d8f" },
  { icon: Utensils, label: "Food & Drink", color: "bg-sunset", hex: "#f4a261" },
  { icon: Package, label: "Misc", color: "bg-sky", hex: "#5b9bd5" },
];

function BudgetPage() {
  const { tripId } = Route.useSearch();
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      if (!token) return setLoading(false);
      
      if (!tripId) {
        try {
          const res = await fetch("http://localhost:5000/api/trips", { headers: { "Authorization": `Bearer ${token}` } });
          if (res.ok) {
            const trips = await res.json();
            if (trips.length > 0) return navigate({ search: { tripId: trips[0].id }, replace: true });
          }
        } catch (e) { console.error(e); }
        return setLoading(false);
      }

      try {
        const res = await fetch(`http://localhost:5000/api/trips/${tripId}/budget`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (res.ok) setData(await res.json());
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [tripId, navigate]);

  if (loading) return <AppLayout title="Loading..."><div className="p-10 text-center text-muted-foreground">Loading budget...</div></AppLayout>;
  if (!tripId || !data) return <AppLayout title="Error"><div className="p-10 text-center">Please select a valid trip from the Dashboard.</div></AppLayout>;

  const total = data.categories.reduce((s: number, c: any) => s + Number(c.total_cost), 0) || 0;
  const limit = Number(data.budget_range) || 3500;
  const pct = Math.min((total / limit) * 100, 100) || 0;

  // map backend categories to our UI categories
  const cats = defaultCats.map(dc => {
    const found = data.categories.find((c: any) => c.category_name === dc.label || (dc.label === 'Misc' && !c.category_name));
    const val = found ? Number(found.total_cost) : 0;
    return { ...dc, val, pct: total > 0 ? (val / total) * 100 : 0 };
  }).filter(c => c.val > 0 || c.label === "Misc");

  if (cats.length === 0) cats.push({ ...defaultCats[4], val: 0, pct: 0 }); // fallback

  let acc = 0;
  const segs = cats.map((c) => {
    const start = acc; acc += c.pct;
    return { ...c, start, end: acc };
  });

  return (
    <AppLayout
      title={`Trip budget · ${data.trip_title}`}
      subtitle="Track estimates, stay under your limit and adjust as you plan"
      actions={<><Btn variant="outline"><Edit3 className="h-4 w-4" /> Edit budget</Btn><Btn><Save className="h-4 w-4" /> Save</Btn></>}
    >
      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        <Card className="p-6 lg:col-span-2 bg-gradient-card">
          <div className="flex flex-wrap gap-6 items-end justify-between">
            <div>
              <div className="text-xs uppercase font-semibold text-muted-foreground">Estimated total</div>
              <div className="font-display text-5xl font-semibold mt-1">${total.toLocaleString()}</div>
              <div className="text-sm text-emerald font-semibold mt-1">${Math.max(limit - total, 0).toLocaleString()} under your ${limit.toLocaleString()} limit</div>
            </div>
          </div>
          <div className="mt-6">
            <div className="flex justify-between text-xs mb-2"><span className="text-muted-foreground">Spent of limit</span><span className="font-semibold">{Math.round(pct)}%</span></div>
            <div className="h-3 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-gradient-ocean rounded-full" style={{ width: `${pct}%` }} />
            </div>
          </div>
        </Card>

        <Card className="p-6 flex flex-col items-center">
          <div className="text-xs uppercase font-semibold text-muted-foreground mb-3">Allocation</div>
          <svg viewBox="0 0 36 36" className="h-40 w-40 -rotate-90">
            <circle cx="18" cy="18" r="15.9" fill="none" stroke="oklch(0.94 0.01 220)" strokeWidth="3.5" />
            {segs.map((s, i) => (
              <circle key={i} cx="18" cy="18" r="15.9" fill="none" stroke={s.hex} strokeWidth="3.5"
                strokeDasharray={`${s.pct} ${100 - s.pct}`} strokeDashoffset={-s.start} />
            ))}
          </svg>
          <div className="font-display text-2xl font-semibold -mt-24">${(total/1000).toFixed(1)}k</div>
          <div className="mt-20 flex flex-wrap justify-center gap-x-4 gap-y-2 text-xs w-full">
            {cats.map((c) => (
              <div key={c.label} className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full" style={{ background: c.hex }} /> {c.label}
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {cats.map((c) => (
          <Card key={c.label} className="p-5">
            <div className="h-10 w-10 rounded-xl bg-muted grid place-items-center"><c.icon className="h-5 w-5" /></div>
            <div className="mt-4 text-xs text-muted-foreground">{c.label}</div>
            <div className="font-display text-2xl font-semibold">${c.val}</div>
            <div className="mt-2 h-1.5 bg-muted rounded-full"><div className={`h-full rounded-full ${c.color}`} style={{ width: `${c.pct}%` }} /></div>
            <div className="text-[11px] text-muted-foreground mt-1">{Math.round(c.pct)}% of trip</div>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="font-display text-lg font-semibold">Cost by destination</h3>
          <div className="mt-5 space-y-4">
            {data.destinations.length === 0 && <div className="text-sm text-muted-foreground">No destinations added yet.</div>}
            {data.destinations.map((c: any) => {
              const cCost = Number(c.city_cost) || 0;
              const cPct = total > 0 ? (cCost / total) * 100 : 0;
              return (
                <div key={c.city_name}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="font-semibold">{c.city_name}</span>
                    <span className="font-semibold">${cCost}</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full"><div className="h-full bg-gradient-ocean rounded-full" style={{ width: `${cPct}%` }} /></div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-display text-lg font-semibold">Daily insights</h3>
          <div className="mt-5 space-y-3">
            <div className="flex items-start gap-3 p-3 rounded-xl bg-coral/10 border border-coral/20">
              <AlertTriangle className="h-5 w-5 text-coral shrink-0" />
              <div>
                <div className="text-sm font-semibold">Keep an eye on limits</div>
                <div className="text-xs text-muted-foreground">Try to save on transport to keep your budget balanced.</div>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-xl bg-muted/40">
              <div className="h-5 w-5 grid place-items-center text-primary shrink-0">i</div>
              <div>
                <div className="text-sm font-semibold">Tip · Add more free activities</div>
                <div className="text-xs text-muted-foreground">Search for "parks" or "walking tours" in the builder.</div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}
