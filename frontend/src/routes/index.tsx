import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import AppLayout from "@/components/AppLayout";
import { Btn, Card, Chip, SectionHeader, StatCard, TripCard, CityCard } from "@/components/ui-kit";
import { cities, heroImg } from "@/lib/sample-data";
import { Plane, Map as MapIcon, Wallet, CalendarDays, Sparkles, ArrowRight, Search, Plus, Compass, NotebookPen, Luggage } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "Traveloop — Personalized travel planning made easy" },
    { name: "description", content: "Plan multi-city trips, estimate budgets, build itineraries and share with the community." },
  ]}),
  component: Dashboard,
});

function Dashboard() {
  const navigate = useNavigate();
  const [myTrips, setMyTrips] = useState<any[]>([]);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate({ to: "/login", replace: true });
        return;
      }
      try {
        const res = await fetch("http://localhost:5000/api/trips", {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          const mapped = data.map((t: any) => ({
            id: t.id,
            title: t.title,
            image: t.cover_image_url ? `http://localhost:5000${t.cover_image_url}` : "https://images.unsplash.com/photo-1524850011238-e3d235c7d4c9?w=600&q=80",
            cities: "0 stops planned",
            dates: `${t.start_date ? new Date(t.start_date).toLocaleDateString() : 'TBD'} - ${t.end_date ? new Date(t.end_date).toLocaleDateString() : 'TBD'}`,
            budget: `$${t.budget_range || 0}`,
            status: t.status ? t.status.charAt(0).toUpperCase() + t.status.slice(1) : "Draft",
            overview: t.description || ""
          }));
          setMyTrips(mapped);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsChecking(false);
      }
    };
    fetchData();
  }, [navigate]);

  if (isChecking) return null;

  return (
    <AppLayout>
      {/* Hero */}
      <section className="relative rounded-3xl overflow-hidden mb-8 shadow-elegant">
        <img src={heroImg} className="absolute inset-0 w-full h-full object-cover" alt="" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
        <div className="relative p-8 md:p-12 text-white max-w-2xl">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-white/15 backdrop-blur px-3 py-1.5 rounded-full">
            <Sparkles className="h-3.5 w-3.5" /> 3 new destination ideas for you
          </span>
          <h1 className="font-display text-3xl md:text-5xl font-semibold mt-4 leading-tight">
            Welcome back, Alex.<br />Where to next?
          </h1>
          <p className="mt-3 text-white/85 max-w-md">
            You have <strong>2 upcoming trips</strong> and a packing list waiting. Let's keep planning.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Btn asChild size="lg" variant="coral">
              <Link to="/create-trip" className="flex items-center gap-2"><Plus className="h-4 w-4" /> Plan New Trip</Link>
            </Btn>
            <Btn asChild size="lg" variant="outline" className="bg-white/15 border-white/30 text-white backdrop-blur hover:bg-white/25">
              <Link to="/community">Explore community</Link>
            </Btn>
          </div>
          <div className="relative mt-7 max-w-lg bg-white/95 rounded-2xl p-2 shadow-elegant flex flex-col gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input placeholder="Search a city, e.g. Tokyo, Lisbon, Reykjavík…"
                className="w-full h-10 pl-9 pr-4 bg-transparent text-foreground border-0 outline-none text-sm" />
            </div>
            <div className="flex items-center gap-3 px-2 pb-1 border-t border-muted pt-2 text-xs text-muted-foreground">
              <select className="bg-transparent border-none outline-none cursor-pointer hover:text-foreground transition-colors">
                <option>Group by: None</option>
                <option>Group by: Region</option>
                <option>Group by: Month</option>
              </select>
              <span className="w-px h-3 bg-muted"></span>
              <select className="bg-transparent border-none outline-none cursor-pointer hover:text-foreground transition-colors">
                <option>Filter: All types</option>
                <option>Filter: Adventure</option>
                <option>Filter: Relaxing</option>
              </select>
              <span className="w-px h-3 bg-muted"></span>
              <select className="bg-transparent border-none outline-none cursor-pointer hover:text-foreground transition-colors">
                <option>Sort by: Recommended</option>
                <option>Sort by: Popular</option>
                <option>Sort by: Budget</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Top Regional Selections */}
      <SectionHeader title="Top regional selections" subtitle="Explore curated trips by region" action={<Link to="/cities" className="text-sm text-primary font-semibold">View all →</Link>} />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {[
          { name: "Europe", count: "120+ destinations", img: cities[0]?.image || heroImg },
          { name: "Southeast Asia", count: "85+ destinations", img: cities[1]?.image || heroImg },
          { name: "South America", count: "40+ destinations", img: cities[2]?.image || heroImg },
          { name: "North America", count: "90+ destinations", img: cities[3]?.image || heroImg },
        ].map((region) => (
          <Card key={region.name} className="overflow-hidden group cursor-pointer relative rounded-2xl border-0">
            <img src={region.img} className="h-40 w-full object-cover group-hover:scale-105 transition duration-700 ease-out" alt={region.name} />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute bottom-4 left-4 text-white">
              <h4 className="font-semibold tracking-tight">{region.name}</h4>
              <p className="text-[11px] text-white/80 font-medium mt-0.5">{region.count}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard icon={MapIcon} label="Trips planned" value="14" hint="+2 this month" accent="primary" />
        <StatCard icon={Plane} label="Cities visited" value="37" accent="coral" />
        <StatCard icon={Wallet} label="Budget saved" value="$1,240" hint="vs estimate" accent="emerald" />
        <StatCard icon={CalendarDays} label="Days till next trip" value="32" accent="sunset" />
      </div>

      {/* Quick actions */}
      <SectionHeader title="Quick actions" subtitle="Jump back into trip planning" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
        {[
          { to: "/create-trip", icon: Plus, label: "New Trip", color: "bg-gradient-ocean text-white" },
          { to: "/cities", icon: Compass, label: "Find Cities", color: "bg-coral/10 text-coral" },
          { to: "/budget", icon: Wallet, label: "View Budget", color: "bg-emerald/10 text-emerald" },
          { to: "/packing", icon: Luggage, label: "Packing List", color: "bg-sunset/10 text-sunset" },
        ].map((a) => (
          <Link key={a.to} to={a.to} className="group">
            <Card className="p-5 hover:shadow-elegant transition-all">
              <div className={`h-10 w-10 rounded-xl grid place-items-center ${a.color}`}><a.icon className="h-5 w-5" /></div>
              <div className="mt-4 flex items-center justify-between">
                <span className="font-semibold text-sm">{a.label}</span>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition" />
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {/* Upcoming + Budget */}
      <div className="grid lg:grid-cols-3 gap-6 mb-10">
        <div className="lg:col-span-2">
          <SectionHeader title="Your upcoming trip" action={<Link to="/trips" className="text-sm text-primary font-semibold">View all →</Link>} />
          {myTrips.length > 0 ? (
            <Card className="overflow-hidden">
              <div className="grid md:grid-cols-2">
                <img src={myTrips[0].image} className="h-56 md:h-full w-full object-cover" alt="" />
                <div className="p-6 space-y-4">
                  <Chip color="coral" active>Upcoming</Chip>
                  <div>
                    <h3 className="font-display text-2xl font-semibold">{myTrips[0].title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{myTrips[0].dates}</p>
                  </div>
                  <div className="grid grid-cols-3 gap-3 py-3 border-y border-border">
                    <div><div className="text-[10px] uppercase text-muted-foreground">Days</div><div className="font-semibold">-</div></div>
                    <div><div className="text-[10px] uppercase text-muted-foreground">Stops</div><div className="font-semibold">0</div></div>
                    <div><div className="text-[10px] uppercase text-muted-foreground">Budget</div><div className="font-semibold">{myTrips[0].budget}</div></div>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs"><span className="text-muted-foreground">Planning progress</span><span className="font-semibold">10%</span></div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden"><div className="h-full bg-gradient-ocean rounded-full" style={{ width: "10%" }} /></div>
                  </div>
                  <div className="flex gap-2">
                    <Btn asChild className="flex-1"><Link to="/itinerary">Open itinerary</Link></Btn>
                    <Btn variant="outline">Share</Btn>
                  </div>
                </div>
              </div>
            </Card>
          ) : (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground mb-4">You have no upcoming trips.</p>
              <Btn asChild><Link to="/create-trip">Plan your first trip</Link></Btn>
            </Card>
          )}
        </div>
        <div>
          <SectionHeader title="Budget at a glance" />
          <Card className="p-6">
            <div className="text-xs text-muted-foreground">Total estimated</div>
            <div className="font-display text-3xl font-semibold mt-1">$3,200</div>
            <div className="text-xs text-emerald font-semibold">$240 under your limit</div>
            <div className="mt-5 space-y-3">
              {[
                { label: "Stay", val: 1200, pct: 38, color: "bg-primary" },
                { label: "Transport", val: 820, pct: 26, color: "bg-coral" },
                { label: "Activities", val: 540, pct: 17, color: "bg-emerald" },
                { label: "Meals", val: 410, pct: 13, color: "bg-sunset" },
                { label: "Misc", val: 230, pct: 6, color: "bg-sky" },
              ].map((b) => (
                <div key={b.label}>
                  <div className="flex justify-between text-xs mb-1"><span>{b.label}</span><span className="font-semibold">${b.val}</span></div>
                  <div className="h-1.5 bg-muted rounded-full"><div className={`h-full rounded-full ${b.color}`} style={{ width: `${b.pct * 2.5}%` }} /></div>
                </div>
              ))}
            </div>
            <Btn asChild variant="outline" size="sm" className="w-full mt-5"><Link to="/budget">Open budget</Link></Btn>
          </Card>
        </div>
      </div>

      {/* Recent trips */}
      <SectionHeader title="Recent trips" subtitle="Pick up where you left off" action={<Link to="/trips" className="text-sm text-primary font-semibold">All trips →</Link>} />
      {myTrips.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
          {myTrips.slice(0, 3).map((t) => <TripCard key={t.id} trip={t} />)}
        </div>
      ) : (
        <div className="mb-10 text-sm text-muted-foreground">No recent trips to show.</div>
      )}

      {/* Recommended */}
      <SectionHeader title="Trending destinations" subtitle="Hand-picked from the community this week" action={<Link to="/cities" className="text-sm text-primary font-semibold">Browse all →</Link>} />
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
        {cities.slice(0, 3).map((c) => <CityCard key={c.name} city={c} />)}
      </div>

      {/* Inspiration + Community */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="p-6 bg-gradient-hero text-white relative overflow-hidden">
          <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
          <Sparkles className="h-6 w-6" />
          <h3 className="font-display text-2xl font-semibold mt-3">Travel inspiration weekly</h3>
          <p className="text-sm text-white/85 mt-1 max-w-md">Curated destinations, off-season picks and budget tips delivered every Sunday.</p>
          <Btn variant="outline" size="sm" className="mt-4 bg-white/15 border-white/30 text-white hover:bg-white/25">Subscribe</Btn>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display text-xl font-semibold">From the community</h3>
              <p className="text-sm text-muted-foreground">Top-rated public itineraries this week</p>
            </div>
            <Link to="/community" className="text-sm text-primary font-semibold">Explore →</Link>
          </div>
          <div className="mt-4 space-y-3">
            {["7 days in Vietnam — under $700", "Solo female travel: Kyoto", "Family road trip · Pacific coast"].map((t, i) => (
              <div key={t} className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted transition">
                <div className="h-12 w-12 rounded-lg bg-gradient-ocean grid place-items-center text-white font-bold text-sm shrink-0">{i + 1}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold truncate">{t}</div>
                  <div className="text-xs text-muted-foreground">by @wanderlust · {2.3 - i * 0.4}k saves</div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </div>
            ))}
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}
