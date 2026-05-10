import { createFileRoute, Link } from "@tanstack/react-router";
import AppLayout from "@/components/AppLayout";
import { Btn, Card, Chip } from "@/components/ui-kit";
import { Field, Input, TextArea } from "@/components/AuthLayout";
import { Plus, GripVertical, MapPin, Calendar, Wallet, Trash2, Plane, Bed, Utensils, Camera, ChevronDown } from "lucide-react";

export const Route = createFileRoute("/itinerary-builder")({
  head: () => ({ meta: [{ title: "Itinerary builder — Traveloop" }, { name: "description", content: "Build a multi-city day-wise itinerary with stops and activities." }] }),
  component: ItineraryBuilder,
});

const stops = [
  { city: "Tokyo, Japan", arrive: "Jun 12", depart: "Jun 16", notes: "Land at Haneda · stay in Shibuya", cost: 1180,
    activities: [
      { icon: Camera, name: "TeamLab Planets", time: "Day 2 · 10:00", cost: 38 },
      { icon: Utensils, name: "Tsukiji food crawl", time: "Day 2 · 19:00", cost: 60 },
      { icon: Bed, name: "Hotel · Shibuya Sky", time: "4 nights", cost: 720 },
    ] },
  { city: "Kyoto, Japan", arrive: "Jun 16", depart: "Jun 20", notes: "Shinkansen from Tokyo · Gion district", cost: 980,
    activities: [
      { icon: Camera, name: "Fushimi Inari sunrise", time: "Day 5 · 05:30", cost: 0 },
      { icon: Utensils, name: "Kaiseki dinner", time: "Day 5 · 19:30", cost: 120 },
      { icon: Plane, name: "Bullet train · Tokyo→Kyoto", time: "Day 5", cost: 95 },
    ] },
  { city: "Osaka, Japan", arrive: "Jun 20", depart: "Jun 24", notes: "Day trip to Nara · street food in Dotonbori", cost: 840,
    activities: [
      { icon: Camera, name: "Nara deer park", time: "Day 9 · 09:00", cost: 12 },
      { icon: Utensils, name: "Dotonbori takoyaki tour", time: "Day 9 · 18:00", cost: 35 },
    ] },
];

function ItineraryBuilder() {
  return (
    <AppLayout
      title="Wonders of Japan · Itinerary"
      subtitle="Drag to reorder · Add stops, activities and notes"
      actions={<>
        <Btn variant="outline">Save draft</Btn>
        <Btn asChild><Link to="/itinerary">Preview itinerary</Link></Btn>
      </>}
    >
      <div className="grid lg:grid-cols-[1fr_320px] gap-6">
        <div className="space-y-5">
          <Card className="p-5 bg-gradient-card">
            <div className="flex flex-wrap items-center gap-4 justify-between">
              <div>
                <div className="text-xs text-muted-foreground">Trip summary</div>
                <h2 className="font-display text-xl font-semibold">Tokyo → Kyoto → Osaka</h2>
              </div>
              <div className="flex gap-6 text-sm">
                <div><div className="text-[10px] uppercase text-muted-foreground">Days</div><div className="font-semibold">12</div></div>
                <div><div className="text-[10px] uppercase text-muted-foreground">Stops</div><div className="font-semibold">3</div></div>
                <div><div className="text-[10px] uppercase text-muted-foreground">Activities</div><div className="font-semibold">11</div></div>
                <div><div className="text-[10px] uppercase text-muted-foreground">Estimated</div><div className="font-semibold text-emerald">$3,200</div></div>
              </div>
            </div>
          </Card>

          {stops.map((s, i) => (
            <Card key={i} className="overflow-hidden">
              <div className="p-5 flex items-start gap-4 border-b border-border bg-muted/30">
                <div className="flex flex-col items-center pt-1">
                  <button className="h-7 w-7 rounded-md grid place-items-center hover:bg-card text-muted-foreground"><GripVertical className="h-4 w-4" /></button>
                  <div className="h-9 w-9 rounded-full bg-gradient-ocean grid place-items-center text-white text-xs font-bold mt-1">{i + 1}</div>
                </div>
                <div className="flex-1 grid sm:grid-cols-2 gap-3">
                  <Field label="Stop"><Input defaultValue={s.city} /></Field>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Arrive"><Input defaultValue={s.arrive} /></Field>
                    <Field label="Depart"><Input defaultValue={s.depart} /></Field>
                  </div>
                  <div className="sm:col-span-2"><Field label="Notes"><TextArea rows={2} defaultValue={s.notes} /></Field></div>
                </div>
                <div className="flex flex-col gap-2">
                  <Chip color="emerald">${s.cost}</Chip>
                  <button className="h-8 w-8 rounded-lg grid place-items-center hover:bg-destructive/10 text-destructive"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
              <div className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Activities · {s.activities.length}</div>
                  <Btn asChild size="sm" variant="soft"><Link to="/activities"><Plus className="h-3.5 w-3.5" /> Add activity</Link></Btn>
                </div>
                <div className="space-y-2">
                  {s.activities.map((a, k) => (
                    <div key={k} className="flex items-center gap-3 p-3 rounded-xl border border-border hover:border-primary/30 hover:bg-muted/30 transition group">
                      <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary grid place-items-center"><a.icon className="h-4 w-4" /></div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm">{a.name}</div>
                        <div className="text-[11px] text-muted-foreground">{a.time}</div>
                      </div>
                      <span className="text-sm font-semibold">{a.cost === 0 ? "Free" : `$${a.cost}`}</span>
                      <button className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          ))}

          <button className="w-full p-5 rounded-2xl border-2 border-dashed border-border hover:border-primary hover:bg-primary/5 transition flex items-center justify-center gap-2 text-sm font-semibold text-primary">
            <Plus className="h-4 w-4" /> Add another stop
          </button>
        </div>

        <aside className="space-y-4">
          <Card className="p-5 sticky top-32">
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Trip progress</div>
            <div className="font-display text-2xl font-semibold mt-1">68% planned</div>
            <div className="h-2 bg-muted rounded-full mt-3 overflow-hidden"><div className="h-full bg-gradient-ocean rounded-full" style={{ width: "68%" }} /></div>
            <div className="mt-5 space-y-2.5 text-sm">
              {[
                ["Trip details", true], ["Stops added", true], ["Activities", true],
                ["Budget set", false], ["Packing list", false], ["Shared", false],
              ].map(([k, done]) => (
                <div key={k as string} className="flex items-center gap-2">
                  <div className={`h-4 w-4 rounded-full grid place-items-center ${done ? "bg-emerald text-white" : "bg-muted"}`}>
                    {done && <span className="text-[9px]">✓</span>}
                  </div>
                  <span className={done ? "" : "text-muted-foreground"}>{k}</span>
                </div>
              ))}
            </div>
            <div className="mt-5 pt-5 border-t border-border space-y-3">
              <div className="text-xs uppercase font-semibold text-muted-foreground">Cost breakdown</div>
              {stops.map((s, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{s.city.split(",")[0]}</span>
                  <span className="font-semibold">${s.cost}</span>
                </div>
              ))}
              <div className="flex justify-between font-display text-lg font-semibold pt-2 border-t border-border">
                <span>Total</span><span>$3,200</span>
              </div>
            </div>
          </Card>
        </aside>
      </div>
    </AppLayout>
  );
}
