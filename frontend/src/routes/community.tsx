import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import AppLayout from "@/components/AppLayout";
import { Btn, Card, Chip } from "@/components/ui-kit";
import { Search, Heart, Bookmark, MapPin, Calendar, Wallet, TrendingUp } from "lucide-react";

export const Route = createFileRoute("/community")({
  head: () => ({ meta: [
    { title: "Explore community trips — Traveloop" },
    { name: "description", content: "Discover and save curated, public itineraries from real travelers." },
  ]}),
  component: CommunityPage,
});

function CommunityPage() {
  const [trips, setTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/public/trips");
        if (res.ok) setTrips(await res.json());
      } catch (e) {
        console.error("Failed to load community trips:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchTrips();
  }, []);
  return (
    <AppLayout title="Explore community trips" subtitle="Find inspiration from real itineraries shared by travelers">
      <Card className="overflow-hidden mb-8">
        <div className="grid md:grid-cols-2">
          <div className="relative h-56 md:h-auto">
            <img src="https://images.unsplash.com/photo-1530841377377-3ff06c0ca713?auto=format&fit=crop&w=1200&q=80" className="absolute inset-0 w-full h-full object-cover" alt="" />
            <div className="absolute top-4 left-4"><Chip color="coral" active>Featured</Chip></div>
          </div>
          <div className="p-7">
            <div className="text-xs uppercase font-semibold text-muted-foreground">Trip of the week</div>
            <h2 className="font-display text-3xl font-semibold mt-2">14 days · Italian Coastline</h2>
            <p className="text-sm text-muted-foreground mt-2 max-w-md">Slow road trip through Tuscany, Cinque Terre and the Amalfi coast. Tested in shoulder season for the best light.</p>
            <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> Rome · Florence · Amalfi</span>
              <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> 14 days</span>
              <span className="flex items-center gap-1"><Wallet className="h-3 w-3" /> $2.7k mid-range</span>
              <span className="flex items-center gap-1"><Heart className="h-3 w-3" /> 3.4k saves</span>
            </div>
            <div className="mt-5 flex gap-2">
              <Btn asChild><Link to="/shared">View itinerary</Link></Btn>
              <Btn variant="outline"><Bookmark className="h-4 w-4" /> Save</Btn>
            </div>
          </div>
        </div>
      </Card>

      <div className="flex flex-col md:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input placeholder="Search 'Iceland', '7 days', 'budget Asia'…" className="w-full h-11 pl-11 pr-4 rounded-xl bg-card border border-input outline-none text-sm focus:border-ring" />
        </div>
        <select className="h-11 px-4 rounded-xl bg-card border border-input text-sm"><option>Any duration</option><option>Weekend</option><option>1 week</option><option>2+ weeks</option></select>
        <select className="h-11 px-4 rounded-xl bg-card border border-input text-sm"><option>Any budget</option><option>$ Backpacker</option><option>$$ Mid-range</option><option>$$$ Luxury</option></select>
      </div>

      <div className="flex flex-wrap gap-2 mb-7">
        {[
          ["All",true,"default"],["Adventure",false,"coral"],["Food",false,"sunset"],["Culture",false,"sky"],
          ["Nature",false,"emerald"],["Family",false,"default"],["Solo",false,"default"],["Budget",false,"default"],
        ].map(([n,a,c]: any) => <Chip key={n} active={a} color={c}>{n}</Chip>)}
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-full py-20 text-center text-muted-foreground">Loading community trips...</div>
        ) : trips.length === 0 ? (
          <div className="col-span-full py-20 text-center text-muted-foreground">No public trips available yet. Be the first to share one!</div>
        ) : trips.map((t) => {
          const days = t.start_date && t.end_date ? Math.max(1, Math.ceil((new Date(t.end_date).getTime() - new Date(t.start_date).getTime()) / (1000 * 3600 * 24))) : '?';
          const imgUrl = t.cover_image_url ? `http://localhost:5000${t.cover_image_url}` : "https://images.unsplash.com/photo-1524850011238-e3d235c7d4c9?auto=format&fit=crop&w=900&q=70";
          return (
            <Card key={t.id} className="overflow-hidden hover:shadow-elegant transition group flex flex-col">
              <div className="relative h-44 shrink-0">
                <img src={imgUrl} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-3 left-3 flex gap-1.5">
                  <span className="text-[10px] font-bold bg-white/95 text-foreground px-2 py-1 rounded-full">{days}d</span>
                  <span className="text-[10px] font-bold bg-white/95 text-foreground px-2 py-1 rounded-full">${t.budget_range || 0}</span>
                </div>
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <h3 className="font-display text-lg font-semibold leading-tight">{t.title}</h3>
                <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1"><MapPin className="h-3 w-3" /> {t.stop_count || 0} stops</div>
                <p className="text-sm text-muted-foreground mt-3 line-clamp-2 flex-1">{t.description || "A wonderful journey."}</p>
                <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-full bg-gradient-sunset" />
                    <span className="text-xs font-semibold">@{t.author_name}</span>
                  </div>
                </div>
                <Btn asChild variant="outline" className="w-full mt-4" size="sm">
                   <Link to="/shared" search={{ tripId: t.id }}>View itinerary</Link>
                </Btn>
              </div>
            </Card>
          );
        })}
      </div>

      <Card className="p-6 mt-10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-lg font-semibold flex items-center gap-2"><TrendingUp className="h-5 w-5 text-coral" /> Trending tags</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {["#slowtravel","#vanlife","#solofemale","#offgrid","#foodie","#shoulderseason","#islandhop","#workation","#weekendbreak","#hidden gems"].map((t) => (
            <Chip key={t}>{t}</Chip>
          ))}
        </div>
      </Card>
    </AppLayout>
  );
}
