import { createFileRoute, Link, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useApp } from "@/lib/store";
import { TiendaUIProvider, useTiendaUI } from "@/lib/tienda-ui";
import { Boxes, ShoppingCart, ShieldCheck, Sparkles } from "lucide-react";

export const Route = createFileRoute("/tienda-online")({
  ssr: false,
  component: TiendaLayout,
});

function TiendaLayout() {
  return (
    <TiendaUIProvider>
      <div className="min-h-screen bg-gradient-soft flex flex-col">
        <TopBar />
        <main className="flex-1">
          <Outlet />
        </main>
        <Footer />
        <FloatingCart />
      </div>
    </TiendaUIProvider>
  );
}

function TopBar() {
  const { cart } = useApp();
  const items = Object.values(cart).reduce((s, n) => s + n, 0);
  return (
    <header className="sticky top-0 z-30 border-b bg-card/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 h-16 flex items-center gap-3">
        <Link to="/tienda-online" className="flex items-center gap-2.5 shrink-0">
          <div className="h-9 w-9 rounded-xl bg-gradient-brand flex items-center justify-center shadow-glow">
            <Boxes className="h-4.5 w-4.5 text-white" />
          </div>
          <div className="leading-tight">
            <div className="font-display font-bold tracking-tight">Nimbus Market</div>
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Tu súper online</div>
          </div>
        </Link>
        <div className="flex-1" />
        <Link
          to="/tienda-online/caja"
          className="relative inline-flex items-center gap-2 rounded-xl bg-gradient-brand text-white px-3 sm:px-4 py-2 text-sm font-medium shadow-elegant hover:opacity-90 transition"
        >
          <ShoppingCart className="h-4 w-4" />
          <span className="hidden sm:inline">Caja</span>
          {items > 0 && (
            <span className="absolute -top-1.5 -right-1.5 h-5 min-w-5 px-1 rounded-full bg-white text-primary text-[10px] font-bold flex items-center justify-center shadow">
              {items}
            </span>
          )}
        </Link>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="border-t bg-card/60 mt-10">
      <div className="max-w-7xl mx-auto px-6 py-8 text-sm text-muted-foreground flex flex-col sm:flex-row items-center gap-3 justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-success" />
          Compra sin cuenta · envío a domicilio
        </div>
        <Link to="/auth" className="hover:text-foreground transition">
          Panel de control interno →
        </Link>
      </div>
    </footer>
  );
}

const LS_FAB_POS = "sm_fab_pos";

function FloatingCart() {
  const { cart, products } = useApp();
  const { registerCartAnchor, bump } = useTiendaUI();
  const navigate = useNavigate();
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const dragState = useRef<{ dx: number; dy: number; moved: boolean } | null>(null);
  const [pulse, setPulse] = useState(false);

  const items = Object.values(cart).reduce((s, n) => s + n, 0);
  const total = Object.entries(cart).reduce(
    (s, [id, q]) => s + (products.find((p) => p.id === id)?.price ?? 0) * q,
    0,
  );

  // hydrate saved position
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_FAB_POS);
      if (raw) {
        const saved = JSON.parse(raw);
        if (typeof saved.x === "number" && typeof saved.y === "number") setPos(saved);
      }
    } catch {}
  }, []);

  // set default position bottom-right on mount if not saved
  useEffect(() => {
    if (pos) return;
    const w = window.innerWidth;
    const h = window.innerHeight;
    setPos({ x: w - 200, y: h - 120 });
  }, [pos]);

  // register anchor for fly-to-cart animation
  useEffect(() => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    registerCartAnchor({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
  }, [pos, items, registerCartAnchor]);

  // bump animation when an item lands
  useEffect(() => {
    if (bump === 0) return;
    setPulse(true);
    const t = setTimeout(() => setPulse(false), 500);
    return () => clearTimeout(t);
  }, [bump]);

  if (items === 0 || !pos) return null;

  const onPointerDown = (e: React.PointerEvent) => {
    if (!ref.current) return;
    (e.target as Element).setPointerCapture?.(e.pointerId);
    dragState.current = {
      dx: e.clientX - pos.x,
      dy: e.clientY - pos.y,
      moved: false,
    };
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragState.current || !ref.current) return;
    const nx = e.clientX - dragState.current.dx;
    const ny = e.clientY - dragState.current.dy;
    const rect = ref.current.getBoundingClientRect();
    const maxX = window.innerWidth - rect.width - 8;
    const maxY = window.innerHeight - rect.height - 8;
    const clampedX = Math.max(8, Math.min(maxX, nx));
    const clampedY = Math.max(8, Math.min(maxY, ny));
    if (Math.abs(nx - pos.x) > 3 || Math.abs(ny - pos.y) > 3) dragState.current.moved = true;
    setPos({ x: clampedX, y: clampedY });
  };

  const onPointerUp = (e: React.PointerEvent) => {
    const moved = dragState.current?.moved;
    dragState.current = null;
    if (pos) localStorage.setItem(LS_FAB_POS, JSON.stringify(pos));
    if (!moved) {
      navigate({ to: "/tienda-online/caja" });
    }
    (e.target as Element).releasePointerCapture?.(e.pointerId);
  };

  return (
    <div
      ref={ref}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      style={{ left: pos.x, top: pos.y, touchAction: "none" }}
      className={`fixed z-40 select-none cursor-grab active:cursor-grabbing rounded-2xl text-white shadow-elevated flex items-center gap-3 transition-transform animated-border ${
        pulse ? "scale-110" : "scale-100"
      }`}
    >
      <div className="rounded-[14px] bg-gradient-brand px-4 py-3 flex items-center gap-3">
        <div className="relative">
          <ShoppingCart className="h-5 w-5" />
          <span className="absolute -top-2 -right-2 h-5 min-w-5 px-1 rounded-full bg-white text-primary text-[10px] font-bold flex items-center justify-center shadow">
            {items}
          </span>
        </div>
        <div className="leading-tight">
          <div className="text-[10px] uppercase tracking-wider opacity-80">Ir a caja</div>
          <div className="font-display font-bold">${total.toLocaleString("es-AR")}</div>
        </div>
      </div>
    </div>
  );
}
