import { Link, useRouterState } from "@tanstack/react-router";
import { ReactNode, useEffect, useState } from "react";
import {
  LayoutDashboard, Map, PlusCircle, Compass, NotebookPen, User,
  Search, Bell, Plane, Luggage, Wallet, Globe2,
} from "lucide-react";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/trips", label: "My Trips", icon: Map },
  { to: "/create-trip", label: "Plan Trip", icon: PlusCircle },
  { to: "/community", label: "Explore", icon: Compass },
  { to: "/notes", label: "Notes", icon: NotebookPen },
  { to: "/profile", label: "Profile", icon: User },
];

const tools = [
  { to: "/cities", label: "Cities", icon: Globe2 },
  { to: "/activities", label: "Activities", icon: Plane },
  { to: "/budget", label: "Budget", icon: Wallet },
  { to: "/packing", label: "Packing", icon: Luggage },
];

export function Logo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const s = size === "lg" ? "h-10 w-10 text-lg" : size === "sm" ? "h-7 w-7 text-xs" : "h-9 w-9 text-base";
  return (
    <Link to="/" className="flex items-center gap-2.5 group">
      <div className={cn("rounded-xl bg-gradient-hero grid place-items-center text-white font-bold shadow-glow", s)}>
        <Plane className="h-4 w-4 -rotate-45" />
      </div>
      <div className="leading-tight">
        <div className="font-display font-bold text-lg tracking-tight">Traveloop</div>
        {size !== "sm" && <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Plan · Explore · Go</div>}
      </div>
    </Link>
  );
}

export default function AppLayout({ children, title, subtitle, actions }: {
  children: ReactNode; title?: string; subtitle?: string; actions?: ReactNode;
}) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const isActive = (p: string) => p === "/" ? path === "/" : path.startsWith(p);
  const [user, setUser] = useState<any>(null);

  const loadUser = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await fetch("http://localhost:5000/api/users/profile", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) setUser(await res.json());
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    loadUser();
    window.addEventListener("profileUpdated", loadUser);
    return () => window.removeEventListener("profileUpdated", loadUser);
  }, []);

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar desktop */}
      <aside className="hidden lg:flex w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar fixed inset-y-0 left-0 z-30">
        <div className="px-5 py-5 border-b border-sidebar-border">
          <Logo />
        </div>
        <nav className="flex-1 overflow-y-auto px-3 py-5 space-y-6">
          <div>
            <div className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Main</div>
            <ul className="space-y-1">
              {nav.map((n) => (
                <li key={n.to}>
                  <Link to={n.to} className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                    isActive(n.to)
                      ? "bg-gradient-ocean text-primary-foreground shadow-elegant"
                      : "text-sidebar-foreground hover:bg-sidebar-accent"
                  )}>
                    <n.icon className="h-4 w-4" />
                    {n.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <div className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Trip Tools</div>
            <ul className="space-y-1">
              {tools.map((n) => (
                <li key={n.to}>
                  <Link to={n.to} className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                    isActive(n.to) ? "bg-accent text-accent-foreground" : "text-sidebar-foreground hover:bg-sidebar-accent"
                  )}>
                    <n.icon className="h-4 w-4" />
                    {n.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </nav>
        <div className="m-3 rounded-2xl p-4 bg-gradient-sunset text-white relative overflow-hidden">
          <div className="text-xs font-semibold uppercase tracking-wider opacity-90">Pro tip</div>
          <div className="font-display text-base font-semibold mt-1 leading-snug">Share trips with friends and earn travel points.</div>
          <button className="mt-3 text-xs font-semibold bg-white/20 hover:bg-white/30 backdrop-blur px-3 py-1.5 rounded-full">
            Learn more
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="sticky top-0 z-20 bg-background/80 backdrop-blur-xl border-b border-border">
          <div className="flex items-center gap-3 px-4 lg:px-8 h-16">
            <div className="lg:hidden"><Logo size="sm" /></div>
            <div className="flex-1 max-w-xl hidden lg:block">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  placeholder="Search destinations, trips, activities…"
                  className="w-full h-10 pl-10 pr-4 rounded-full bg-muted/60 border border-transparent focus:bg-card focus:border-ring outline-none text-sm transition"
                />
              </div>
            </div>
            <div className="ml-auto flex items-center gap-3">
              <button className="h-10 w-10 grid place-items-center rounded-full hover:bg-muted relative">
                <Bell className="h-4 w-4" />
                <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-coral" />
              </button>
              <Link to="/profile" className="h-9 w-9 rounded-full bg-gradient-ocean grid place-items-center text-primary-foreground text-sm font-semibold ring-2 ring-card overflow-hidden">
                {user?.profile_photo_url ? (
                   <img src={`http://localhost:5000${user.profile_photo_url}`} className="w-full h-full object-cover" alt="Profile" />
                ) : (
                   user ? (user.first_name?.[0] + (user.last_name?.[0] || "")) : "AS"
                )}
              </Link>
            </div>
          </div>
          {(title || actions) && (
            <div className="px-4 lg:px-8 pb-5 pt-2 flex flex-wrap items-end justify-between gap-4">
              <div>
                {title && <h1 className="font-display text-2xl md:text-3xl font-semibold">{title}</h1>}
                {subtitle && <p className="text-sm text-muted-foreground mt-1 max-w-2xl">{subtitle}</p>}
              </div>
              {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
            </div>
          )}
        </header>

        <main className="flex-1 px-4 lg:px-8 py-6 pb-28 lg:pb-10">{children}</main>
      </div>

      {/* Bottom nav mobile */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-card/95 backdrop-blur-xl border-t border-border">
        <div className="grid grid-cols-5">
          {nav.slice(0, 5).map((n) => (
            <Link key={n.to} to={n.to} className={cn(
              "flex flex-col items-center gap-1 py-2.5 text-[10px] font-medium",
              isActive(n.to) ? "text-primary" : "text-muted-foreground"
            )}>
              <n.icon className={cn("h-5 w-5", isActive(n.to) && "stroke-[2.5]")} />
              {n.label}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
