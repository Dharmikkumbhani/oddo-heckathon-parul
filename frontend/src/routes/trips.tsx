import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import AppLayout from "@/components/AppLayout";
import { Btn, Card, Chip, TripCard } from "@/components/ui-kit";
import { trips } from "@/lib/sample-data";
import { Plus, LayoutGrid, List, Filter, ArrowDownUp, MapPin, Calendar, Wallet } from "lucide-react";

export const Route = createFileRoute("/trips")({
  head: () => ({ meta: [{ title: "My trips — Traveloop" }, { name: "description", content: "View, edit and share all your planned trips." }] }),
  component: TripsPage,
});

function TripsPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<"Upcoming" | "Ongoing" | "Completed" | "Draft">("Upcoming");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [myTrips, setMyTrips] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTrips = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate({ to: "/login" });
        return;
      }
      try {
        const res = await fetch("http://localhost:5000/api/trips", {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          // map to UI shape
          const mapped = data.map((t: any) => {
            // Capitalize status
            let s = t.status ? t.status.charAt(0).toUpperCase() + t.status.slice(1) : "Draft";
            return {
              id: t.id,
              title: t.title,
              image: t.cover_image_url ? `http://localhost:5000${t.cover_image_url}` : "https://images.unsplash.com/photo-1524850011238-e3d235c7d4c9?w=600&q=80",
              cities: "0 stops planned", // placeholder until stops are implemented
              dates: `${t.start_date ? new Date(t.start_date).toLocaleDateString() : 'TBD'} - ${t.end_date ? new Date(t.end_date).toLocaleDateString() : 'TBD'}`,
              budget: `$${t.budget_range || 0}`,
              status: s,
              overview: t.description || "No description provided."
            };
          });
          setMyTrips(mapped);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTrips();
  }, [navigate]);

  const filtered = myTrips.filter((t) => t.status === tab);

  return (
    <AppLayout
      title="My trips"
      subtitle="Manage your planned, ongoing and completed adventures"
      actions={<Btn asChild variant="primary"><Link to="/create-trip"><Plus className="h-4 w-4" /> Plan New Trip</Link></Btn>}
    >
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="inline-flex bg-muted rounded-full p-1 scrollbar-hide overflow-x-auto max-w-full">
          {(["Upcoming", "Ongoing", "Completed", "Draft"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-1.5 text-xs font-semibold rounded-full transition whitespace-nowrap ${tab === t ? "bg-card shadow-soft" : "text-muted-foreground"}`}>
              {t} <span className="ml-1 opacity-60">{myTrips.filter(x => x.status === t).length}</span>
            </button>
          ))}
        </div>
        <div className="flex-1" />
        <Btn variant="outline" size="sm"><Filter className="h-4 w-4" /> Filters</Btn>
        <Btn variant="outline" size="sm"><ArrowDownUp className="h-4 w-4" /> Sort</Btn>
        <div className="inline-flex border border-border rounded-lg overflow-hidden">
          <button onClick={() => setView("grid")} className={`p-2 ${view === "grid" ? "bg-muted" : ""}`}><LayoutGrid className="h-4 w-4" /></button>
          <button onClick={() => setView("list")} className={`p-2 ${view === "list" ? "bg-muted" : ""}`}><List className="h-4 w-4" /></button>
        </div>
      </div>

      {isLoading ? (
        <div className="p-12 text-center text-muted-foreground">Loading your trips...</div>
      ) : filtered.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="mx-auto h-16 w-16 rounded-2xl bg-muted grid place-items-center mb-4"><MapPin className="h-7 w-7 text-muted-foreground" /></div>
          <h3 className="font-display text-xl font-semibold">No {tab.toLowerCase()} trips yet</h3>
          <p className="text-sm text-muted-foreground mt-1">Start planning a new journey to see it here.</p>
          <Btn asChild className="mt-5"><Link to="/create-trip">Plan a trip</Link></Btn>
        </Card>
      ) : view === "grid" ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((t) => <TripCard key={t.id} trip={t} />)}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((t) => (
            <Card key={t.id} className="p-4 flex flex-col md:flex-row gap-4">
              <img src={t.image} className="md:w-44 h-32 md:h-28 rounded-xl object-cover" alt="" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-display text-lg font-semibold">{t.title}</h3>
                  <Chip color="emerald" active={t.status === "Ongoing"}>{t.status}</Chip>
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground mt-1">
                  <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {t.cities}</span>
                  <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {t.dates}</span>
                  <span className="flex items-center gap-1"><Wallet className="h-3 w-3" /> {t.budget}</span>
                </div>
                <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{t.overview}</p>
              </div>
              <div className="flex md:flex-col gap-2 md:justify-center">
                <Btn size="sm">View</Btn>
                <Btn size="sm" variant="outline">Edit</Btn>
                <Btn size="sm" variant="ghost">Share</Btn>
              </div>
            </Card>
          ))}
        </div>
      )}
    </AppLayout>
  );
}
