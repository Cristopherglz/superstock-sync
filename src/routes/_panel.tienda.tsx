import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useApp } from "@/lib/store";
import { CATEGORIES } from "@/lib/mock-data";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Search, Boxes } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export const Route = createFileRoute("/_panel/tienda")({
  component: TiendaPage,
});

function TiendaPage() {
  const { products } = useApp();
  const [cat, setCat] = useState<string>("all");
  const [q, setQ] = useState("");
  const [cart, setCart] = useState<Record<string, number>>({});

  const visible = products.filter((p) => p.publishedOnline && p.stock > 0);
  const filtered = visible.filter(
    (p) => (cat === "all" || p.category === cat) && (!q || p.name.toLowerCase().includes(q.toLowerCase())),
  );

  const add = (id: string) => {
    setCart((c) => ({ ...c, [id]: (c[id] || 0) + 1 }));
    toast.success("Agregado al carrito");
  };

  const total = Object.entries(cart).reduce(
    (s, [id, qty]) => s + (products.find((p) => p.id === id)?.price ?? 0) * qty,
    0,
  );
  const itemsCount = Object.values(cart).reduce((s, n) => s + n, 0);

  return (
    <div className="-m-4 lg:-m-8">
      {/* Store hero */}
      <div className="bg-gradient-hero text-white px-6 lg:px-12 py-14">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-2 text-white/70 text-sm mb-4">
            <Boxes className="h-4 w-4" /> Vista previa · tienda online sincronizada
          </div>
          <h1 className="font-display text-4xl lg:text-5xl font-bold max-w-2xl leading-tight">
            Tu supermercado, ahora también online.
          </h1>
          <p className="mt-3 text-white/80 max-w-xl">
            {visible.length} productos publicados en vivo desde tu sistema de inventario.
          </p>
          <div className="mt-6 max-w-md relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/60" />
            <Input
              placeholder="Buscar productos..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="pl-9 bg-white/10 border-white/20 text-white placeholder:text-white/60"
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-8">
        {/* Category chips */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setCat("all")}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition ${
              cat === "all" ? "bg-gradient-brand text-white border-transparent shadow-elegant" : "bg-card hover:bg-secondary"
            }`}
          >
            Todos
          </button>
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              onClick={() => setCat(c.id)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition ${
                cat === c.id ? "bg-gradient-brand text-white border-transparent shadow-elegant" : "bg-card hover:bg-secondary"
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid gap-5 grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
          {filtered.map((p) => {
            const c = CATEGORIES.find((x) => x.id === p.category);
            const low = p.stock <= p.minStock;
            return (
              <Card key={p.id} className="overflow-hidden shadow-elegant hover:shadow-elevated transition-all hover:-translate-y-1 group">
                <div className="aspect-square relative overflow-hidden bg-secondary">
                  <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                  {low && (
                    <Badge className="absolute top-2 right-2 bg-warning text-warning-foreground border-0">
                      Últimas {p.stock}
                    </Badge>
                  )}
                </div>
                <div className="p-4">
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{c?.name}</div>
                  <h3 className="font-medium mt-1 line-clamp-2 min-h-[2.5rem]">{p.name}</h3>
                  <div className="mt-3 flex items-end justify-between">
                    <div className="font-display font-bold text-lg">${p.price.toLocaleString("es-AR")}</div>
                    <Button size="sm" onClick={() => add(p.id)} className="bg-gradient-brand hover:opacity-90 h-8">
                      <ShoppingCart className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {itemsCount > 0 && (
        <div className="fixed bottom-6 right-6 z-30">
          <Card className="p-4 shadow-elevated bg-gradient-brand text-white border-0 flex items-center gap-4">
            <ShoppingCart className="h-5 w-5" />
            <div>
              <div className="text-xs opacity-80">{itemsCount} items</div>
              <div className="font-display font-bold">${total.toLocaleString("es-AR")}</div>
            </div>
            <Button variant="secondary" size="sm" onClick={() => { setCart({}); toast.success("Pedido enviado (demo)"); }}>
              Comprar
            </Button>
          </Card>
        </div>
      )}
    </div>
  );
}
