import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { MapPin, Calendar, Wallet, Star, Plus, Heart } from "lucide-react";
import { Link } from "@tanstack/react-router";

export function Chip({ children, active, color = "default", onClick }: {
  children: ReactNode; active?: boolean; color?: "default" | "coral" | "emerald" | "sky" | "sunset"; onClick?: () => void;
}) {
  const colorMap = {
    default: active ? "bg-primary text-primary-foreground border-primary" : "bg-card text-foreground border-border hover:border-primary/40",
    coral: active ? "bg-coral text-coral-foreground border-coral" : "bg-coral/10 text-coral border-coral/20",
    emerald: active ? "bg-emerald text-white border-emerald" : "bg-emerald/10 text-emerald border-emerald/20",
    sky: active ? "bg-sky text-white border-sky" : "bg-sky/10 text-sky border-sky/20",
    sunset: active ? "bg-sunset text-white border-sunset" : "bg-sunset/10 text-sunset border-sunset/20",
  };
  return (
    <button onClick={onClick} className={cn(
      "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all",
      colorMap[color]
    )}>{children}</button>
  );
}

export function Btn({ variant = "primary", size = "md", children, className, asChild, ...props }: any) {
  const variants: Record<string, string> = {
    primary: "bg-gradient-ocean text-primary-foreground hover:opacity-95 shadow-elegant",
    coral: "bg-coral text-coral-foreground hover:opacity-95 shadow-elegant",
    outline: "border border-border bg-card hover:bg-muted text-foreground",
    ghost: "hover:bg-muted text-foreground",
    soft: "bg-accent text-accent-foreground hover:bg-accent/80",
  };
  const sizes: Record<string, string> = {
    sm: "h-8 px-3 text-xs rounded-lg",
    md: "h-10 px-4 text-sm rounded-xl",
    lg: "h-12 px-6 text-sm rounded-xl",
  };
  const Comp: any = asChild ? "span" : "button";
  return <Comp {...props} className={cn("inline-flex items-center justify-center gap-2 font-semibold transition-all", variants[variant], sizes[size], className)}>{children}</Comp>;
}

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("bg-card border border-border rounded-2xl shadow-soft", className)}>{children}</div>;
}

export function SectionHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="flex items-end justify-between gap-4 mb-4">
      <div>
        <h2 className="font-display text-xl md:text-2xl font-semibold">{title}</h2>
        {subtitle && <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function StatCard({ icon: Icon, label, value, hint, accent = "primary" }: any) {
  const colors: Record<string, string> = {
    primary: "bg-primary/10 text-primary",
    coral: "bg-coral/10 text-coral",
    emerald: "bg-emerald/10 text-emerald",
    sunset: "bg-sunset/10 text-sunset",
  };
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <div className={cn("h-10 w-10 rounded-xl grid place-items-center", colors[accent])}><Icon className="h-5 w-5" /></div>
        {hint && <span className="text-[10px] font-semibold text-emerald bg-emerald/10 px-2 py-0.5 rounded-full">{hint}</span>}
      </div>
      <div className="mt-4">
        <div className="text-2xl font-bold font-display">{value}</div>
        <div className="text-xs text-muted-foreground mt-0.5">{label}</div>
      </div>
    </Card>
  );
}

export function TripCard({ trip, onUpdate }: { trip: any; onUpdate?: () => void }) {
  const handlePublish = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/trips/${trip.id}/publish`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ isPublic: !trip.is_public })
      });
      if (res.ok) {
        if (onUpdate) onUpdate();
        else window.location.reload();
      }
    } catch (e) {
      console.error(e);
    }
  };
  
  return (
    <Card className="overflow-hidden group hover:shadow-elegant transition-all">
      <div className="relative h-44 overflow-hidden">
        <img src={trip.image} alt={trip.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        <div className="absolute top-3 left-3 flex gap-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider bg-white/90 backdrop-blur text-foreground px-2.5 py-1 rounded-full">{trip.status}</span>
        </div>
        <button className="absolute top-3 right-3 h-8 w-8 grid place-items-center rounded-full bg-white/90 backdrop-blur hover:bg-white">
          <Heart className="h-3.5 w-3.5" />
        </button>
        <div className="absolute bottom-3 left-3 right-3 text-white">
          <div className="text-xs opacity-90 flex items-center gap-1"><MapPin className="h-3 w-3" /> {trip.cities}</div>
          <h3 className="font-display text-lg font-semibold leading-tight">{trip.title}</h3>
        </div>
      </div>
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> {trip.dates}</span>
          <span className="flex items-center gap-1.5 font-semibold text-foreground"><Wallet className="h-3.5 w-3.5 text-emerald" /> {trip.budget}</span>
        </div>
        <p className="text-xs text-muted-foreground line-clamp-2">{trip.overview}</p>
        <div className="flex gap-2 pt-1">
          <Btn asChild size="sm" variant="primary" className="flex-1">
            <Link to={`/itinerary-builder`} search={{ tripId: trip.id }}>View</Link>
          </Btn>
          <Btn size="sm" variant="outline">Edit</Btn>
          <Btn size="sm" variant={trip.is_public ? "coral" : "ghost"} onClick={handlePublish}>
             {trip.is_public ? "Unpublish" : "Publish"}
          </Btn>
        </div>
      </div>
    </Card>
  );
}

export function CityCard({ city, onAdd, showAdd }: { city: any; onAdd?: () => void; showAdd?: boolean }) {
  return (
    <Card className="overflow-hidden group hover:shadow-elegant transition-all">
      <div className="relative h-40">
        <img src={city.image} alt={city.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-3 left-3 text-white">
          <div className="text-[10px] uppercase opacity-80">{city.country}</div>
          <h3 className="font-display text-lg font-semibold">{city.name}</h3>
        </div>
        <div className="absolute top-3 right-3 bg-white/95 backdrop-blur rounded-full px-2 py-1 flex items-center gap-1 text-xs font-semibold">
          <Star className="h-3 w-3 fill-sunset text-sunset" /> {city.rating}
        </div>
      </div>
      <div className="p-4 space-y-3">
        <p className="text-xs text-muted-foreground line-clamp-2">{city.desc || city.description}</p>
        <div className="flex flex-wrap gap-1.5">
          {(city.tags || []).map((t: string) => <Chip key={t} color="sky">{t}</Chip>)}
        </div>
        <div className="flex items-center justify-between pt-1">
          <span className="text-xs text-muted-foreground">Cost · <span className="text-foreground font-semibold">{city.cost}</span></span>
          {showAdd && <Btn size="sm" variant="primary" onClick={onAdd}><Plus className="h-3.5 w-3.5" /> Add</Btn>}
        </div>
      </div>
    </Card>
  );
}
