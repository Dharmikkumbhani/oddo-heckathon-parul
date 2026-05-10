import { ReactNode } from "react";
import { Logo } from "./AppLayout";

export default function AuthLayout({ children, title, subtitle, footer }: {
  children: ReactNode; title: string; subtitle?: string; footer?: ReactNode;
}) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      <div className="hidden lg:block relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1500835556837-99ac94a94552?auto=format&fit=crop&w=1400&q=80"
          alt="Travel"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/70 via-primary/40 to-coral/60" />
        <div className="relative z-10 h-full flex flex-col justify-between p-10 text-white">
          <Logo size="md" />
          <div className="space-y-6 max-w-md">
            <h2 className="font-display text-4xl font-semibold leading-tight">
              Plan unforgettable journeys, one stop at a time.
            </h2>
            <p className="text-white/85">
              Build multi-city itineraries, estimate budgets, and share your trips with the community.
            </p>
            <div className="flex gap-2 pt-2">
              {[1,2,3,4].map((i) => (
                <span key={i} className={`h-1.5 rounded-full ${i===1 ? "bg-white w-8" : "bg-white/40 w-3"}`} />
              ))}
            </div>
          </div>
          <div className="text-xs text-white/70">© 2026 Traveloop · Made for explorers</div>
        </div>
      </div>
      <div className="flex items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-md space-y-7">
          <div className="lg:hidden"><Logo /></div>
          <div>
            <h1 className="font-display text-3xl font-semibold">{title}</h1>
            {subtitle && <p className="text-sm text-muted-foreground mt-1.5">{subtitle}</p>}
          </div>
          {children}
          {footer && <div className="text-sm text-center text-muted-foreground pt-2">{footer}</div>}
        </div>
      </div>
    </div>
  );
}

export function Field({ label, hint, error, children }: { label: string; hint?: string; error?: string; children: ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</label>
      {children}
      {hint && !error && <p className="text-[11px] text-muted-foreground">{hint}</p>}
      {error && <p className="text-[11px] text-destructive font-medium">{error}</p>}
    </div>
  );
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full h-11 px-4 rounded-xl bg-card border border-input focus:border-ring focus:ring-4 focus:ring-ring/15 outline-none text-sm transition ${props.className ?? ""}`}
    />
  );
}

export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`w-full px-4 py-3 rounded-xl bg-card border border-input focus:border-ring focus:ring-4 focus:ring-ring/15 outline-none text-sm transition ${props.className ?? ""}`}
    />
  );
}
