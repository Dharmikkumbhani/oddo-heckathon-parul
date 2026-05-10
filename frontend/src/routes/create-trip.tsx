import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import AppLayout from "@/components/AppLayout";
import { Btn, Card, Chip } from "@/components/ui-kit";
import { Field, Input, TextArea } from "@/components/AuthLayout";
import { Image as ImageIcon, Calendar, MapPin, Wallet, Sparkles } from "lucide-react";

export const Route = createFileRoute("/create-trip")({
  head: () => ({ meta: [{ title: "Create a trip — Traveloop" }, { name: "description", content: "Begin planning a new personalized travel itinerary." }] }),
  component: CreateTripPage,
});

const styles = ["Adventure", "Relaxation", "Food", "Culture", "Nature", "Family", "Budget", "Luxury"];

function CreateTripPage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [description, setDescription] = useState("");
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [picked, setPicked] = useState<string[]>([]);
  const toggle = (s: string) => setPicked((p) => p.includes(s) ? p.filter(x => x !== s) : [...p, s]);
  const [budget, setBudget] = useState(2500);
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    if (!title || !startDate || !endDate) return alert("Please fill in trip name and dates");
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("title", title);
      formData.append("startDate", startDate);
      formData.append("endDate", endDate);
      formData.append("description", description);
      formData.append("tripStyle", picked.join(','));
      formData.append("budgetRange", budget.toString());
      if (coverImage) formData.append("coverImage", coverImage);

      const res = await fetch("http://localhost:5000/api/trips", {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` },
        body: formData
      });
      if (res.ok) {
        navigate({ to: "/trips" });
      } else {
        const data = await res.json();
        alert(data.error || "Failed to create trip");
      }
    } catch (e) {
      console.error(e);
      alert("Error connecting to server");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AppLayout title="Plan a new trip" subtitle="Tell us the basics — we'll help you build the rest.">
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6 space-y-5">
            <div className="flex items-center gap-2 text-xs font-semibold text-primary"><Sparkles className="h-4 w-4" /> STEP 1 · TRIP DETAILS</div>
            <Field label="Trip name" hint="A short, evocative name. E.g. 'Wonders of Japan'">
              <Input placeholder="My next adventure" value={title} onChange={(e) => setTitle(e.target.value)} />
            </Field>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Start date">
                <div className="relative"><Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input type="date" className="pl-10" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                </div>
              </Field>
              <Field label="End date">
                <div className="relative"><Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input type="date" className="pl-10" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                </div>
              </Field>
            </div>
            <Field label="Description" hint="Set the tone for this journey">
              <TextArea rows={3} placeholder="Two weeks across temples..." value={description} onChange={(e) => setDescription(e.target.value)} />
            </Field>
          </Card>

          <Card className="p-6 space-y-5">
            <div className="flex items-center gap-2 text-xs font-semibold text-coral"><ImageIcon className="h-4 w-4" /> STEP 2 · COVER IMAGE</div>
            <div className="border-2 border-dashed border-border rounded-2xl p-8 text-center hover:border-primary/40 transition relative overflow-hidden">
              {coverImage ? (
                <img src={URL.createObjectURL(coverImage)} className="absolute inset-0 w-full h-full object-cover opacity-50" alt="" />
              ) : null}
              <div className="relative z-10">
                <div className="mx-auto h-12 w-12 rounded-xl bg-muted grid place-items-center"><ImageIcon className="h-5 w-5 text-muted-foreground" /></div>
                <div className="mt-3 text-sm font-semibold">Drop image or click to upload</div>
                <div className="text-xs text-muted-foreground mt-1">Recommended 1600 × 900 · JPG or PNG</div>
                <label className="mt-4 cursor-pointer inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2">
                  Choose file
                  <input type="file" className="hidden" accept="image/*" onChange={(e) => { if (e.target.files) setCoverImage(e.target.files[0]) }} />
                </label>
              </div>
            </div>
          </Card>

          <Card className="p-6 space-y-5">
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald"><MapPin className="h-4 w-4" /> STEP 3 · TRAVEL STYLE</div>
            <div className="text-sm text-muted-foreground">Pick everything that fits — we'll personalize suggestions.</div>
            <div className="flex flex-wrap gap-2">
              {styles.map((s, i) => (
                <Chip key={s} active={picked.includes(s)} color={(["default","coral","emerald","sky","sunset"][i % 5]) as any} onClick={() => toggle(s)}>
                  {s}
                </Chip>
              ))}
            </div>
          </Card>

          <Card className="p-6 space-y-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-sunset"><Wallet className="h-4 w-4" /> STEP 4 · BUDGET</div>
            <div className="flex items-baseline justify-between">
              <span className="text-sm text-muted-foreground">Preferred budget</span>
              <span className="font-display text-2xl font-semibold">${budget.toLocaleString()}</span>
            </div>
            <input type="range" min={500} max={10000} step={100} value={budget} onChange={(e) => setBudget(+e.target.value)} className="w-full accent-primary" />
            <div className="flex justify-between text-[11px] text-muted-foreground"><span>$500 · Backpacker</span><span>Mid-range</span><span>$10k · Luxury</span></div>
          </Card>

          <div className="flex justify-end gap-3">
            <Btn asChild variant="outline"><Link to="/">Cancel</Link></Btn>
            <Btn size="lg" onClick={handleSave} disabled={isLoading}>{isLoading ? "Saving..." : "Save & continue →"}</Btn>
          </div>
        </div>

        <aside className="space-y-5">
          <Card className="p-6 sticky top-32">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Trip preview</div>
            <h3 className="font-display text-2xl font-semibold mt-2">Wonders of Japan</h3>
            <div className="text-xs text-muted-foreground mt-1">Jun 12 – Jun 24 · 12 days</div>
            <div className="grid grid-cols-3 gap-3 mt-5 py-4 border-y border-border">
              <div><div className="text-[10px] uppercase text-muted-foreground">Style</div><div className="text-sm font-semibold">{picked.length}</div></div>
              <div><div className="text-[10px] uppercase text-muted-foreground">Budget</div><div className="text-sm font-semibold">${budget}</div></div>
              <div><div className="text-[10px] uppercase text-muted-foreground">Days</div><div className="text-sm font-semibold">12</div></div>
            </div>
            <div className="mt-4 space-y-2 text-sm">
              {["Add stops in 2 minutes","Browse curated activities","Auto-estimate budget per day"].map((t) => (
                <div key={t} className="flex items-start gap-2 text-muted-foreground">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5" /> {t}
                </div>
              ))}
            </div>
          </Card>
        </aside>
      </div>
    </AppLayout>
  );
}
