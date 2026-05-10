import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import AppLayout from "@/components/AppLayout";
import { Btn, Card, Chip } from "@/components/ui-kit";
import { Field, Input, TextArea } from "@/components/AuthLayout";
import { Camera, MapPin, Mail, Phone, Globe, Bell, Shield, Trash2, Heart } from "lucide-react";

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "Profile & settings — Traveloop" }, { name: "description", content: "Manage your profile, preferences and notifications." }] }),
  component: ProfilePage,
});

const ALL_STYLES = ["Adventure","Food","Culture","Nature","Family","Budget","Luxury","Coastal","Slow travel"];

function ProfilePage() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("Personal info");
  const [profile, setProfile] = useState<any>(null);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [bio, setBio] = useState("");
  const [styles, setStyles] = useState<string[]>([]);
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");
      if (!token) return setLoading(false);
      try {
        const res = await fetch("http://localhost:5000/api/users/profile", {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setProfile(data);
          setFirstName(data.first_name || "");
          setLastName(data.last_name || "");
          setEmail(data.email || "");
          setPhone(data.phone_number || "");
          setCity(data.city || "");
          setCountry(data.country || "");
          setBio(data.bio || "");
          
          let fetchedStyles = data.preferred_trip_styles || [];
          if (typeof fetchedStyles === "string") {
            try { fetchedStyles = JSON.parse(fetchedStyles); } catch(e) {}
          }
          if (!Array.isArray(fetchedStyles)) fetchedStyles = [];
          setStyles(fetchedStyles);
          
          if (data.profile_photo_url) setPhotoPreview(`http://localhost:5000${data.profile_photo_url}`);
        }
      } catch (e) { console.error(e); }
      setLoading(false);
    };
    fetchProfile();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const token = localStorage.getItem("token");
    try {
      const formData = new FormData();
      formData.append("firstName", firstName);
      formData.append("lastName", lastName);
      formData.append("phone", phone);
      formData.append("city", city);
      formData.append("country", country);
      formData.append("bio", bio);
      formData.append("styles", JSON.stringify(styles));
      if (profilePhoto) formData.append("profilePhoto", profilePhoto);
      
      const res = await fetch("http://localhost:5000/api/users/profile", {
        method: "PUT",
        headers: { "Authorization": `Bearer ${token}` },
        body: formData
      });
      if (res.ok) {
        const data = await res.json();
        setProfile({ ...profile, ...data, country });
        if (data.profile_photo_url) {
           setPhotoPreview(`http://localhost:5000${data.profile_photo_url}`);
        }
        alert("Profile updated successfully!");
        window.dispatchEvent(new Event("profileUpdated"));
      }
    } catch (e) {
      console.error(e);
      alert("Failed to update profile.");
    }
    setSaving(false);
  };

  const toggleStyle = (style: string) => {
    setStyles(prev => prev.includes(style) ? prev.filter(s => s !== style) : [...prev, style]);
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfilePhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm("Are you SURE you want to delete your account? This action cannot be undone and you will lose all your trips.")) return;
    const token = localStorage.getItem("token");
    try {
      const res = await fetch("http://localhost:5000/api/users/account", {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        localStorage.removeItem("token");
        navigate({ to: "/login" });
      }
    } catch (e) {
      console.error(e);
      alert("Failed to delete account");
    }
  };

  if (loading) return <AppLayout title="Loading..."><div className="p-10 text-center">Loading profile...</div></AppLayout>;
  if (!profile) return <AppLayout title="Error"><div className="p-10 text-center">Please log in to view your profile.</div></AppLayout>;

  return (
    <AppLayout title="Profile & settings" subtitle="Personalize your Traveloop experience">
      <div className="grid lg:grid-cols-[260px_1fr] gap-6">
        <aside>
          <Card className="p-3 sticky top-32 space-y-1">
            {[
              "Personal info",
              "Travel preferences",
              "Dream destinations",
              "Privacy",
              "Danger zone",
            ].map((k) => (
              <button 
                key={k} 
                onClick={() => setActiveTab(k)}
                className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition ${activeTab === k ? "bg-accent text-accent-foreground" : "hover:bg-muted"}`}
              >
                {k}
              </button>
            ))}
          </Card>
        </aside>

        <div className="space-y-6">
          <Card className="overflow-hidden">
            <div className="h-32 bg-gradient-hero relative">
              <img src="https://images.unsplash.com/photo-1500835556837-99ac94a94552?auto=format&fit=crop&w=1400&q=60" className="w-full h-full object-cover opacity-30" alt="" />
            </div>
            <div className="p-6 -mt-12">
              <div className="flex flex-wrap items-end gap-4">
                <div className="relative">
                  <div className="h-24 w-24 rounded-2xl bg-gradient-ocean ring-4 ring-card grid place-items-center text-white font-display text-3xl font-bold overflow-hidden">
                    {photoPreview ? (
                      <img src={photoPreview} className="w-full h-full object-cover" alt="Profile" />
                    ) : (
                      profile.first_name?.[0] + (profile.last_name?.[0] || "")
                    )}
                  </div>
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handlePhotoChange} />
                  <button onClick={() => fileInputRef.current?.click()} className="absolute bottom-1 right-1 h-7 w-7 rounded-lg bg-card border border-border grid place-items-center"><Camera className="h-3.5 w-3.5" /></button>
                </div>
                <div className="flex-1">
                  <h2 className="font-display text-2xl font-semibold">{profile.first_name} {profile.last_name}</h2>
                  <div className="text-sm text-muted-foreground flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> {profile.city || 'Anywhere'}, {profile.country || 'Earth'}</div>
                </div>
                <Btn variant="outline">Edit cover</Btn>
              </div>
            </div>
          </Card>

          {activeTab === "Personal info" && (
            <Card className="p-6 space-y-5 animate-in fade-in duration-300">
              <h3 className="font-display text-lg font-semibold">Personal information</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="First name"><Input value={firstName} onChange={e => setFirstName(e.target.value)} /></Field>
              <Field label="Last name"><Input value={lastName} onChange={e => setLastName(e.target.value)} /></Field>
              <Field label="Email"><div className="relative"><Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input value={email} disabled className="pl-10 bg-muted/50" /></div></Field>
              <Field label="Phone"><div className="relative"><Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input value={phone} onChange={e => setPhone(e.target.value)} className="pl-10" /></div></Field>
              <Field label="City"><Input value={city} onChange={e => setCity(e.target.value)} /></Field>
              <Field label="Country"><Input value={country} onChange={e => setCountry(e.target.value)} /></Field>
            </div>
            <Field label="Bio"><TextArea rows={3} value={bio} onChange={e => setBio(e.target.value)} /></Field>
            <div className="flex justify-end gap-2"><Btn variant="ghost" onClick={() => window.location.reload()}>Cancel</Btn><Btn onClick={handleSave} disabled={saving}>{saving ? "Saving..." : "Save changes"}</Btn></div>
          </Card>
          )}

          {activeTab === "Travel preferences" && (
            <Card className="p-6 animate-in fade-in duration-300">
              <h3 className="font-display text-lg font-semibold">Travel preferences</h3>
            <p className="text-sm text-muted-foreground mt-1">We'll personalize destination and activity recommendations.</p>
            <div className="mt-4">
              <div className="text-xs font-semibold uppercase text-muted-foreground mb-2">Trip styles</div>
              <div className="flex flex-wrap gap-2">
                {ALL_STYLES.map((t,i) =>
                  <div key={t} onClick={() => toggleStyle(t)} className="cursor-pointer">
                    <Chip active={styles.includes(t)} color={(["coral","sunset","sky","emerald","default"][i % 5]) as any}>{t}</Chip>
                  </div>
                )}
              </div>
            </div>
            <div className="mt-5 grid sm:grid-cols-2 gap-4">
              <Field label="Language"><div className="relative"><Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input defaultValue="English (US)" className="pl-10" /></div></Field>
              <Field label="Currency"><Input defaultValue="USD ($)" /></Field>
            </div>
            <div className="flex justify-end gap-2 mt-4"><Btn onClick={handleSave} disabled={saving}>{saving ? "Saving..." : "Save preferences"}</Btn></div>
          </Card>
          )}

          {activeTab === "Dream destinations" && (
            <Card className="p-6 animate-in fade-in duration-300">
              <h3 className="font-display text-lg font-semibold">Dream destinations</h3>
            <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {["Lisbon","Kyoto","Reykjavík","Cape Town","Hanoi","Queenstown"].map((c) => (
                <div key={c} className="p-3 rounded-xl border border-border flex items-center gap-3">
                  <Heart className="h-4 w-4 text-coral fill-coral" />
                  <span className="text-sm font-semibold flex-1">{c}</span>
                  <button className="text-xs text-muted-foreground hover:text-foreground">Remove</button>
                </div>
              ))}
            </div>
          </Card>
          )}

          {activeTab === "Privacy" && (
            <Card className="p-6 animate-in fade-in duration-300">
              <h3 className="font-display text-lg font-semibold flex items-center gap-2"><Shield className="h-5 w-5" /> Privacy</h3>
            <div className="mt-4 space-y-3">
              {[
                ["Public profile","Anyone can see trips you mark public"],
                ["Show activity in feed","Likes and saves appear in community"],
                ["Allow trip cloning","Others can copy your shared trips"],
              ].map(([t, d], i) => (
                <label key={t} className="flex items-center justify-between p-3 rounded-xl hover:bg-muted/40">
                  <div><div className="text-sm font-semibold">{t}</div><div className="text-xs text-muted-foreground">{d}</div></div>
                  <input type="checkbox" defaultChecked={i !== 1} className="h-5 w-9 appearance-none bg-muted rounded-full relative cursor-pointer transition checked:bg-primary before:content-[''] before:absolute before:top-0.5 before:left-0.5 before:h-4 before:w-4 before:bg-card before:rounded-full before:transition checked:before:translate-x-4" />
                </label>
              ))}
            </div>
          </Card>
          )}

          {activeTab === "Danger zone" && (
            <Card className="p-6 border-destructive/30 animate-in fade-in duration-300">
              <h3 className="font-display text-lg font-semibold text-destructive flex items-center gap-2"><Trash2 className="h-5 w-5" /> Danger zone</h3>
            <p className="text-sm text-muted-foreground mt-1">Permanently delete your account and all related data.</p>
            <Btn variant="outline" onClick={handleDeleteAccount} className="mt-4 border-destructive text-destructive hover:bg-destructive/10">Delete my account</Btn>
          </Card>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
