import { createFileRoute, Link, Outlet, useLocation, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useApp } from "@/lib/store";
import {
  LayoutDashboard,
  Package,
  Warehouse,
  Tags,
  Store,
  Code2,
  LogOut,
  Boxes,
  Bell,
  Search,
  Menu,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";

export const Route = createFileRoute("/_panel")({
  ssr: false,
  component: PanelLayout,
});

const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/productos", label: "Productos", icon: Package },
  { to: "/inventario", label: "Inventario", icon: Warehouse },
  { to: "/categorias", label: "Categorías", icon: Tags },
  { to: "/tienda", label: "Tienda Online", icon: Store },
  { to: "/api-docs", label: "API", icon: Code2 },
] as const;

function SidebarContent({
  user,
  logout,
  lowStock,
  onNavigate,
  location,
}: {
  user: { name: string; role: string };
  logout: () => void;
  lowStock: number;
  onNavigate?: () => void;
  location: { pathname: string };
}) {
  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      <div className="p-6 flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-gradient-brand flex items-center justify-center shadow-glow shrink-0">
          <Boxes className="h-5 w-5 text-white" />
        </div>
        <div className="min-w-0">
          <div className="font-display font-bold tracking-tight truncate">Nimbus Stock</div>
          <div className="text-[10px] uppercase tracking-widest text-sidebar-foreground/60">Retail OS</div>
        </div>
      </div>

      <nav className="px-3 flex-1 space-y-1 overflow-y-auto">
        {NAV.map((item) => {
          const active = location.pathname.startsWith(item.to);
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={onNavigate}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-elegant"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="flex-1 truncate">{item.label}</span>
              {item.to === "/inventario" && lowStock > 0 && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-destructive text-destructive-foreground font-semibold">
                  {lowStock}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-sidebar-border">
        <div className="flex items-center gap-3 px-2 py-2">
          <div className="h-9 w-9 rounded-full bg-gradient-brand flex items-center justify-center text-white font-semibold text-sm shrink-0">
            {user.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium truncate">{user.name}</div>
            <div className="text-[10px] uppercase tracking-wider text-sidebar-foreground/60">{user.role}</div>
          </div>
          <button
            onClick={logout}
            className="p-2 rounded-lg text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground shrink-0"
            title="Cerrar sesión"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function PanelLayout() {
  const { user, logout, products } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!user) navigate({ to: "/auth" });
  }, [user, navigate]);

  if (!user) return null;

  const lowStock = products.filter((p) => p.stock <= p.minStock).length;
  const doLogout = () => { logout(); navigate({ to: "/auth" }); };

  return (
    <div className="min-h-screen bg-gradient-soft flex">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 flex-col">
        <SidebarContent user={user} logout={doLogout} lowStock={lowStock} location={location} />
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="h-16 border-b bg-card/70 backdrop-blur-xl px-3 sm:px-4 lg:px-8 flex items-center gap-2 sm:gap-4 sticky top-0 z-20">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <button
                className="lg:hidden p-2 -ml-1 rounded-lg hover:bg-accent transition shrink-0"
                aria-label="Abrir menú"
              >
                <Menu className="h-5 w-5" />
              </button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-72 bg-sidebar text-sidebar-foreground border-r-sidebar-border">
              <SheetTitle className="sr-only">Menú de navegación</SheetTitle>
              <SidebarContent
                user={user}
                logout={() => { setMobileOpen(false); doLogout(); }}
                lowStock={lowStock}
                onNavigate={() => setMobileOpen(false)}
                location={location}
              />
            </SheetContent>
          </Sheet>

          <div className="lg:hidden flex items-center gap-2 min-w-0">
            <div className="h-8 w-8 rounded-lg bg-gradient-brand flex items-center justify-center shrink-0">
              <Boxes className="h-4 w-4 text-white" />
            </div>
            <span className="font-display font-bold truncate">Nimbus</span>
          </div>

          <div className="hidden sm:block flex-1 max-w-md relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar productos, SKU, códigos..." className="pl-9 bg-secondary border-transparent" />
          </div>
          <div className="flex-1 sm:hidden" />

          <Badge variant="outline" className="hidden md:inline-flex gap-1.5 border-success/40 text-success bg-success/10">
            <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
            API online
          </Badge>
          <button className="relative p-2 rounded-lg hover:bg-accent transition shrink-0" aria-label="Notificaciones">
            <Bell className="h-5 w-5 text-muted-foreground" />
            {lowStock > 0 && (
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-destructive" />
            )}
          </button>
        </header>

        <main className="flex-1 p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
