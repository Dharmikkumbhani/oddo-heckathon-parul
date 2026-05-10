import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import AppLayout from "@/components/AppLayout";
import { Btn, Card, Chip } from "@/components/ui-kit";
import { Field, Input, TextArea } from "@/components/AuthLayout";
import { Plus, GripVertical, MapPin, Calendar, Wallet, Trash2, Plane, Bed, Utensils, Camera, ChevronDown } from "lucide-react";

type ItinerarySearch = { tripId?: string };

export const Route = createFileRoute("/itinerary-builder")({
  validateSearch: (search: Record<string, unknown>): ItinerarySearch => {
    return { tripId: search.tripId as string | undefined };
  },
  head: () => ({ meta: [{ title: "Itinerary builder — Traveloop" }, { name: "description", content: "Build a multi-city day-wise itinerary with stops and activities." }] }),
  component: ItineraryBuilder,
});

function ItineraryBuilder() {
  const { tripId } = Route.useSearch();
  const navigate = useNavigate();
  const [trip, setTrip] = useState<any>(null);
  const [stops, setStops] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [draggedStopIdx, setDraggedStopIdx] = useState<number | null>(null);

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
        if (tripRes.ok) setTrip(await tripRes.json());
        if (stopsRes.ok) setStops(await stopsRes.json());
        if (actRes.ok) setActivities(await actRes.json());
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [tripId]);

  const handleDeleteStop = async (stopId: string) => {
    if (!confirm("Are you sure you want to delete this stop?")) return;
    const token = localStorage.getItem("token");
    try {
      await fetch(`http://localhost:5000/api/stops/${stopId}`, { method: "DELETE", headers: { "Authorization": `Bearer ${token}` } });
      setStops(stops.filter(s => s.id !== stopId));
    } catch (e) { console.error(e); }
  };

  const handleDeleteActivity = async (actId: string) => {
    if (!confirm("Are you sure you want to remove this activity?")) return;
    const token = localStorage.getItem("token");
    try {
      await fetch(`http://localhost:5000/api/activities/${actId}`, { method: "DELETE", headers: { "Authorization": `Bearer ${token}` } });
      setActivities(activities.filter(a => a.id !== actId));
    } catch (e) { console.error(e); }
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedStopIdx(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedStopIdx === null || draggedStopIdx === index) return;

    const newStops = [...stops];
    const draggedStop = newStops[draggedStopIdx];
    newStops.splice(draggedStopIdx, 1);
    newStops.splice(index, 0, draggedStop);
    setStops(newStops);
    setDraggedStopIdx(null);

    const stopIds = newStops.map(s => s.id);
    const token = localStorage.getItem("token");
    try {
      await fetch(`http://localhost:5000/api/trips/${tripId}/stops/reorder`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ stopIds })
      });
    } catch (e) { console.error(e); }
  };

  if (loading) return <AppLayout title="Loading..."><div className="p-10 text-center text-muted-foreground">Loading itinerary...</div></AppLayout>;
  if (!tripId || !trip) return <AppLayout title="Error"><div className="p-10 text-center">Please select a valid trip from the Dashboard.</div></AppLayout>;

  // map stops to include activities
  const stopsWithActivities = stops.map(s => {
    const sActs = activities.filter(a => a.trip_stop_id === s.id);
    const cost = sActs.reduce((sum, a) => sum + (Number(a.base_cost) || 0), 0);
    return { ...s, activities: sActs, cost };
  });

  const totalCost = stopsWithActivities.reduce((sum, s) => sum + s.cost, 0);
  const days = Math.ceil((new Date(trip.end_date).getTime() - new Date(trip.start_date).getTime()) / (1000 * 3600 * 24)) || 0;

  const iconMap: Record<string, any> = { camera: Camera, utensils: Utensils, compass: MapPin, default: MapPin };

  return (
    <AppLayout
      title={`${trip.title} · Itinerary`}
      subtitle="Drag to reorder · Add stops, activities and notes"
      actions={<>
        <Btn variant="outline">Save draft</Btn>
        <Btn asChild><Link to="/itinerary" search={{ tripId }}>Preview itinerary</Link></Btn>
      </>}
    >
      <div className="grid lg:grid-cols-[1fr_320px] gap-6">
        <div className="space-y-5">
          <Card className="p-5 bg-gradient-card">
            <div className="flex flex-wrap items-center gap-4 justify-between">
              <div>
                <div className="text-xs text-muted-foreground">Trip summary</div>
                <h2 className="font-display text-xl font-semibold">
                  {stops.length > 0 ? stops.map(s => s.city_name).join(" → ") : "No stops added yet"}
                </h2>
              </div>
              <div className="flex gap-6 text-sm">
                <div><div className="text-[10px] uppercase text-muted-foreground">Days</div><div className="font-semibold">{days}</div></div>
                <div><div className="text-[10px] uppercase text-muted-foreground">Stops</div><div className="font-semibold">{stops.length}</div></div>
                <div><div className="text-[10px] uppercase text-muted-foreground">Activities</div><div className="font-semibold">{activities.length}</div></div>
                <div><div className="text-[10px] uppercase text-muted-foreground">Estimated</div><div className="font-semibold text-emerald">${totalCost}</div></div>
              </div>
            </div>
          </Card>

          {stopsWithActivities.length === 0 && (
             <Card className="p-10 text-center space-y-4 border-dashed bg-transparent shadow-none">
                <div className="text-muted-foreground">Your itinerary is empty. Let's add some destinations!</div>
             </Card>
          )}

          {stopsWithActivities.map((s, i) => (
            <div 
              key={s.id} 
              className="bg-card border border-border rounded-2xl shadow-soft overflow-hidden hover:border-primary/30 transition-colors"
              draggable
              onDragStart={(e) => handleDragStart(e, i)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, i)}
            >
              <div className="p-5 flex items-start gap-4 border-b border-border bg-muted/30">
                <div className="flex flex-col items-center pt-1 cursor-grab active:cursor-grabbing">
                  <button className="h-7 w-7 rounded-md grid place-items-center hover:bg-card text-muted-foreground"><GripVertical className="h-4 w-4" /></button>
                  <div className="h-9 w-9 rounded-full bg-gradient-ocean grid place-items-center text-white text-xs font-bold mt-1">{i + 1}</div>
                </div>
                <div className="flex-1 grid sm:grid-cols-2 gap-3">
                  <Field label="Stop"><Input defaultValue={s.city_name} disabled className="bg-muted/50" /></Field>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Arrive"><Input defaultValue={s.arrival_date ? new Date(s.arrival_date).toLocaleDateString() : ''} /></Field>
                    <Field label="Depart"><Input defaultValue={s.departure_date ? new Date(s.departure_date).toLocaleDateString() : ''} /></Field>
                  </div>
                  <div className="sm:col-span-2"><Field label="Notes"><TextArea rows={2} placeholder="Add specific notes for this stop..." /></Field></div>
                </div>
                <div className="flex flex-col gap-2">
                  <Chip color="emerald">${s.cost}</Chip>
                  <button onClick={() => handleDeleteStop(s.id)} className="h-8 w-8 rounded-lg grid place-items-center hover:bg-destructive/10 text-destructive"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
              <div className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Activities · {s.activities.length}</div>
                  <Btn asChild size="sm" variant="soft"><Link to="/activities" search={{ tripId, stopId: s.id, cityId: s.city_id }}><Plus className="h-3.5 w-3.5" /> Add activity</Link></Btn>
                </div>
                <div className="space-y-2">
                  {s.activities.map((a: any) => {
                    const ActIcon = iconMap[a.icon_name] || MapPin;
                    return (
                      <div key={a.id} className="flex items-center gap-3 p-3 rounded-xl border border-border hover:border-primary/30 hover:bg-muted/30 transition group">
                        <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary grid place-items-center"><ActIcon className="h-4 w-4" /></div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-sm">{a.name}</div>
                          <div className="text-[11px] text-muted-foreground">{a.activity_date ? new Date(a.activity_date).toLocaleDateString() : 'Date TBD'}</div>
                        </div>
                        <span className="text-sm font-semibold">{Number(a.base_cost) === 0 ? "Free" : `$${a.base_cost}`}</span>
                        <button onClick={() => handleDeleteActivity(a.id)} className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    );
                  })}
                  {s.activities.length === 0 && (
                    <div className="text-sm text-muted-foreground italic text-center py-4">No activities planned yet.</div>
                  )}
                </div>
              </div>
            </div>
          ))}

          <Btn asChild variant="outline" className="w-full border-dashed p-5 h-auto text-primary border-2 border-border hover:border-primary hover:bg-primary/5">
            <Link to="/cities" search={{ tripId }}>
              <Plus className="h-4 w-4" /> Add a destination
            </Link>
          </Btn>
        </div>

        <aside className="space-y-4">
          <Card className="p-5 sticky top-32">
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Trip progress</div>
            <div className="font-display text-2xl font-semibold mt-1">
              {stops.length > 0 ? "Planned" : "Drafting"}
            </div>
            <div className="h-2 bg-muted rounded-full mt-3 overflow-hidden">
               <div className="h-full bg-gradient-ocean rounded-full transition-all" style={{ width: stops.length > 0 ? "70%" : "20%" }} />
            </div>
            <div className="mt-5 space-y-2.5 text-sm">
              {[
                ["Trip details", true], ["Stops added", stops.length > 0], ["Activities", activities.length > 0],
                ["Budget set", Number(trip.budget_range) > 0], ["Shared", false],
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
              {stopsWithActivities.map((s, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{s.city_name}</span>
                  <span className="font-semibold">${s.cost}</span>
                </div>
              ))}
              <div className="flex justify-between font-display text-lg font-semibold pt-2 border-t border-border">
                <span>Total</span><span className="text-emerald">${totalCost}</span>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                 <span>Budget</span><span>${trip.budget_range}</span>
              </div>
            </div>
          </Card>
        </aside>
      </div>
    </AppLayout>
  );
}

