import { createFileRoute, Link, Outlet, useLocation, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useApp, type Role } from "@/lib/store";
import { CATEGORIES } from "@/lib/mock-data";
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
  ClipboardList,
  X,
  AlertTriangle,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export const Route = createFileRoute("/_panel")({
  ssr: false,
  component: PanelLayout,
});

const NAV_ALL = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["admin"] as Role[] },
  { to: "/productos", label: "Productos", icon: Package, roles: ["admin", "empleado"] as Role[] },
  { to: "/inventario", label: "Inventario", icon: Warehouse, roles: ["admin", "empleado"] as Role[] },
  { to: "/pedidos", label: "Pedidos", icon: ClipboardList, roles: ["admin", "empleado"] as Role[] },
  { to: "/categorias", label: "Categorías", icon: Tags, roles: ["admin"] as Role[] },
  { to: "/tienda", label: "Tienda Online", icon: Store, roles: ["admin", "empleado"] as Role[] },
  { to: "/api-docs", label: "API", icon: Code2, roles: ["admin"] as Role[] },
] as const;

function SidebarContent({
  user,
  logout,
  lowStock,
  unread,
  onNavigate,
  location,
}: {
  user: { name: string; role: Role };
  logout: () => void;
  lowStock: number;
  unread: number;
  onNavigate?: () => void;
  location: { pathname: string };
}) {
  const nav = NAV_ALL.filter((n) => n.roles.includes(user.role));
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
        {nav.map((item) => {
          const active = location.pathname.startsWith(item.to);
          const Icon = item.icon;
          const badge =
            item.to === "/inventario" && lowStock > 0
              ? lowStock
              : item.to === "/pedidos" && unread > 0
                ? unread
                : null;
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
              {badge !== null && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-destructive text-destructive-foreground font-semibold">
                  {badge}
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

function GlobalSearch({ onDone }: { onDone?: () => void }) {
  const { products } = useApp();
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);

  const results = useMemo(() => {
    if (!q.trim()) return [];
    const s = q.toLowerCase();
    return products
      .filter(
        (p) =>
          p.name.toLowerCase().includes(s) ||
          p.sku.toLowerCase().includes(s) ||
          p.barcode.includes(q) ||
          CATEGORIES.find((c) => c.id === p.category)?.name.toLowerCase().includes(s),
      )
      .slice(0, 8);
  }, [q, products]);

  const submit = () => {
    if (!q.trim()) return;
    navigate({ to: "/productos", search: { q } as never });
    setOpen(false);
    onDone?.();
  };

  return (
    <div className="relative w-full">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
      <Input
        placeholder="Buscar productos, SKU, códigos..."
        className="pl-9 bg-secondary border-transparent"
        value={q}
        onChange={(e) => { setQ(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(!!q)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        onKeyDown={(e) => e.key === "Enter" && submit()}
      />
      {open && results.length > 0 && (
        <div className="absolute left-0 right-0 top-full mt-2 rounded-xl border bg-popover shadow-elevated z-50 overflow-hidden">
          {results.map((p) => {
            const cat = CATEGORIES.find((c) => c.id === p.category);
            return (
              <button
                key={p.id}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  navigate({ to: "/productos", search: { q: p.sku } as never });
                  setOpen(false);
                  setQ("");
                  onDone?.();
                }}
                className="w-full flex items-center gap-3 p-3 hover:bg-secondary text-left border-b last:border-b-0"
              >
                <img src={p.image} alt="" className="h-10 w-10 rounded-lg object-cover border shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{p.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {cat?.name} · SKU {p.sku} · Stock {p.stock}
                  </div>
                </div>
                <div className="text-sm font-semibold shrink-0">${p.price.toLocaleString("es-AR")}</div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function NotificationsBell() {
  const { lowStockProducts, unreadOrders, markOrdersRead, updateProduct } = useApp();
  const navigate = useNavigate();
  const total = lowStockProducts.length + unreadOrders.length;

  return (
    <Popover onOpenChange={(o) => { if (o) markOrdersRead(); }}>
      <PopoverTrigger asChild>
        <button className="relative p-2 rounded-lg hover:bg-accent transition shrink-0" aria-label="Notificaciones">
          <Bell className="h-5 w-5 text-muted-foreground" />
          {total > 0 && (
            <span className="absolute top-0.5 right-0.5 h-4 min-w-4 px-1 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center">
              {total}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0 max-h-[70vh] overflow-y-auto">
        <div className="p-3 border-b flex items-center justify-between">
          <div className="font-display font-semibold">Notificaciones</div>
          <span className="text-xs text-muted-foreground">{total} nuevas</span>
        </div>
        {total === 0 && (
          <div className="p-6 text-center text-sm text-muted-foreground">Sin novedades. Todo en orden 🎉</div>
        )}
        {unreadOrders.length > 0 && (
          <div className="p-2">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground px-2 pb-1">Nuevos pedidos</div>
            {unreadOrders.slice(0, 6).map((o) => (
              <button
                key={o.id}
                onClick={() => navigate({ to: "/pedidos" })}
                className="w-full flex items-center gap-3 rounded-lg p-2 hover:bg-secondary text-left"
              >
                <div className="h-8 w-8 rounded-full bg-primary/15 text-primary flex items-center justify-center shrink-0">
                  <ClipboardList className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">Pedido {o.id} · {o.customer.fullName}</div>
                  <div className="text-xs text-muted-foreground">
                    ${o.total.toLocaleString("es-AR")} · {o.paymentStatus === "paid" ? "Pagado" : "Pendiente pago"}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
        {lowStockProducts.length > 0 && (
          <div className="p-2 border-t">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground px-2 pb-1">Stock bajo o agotado</div>
            {lowStockProducts.slice(0, 8).map((p) => (
              <button
                key={p.id}
                onClick={() => navigate({ to: "/inventario" })}
                className="w-full flex items-center gap-3 rounded-lg p-2 hover:bg-secondary text-left"
              >
                <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${p.stock === 0 ? "bg-destructive/15 text-destructive" : "bg-warning/25 text-warning-foreground"}`}>
                  <AlertTriangle className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{p.name}</div>
                  <div className="text-xs text-muted-foreground">
                    Stock {p.stock} / mín {p.minStock}
                  </div>
                </div>
                {p.stock === 0 && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-destructive text-destructive-foreground shrink-0">Agotado</span>
                )}
              </button>
            ))}
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}

function PanelLayout() {
  const { user, logout, lowStockProducts, unreadOrders } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!user) navigate({ to: "/auth" });
  }, [user, navigate]);

  // Redirect employee away from admin-only pages
  useEffect(() => {
    if (!user) return;
    const item = NAV_ALL.find((n) => location.pathname.startsWith(n.to));
    if (item && !item.roles.includes(user.role)) {
      navigate({ to: "/productos" });
    }
    if (user.role === "empleado" && location.pathname === "/dashboard") {
      navigate({ to: "/productos" });
    }
  }, [user, location.pathname, navigate]);

  if (!user) return null;

  const lowStock = lowStockProducts.length;
  const doLogout = () => { logout(); navigate({ to: "/auth" }); };

  return (
    <div className="min-h-screen bg-gradient-soft flex">
      <aside className="hidden lg:flex w-64 flex-col">
        <SidebarContent user={user} logout={doLogout} lowStock={lowStock} unread={unreadOrders.length} location={location} />
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b bg-card/70 backdrop-blur-xl px-3 sm:px-4 lg:px-8 flex items-center gap-2 sm:gap-3 sticky top-0 z-20">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <button className="lg:hidden p-2 -ml-1 rounded-lg hover:bg-accent transition shrink-0" aria-label="Abrir menú">
                <Menu className="h-5 w-5" />
              </button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-72 bg-sidebar text-sidebar-foreground border-r-sidebar-border">
              <SheetTitle className="sr-only">Menú de navegación</SheetTitle>
              <SidebarContent
                user={user}
                logout={() => { setMobileOpen(false); doLogout(); }}
                lowStock={lowStock}
                unread={unreadOrders.length}
                onNavigate={() => setMobileOpen(false)}
                location={location}
              />
            </SheetContent>
          </Sheet>

          <div className="lg:hidden flex items-center gap-2 min-w-0 mr-1">
            <div className="h-8 w-8 rounded-lg bg-gradient-brand flex items-center justify-center shrink-0">
              <Boxes className="h-4 w-4 text-white" />
            </div>
            <span className="font-display font-bold truncate">Nimbus</span>
          </div>

          <div className="hidden md:block flex-1 max-w-md">
            <GlobalSearch />
          </div>
          <div className="flex-1 md:hidden" />

          <Sheet>
            <SheetTrigger asChild>
              <button className="md:hidden p-2 rounded-lg hover:bg-accent transition shrink-0" aria-label="Buscar">
                <Search className="h-5 w-5" />
              </button>
            </SheetTrigger>
            <SheetContent side="top" className="p-4">
              <SheetTitle className="sr-only">Buscar</SheetTitle>
              <GlobalSearch />
            </SheetContent>
          </Sheet>

          <Badge variant="outline" className="hidden xl:inline-flex gap-1.5 border-success/40 text-success bg-success/10">
            <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
            API online
          </Badge>
          <NotificationsBell />
        </header>

        <main className="flex-1 p-3 sm:p-4 lg:p-8 min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

// silence unused
void X;
