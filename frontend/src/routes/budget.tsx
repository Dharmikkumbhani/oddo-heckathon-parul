import { createFileRoute } from "@tanstack/react-router";
import AppLayout from "@/components/AppLayout";
import { Btn, Card, Chip } from "@/components/ui-kit";
import { Plane, Bed, Camera, Utensils, Package, AlertTriangle, Edit3, Save } from "lucide-react";

export const Route = createFileRoute("/budget")({
  head: () => ({ meta: [{ title: "Trip budget — Traveloop" }, { name: "description", content: "See your full trip cost breakdown and stay on budget." }] }),
  component: BudgetPage,
});

const cats = [
  { icon: Bed, label: "Stay", val: 1200, pct: 38, color: "bg-primary", hex: "#1f7a8c" },
  { icon: Plane, label: "Transport", val: 820, pct: 26, color: "bg-coral", hex: "#e76f51" },
  { icon: Camera, label: "Activities", val: 540, pct: 17, color: "bg-emerald", hex: "#2a9d8f" },
  { icon: Utensils, label: "Meals", val: 410, pct: 13, color: "bg-sunset", hex: "#f4a261" },
  { icon: Package, label: "Misc", val: 230, pct: 6, color: "bg-sky", hex: "#5b9bd5" },
];

function BudgetPage() {
  const total = cats.reduce((s, c) => s + c.val, 0);
  const limit = 3500;
  const pct = (total / limit) * 100;

  // simple SVG donut
  let acc = 0;
  const segs = cats.map((c) => {
    const start = acc; acc += c.pct;
    return { ...c, start, end: acc };
  });

  return (
    <AppLayout
      title="Trip budget · Wonders of Japan"
      subtitle="Track estimates, stay under your limit and adjust as you plan"
      actions={<><Btn variant="outline"><Edit3 className="h-4 w-4" /> Edit budget</Btn><Btn><Save className="h-4 w-4" /> Save</Btn></>}
    >
      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        <Card className="p-6 lg:col-span-2 bg-gradient-card">
          <div className="flex flex-wrap gap-6 items-end justify-between">
            <div>
              <div className="text-xs uppercase font-semibold text-muted-foreground">Estimated total</div>
              <div className="font-display text-5xl font-semibold mt-1">${total.toLocaleString()}</div>
              <div className="text-sm text-emerald font-semibold mt-1">${(limit - total).toLocaleString()} under your ${limit.toLocaleString()} limit</div>
            </div>
            <div className="text-right">
              <div className="text-xs text-muted-foreground">Daily average</div>
              <div className="font-display text-2xl font-semibold">$266</div>
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
          <div className="mt-20 grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
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
            <div className="mt-2 h-1.5 bg-muted rounded-full"><div className={`h-full rounded-full ${c.color}`} style={{ width: `${c.pct * 2.5}%` }} /></div>
            <div className="text-[11px] text-muted-foreground mt-1">{c.pct}% of trip</div>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="font-display text-lg font-semibold">Cost by destination</h3>
          <div className="mt-5 space-y-4">
            {[
              { city: "Tokyo", days: 4, cost: 1180, pct: 90 },
              { city: "Kyoto", days: 4, cost: 980, pct: 75 },
              { city: "Osaka", days: 4, cost: 840, pct: 64 },
              { city: "Transport", days: 0, cost: 200, pct: 16 },
            ].map((c) => (
              <div key={c.city}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="font-semibold">{c.city} {c.days > 0 && <span className="text-xs text-muted-foreground font-normal">· {c.days} days</span>}</span>
                  <span className="font-semibold">${c.cost}</span>
                </div>
                <div className="h-2 bg-muted rounded-full"><div className="h-full bg-gradient-ocean rounded-full" style={{ width: `${c.pct}%` }} /></div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-display text-lg font-semibold">Daily insights</h3>
          <div className="mt-5 space-y-3">
            <div className="flex items-start gap-3 p-3 rounded-xl bg-coral/10 border border-coral/20">
              <AlertTriangle className="h-5 w-5 text-coral shrink-0" />
              <div>
                <div className="text-sm font-semibold">Day 6 · Kyoto · $410</div>
                <div className="text-xs text-muted-foreground">$144 over your daily average — kaiseki dinner pushes the day.</div>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-xl bg-emerald/10 border border-emerald/20">
              <div className="h-5 w-5 grid place-items-center text-emerald shrink-0">✓</div>
              <div>
                <div className="text-sm font-semibold">Best value · Day 9 · Osaka · $98</div>
                <div className="text-xs text-muted-foreground">Street food + free Nara temples = best per-dollar day.</div>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-xl bg-muted/40">
              <div className="h-5 w-5 grid place-items-center text-primary shrink-0">i</div>
              <div>
                <div className="text-sm font-semibold">Tip · JR Pass</div>
                <div className="text-xs text-muted-foreground">Buying a 7-day rail pass would save ~$110 across stops.</div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}
