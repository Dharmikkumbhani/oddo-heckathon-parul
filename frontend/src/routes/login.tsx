import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import AuthLayout, { Field, Input } from "@/components/AuthLayout";
import { Btn } from "@/components/ui-kit";
import { Mail, Lock, Eye } from "lucide-react";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Sign in — Traveloop" }, { name: "description", content: "Sign in to plan and share your trips with Traveloop." }] }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (localStorage.getItem("token")) {
      navigate({ to: "/", replace: true });
    } else {
      setIsChecking(false);
    }
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Login failed");
      }

      // Store token securely in real app, using localStorage for simplicity
      localStorage.setItem("token", data.token);
      alert("Login Successful!");
      navigate({ to: "/" });
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (isChecking) return null;

  return (
    <AuthLayout
      title="Welcome back, explorer"
      subtitle="Pick up your itinerary right where you left off."
      footer={<>New to Traveloop? <Link to="/signup" className="text-primary font-semibold">Create an account</Link></>}
    >
      <form className="space-y-4" onSubmit={handleLogin}>
        {error && <div className="text-red-500 text-sm font-semibold">{error}</div>}
        <Field label="Email">
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input type="email" placeholder="you@traveloop.app" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10" required />
          </div>
        </Field>
        <Field label="Password">
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-10 pr-10" required />
            <Eye className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground cursor-pointer" />
          </div>
        </Field>
        <div className="flex items-center justify-between text-xs">
          <label className="flex items-center gap-2 text-muted-foreground">
            <input type="checkbox" defaultChecked className="rounded accent-primary" /> Remember me
          </label>
          <a className="text-primary font-semibold cursor-pointer">Forgot password?</a>
        </div>
        <Btn size="lg" className="w-full" type="submit">Sign in</Btn>
        <div className="flex items-center gap-3 text-[11px] text-muted-foreground"><span className="flex-1 h-px bg-border" /> OR <span className="flex-1 h-px bg-border" /></div>
        <Btn variant="outline" size="lg" className="w-full" type="button">
          <svg className="h-4 w-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22 12.2c0-.7-.1-1.4-.2-2H12v3.9h5.6c-.2 1.3-1 2.4-2.1 3.1v2.6h3.4c2-1.8 3.1-4.5 3.1-7.6z"/><path fill="#34A853" d="M12 22c2.7 0 5-1 6.7-2.6l-3.4-2.6c-.9.6-2 1-3.3 1-2.5 0-4.7-1.7-5.5-4H3v2.5C4.7 19.6 8.1 22 12 22z"/><path fill="#FBBC05" d="M6.5 13.8c-.2-.6-.3-1.2-.3-1.8s.1-1.2.3-1.8V7.7H3C2.4 9 2 10.4 2 12s.4 3 1 4.3l3.5-2.5z"/><path fill="#EA4335" d="M12 6c1.5 0 2.8.5 3.8 1.5l2.9-2.9C17 3 14.7 2 12 2 8.1 2 4.7 4.4 3 7.7l3.5 2.5C7.3 7.7 9.5 6 12 6z"/></svg>
          Continue with Google
        </Btn>
      </form>
    </AuthLayout>
  );
}
