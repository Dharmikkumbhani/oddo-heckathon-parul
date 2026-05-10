import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import AppLayout from "@/components/AppLayout";
import { Btn, Card, Chip } from "@/components/ui-kit";
import { Plus, Shirt, FileText, Smartphone, Sparkles, Heart, Trash2, RotateCcw } from "lucide-react";

type PackingSearch = { tripId?: string };

export const Route = createFileRoute("/packing")({
  validateSearch: (search: Record<string, unknown>): PackingSearch => ({ tripId: search.tripId as string | undefined }),
  head: () => ({ meta: [{ title: "Packing checklist — Traveloop" }, { name: "description", content: "Pack smart with categorized checklists." }] }),
  component: PackingPage,
});

const icons: Record<string, any> = { Clothing: Shirt, Documents: FileText, Electronics: Smartphone, Toiletries: Sparkles, Essentials: Heart, default: Sparkles };

function PackingPage() {
  const { tripId } = Route.useSearch();
  const navigate = useNavigate();
  const [itemsMap, setItemsMap] = useState<Record<string, any[]>>({});
  const [newItemNames, setNewItemNames] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [availableTrips, setAvailableTrips] = useState<any[]>([]);

  const fetchItems = async () => {
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
      const res = await fetch(`http://localhost:5000/api/trips/${tripId}/packing`, { headers: { "Authorization": `Bearer ${token}` } });
      if (res.ok) {
        const data = await res.json();
        const grouped: Record<string, any[]> = {};
        // Ensure default categories exist
        ["Clothing", "Documents", "Electronics", "Toiletries", "Essentials"].forEach(c => grouped[c] = []);
        
        data.forEach((item: any) => {
          const cat = item.category_name || "Essentials";
          if (!grouped[cat]) grouped[cat] = [];
          grouped[cat].push(item);
        });
        setItemsMap(grouped);
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    fetchItems();
  }, [tripId]);

  const all = Object.values(itemsMap).flat();
  const packed = all.filter(i => i.is_packed).length;
  const total = all.length;
  const pct = total === 0 ? 0 : Math.round((packed / total) * 100);

  const toggle = async (id: string, cat: string) => {
    // Optimistic update
    setItemsMap(p => ({
      ...p, [cat]: p[cat].map(it => it.id === id ? { ...it, is_packed: !it.is_packed } : it)
    }));
    const token = localStorage.getItem("token");
    await fetch(`http://localhost:5000/api/packing/${id}/toggle`, { method: "PUT", headers: { "Authorization": `Bearer ${token}` } });
  };

  const remove = async (id: string, cat: string) => {
    setItemsMap(p => ({
      ...p, [cat]: p[cat].filter(it => it.id !== id)
    }));
    const token = localStorage.getItem("token");
    await fetch(`http://localhost:5000/api/packing/${id}`, { method: "DELETE", headers: { "Authorization": `Bearer ${token}` } });
  };

  const add = async (cat: string, overrideName?: string) => {
    const name = overrideName || newItemNames[cat]?.trim();
    if (!name) return;
    
    if (!overrideName) setNewItemNames(p => ({ ...p, [cat]: "" }));
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`http://localhost:5000/api/trips/${tripId}/packing`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ itemName: name, categoryName: cat })
      });
      if (res.ok) {
        const newItem = await res.json();
        setItemsMap(p => ({
          ...p, [cat]: [...p[cat], newItem]
        }));
      }
    } catch (e) { console.error(e); }
  };

  if (loading) return <AppLayout title="Loading..."><div className="p-10 text-center text-muted-foreground">Loading checklist...</div></AppLayout>;
  
  if (!tripId) {
    return (
      <AppLayout title="Select a Trip" subtitle="Choose a trip to view its packing list">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {availableTrips.map(t => (
             <div key={t.id} onClick={() => navigate({ to: "/packing", search: { tripId: t.id } })} className="cursor-pointer">
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
      title="Packing checklist"
      subtitle="Keep track of your items before you fly"
      actions={<><Btn variant="outline" onClick={fetchItems}><RotateCcw className="h-4 w-4" /> Refresh</Btn></>}
    >
      <div className="grid lg:grid-cols-[1fr_320px] gap-6">
        <div className="space-y-5">
          <Card className="p-6 bg-gradient-card">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-xs uppercase font-semibold text-muted-foreground">Progress</div>
                <div className="font-display text-3xl font-semibold mt-1">{packed} of {total} packed</div>
              </div>
              <div className="text-right">
                <div className="font-display text-4xl font-semibold text-primary">{pct}%</div>
                <div className="text-xs text-muted-foreground">{total - packed} items left</div>
              </div>
            </div>
            <div className="mt-5 h-3 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-gradient-ocean transition-all" style={{ width: `${pct}%` }} />
            </div>
          </Card>

          {Object.entries(itemsMap).map(([cat, list]) => {
            const Icon = icons[cat] || icons.default;
            const cp = list.filter(i => i.is_packed).length;
            return (
              <Card key={cat} className="overflow-hidden">
                <div className="px-5 py-4 flex items-center justify-between border-b border-border bg-muted/30">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary grid place-items-center"><Icon className="h-4 w-4" /></div>
                    <div>
                      <div className="font-semibold">{cat}</div>
                      <div className="text-xs text-muted-foreground">{cp} of {list.length} packed</div>
                    </div>
                  </div>
                  <Chip color={list.length > 0 && cp === list.length ? "emerald" : "default"} active={list.length > 0 && cp === list.length}>{list.length > 0 && cp === list.length ? "Complete" : `${list.length - cp} left`}</Chip>
                </div>
                <div className="divide-y divide-border">
                  {list.map((it) => (
                    <label key={it.id} className="flex items-center gap-3 px-5 py-3 hover:bg-muted/40 cursor-pointer group">
                      <input type="checkbox" checked={it.is_packed} onChange={() => toggle(it.id, cat)} className="h-4 w-4 rounded accent-primary" />
                      <span className={`flex-1 text-sm ${it.is_packed ? "line-through text-muted-foreground" : ""}`}>{it.item_name}</span>
                      <button onClick={(e) => { e.preventDefault(); remove(it.id, cat); }} className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition"><Trash2 className="h-4 w-4" /></button>
                    </label>
                  ))}
                  <div className="flex items-center gap-2 px-5 py-3">
                    <input 
                      placeholder={`Add to ${cat.toLowerCase()}…`} 
                      value={newItemNames[cat] || ''}
                      onChange={e => setNewItemNames(p => ({ ...p, [cat]: e.target.value }))}
                      onKeyDown={e => { if (e.key === 'Enter') add(cat); }}
                      className="flex-1 h-9 px-3 rounded-lg bg-muted/50 border border-transparent focus:bg-card focus:border-ring outline-none text-sm" 
                    />
                    <Btn size="sm" variant="soft" onClick={() => add(cat)}><Plus className="h-3.5 w-3.5" /> Add</Btn>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        <aside>
          <Card className="p-5 sticky top-32">
            <h3 className="font-display text-lg font-semibold">Suggested items</h3>
            <p className="text-xs text-muted-foreground mt-1">Travelers commonly add these items.</p>
            <div className="mt-4 space-y-2">
              {["Slip-on shoes","Pocket Wi-Fi rental","Cash for small shops","Compact umbrella","Travel chopsticks"].map((t) => (
                <div key={t} className="flex items-center justify-between p-2.5 rounded-lg border border-dashed border-border hover:border-primary/40 hover:bg-primary/5 transition">
                  <span className="text-sm">{t}</span>
                  <button onClick={() => add("Essentials", t)} className="h-7 w-7 rounded-md bg-primary/10 text-primary grid place-items-center"><Plus className="h-3.5 w-3.5" /></button>
                </div>
              ))}
            </div>
            <div className="mt-5 pt-5 border-t border-border">
              <div className="text-xs font-semibold uppercase text-muted-foreground">Templates</div>
              <div className="mt-3 space-y-2">
                {["City weekend","Beach holiday","Winter trek","Business trip"].map((t) => (
                  <button key={t} className="w-full text-left text-sm font-medium px-3 py-2 rounded-lg hover:bg-muted">{t}</button>
                ))}
              </div>
            </div>
          </Card>
        </aside>
      </div>
    </AppLayout>
  );
}
