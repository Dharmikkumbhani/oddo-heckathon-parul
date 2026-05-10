import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Btn, Card, Chip } from "@/components/ui-kit";
import { Logo } from "@/components/AppLayout";
import { Heart, Bookmark, Share2, Copy, MapPin, Calendar, Wallet, Star, MessageCircle, Plane, Bed, Utensils, Camera, Activity } from "lucide-react";

type SharedSearch = { tripId?: string };

export const Route = createFileRoute("/shared")({
  validateSearch: (search: Record<string, unknown>): SharedSearch => ({ tripId: search.tripId as string | undefined }),
  head: () => ({ meta: [
    { title: "Trip Shared — Traveloop" },
    { name: "description", content: "View a public itinerary." }
  ]}),
  component: SharedTrip,
});

function SharedTrip() {
  const { tripId } = Route.useSearch();
  const navigate = useNavigate();
  
  const [trip, setTrip] = useState<any>(null);
  const [stops, setStops] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [duplicating, setDuplicating] = useState(false);

  useEffect(() => {
    if (!tripId) { setLoading(false); return; }
    const fetchTrip = async () => {
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
    fetchTrip();
  }, [tripId]);

  const handleDuplicate = async () => {
    if (!tripId) return;
    setDuplicating(true);
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`http://localhost:5000/api/trips/${tripId}/duplicate`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        navigate({ to: "/itinerary-builder", search: { tripId: data.id } });
      } else {
         alert("Failed to duplicate trip.");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setDuplicating(false);
    }
  };

  if (loading) return <div className="min-h-screen grid place-items-center">Loading...</div>;
  if (!trip) return <div className="min-h-screen grid place-items-center">Trip not found or private.</div>;

  const stopsWithActivities = stops.map(s => {
    const sActs = activities.filter(a => a.trip_stop_id === s.id);
    const cost = sActs.reduce((sum, a) => sum + (Number(a.base_cost) || 0), 0);
    return { ...s, activities: sActs, cost };
  });

  const totalCost = stopsWithActivities.reduce((sum, s) => sum + s.cost, 0);
  const days = Math.ceil((new Date(trip.end_date).getTime() - new Date(trip.start_date).getTime()) / (1000 * 3600 * 24)) || 0;
  const imgUrl = trip.cover_image_url ? `http://localhost:5000${trip.cover_image_url}` : "https://images.unsplash.com/photo-1492571350019-22de08371fd3?auto=format&fit=crop&w=1800&q=80";

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border sticky top-0 bg-background/85 backdrop-blur z-20">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2"><Logo /></Link>
          <div className="flex gap-2">
            <Btn variant="outline" size="sm"><Bookmark className="h-4 w-4" /> Save</Btn>
            <Btn variant="coral" size="sm" onClick={handleDuplicate} disabled={duplicating}>
              <Copy className="h-4 w-4" /> {duplicating ? "Copying..." : "Copy trip"}
            </Btn>
          </div>
        </div>
      </header>

      <section className="relative h-[60vh] min-h-[400px] overflow-hidden">
        <img src={imgUrl} className="absolute inset-0 w-full h-full object-cover" alt="" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/30" />
        <div className="relative max-w-6xl mx-auto px-6 h-full flex flex-col justify-end pb-10 text-white">
          {trip.is_public && <Chip color="coral" active>Public itinerary</Chip>}
          <h1 className="font-display text-4xl md:text-6xl font-semibold mt-3 max-w-3xl leading-tight">{trip.title}</h1>
          <p className="mt-3 max-w-xl text-white/85">{trip.description}</p>
          <div className="mt-5 flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-gradient-sunset grid place-items-center font-bold text-sm">
               {trip.author_name ? trip.author_name.charAt(0).toUpperCase() : "U"}
            </div>
            <div>
              <div className="text-sm font-semibold">@{trip.author_name || "Traveler"}</div>
            </div>
            <div className="ml-auto flex gap-3 text-xs text-white/85">
              <span className="flex items-center gap-1"><Heart className="h-3.5 w-3.5" /> 1.2k</span>
              <span className="flex items-center gap-1"><Bookmark className="h-3.5 w-3.5" /> 380</span>
            </div>
          </div>
        </div>
      </section>

      <main className="max-w-6xl mx-auto px-6 py-10">
        <div className="grid sm:grid-cols-4 gap-4 mb-10">
          {[
            { icon: Calendar, k: `${days} days`, v: `${trip.start_date ? new Date(trip.start_date).toLocaleDateString() : 'TBD'} – ${trip.end_date ? new Date(trip.end_date).toLocaleDateString() : 'TBD'}` },
            { icon: MapPin, k: `${stops.length} stops`, v: stops.map(s => s.city_name).join(' · ') || "No stops" },
            { icon: Wallet, k: `$${totalCost}`, v: "Total activity cost" },
            { icon: Star, k: "4.9", v: "Highly rated" },
          ].map((s) => (
            <Card key={s.k} className="p-5">
              <s.icon className="h-5 w-5 text-primary" />
              <div className="font-display text-xl font-semibold mt-3">{s.k}</div>
              <div className="text-xs text-muted-foreground line-clamp-1">{s.v}</div>
            </Card>
          ))}
        </div>

        <h2 className="font-display text-2xl font-semibold mb-5">Trip overview</h2>
        <div className="space-y-5">
          {stopsWithActivities.length === 0 && <div className="text-muted-foreground">This trip has no destinations yet.</div>}
          {stopsWithActivities.map((s, i) => (
            <Card key={s.id} className="overflow-hidden">
              <div className="grid md:grid-cols-[200px_1fr]">
                <div className="relative h-40 md:h-auto">
                  <img src={s.city_image || "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=600&q=70"} className="absolute inset-0 w-full h-full object-cover" alt="" />
                </div>
                <div className="p-6">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <div className="text-xs uppercase font-semibold text-muted-foreground">Stop {i + 1}</div>
                      <h3 className="font-display text-xl font-semibold">{s.city_name}</h3>
                    </div>
                    <Chip color="emerald">${s.cost}</Chip>
                  </div>
                  <ul className="mt-4 space-y-2">
                    {s.activities.length === 0 && <li className="text-sm text-muted-foreground">No specific activities planned here.</li>}
                    {s.activities.map((it: any, k: number) => (
                      <li key={k} className="flex items-center gap-3 text-sm">
                        <div className="h-7 w-7 rounded-lg bg-primary/10 text-primary grid place-items-center"><Activity className="h-3.5 w-3.5" /></div>
                        <div>
                          <div>{it.name}</div>
                          <div className="text-xs text-muted-foreground">{it.activity_date ? new Date(it.activity_date).toLocaleDateString() : 'Date TBD'}</div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <Card className="p-8 mt-10 bg-gradient-hero text-white text-center">
          <h3 className="font-display text-3xl font-semibold">Loved this trip?</h3>
          <p className="mt-2 text-white/85 max-w-md mx-auto">Copy it as a starting point and customize dates, stops and budget for your own version.</p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <Btn variant="coral" onClick={handleDuplicate} disabled={duplicating}>
              <Copy className="h-4 w-4" /> {duplicating ? "Copying..." : "Copy as my trip"}
            </Btn>
            <Btn variant="outline" className="bg-white/15 border-white/30 text-white hover:bg-white/25"><Share2 className="h-4 w-4" /> Share</Btn>
          </div>
        </Card>
      </main>
    </div>
  );
}
