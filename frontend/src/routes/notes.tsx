import { createFileRoute } from "@tanstack/react-router";
import AppLayout from "@/components/AppLayout";
import { Btn, Card, Chip } from "@/components/ui-kit";
import { Plus, Search, Edit3, Trash2, Calendar, MapPin } from "lucide-react";

export const Route = createFileRoute("/notes")({
  head: () => ({ meta: [{ title: "Trip notes & journal — Traveloop" }, { name: "description", content: "Capture reservations, reminders and travel thoughts." }] }),
  component: NotesPage,
});

const notes = [
  { title: "Hotel check-in · Shibuya Sky", body: "Arrival after 16:00. Reception 24/7. Confirmation code: SBY-1042. Ask for room facing Shibuya crossing.", trip: "Wonders of Japan · Tokyo · Day 1", date: "Jun 12, 2026", color: "coral" },
  { title: "Pasta cooking class booking", body: "Confirmed with Nonna Gianna. 18:00 start, bring appetite. Address: Via dei Bardi 12. Pay cash on arrival (€45).", trip: "Italian Coastline · Florence", date: "Aug 06, 2026", color: "sunset" },
  { title: "Local SIM card", body: "Sakura Mobile 8GB plan, pickup at Haneda Arrivals counter. Bring passport and reservation print.", trip: "Wonders of Japan · Tokyo · Day 1", date: "Jun 12, 2026", color: "sky" },
  { title: "Restaurant · Kikunoi Honten", body: "Kaiseki dinner reservation 19:30. Smart casual. Allergies noted: shellfish.", trip: "Wonders of Japan · Kyoto · Day 5", date: "Jun 16, 2026", color: "emerald" },
  { title: "Local contact · Yuki", body: "Friend of friend in Osaka. WhatsApp +81 90 1234 5678. Loves baseball — Hanshin game on Day 10?", trip: "Wonders of Japan · Osaka", date: "Jun 20, 2026", color: "default" },
  { title: "Journal · Day 3 in Tokyo", body: "Long walk through Yanaka. Felt like falling into the 60s. Best taiyaki in years from a tiny stall near the cemetery.", trip: "Wonders of Japan · Tokyo · Day 3", date: "Jun 14, 2026", color: "coral" },
];

function NotesPage() {
  return (
    <AppLayout
      title="Notes & journal"
      subtitle="Reservations, reminders and travel thoughts"
      actions={<Btn><Plus className="h-4 w-4" /> Add note</Btn>}
    >
      <div className="grid lg:grid-cols-[240px_1fr] gap-6">
        <aside>
          <Card className="p-4 sticky top-32">
            <div className="text-xs uppercase font-semibold text-muted-foreground mb-2">Filter by trip</div>
            <div className="space-y-1">
              {["All notes (12)","Wonders of Japan (8)","Italian Coastline (3)","Iceland Ring Road (1)"].map((t, i) => (
                <button key={t} className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition ${i === 0 ? "bg-accent text-accent-foreground" : "hover:bg-muted"}`}>{t}</button>
              ))}
            </div>
            <div className="text-xs uppercase font-semibold text-muted-foreground mt-5 mb-2">Type</div>
            <div className="flex flex-wrap gap-1.5">
              {["Reservation","Reminder","Journal","Contact"].map((t,i) => <Chip key={t} active={i===0} color="default">{t}</Chip>)}
            </div>
          </Card>
        </aside>

        <div>
          <div className="flex flex-col sm:flex-row gap-3 mb-5">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input placeholder="Search your notes" className="w-full h-11 pl-11 pr-4 rounded-xl bg-card border border-input outline-none text-sm focus:border-ring" />
            </div>
            <select className="h-11 px-4 rounded-xl bg-card border border-input text-sm">
              <option>Most recent</option><option>By trip date</option><option>Alphabetical</option>
            </select>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {notes.map((n, i) => (
              <Card key={i} className="p-5 hover:shadow-elegant transition group">
                <div className="flex items-start justify-between gap-3">
                  <Chip color={n.color as any}>Note</Chip>
                  <div className="opacity-0 group-hover:opacity-100 transition flex gap-1">
                    <button className="h-7 w-7 rounded-lg hover:bg-muted grid place-items-center"><Edit3 className="h-3.5 w-3.5" /></button>
                    <button className="h-7 w-7 rounded-lg hover:bg-destructive/10 text-destructive grid place-items-center"><Trash2 className="h-3.5 w-3.5" /></button>
                  </div>
                </div>
                <h3 className="font-display text-lg font-semibold mt-2">{n.title}</h3>
                <p className="text-sm text-muted-foreground mt-2 line-clamp-3">{n.body}</p>
                <div className="mt-4 pt-4 border-t border-border flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {n.trip}</span>
                  <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {n.date}</span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
