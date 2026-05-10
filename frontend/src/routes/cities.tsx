import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import AppLayout from "@/components/AppLayout";
import { Btn, Card, Chip, CityCard } from "@/components/ui-kit";
import { Search, Map, SlidersHorizontal, Star, Plus } from "lucide-react";

type CitySearchQuery = { tripId?: string };

export const Route = createFileRoute("/cities")({
  validateSearch: (search: Record<string, unknown>): CitySearchQuery => ({ tripId: search.tripId as string | undefined }),
  head: () => ({ meta: [{ title: "City search — Traveloop" }, { name: "description", content: "Discover and add destinations to your trip." }] }),
  component: CitySearch,
});

function CitySearch() {
  const { tripId } = Route.useSearch();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [cityResults, setCityResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const searchCities = async () => {
      setLoading(true);
      try {
        const res = await fetch(`http://localhost:5000/api/cities?q=${query}`);
        if (res.ok) {
          const data = await res.json();
          const mapped = data.map((c: any) => ({
            id: c.id,
            name: c.name,
            country: c.country_name,
            image: c.image_url?.startsWith('http') ? c.image_url : `http://localhost:5000${c.image_url}`,
            desc: c.description || c.region,
            tags: c.climate_type ? [c.climate_type, c.region] : [c.region],
            cost: c.cost_index ? `$${c.cost_index}/day` : "$120/day",
            rating: c.popularity_score
          }));
          setCityResults(mapped);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    const t = setTimeout(searchCities, 300);
    return () => clearTimeout(t);
  }, [query]);

  const handleAddCity = async (cityId: string) => {
    if (!tripId) {
      alert("Please select a trip first from the Dashboard.");
      return;
    }
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/trips/${tripId}/stops`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ cityId, arrivalDate: null, departureDate: null })
      });
      if (res.ok) {
        navigate({ to: "/itinerary-builder", search: { tripId } });
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <AppLayout title="Find your next destination" subtitle="Search by country, region, vibe and budget">
      <div className="grid lg:grid-cols-[260px_1fr] gap-6">
        <aside className="space-y-5">
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold flex items-center gap-2"><SlidersHorizontal className="h-4 w-4" /> Filters</h3>
              <button className="text-xs text-primary font-semibold">Reset</button>
            </div>
            <div className="space-y-5">
              <div>
                <div className="text-xs font-semibold mb-2">Region</div>
                <div className="flex flex-wrap gap-1.5">
                  {["Europe","Asia","Africa","Americas","Oceania"].map((r,i) => <Chip key={r} active={i===1}>{r}</Chip>)}
                </div>
              </div>
              <div>
                <div className="text-xs font-semibold mb-2">Travel type</div>
                <div className="flex flex-wrap gap-1.5">
                  {["Adventure","Food","Culture","Nature","Coastal"].map((r,i) => <Chip key={r} color={(["coral","sunset","sky","emerald","default"][i]) as any} active={i===0||i===2}>{r}</Chip>)}
                </div>
              </div>
              <div>
                <div className="text-xs font-semibold mb-2">Budget</div>
                <input type="range" defaultValue={50} className="w-full accent-primary" />
                <div className="flex justify-between text-[11px] text-muted-foreground mt-1"><span>$50/day</span><span>$150/day</span><span>$300/day</span></div>
              </div>
              <div>
                <div className="text-xs font-semibold mb-2">Climate</div>
                <div className="space-y-1.5 text-sm">
                  {["Tropical","Mild","Cool","Snowy"].map((c) => (
                    <label key={c} className="flex items-center gap-2 text-muted-foreground">
                      <input type="checkbox" className="accent-primary" /> {c}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </aside>

        <div>
          <div className="flex flex-col sm:flex-row gap-3 mb-5">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input placeholder="Search Lisbon, Bali, Kyoto…" className="w-full h-11 pl-11 pr-4 rounded-xl bg-card border border-input outline-none text-sm focus:border-ring" value={query} onChange={(e) => setQuery(e.target.value)} />
            </div>
            <Btn variant="outline"><Map className="h-4 w-4" /> Map view</Btn>
          </div>

          <Card className="p-0 overflow-hidden mb-5">
            <div className="relative h-44 bg-gradient-ocean grid place-items-center text-white">
              <div className="absolute inset-0 opacity-30 bg-[url('https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=1400&q=60')] bg-cover bg-center" />
              <div className="relative text-center">
                <Map className="h-10 w-10 mx-auto opacity-90" />
                <div className="text-sm mt-2 opacity-90">Interactive map preview</div>
              </div>
            </div>
          </Card>

          <div className="flex items-center justify-between mb-3">
            <div className="text-sm text-muted-foreground"><strong className="text-foreground">{cityResults.length}</strong> destinations match your search</div>
            <select className="h-9 px-3 rounded-lg bg-card border border-input text-xs">
              <option>Most popular</option><option>Highest rated</option><option>Lowest cost</option>
            </select>
          </div>
          {loading ? (
             <div className="text-center py-10 text-muted-foreground">Searching destinations...</div>
          ) : (
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {cityResults.map((c) => <CityCard key={c.id} city={c} onAdd={() => handleAddCity(c.id)} showAdd={!!tripId} />)}
            </div>
          )}

          <div className="mt-10">
            <h2 className="font-display text-xl font-semibold mb-4">You might also like</h2>
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {cityResults.slice(0, 3).map((c) => <CityCard key={c.id + "2"} city={c} onAdd={() => handleAddCity(c.id)} showAdd={!!tripId} />)}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
