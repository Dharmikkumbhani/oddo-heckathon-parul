import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import AppLayout from "@/components/AppLayout";
import { Btn, Card, Chip } from "@/components/ui-kit";
import { Plus, Search, Edit3, Trash2, Calendar, MapPin, X } from "lucide-react";

type NotesSearch = { tripId?: string };

export const Route = createFileRoute("/notes")({
  validateSearch: (search: Record<string, unknown>): NotesSearch => ({ tripId: search.tripId as string | undefined }),
  head: () => ({ meta: [{ title: "Trip notes & journal — Traveloop" }, { name: "description", content: "Capture reservations, reminders and travel thoughts." }] }),
  component: NotesPage,
});

const colors: Record<string, string> = { general: "default", reminder: "coral", hotel: "sky", transport: "emerald", food: "sunset" };

function NotesPage() {
  const { tripId } = Route.useSearch();
  const navigate = useNavigate();
  const [notes, setNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newBody, setNewBody] = useState("");
  const [newType, setNewType] = useState("general");
  const [availableTrips, setAvailableTrips] = useState<any[]>([]);

  const fetchNotes = async () => {
    const token = localStorage.getItem("token");
    if (!token) return setLoading(false);

    if (!tripId) {
      try {
        const res = await fetch("http://localhost:5000/api/trips", { headers: { "Authorization": `Bearer ${token}` } });
        if (res.ok) {
          const trips = await res.json();
          setAvailableTrips(trips);
        }
      } catch (e) { console.error(e); }
      return setLoading(false);
    }

    try {
      const res = await fetch(`http://localhost:5000/api/trips/${tripId}/notes`, { headers: { "Authorization": `Bearer ${token}` } });
      if (res.ok) setNotes(await res.json());
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    fetchNotes();
  }, [tripId]);

  const addNote = async () => {
    if (!newTitle.trim() || !newBody.trim() || !tripId) return;
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`http://localhost:5000/api/trips/${tripId}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ title: newTitle, content: newBody, noteType: newType })
      });
      if (res.ok) {
        const n = await res.json();
        setNotes([n, ...notes]);
        setNewTitle("");
        setNewBody("");
        setShowAdd(false);
      }
    } catch (e) { console.error(e); }
  };

  const deleteNote = async (id: string) => {
    if (!confirm("Delete this note?")) return;
    const token = localStorage.getItem("token");
    try {
      await fetch(`http://localhost:5000/api/notes/${id}`, { method: "DELETE", headers: { "Authorization": `Bearer ${token}` } });
      setNotes(notes.filter(n => n.id !== id));
    } catch (e) { console.error(e); }
  };

  if (loading) return <AppLayout title="Loading..."><div className="p-10 text-center text-muted-foreground">Loading notes...</div></AppLayout>;
  
  if (!tripId) {
    return (
      <AppLayout title="Select a Trip" subtitle="Choose a trip to view its notes">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {availableTrips.map(t => (
             <div key={t.id} onClick={() => navigate({ to: "/notes", search: { tripId: t.id } })} className="cursor-pointer">
               <Card className="p-5 hover:border-primary/50 transition-all h-full">
                  <h3 className="font-display font-semibold text-lg">{t.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{new Date(t.start_date).toLocaleDateString()} - {new Date(t.end_date).toLocaleDateString()}</p>
               </Card>
             </div>
          ))}
          {availableTrips.length === 0 && <div className="col-span-full text-center p-10 text-muted-foreground">No trips found. Create one first!</div>}
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout
      title="Notes & journal"
      subtitle="Reservations, reminders and travel thoughts"
      actions={<Btn onClick={() => setShowAdd(true)}><Plus className="h-4 w-4" /> Add note</Btn>}
    >
      <div className="grid lg:grid-cols-[240px_1fr] gap-6">
        <aside>
          <Card className="p-4 sticky top-32">
            <div className="text-xs uppercase font-semibold text-muted-foreground mb-2">Filter by trip</div>
            <div className="space-y-1">
              <button className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition bg-accent text-accent-foreground">Current trip ({notes.length})</button>
            </div>
            <div className="text-xs uppercase font-semibold text-muted-foreground mt-5 mb-2">Type</div>
            <div className="flex flex-wrap gap-1.5">
              {["General","Reminder","Hotel","Transport","Food"].map((t) => (
                <Chip key={t} color={colors[t.toLowerCase()] as any}>{t}</Chip>
              ))}
            </div>
          </Card>
        </aside>

        <div>
          <div className="flex flex-col sm:flex-row gap-3 mb-5">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input placeholder="Search your notes" className="w-full h-11 pl-11 pr-4 rounded-xl bg-card border border-input outline-none text-sm focus:border-ring" />
            </div>
          </div>

          {showAdd && (
            <Card className="p-5 mb-6 border-primary/50 shadow-soft relative">
              <button onClick={() => setShowAdd(false)} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"><X className="h-5 w-5" /></button>
              <h3 className="font-semibold mb-4 text-primary">Create a new note</h3>
              <div className="space-y-3">
                <input placeholder="Note title" className="w-full h-10 px-3 rounded-lg bg-muted/50 border border-transparent focus:bg-card focus:border-ring outline-none text-sm" value={newTitle} onChange={e => setNewTitle(e.target.value)} />
                <textarea placeholder="Write your thoughts, confirmation numbers, or reminders..." className="w-full p-3 rounded-lg bg-muted/50 border border-transparent focus:bg-card focus:border-ring outline-none text-sm resize-none" rows={4} value={newBody} onChange={e => setNewBody(e.target.value)} />
                <div className="flex justify-between items-center">
                  <select className="h-9 px-3 rounded-lg bg-muted/50 border border-transparent text-sm outline-none" value={newType} onChange={e => setNewType(e.target.value)}>
                    <option value="general">General</option>
                    <option value="reminder">Reminder</option>
                    <option value="hotel">Hotel</option>
                    <option value="transport">Transport</option>
                    <option value="food">Food</option>
                  </select>
                  <Btn size="sm" onClick={addNote}>Save note</Btn>
                </div>
              </div>
            </Card>
          )}

          <div className="grid sm:grid-cols-2 gap-4">
            {notes.length === 0 && !showAdd && <div className="col-span-2 p-10 text-center text-muted-foreground">You have no notes for this trip.</div>}
            {notes.map((n) => (
              <Card key={n.id} className="p-5 hover:shadow-elegant transition group">
                <div className="flex items-start justify-between gap-3">
                  <Chip color={colors[n.note_type] as any}>{n.note_type.charAt(0).toUpperCase() + n.note_type.slice(1)}</Chip>
                  <div className="opacity-0 group-hover:opacity-100 transition flex gap-1">
                    <button className="h-7 w-7 rounded-lg hover:bg-muted grid place-items-center"><Edit3 className="h-3.5 w-3.5" /></button>
                    <button onClick={() => deleteNote(n.id)} className="h-7 w-7 rounded-lg hover:bg-destructive/10 text-destructive grid place-items-center"><Trash2 className="h-3.5 w-3.5" /></button>
                  </div>
                </div>
                <h3 className="font-display text-lg font-semibold mt-2">{n.title}</h3>
                <p className="text-sm text-muted-foreground mt-2 whitespace-pre-wrap line-clamp-4">{n.content}</p>
                <div className="mt-4 pt-4 border-t border-border flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {n.trip_name}</span>
                  <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {new Date(n.created_at).toLocaleDateString()}</span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
