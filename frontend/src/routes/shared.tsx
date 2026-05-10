import { createFileRoute, Link } from "@tanstack/react-router";
import { Btn, Card, Chip } from "@/components/ui-kit";
import { Logo } from "@/components/AppLayout";
import { Heart, Bookmark, Share2, Copy, MapPin, Calendar, Wallet, Star, MessageCircle, Plane, Bed, Utensils, Camera } from "lucide-react";

export const Route = createFileRoute("/shared")({
  head: () => ({ meta: [
    { title: "Wonders of Japan · Shared by Alex — Traveloop" },
    { name: "description", content: "A 12-day Japan itinerary across Tokyo, Kyoto and Osaka." },
    { property: "og:title", content: "Wonders of Japan · Shared by Alex" },
    { property: "og:description", content: "A 12-day itinerary across Tokyo, Kyoto and Osaka. Copy and customize for yourself." },
    { property: "og:image", content: "https://images.unsplash.com/photo-1492571350019-22de08371fd3?auto=format&fit=crop&w=1600&q=80" },
  ]}),
  component: SharedTrip,
});

function SharedTrip() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border sticky top-0 bg-background/85 backdrop-blur z-20">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Logo />
          <div className="flex gap-2">
            <Btn variant="outline" size="sm"><Bookmark className="h-4 w-4" /> Save</Btn>
            <Btn variant="coral" size="sm" asChild><Link to="/create-trip"><Copy className="h-4 w-4" /> Copy trip</Link></Btn>
          </div>
        </div>
      </header>

      <section className="relative h-[60vh] min-h-[400px] overflow-hidden">
        <img src="https://images.unsplash.com/photo-1492571350019-22de08371fd3?auto=format&fit=crop&w=1800&q=80" className="absolute inset-0 w-full h-full object-cover" alt="" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/30" />
        <div className="relative max-w-6xl mx-auto px-6 h-full flex flex-col justify-end pb-10 text-white">
          <Chip color="coral" active>Public itinerary</Chip>
          <h1 className="font-display text-4xl md:text-6xl font-semibold mt-3 max-w-3xl leading-tight">Wonders of Japan</h1>
          <p className="mt-3 max-w-xl text-white/85">Two weeks of temples, neon nights and slow ramen mornings — built for first-time visitors who still want depth.</p>
          <div className="mt-5 flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-gradient-sunset grid place-items-center font-bold text-sm">AS</div>
            <div>
              <div className="text-sm font-semibold">Alex Somerset</div>
              <div className="text-xs text-white/70">Lisbon, Portugal · 14 trips shared</div>
            </div>
            <div className="ml-auto flex gap-3 text-xs text-white/85">
              <span className="flex items-center gap-1"><Heart className="h-3.5 w-3.5" /> 1.2k</span>
              <span className="flex items-center gap-1"><Bookmark className="h-3.5 w-3.5" /> 380</span>
              <span className="flex items-center gap-1"><MessageCircle className="h-3.5 w-3.5" /> 47</span>
            </div>
          </div>
        </div>
      </section>

      <main className="max-w-6xl mx-auto px-6 py-10">
        <div className="grid sm:grid-cols-4 gap-4 mb-10">
          {[
            { icon: Calendar, k: "12 days", v: "Jun 12 – Jun 24" },
            { icon: MapPin, k: "3 cities", v: "Tokyo · Kyoto · Osaka" },
            { icon: Wallet, k: "$3,200", v: "Mid-range budget" },
            { icon: Star, k: "4.9", v: "Inspired 312 trips" },
          ].map((s) => (
            <Card key={s.k} className="p-5">
              <s.icon className="h-5 w-5 text-primary" />
              <div className="font-display text-xl font-semibold mt-3">{s.k}</div>
              <div className="text-xs text-muted-foreground">{s.v}</div>
            </Card>
          ))}
        </div>

        <h2 className="font-display text-2xl font-semibold mb-5">Trip overview</h2>
        <div className="space-y-5">
          {[
            { city: "Tokyo", days: "Days 1–4", cost: "$1,180", img: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=600&q=70", items: [
              { icon: Bed, t: "Shibuya Sky Hotel · 4 nights" },
              { icon: Camera, t: "TeamLab Planets · Shinjuku night walk" },
              { icon: Utensils, t: "Tsukiji food crawl · Ichiran ramen" },
            ]},
            { city: "Kyoto", days: "Days 5–8", cost: "$980", img: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=600&q=70", items: [
              { icon: Plane, t: "Bullet train from Tokyo" },
              { icon: Camera, t: "Fushimi Inari sunrise · Arashiyama bamboo" },
              { icon: Utensils, t: "Kaiseki dinner in Gion" },
            ]},
            { city: "Osaka", days: "Days 9–12", cost: "$840", img: "https://images.unsplash.com/photo-1590559899731-a382839e5549?auto=format&fit=crop&w=600&q=70", items: [
              { icon: Camera, t: "Day trip to Nara deer park" },
              { icon: Utensils, t: "Dotonbori takoyaki crawl" },
              { icon: Plane, t: "Departure from Kansai" },
            ]},
          ].map((s, i) => (
            <Card key={i} className="overflow-hidden">
              <div className="grid md:grid-cols-[200px_1fr]">
                <div className="relative h-40 md:h-auto">
                  <img src={s.img} className="absolute inset-0 w-full h-full object-cover" alt="" />
                </div>
                <div className="p-6">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <div className="text-xs uppercase font-semibold text-muted-foreground">{s.days}</div>
                      <h3 className="font-display text-xl font-semibold">{s.city}</h3>
                    </div>
                    <Chip color="emerald">{s.cost}</Chip>
                  </div>
                  <ul className="mt-4 space-y-2">
                    {s.items.map((it, k) => (
                      <li key={k} className="flex items-center gap-3 text-sm">
                        <div className="h-7 w-7 rounded-lg bg-primary/10 text-primary grid place-items-center"><it.icon className="h-3.5 w-3.5" /></div>
                        {it.t}
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
            <Btn variant="coral"><Copy className="h-4 w-4" /> Copy as my trip</Btn>
            <Btn variant="outline" className="bg-white/15 border-white/30 text-white hover:bg-white/25"><Share2 className="h-4 w-4" /> Share</Btn>
          </div>
        </Card>
      </main>
    </div>
  );
}
