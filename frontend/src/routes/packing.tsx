import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import AppLayout from "@/components/AppLayout";
import { Btn, Card, Chip } from "@/components/ui-kit";
import { Plus, Shirt, FileText, Smartphone, Sparkles, Heart, Trash2, RotateCcw } from "lucide-react";

export const Route = createFileRoute("/packing")({
  head: () => ({ meta: [{ title: "Packing checklist — Traveloop" }, { name: "description", content: "Pack smart with categorized checklists." }] }),
  component: PackingPage,
});

const initial = {
  Clothing: [
    { name: "T-shirts × 5", packed: true },
    { name: "Light jacket", packed: true },
    { name: "Walking shoes", packed: true },
    { name: "Swimwear", packed: false },
    { name: "Socks × 7", packed: false },
  ],
  Documents: [
    { name: "Passport", packed: true },
    { name: "Visa printouts", packed: true },
    { name: "Flight tickets", packed: false },
    { name: "Travel insurance", packed: false },
  ],
  Electronics: [
    { name: "Phone charger", packed: true },
    { name: "Universal adapter", packed: false },
    { name: "Power bank", packed: false },
    { name: "Camera", packed: false },
  ],
  Toiletries: [
    { name: "Toothbrush & paste", packed: true },
    { name: "Sunscreen SPF 50", packed: false },
    { name: "Skincare basics", packed: false },
  ],
  Essentials: [
    { name: "Reusable water bottle", packed: true },
    { name: "Cash · ¥10,000", packed: false },
    { name: "Daypack", packed: false },
  ],
};

const icons: Record<string, any> = { Clothing: Shirt, Documents: FileText, Electronics: Smartphone, Toiletries: Sparkles, Essentials: Heart };

function PackingPage() {
  const [items, setItems] = useState(initial);
  const all = Object.values(items).flat();
  const packed = all.filter(i => i.packed).length;
  const total = all.length;
  const pct = Math.round((packed / total) * 100);

  const toggle = (cat: string, idx: number) => setItems((p) => ({
    ...p, [cat]: p[cat as keyof typeof p].map((it, i) => i === idx ? { ...it, packed: !it.packed } : it),
  }));

  return (
    <AppLayout
      title="Packing checklist"
      subtitle="Wonders of Japan · 12 days"
      actions={<><Btn variant="outline"><RotateCcw className="h-4 w-4" /> Reset</Btn><Btn>Save list</Btn></>}
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

          {Object.entries(items).map(([cat, list]) => {
            const Icon = icons[cat];
            const cp = list.filter(i => i.packed).length;
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
                  <Chip color={cp === list.length ? "emerald" : "default"} active={cp === list.length}>{cp === list.length ? "Complete" : `${list.length - cp} left`}</Chip>
                </div>
                <div className="divide-y divide-border">
                  {list.map((it, i) => (
                    <label key={i} className="flex items-center gap-3 px-5 py-3 hover:bg-muted/40 cursor-pointer group">
                      <input type="checkbox" checked={it.packed} onChange={() => toggle(cat, i)} className="h-4 w-4 rounded accent-primary" />
                      <span className={`flex-1 text-sm ${it.packed ? "line-through text-muted-foreground" : ""}`}>{it.name}</span>
                      <button className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition"><Trash2 className="h-4 w-4" /></button>
                    </label>
                  ))}
                  <div className="flex items-center gap-2 px-5 py-3">
                    <input placeholder={`Add to ${cat.toLowerCase()}…`} className="flex-1 h-9 px-3 rounded-lg bg-muted/50 border border-transparent focus:bg-card focus:border-ring outline-none text-sm" />
                    <Btn size="sm" variant="soft"><Plus className="h-3.5 w-3.5" /> Add</Btn>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        <aside>
          <Card className="p-5 sticky top-32">
            <h3 className="font-display text-lg font-semibold">Suggested for Japan</h3>
            <p className="text-xs text-muted-foreground mt-1">Travelers commonly add these items.</p>
            <div className="mt-4 space-y-2">
              {["Slip-on shoes (temples)","Pocket Wi-Fi rental","Yen cash for small shops","Compact umbrella","JR Pass voucher","Travel chopsticks"].map((t) => (
                <div key={t} className="flex items-center justify-between p-2.5 rounded-lg border border-dashed border-border hover:border-primary/40 hover:bg-primary/5 transition">
                  <span className="text-sm">{t}</span>
                  <button className="h-7 w-7 rounded-md bg-primary/10 text-primary grid place-items-center"><Plus className="h-3.5 w-3.5" /></button>
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
