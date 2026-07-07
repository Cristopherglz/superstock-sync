import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useApp } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Boxes, ShieldCheck, Zap } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Ingresar — Nimbus Stock" },
      { name: "description", content: "Accedé al panel de control de inventario." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { user, login } = useApp();
  const navigate = useNavigate();
  const [email, setEmail] = useState("admin@market.com");
  const [password, setPassword] = useState("admin123");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) navigate({ to: "/dashboard" });
  }, [user, navigate]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      const res = login(email, password);
      setLoading(false);
      if (!res.ok) toast.error(res.error ?? "Error al ingresar");
      else {
        toast.success("Bienvenido/a de vuelta");
        navigate({ to: "/dashboard" });
      }
    }, 350);
  };

  const quickLogin = (role: "admin" | "empleado") => {
    setEmail(role === "admin" ? "admin@market.com" : "empleado@market.com");
    setPassword(role === "admin" ? "admin123" : "empleado123");
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left brand panel */}
      <div className="relative hidden lg:flex flex-col justify-between p-12 bg-gradient-hero text-white overflow-hidden">
        <div className="absolute inset-0 opacity-30" style={{
          backgroundImage: "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.25), transparent 40%), radial-gradient(circle at 80% 70%, rgba(255,255,255,0.15), transparent 45%)",
        }} />
        <div className="relative flex items-center gap-3">
          <div className="h-11 w-11 rounded-xl bg-white/15 backdrop-blur flex items-center justify-center ring-1 ring-white/25">
            <Boxes className="h-6 w-6" />
          </div>
          <div>
            <div className="font-display text-xl font-bold tracking-tight">Nimbus Stock</div>
            <div className="text-xs text-white/70">Retail Intelligence Platform</div>
          </div>
        </div>

        <div className="relative space-y-6 max-w-md">
          <h1 className="font-display text-5xl font-bold leading-[1.05]">
            Controlá tu supermercado con precisión de siguiente generación.
          </h1>
          <p className="text-white/80 text-lg leading-relaxed">
            Inventario en tiempo real, alertas inteligentes y una API que sincroniza tu tienda online al instante.
          </p>
          <div className="grid gap-3">
            {[
              { icon: Zap, t: "Sincronización instantánea con e-commerce" },
              { icon: ShieldCheck, t: "Roles, permisos y trazabilidad completa" },
              { icon: Boxes, t: "SKU, códigos de barras y multi-depósito" },
            ].map(({ icon: Icon, t }) => (
              <div key={t} className="flex items-center gap-3 text-white/90">
                <div className="h-9 w-9 rounded-lg bg-white/10 flex items-center justify-center ring-1 ring-white/20">
                  <Icon className="h-4 w-4" />
                </div>
                <span className="text-sm">{t}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative text-xs text-white/60">
          © {new Date().getFullYear()} Nimbus Stock. Diseñado para retail moderno.
        </div>
      </div>

      {/* Right form */}
      <div className="flex items-center justify-center p-6 sm:p-12 bg-gradient-soft">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="h-10 w-10 rounded-xl bg-gradient-brand flex items-center justify-center text-primary-foreground">
              <Boxes className="h-5 w-5" />
            </div>
            <div className="font-display font-bold text-lg">Nimbus Stock</div>
          </div>

          <h2 className="font-display text-3xl font-bold">Ingresá a tu panel</h2>
          <p className="text-muted-foreground mt-2">Gestioná tu inventario y tienda online en un solo lugar.</p>

          <form onSubmit={submit} className="mt-8 space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>

            <Button type="submit" disabled={loading} className="w-full h-11 bg-gradient-brand shadow-elegant hover:opacity-90 transition">
              {loading ? "Ingresando..." : "Ingresar al panel"}
            </Button>
          </form>

          <div className="mt-8 rounded-xl border bg-card p-4">
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
              Acceso rápido demo
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => quickLogin("admin")}
                className="text-left rounded-lg border p-3 hover:border-primary hover:bg-accent transition"
              >
                <div className="text-sm font-semibold">Admin</div>
                <div className="text-xs text-muted-foreground">admin@market.com</div>
              </button>
              <button
                type="button"
                onClick={() => quickLogin("empleado")}
                className="text-left rounded-lg border p-3 hover:border-primary hover:bg-accent transition"
              >
                <div className="text-sm font-semibold">Empleado</div>
                <div className="text-xs text-muted-foreground">empleado@market.com</div>
              </button>
            </div>
          </div>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            <Link to="/tienda" className="text-primary hover:underline">
              Ver tienda online pública →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
