import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useApp } from "@/lib/store";
import { useTiendaUI } from "@/lib/tienda-ui";
import { CATEGORIES } from "@/lib/mock-data";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, ShoppingCart, Store, Sparkles } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/tienda-online/")({
  head: () => ({
    meta: [
      { title: "Nimbus Market — Tu supermercado online" },
      { name: "description", content: "Recorrí los pasillos de Nimbus Market y recibí tu compra en casa. Sin registro, pago contra entrega." },
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

  const visible = products.filter((p) => p.publishedOnline && p.stock > 0);
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

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-hero text-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-12 lg:py-16">
          <div className="inline-flex items-center gap-2 text-white/80 text-xs bg-white/10 border border-white/20 rounded-full px-3 py-1">
            <Sparkles className="h-3.5 w-3.5" /> Envíos en el día · sin cuenta requerida
          </div>
          <h1 className="mt-4 font-display text-4xl lg:text-5xl font-bold max-w-2xl leading-tight">
            Recorré tu supermercado desde casa.
          </h1>
          <p className="mt-3 text-white/85 max-w-xl">
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
        {/* Pasillos heading */}
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 rounded-xl bg-gradient-brand flex items-center justify-center shadow-elegant">
            <Store className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="font-display text-2xl font-bold">Pasillos</h2>
            <p className="text-xs text-muted-foreground">Elegí una sección del supermercado</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-8">
          <button
            onClick={() => setCat("all")}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition ${
              cat === "all"
                ? "bg-gradient-brand text-white border-transparent shadow-elegant"
                : "bg-card hover:bg-secondary"
            }`}
          >
            Todos los pasillos
          </button>
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              onClick={() => setCat(c.id)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition ${
                cat === c.id
                  ? "bg-gradient-brand text-white border-transparent shadow-elegant"
                  : "bg-card hover:bg-secondary"
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid gap-4 sm:gap-5 grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
          {filtered.map((p) => {
            const c = CATEGORIES.find((x) => x.id === p.category);
            const low = p.stock <= p.minStock;
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
                    {low && (
                      <Badge className="absolute top-2 right-2 bg-warning text-warning-foreground border-0">
                        Últimas {p.stock}
                      </Badge>
                    )}
                  </div>
                  <div className="p-3 sm:p-4 flex flex-col flex-1">
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{c?.name}</div>
                    <h3 className="font-medium mt-1 line-clamp-2 min-h-[2.5rem]">{p.name}</h3>
                    <div className="mt-auto pt-3 flex items-end justify-between">
                      <div className="font-display font-bold text-lg">${p.price.toLocaleString("es-AR")}</div>
                      <button
                        onClick={(e) => handleAdd(e, p.id, p.image, p.name)}
                        className="h-9 w-9 rounded-full bg-gradient-brand text-white flex items-center justify-center shadow-elegant hover:opacity-90 active:scale-95 transition"
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
