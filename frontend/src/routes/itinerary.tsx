import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import AppLayout from "@/components/AppLayout";
import { Btn, Card, Chip } from "@/components/ui-kit";
import { Calendar, List as ListIcon, Clock, MapPin, Plane, Edit3, Share2, Copy, Download, Bed, Utensils, Camera, Train } from "lucide-react";

export const Route = createFileRoute("/itinerary")({
  head: () => ({ meta: [{ title: "Itinerary view — Traveloop" }, { name: "description", content: "Read your fully-planned trip in a clean timeline view." }] }),
  component: ItineraryView,
});

const days = [
  { day: 1, date: "Jun 12 · Sun", city: "Tokyo", items: [
    { time: "14:00", icon: Plane, title: "Land · Haneda Airport", cat: "Transport", cost: "$0" },
    { time: "16:30", icon: Bed, title: "Check in · Shibuya Sky Hotel", cat: "Stay", cost: "$180" },
    { time: "19:00", icon: Utensils, title: "Welcome ramen at Ichiran", cat: "Food", cost: "$22" },
  ]},
  { day: 2, date: "Jun 13 · Mon", city: "Tokyo", items: [
    { time: "09:00", icon: Camera, title: "TeamLab Planets immersive", cat: "Culture", cost: "$38" },
    { time: "13:00", icon: Utensils, title: "Sushi at Tsukiji outer market", cat: "Food", cost: "$45" },
    { time: "20:00", icon: Camera, title: "Shinjuku night walk", cat: "Free", cost: "Free" },
  ]},
  { day: 5, date: "Jun 16 · Thu", city: "Kyoto", items: [
    { time: "08:00", icon: Train, title: "Bullet train · Tokyo → Kyoto", cat: "Transport", cost: "$95" },
    { time: "12:30", icon: Bed, title: "Check in · Gion Ryokan", cat: "Stay", cost: "$220" },
    { time: "17:00", icon: Camera, title: "Fushimi Inari sunset", cat: "Free", cost: "Free" },
  ]},
];

const catColor: Record<string, any> = { Transport: "sky", Stay: "default", Food: "coral", Culture: "sunset", Free: "emerald" };

function ItineraryView() {
  const [view, setView] = useState<"timeline" | "calendar" | "list">("timeline");

  return (
    <AppLayout>
      {/* Hero header */}
      <div className="rounded-3xl overflow-hidden relative shadow-elegant mb-8">
        <img src="https://images.unsplash.com/photo-1492571350019-22de08371fd3?auto=format&fit=crop&w=1600&q=80" className="absolute inset-0 w-full h-full object-cover" alt="" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/30" />
        <div className="relative p-8 md:p-12 text-white">
          <div className="flex items-center gap-2 text-xs"><Chip color="coral" active>Upcoming</Chip><span className="opacity-80">in 32 days</span></div>
          <h1 className="font-display text-4xl md:text-5xl font-semibold mt-3">Wonders of Japan</h1>
          <div className="flex flex-wrap gap-x-6 gap-y-2 mt-4 text-sm">
            <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4" /> Jun 12 – Jun 24, 2026 · 12 days</span>
            <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4" /> 3 cities · 11 activities</span>
          </div>
          <div className="mt-6 flex flex-wrap gap-2">
            <Btn variant="coral" asChild><Link to="/itinerary-builder"><Edit3 className="h-4 w-4" /> Edit</Link></Btn>
            <Btn asChild variant="outline" className="bg-white/15 border-white/30 text-white hover:bg-white/25"><Link to="/shared"><Share2 className="h-4 w-4" /> Share</Link></Btn>
            <Btn variant="outline" className="bg-white/15 border-white/30 text-white hover:bg-white/25"><Download className="h-4 w-4" /> Export PDF</Btn>
            <Btn variant="outline" className="bg-white/15 border-white/30 text-white hover:bg-white/25"><Copy className="h-4 w-4" /> Copy trip</Btn>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_300px] gap-6">
        <div>
          <div className="flex items-center justify-between mb-5">
            <div className="inline-flex bg-muted rounded-full p-1">
              {[
                ["timeline", Clock],
                ["calendar", Calendar],
                ["list", ListIcon],
              ].map(([v, Icon]: any) => (
                <button key={v} onClick={() => setView(v)}
                  className={`px-4 py-1.5 text-xs font-semibold rounded-full transition flex items-center gap-1.5 capitalize ${view === v ? "bg-card shadow-soft" : "text-muted-foreground"}`}>
                  <Icon className="h-3.5 w-3.5" /> {v}
                </button>
              ))}
            </div>
            <span className="text-xs text-muted-foreground">{days.length} days shown</span>
          </div>

          <div className="relative">
            <div className="absolute left-[19px] top-2 bottom-2 w-px bg-border lg:block" />
            <div className="space-y-6">
              {days.map((d) => (
                <div key={d.day} className="relative pl-12">
                  <div className="absolute left-0 top-0 h-10 w-10 rounded-full bg-gradient-ocean text-white grid place-items-center font-bold text-sm shadow-elegant">D{d.day}</div>
                  <Card className="overflow-hidden">
                    <div className="px-5 py-3 border-b border-border bg-muted/40 flex items-center justify-between">
                      <div>
                        <div className="font-semibold">{d.date}</div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="h-3 w-3" /> {d.city}</div>
                      </div>
                      <Chip color="default">${d.items.reduce((s, i) => s + (parseInt(i.cost.replace(/[^0-9]/g, "")) || 0), 0)}</Chip>
                    </div>
                    <div className="divide-y divide-border">
                      {d.items.map((it, k) => (
                        <div key={k} className="flex items-center gap-4 p-4 hover:bg-muted/30 transition">
                          <div className="text-xs font-mono text-muted-foreground w-12">{it.time}</div>
                          <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary grid place-items-center"><it.icon className="h-4 w-4" /></div>
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-sm">{it.title}</div>
                            <Chip color={catColor[it.cat]}>{it.cat}</Chip>
                          </div>
                          <div className="text-sm font-semibold">{it.cost}</div>
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        </div>

        <aside>
          <Card className="p-5 sticky top-32">
            <div className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Trip total</div>
            <div className="font-display text-3xl font-semibold mt-1">$3,200</div>
            <div className="text-xs text-emerald font-semibold">$240 under budget</div>
            <div className="mt-5 space-y-3">
              {[
                ["Days", "12"], ["Stops", "3"], ["Activities", "11"], ["Avg / day", "$266"],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between text-sm"><span className="text-muted-foreground">{k}</span><span className="font-semibold">{v}</span></div>
              ))}
            </div>
            <Btn asChild variant="outline" size="sm" className="w-full mt-5"><Link to="/budget">Open budget</Link></Btn>
          </Card>
        </aside>
      </div>
    </AppLayout>
  );
}
