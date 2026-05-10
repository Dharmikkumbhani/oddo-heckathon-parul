import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import AppLayout from "@/components/AppLayout";
import { Btn, Card, Chip } from "@/components/ui-kit";
import { Calendar, List as ListIcon, Clock, MapPin, Plane, Edit3, Share2, Copy, Download, Bed, Utensils, Camera, Train } from "lucide-react";

type ItinerarySearch = { tripId?: string };

export const Route = createFileRoute("/itinerary")({
  validateSearch: (search: Record<string, unknown>): ItinerarySearch => ({
    tripId: search.tripId as string | undefined,
  }),
  head: () => ({ meta: [{ title: "Itinerary view — Traveloop" }, { name: "description", content: "Read your fully-planned trip in a clean timeline view." }] }),
  component: ItineraryView,
});

const catColor: Record<string, any> = { Transport: "sky", Stay: "default", Food: "coral", Culture: "sunset", Free: "emerald", Activity: "emerald" };
const iconMap: Record<string, any> = { camera: Camera, utensils: Utensils, compass: MapPin, train: Train, plane: Plane, bed: Bed, default: MapPin };

function ItineraryView() {
  const { tripId } = Route.useSearch();
  const [view, setView] = useState<"timeline" | "calendar" | "list">("timeline");
  const [trip, setTrip] = useState<any>(null);
  const [days, setDays] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!tripId) {
      setLoading(false);
      return;
    }
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      try {
        const [tripRes, stopsRes, actRes] = await Promise.all([
          fetch(`http://localhost:5000/api/trips/${tripId}`, { headers: { "Authorization": `Bearer ${token}` } }),
          fetch(`http://localhost:5000/api/trips/${tripId}/stops`, { headers: { "Authorization": `Bearer ${token}` } }),
          fetch(`http://localhost:5000/api/trips/${tripId}/activities`, { headers: { "Authorization": `Bearer ${token}` } })
        ]);
        if (tripRes.ok && stopsRes.ok && actRes.ok) {
          const tripData = await tripRes.json();
          const stopsData = await stopsRes.json();
          const actsData = await actRes.json();

          setTrip(tripData);
          
          // Map to days array
          const groupedDays: any[] = [];
          let currentDayNum = 1;
          
          stopsData.forEach((stop: any) => {
            const stopActs = actsData.filter((a: any) => a.trip_stop_id === stop.id);
            
            // Format date if available
            let dateStr = "TBD";
            if (stop.arrival_date) {
               const d = new Date(stop.arrival_date);
               dateStr = `${d.toLocaleString('default', { month: 'short' })} ${d.getDate()} · ${d.toLocaleString('default', { weekday: 'short' })}`;
            }

            const items = stopActs.map((act: any) => {
               const ActIcon = iconMap[act.icon_name] || MapPin;
               const isFree = Number(act.base_cost) === 0;
               return {
                 time: act.start_time ? act.start_time.substring(0,5) : "TBD",
                 icon: ActIcon,
                 title: act.name,
                 cat: act.category_name || "Activity",
                 cost: isFree ? "Free" : `$${act.base_cost}`
               };
            });

            // If no activities, add a placeholder or simple arrival
            if (items.length === 0) {
               items.push({
                 time: "TBD", icon: Plane, title: `Arrive in ${stop.city_name}`, cat: "Transport", cost: "$0"
               });
            }

            groupedDays.push({
              day: currentDayNum++,
              date: dateStr,
              city: stop.city_name,
              items: items
            });
          });

          setDays(groupedDays);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [tripId]);

  if (loading) return <AppLayout title="Loading..."><div className="p-10 text-center text-muted-foreground">Loading itinerary...</div></AppLayout>;
  if (!tripId || !trip) return <AppLayout title="Error"><div className="p-10 text-center">Please select a valid trip from the Dashboard.</div></AppLayout>;

  // calculate totals
  const totalDays = Math.ceil((new Date(trip.end_date).getTime() - new Date(trip.start_date).getTime()) / (1000 * 3600 * 24)) || 0;
  const numStops = days.length;
  const numActivities = days.reduce((sum, d) => sum + d.items.length, 0);
  const totalCost = days.reduce((sum, d) => sum + d.items.reduce((s: number, i: any) => s + (parseInt(i.cost.replace(/[^0-9]/g, "")) || 0), 0), 0);
  const avgPerDay = totalDays > 0 ? Math.round(totalCost / totalDays) : totalCost;

  return (
    <AppLayout>
      {/* Hero header */}
      <div className="rounded-3xl overflow-hidden relative shadow-elegant mb-8">
        <img src={trip.cover_image_url ? `http://localhost:5000${trip.cover_image_url}` : "https://images.unsplash.com/photo-1492571350019-22de08371fd3?auto=format&fit=crop&w=1600&q=80"} className="absolute inset-0 w-full h-full object-cover" alt="" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/30" />
        <div className="relative p-8 md:p-12 text-white">
          <div className="flex items-center gap-2 text-xs"><Chip color="coral" active>{trip.status ? trip.status.charAt(0).toUpperCase() + trip.status.slice(1) : 'Upcoming'}</Chip></div>
          <h1 className="font-display text-4xl md:text-5xl font-semibold mt-3">{trip.title}</h1>
          <div className="flex flex-wrap gap-x-6 gap-y-2 mt-4 text-sm">
            <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4" /> {trip.start_date ? new Date(trip.start_date).toLocaleDateString() : 'TBD'} – {trip.end_date ? new Date(trip.end_date).toLocaleDateString() : 'TBD'} · {totalDays} days</span>
            <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4" /> {numStops} cities · {numActivities} activities</span>
          </div>
          <div className="mt-6 flex flex-wrap gap-2">
            <Btn variant="coral" asChild><Link to="/itinerary-builder" search={{ tripId }}><Edit3 className="h-4 w-4" /> Edit</Link></Btn>
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
                      <Chip color="default">${d.items.reduce((s: number, i: any) => s + (parseInt(i.cost.replace(/[^0-9]/g, "")) || 0), 0)}</Chip>
                    </div>
                    <div className="divide-y divide-border">
                      {d.items.map((it: any, k: number) => (
                        <div key={k} className="flex items-center gap-4 p-4 hover:bg-muted/30 transition">
                          <div className="text-xs font-mono text-muted-foreground w-12">{it.time}</div>
                          <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary grid place-items-center"><it.icon className="h-4 w-4" /></div>
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-sm">{it.title}</div>
                            <Chip color={catColor[it.cat] || "default"}>{it.cat}</Chip>
                          </div>
                          <div className="text-sm font-semibold">{it.cost}</div>
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>
              ))}
              {days.length === 0 && (
                <Card className="p-10 text-center text-muted-foreground border-dashed">
                  No stops added to this itinerary yet. 
                </Card>
              )}
            </div>
          </div>
        </div>

        <aside>
          <Card className="p-5 sticky top-32">
            <div className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Trip total</div>
            <div className="font-display text-3xl font-semibold mt-1">${totalCost}</div>
            <div className="text-xs text-muted-foreground mt-1">Budget limit: ${trip.budget_range || 0}</div>
            <div className="mt-5 space-y-3">
              {[
                ["Days", totalDays], ["Stops", numStops], ["Activities", numActivities], ["Avg / day", `$${avgPerDay}`],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between text-sm"><span className="text-muted-foreground">{k}</span><span className="font-semibold">{v}</span></div>
              ))}
            </div>
            <Btn asChild variant="outline" size="sm" className="w-full mt-5"><Link to="/budget" search={{ tripId }}>Open budget</Link></Btn>
          </Card>
        </aside>
      </div>
    </AppLayout>
  );
}
