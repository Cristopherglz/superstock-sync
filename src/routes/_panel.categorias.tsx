import { createFileRoute } from "@tanstack/react-router";
import { useApp } from "@/lib/store";
import { CATEGORIES } from "@/lib/mock-data";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/_panel/categorias")({
  component: CategoriasPage,
});

function CategoriasPage() {
  const { products } = useApp();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold">Categorías</h1>
        <p className="text-muted-foreground mt-1">Organización y performance por rubro</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {CATEGORIES.map((c) => {
          const items = products.filter((p) => p.category === c.id);
          const stock = items.reduce((s, p) => s + p.stock, 0);
          const value = items.reduce((s, p) => s + p.stock * p.cost, 0);
          return (
            <Card key={c.id} className="p-6 shadow-elegant overflow-hidden relative">
              <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full opacity-20 blur-2xl" style={{ background: c.color }} />
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl flex items-center justify-center text-white font-display font-bold text-lg" style={{ background: c.color }}>
                  {c.name.charAt(0)}
                </div>
                <div>
                  <div className="font-display font-semibold text-lg">{c.name}</div>
                  <div className="text-xs text-muted-foreground">{items.length} productos</div>
                </div>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-secondary p-3">
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Unidades</div>
                  <div className="font-display font-bold text-xl mt-1">{stock.toLocaleString("es-AR")}</div>
                </div>
                <div className="rounded-lg bg-secondary p-3">
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Valor stock</div>
                  <div className="font-display font-bold text-xl mt-1">${(value / 1000).toFixed(0)}k</div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
