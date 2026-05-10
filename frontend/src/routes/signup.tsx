import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import AuthLayout, { Field, Input, TextArea } from "@/components/AuthLayout";
import { Btn, Chip } from "@/components/ui-kit";
import { Camera } from "lucide-react";

export const Route = createFileRoute("/signup")({
  head: () => ({ meta: [{ title: "Create account — Traveloop" }, { name: "description", content: "Join Traveloop and start planning your next adventure." }] }),
  component: SignupPage,
});

function SignupPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    city: "",
    country: "",
    bio: "",
    password: "",
    confirmPassword: ""
  });
  const [error, setError] = useState("");
  const [isChecking, setIsChecking] = useState(true);
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState<string | null>(null);
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);

  useEffect(() => {
    if (localStorage.getItem("token")) {
      navigate({ to: "/", replace: true });
    } else {
      setIsChecking(false);
    }
  }, [navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      const dataToSend = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        dataToSend.append(key, value);
      });
      dataToSend.append("styles", JSON.stringify(selectedStyles));
      if (profilePhoto) {
        dataToSend.append("profilePhoto", profilePhoto);
      }

      const res = await fetch("http://localhost:5000/api/signup", {
        method: "POST",
        body: dataToSend,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Signup failed");
      }

      localStorage.setItem("token", data.token);
      alert("Signup Successful!");
      navigate({ to: "/" });
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (isChecking) return null;

  return (
    <AuthLayout
      title="Start your travel story"
      subtitle="A few details and you're ready to plan your first trip."
      footer={<>Already a member? <Link to="/login" className="text-primary font-semibold">Sign in</Link></>}
    >
      <form className="space-y-5" onSubmit={handleSignup}>
        {error && <div className="text-red-500 text-sm font-semibold">{error}</div>}
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-2xl bg-gradient-ocean grid place-items-center text-white overflow-hidden shrink-0">
            {profilePhotoPreview ? (
              <img src={profilePhotoPreview} alt="Profile preview" className="w-full h-full object-cover" />
            ) : (
              <Camera className="h-6 w-6" />
            )}
          </div>
          <div>
            <div className="text-sm font-semibold">Profile photo</div>
            <div className="text-xs text-muted-foreground">PNG or JPG, up to 5MB</div>
            <label className="text-xs text-primary font-semibold mt-1 cursor-pointer inline-block">
              Upload image
              <input 
                type="file" 
                className="hidden" 
                accept="image/png, image/jpeg" 
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setProfilePhoto(e.target.files[0]);
                    setProfilePhotoPreview(URL.createObjectURL(e.target.files[0]));
                  }
                }} 
              />
            </label>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="First name"><Input name="firstName" value={formData.firstName} onChange={handleChange} required /></Field>
          <Field label="Last name"><Input name="lastName" value={formData.lastName} onChange={handleChange} required /></Field>
        </div>
        <Field label="Email"><Input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="you@traveloop.app" required /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Phone"><Input name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} placeholder="+1 (555) 010 1234" /></Field>
          <Field label="City" hint="Helps us suggest local trips"><Input name="city" value={formData.city} onChange={handleChange} /></Field>
        </div>
        <Field label="Country"><Input name="country" value={formData.country} onChange={handleChange} /></Field>
        <Field label="Additional info" hint="What kind of traveler are you?">
          <TextArea name="bio" value={formData.bio} onChange={handleChange} rows={3} placeholder="Slow travel, food discoveries, off-the-beaten-path…" />
        </Field>
        <div className="flex flex-wrap gap-2">
          {["Adventure", "Food", "Culture", "Nature", "Luxury", "Budget"].map((t) => {
            const isSelected = selectedStyles.includes(t);
            return (
              <button 
                key={t} 
                type="button" 
                onClick={() => {
                  setSelectedStyles(prev => 
                    prev.includes(t) ? prev.filter(s => s !== t) : [...prev, t]
                  );
                }}
                className={`rounded-full transition-all hover:scale-105 ${isSelected ? "ring-2 ring-coral ring-offset-2" : ""}`}
              >
                <Chip active={isSelected} color={isSelected ? "coral" : "default"}>
                  {t}
                </Chip>
              </button>
            );
          })}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Password"><Input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="••••••••" required /></Field>
          <Field label="Confirm password"><Input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="••••••••" required /></Field>
        </div>
        <label className="flex items-start gap-2 text-xs text-muted-foreground">
          <input type="checkbox" required className="mt-0.5 accent-primary" />
          I agree to the <a className="text-primary font-semibold cursor-pointer">Terms</a> and <a className="text-primary font-semibold cursor-pointer">Privacy Policy</a>.
        </label>
        <Btn size="lg" className="w-full" type="submit">Create account</Btn>
      </form>
    </AuthLayout>
  );
}
