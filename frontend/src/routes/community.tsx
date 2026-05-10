import { createFileRoute, Link } from "@tanstack/react-router";
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

const trips = [
  { title: "7 days in Vietnam under $700", author: "@minh.t", dest: "Hanoi · Hội An · Saigon", days: "7d", budget: "$$", desc: "Street food, sleeper trains and beach evenings on a backpacker budget.", img: "https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=900&q=70", saves: "2.1k" },
  { title: "Solo female travel · Kyoto", author: "@ren_walks", dest: "Kyoto · Nara", days: "6d", budget: "$$", desc: "Temple mornings, slow lunches and safe night walks. Tested ryokan picks.", img: "https://images.unsplash.com/photo-1545569341-9eb8b30979d9?auto=format&fit=crop&w=900&q=70", saves: "1.8k" },
  { title: "Pacific Coast family road trip", author: "@thelongway", dest: "Seattle → San Diego", days: "14d", budget: "$$$", desc: "Two adults, two kids, one campervan. Full route with stops every 3 hours.", img: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=900&q=70", saves: "1.4k" },
  { title: "Iceland ring road in winter", author: "@fjordfan", dest: "Reykjavík → Akureyri loop", days: "10d", budget: "$$$", desc: "Northern lights chase with daily backup plans for weather.", img: "https://images.unsplash.com/photo-1500468756762-a401b6f17b46?auto=format&fit=crop&w=900&q=70", saves: "1.2k" },
  { title: "Marrakech weekend escape", author: "@zara.rides", dest: "Marrakech", days: "3d", budget: "$", desc: "Riads, souks and a quick desert overnight. Perfect long-weekend pacing.", img: "https://images.unsplash.com/photo-1597212618440-806262de4f6b?auto=format&fit=crop&w=900&q=70", saves: "980" },
  { title: "Patagonia trekkers' guide", author: "@trail_jen", dest: "El Chaltén · Torres del Paine", days: "12d", budget: "$$$", desc: "W-trek prep, gear list, hut bookings and weather backup days.", img: "https://images.unsplash.com/photo-1531176175280-33e81b2294dd?auto=format&fit=crop&w=900&q=70", saves: "920" },
];

function CommunityPage() {
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
        {trips.map((t, i) => (
          <Card key={i} className="overflow-hidden hover:shadow-elegant transition group">
            <div className="relative h-44">
              <img src={t.img} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <button className="absolute top-3 right-3 h-8 w-8 grid place-items-center rounded-full bg-white/90 backdrop-blur"><Bookmark className="h-3.5 w-3.5" /></button>
              <div className="absolute bottom-3 left-3 flex gap-1.5">
                <span className="text-[10px] font-bold bg-white/95 text-foreground px-2 py-1 rounded-full">{t.days}</span>
                <span className="text-[10px] font-bold bg-white/95 text-foreground px-2 py-1 rounded-full">{t.budget}</span>
              </div>
            </div>
            <div className="p-5">
              <h3 className="font-display text-lg font-semibold leading-tight">{t.title}</h3>
              <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1"><MapPin className="h-3 w-3" /> {t.dest}</div>
              <p className="text-sm text-muted-foreground mt-3 line-clamp-2">{t.desc}</p>
              <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-full bg-gradient-sunset" />
                  <span className="text-xs font-semibold">{t.author}</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Heart className="h-3 w-3" /> {t.saves}</span>
                </div>
              </div>
              <Btn asChild variant="outline" className="w-full mt-4" size="sm"><Link to="/shared">View itinerary</Link></Btn>
            </div>
          </Card>
        ))}
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
