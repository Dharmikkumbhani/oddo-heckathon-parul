import { createFileRoute } from "@tanstack/react-router";
import AppLayout from "@/components/AppLayout";
import { Btn, Card, Chip, CityCard } from "@/components/ui-kit";
import { cities } from "@/lib/sample-data";
import { Search, Map, SlidersHorizontal } from "lucide-react";

export const Route = createFileRoute("/cities")({
  head: () => ({ meta: [{ title: "City search — Traveloop" }, { name: "description", content: "Discover and add destinations to your trip." }] }),
  component: CitySearch,
});

function CitySearch() {
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
                <div className="flex justify-between text-[11px] text-muted-foreground mt-1"><span>$</span><span>$$</span><span>$$$</span></div>
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
              <input placeholder="Search Lisbon, Bali, Kyoto…" className="w-full h-11 pl-11 pr-4 rounded-xl bg-card border border-input outline-none text-sm focus:border-ring" />
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
            <div className="text-sm text-muted-foreground"><strong className="text-foreground">{cities.length}</strong> destinations match your filters</div>
            <select className="h-9 px-3 rounded-lg bg-card border border-input text-xs">
              <option>Most popular</option><option>Highest rated</option><option>Lowest cost</option>
            </select>
          </div>
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {cities.map((c) => <CityCard key={c.name} city={c} />)}
          </div>

          <div className="mt-10">
            <h2 className="font-display text-xl font-semibold mb-4">You might also like</h2>
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {cities.slice(0, 3).map((c) => <CityCard key={c.name + "2"} city={c} />)}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
