import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useRef, useState } from "react";
import { useApp, effectivePrice } from "@/lib/store";
import { useTiendaUI } from "@/lib/tienda-ui";
import { CATEGORIES } from "@/lib/mock-data";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, ShoppingCart, Store, Sparkles, ChevronLeft, ChevronRight, Flame } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/tienda-online/")({
  head: () => ({
    meta: [
      { title: "Nimbus Market — Tu supermercado online" },
      { name: "description", content: "Recorré los pasillos de Nimbus Market y recibí tu compra en casa. Sin registro, pagás con Mercado Pago o al recibir." },
      { property: "og:title", content: "Nimbus Market — Tu supermercado online" },
      { property: "og:description", content: "Comprá tus productos favoritos y recibilos en tu domicilio." },
    ],
  }),
  component: StoreHome,
});

function StoreHome() {
  const { products, addToCart } = useApp();
  const { flyToCart } = useTiendaUI();
  const [cat, setCat] = useState<string>("all");
  const [q, setQ] = useState("");
  const railRef = useRef<HTMLDivElement>(null);

  const visible = products.filter((p) => p.publishedOnline && p.stock > 0);

  // Only show categories that actually have visible products
  const activeCategories = useMemo(
    () => CATEGORIES.filter((c) => visible.some((p) => p.category === c.id)),
    [visible],
  );

  const filtered = visible.filter(
    (p) => (cat === "all" || p.category === cat) && (!q || p.name.toLowerCase().includes(q.toLowerCase())),
  );

  const handleAdd = (
    e: React.MouseEvent<HTMLButtonElement>,
    id: string,
    image: string,
    name: string,
  ) => {
    e.preventDefault();
    e.stopPropagation();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    flyToCart({ image, from: { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 } });
    addToCart(id);
    toast.success(`${name} agregado`);
  };

  const scroll = (dir: -1 | 1) => {
    railRef.current?.scrollBy({ left: dir * 320, behavior: "smooth" });
  };

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-hero text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-10 lg:py-16">
          <div className="inline-flex items-center gap-2 text-white/80 text-xs bg-white/10 border border-white/20 rounded-full px-3 py-1">
            <Sparkles className="h-3.5 w-3.5" /> Envíos en el día · pagás con Mercado Pago
          </div>
          <h1 className="mt-4 font-display text-3xl sm:text-4xl lg:text-5xl font-bold max-w-2xl leading-tight">
            Recorré tu supermercado desde casa.
          </h1>
          <p className="mt-3 text-white/85 max-w-xl text-sm sm:text-base">
            {visible.length} productos frescos, listos para llegar a tu puerta. Elegí tus pasillos y llená el carrito.
          </p>
          <div className="mt-6 max-w-md relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/60" />
            <Input
              placeholder="¿Qué estás buscando hoy?"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="pl-9 bg-white/10 border-white/20 text-white placeholder:text-white/60"
            />
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-8">
        {/* Pasillos */}
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-10 w-10 rounded-xl bg-gradient-brand flex items-center justify-center shadow-elegant shrink-0">
              <Store className="h-5 w-5 text-white" />
            </div>
            <div className="min-w-0">
              <h2 className="font-display text-xl sm:text-2xl font-bold">Pasillos</h2>
              <p className="text-xs text-muted-foreground truncate">Elegí una sección del supermercado</p>
            </div>
          </div>
          <div className="hidden sm:flex gap-1 shrink-0">
            <button onClick={() => scroll(-1)} className="h-9 w-9 rounded-full border bg-card hover:bg-secondary flex items-center justify-center transition" aria-label="Anterior">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button onClick={() => scroll(1)} className="h-9 w-9 rounded-full border bg-card hover:bg-secondary flex items-center justify-center transition" aria-label="Siguiente">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div
          ref={railRef}
          className="flex gap-3 overflow-x-auto pb-3 mb-8 snap-x snap-mandatory scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden -mx-4 px-4 sm:mx-0 sm:px-0"
        >
          <CatChip
            active={cat === "all"}
            onClick={() => setCat("all")}
            label="Todos"
            icon={<Store className="h-5 w-5" />}
            color="oklch(0.52 0.18 255)"
          />
          {activeCategories.map((c) => {
            const Icon = c.icon;
            return (
              <CatChip
                key={c.id}
                active={cat === c.id}
                onClick={() => setCat(c.id)}
                label={c.name}
                icon={<Icon className="h-5 w-5" />}
                color={c.color}
              />
            );
          })}
        </div>

        {/* Grid */}
        <div className="grid gap-3 sm:gap-5 grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
          {filtered.map((p) => {
            const c = CATEGORIES.find((x) => x.id === p.category);
            const low = p.stock <= p.minStock;
            const eff = effectivePrice(p);
            const onSale = p.discountPct > 0;
            return (
              <Link
                key={p.id}
                to="/tienda-online/producto/$id"
                params={{ id: p.id }}
                className="group"
              >
                <Card className="overflow-hidden shadow-elegant hover:shadow-elevated transition-all hover:-translate-y-1 h-full flex flex-col">
                  <div className="aspect-square relative overflow-hidden bg-secondary">
                    <img
                      src={p.image}
                      alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                    {onSale && (
                      <div className="absolute top-2 left-2 rounded-full bg-destructive text-destructive-foreground text-[11px] font-bold px-2.5 py-1 shadow-elegant flex items-center gap-1">
                        <Flame className="h-3 w-3" /> -{p.discountPct}%
                      </div>
                    )}
                    {low && (
                      <Badge className="absolute top-2 right-2 bg-warning text-warning-foreground border-0">
                        Últimas {p.stock}
                      </Badge>
                    )}
                  </div>
                  <div className="p-3 sm:p-4 flex flex-col flex-1">
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{c?.name}</div>
                    <h3 className="font-medium mt-1 line-clamp-2 min-h-[2.5rem] text-sm sm:text-base">{p.name}</h3>
                    <div className="mt-auto pt-3 flex items-end justify-between gap-2">
                      <div className="min-w-0">
                        {onSale && (
                          <div className="text-[11px] text-muted-foreground line-through leading-none">
                            ${p.price.toLocaleString("es-AR")}
                          </div>
                        )}
                        <div className={`font-display font-bold text-base sm:text-lg ${onSale ? "text-destructive" : ""}`}>
                          ${eff.toLocaleString("es-AR")}
                        </div>
                      </div>
                      <button
                        onClick={(e) => handleAdd(e, p.id, p.image, p.name)}
                        className="h-9 w-9 rounded-full bg-gradient-brand text-white flex items-center justify-center shadow-elegant hover:opacity-90 active:scale-95 transition shrink-0"
                        aria-label="Agregar al carrito"
                      >
                        <ShoppingCart className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="py-16 text-center text-muted-foreground">
            <Store className="h-10 w-10 mx-auto mb-3 opacity-40" />
            No encontramos productos en este pasillo.
          </div>
        )}
      </div>
    </div>
  );
}

function CatChip({
  active,
  onClick,
  label,
  icon,
  color,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`snap-start shrink-0 flex flex-col items-center justify-center gap-2 rounded-2xl w-24 sm:w-28 h-24 sm:h-28 border transition-all ${
        active
          ? "bg-gradient-brand text-white border-transparent shadow-elevated -translate-y-0.5"
          : "bg-card hover:bg-secondary text-foreground"
      }`}
    >
      <div
        className="h-10 w-10 rounded-xl flex items-center justify-center text-white shadow-elegant"
        style={{ background: active ? "rgba(255,255,255,0.2)" : color }}
      >
        {icon}
      </div>
      <div className="text-[11px] sm:text-xs font-medium text-center leading-tight px-1 line-clamp-2">
        {label}
      </div>
    </button>
  );
}
