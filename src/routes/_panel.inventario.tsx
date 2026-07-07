import { createFileRoute } from "@tanstack/react-router";
import { useApp } from "@/lib/store";
import { CATEGORIES } from "@/lib/mock-data";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, TrendingDown, PackageX } from "lucide-react";

export const Route = createFileRoute("/_panel/inventario")({
  component: InventarioPage,
});

function InventarioPage() {
  const { products } = useApp();
  const critical = products.filter((p) => p.stock === 0);
  const low = products.filter((p) => p.stock > 0 && p.stock <= p.minStock);
  const healthy = products.filter((p) => p.stock > p.minStock);

  const Section = ({ title, items, icon: Icon, tone }: any) => (
    <Card className="p-6 shadow-elegant">
      <div className="flex items-center gap-3 mb-5">
        <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${tone}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <h3 className="font-display font-semibold text-lg">{title}</h3>
          <p className="text-xs text-muted-foreground">{items.length} productos</p>
        </div>
      </div>
      <div className="space-y-3">
        {items.slice(0, 8).map((p: any) => {
          const cat = CATEGORIES.find((c) => c.id === p.category);
          const pct = Math.min(100, (p.stock / Math.max(p.minStock * 2, 1)) * 100);
          return (
            <div key={p.id} className="flex items-center gap-3 rounded-lg p-2 hover:bg-secondary/50">
              <img src={p.image} className="h-11 w-11 rounded-lg object-cover border" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <div className="font-medium text-sm truncate">{p.name}</div>
                  <div className="text-xs font-semibold shrink-0">{p.stock} / {p.minStock}</div>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] text-muted-foreground truncate">{cat?.name}</span>
                  <Progress value={pct} className="h-1.5 flex-1" />
                </div>
              </div>
            </div>
          );
        })}
        {items.length === 0 && <div className="text-sm text-muted-foreground text-center py-8">Nada por acá 🎉</div>}
      </div>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold">Inventario</h1>
        <p className="text-muted-foreground mt-1">Estado de stock por producto y alertas activas</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-5 bg-gradient-card border-destructive/20 shadow-elegant">
          <div className="flex items-center gap-3">
            <PackageX className="h-8 w-8 text-destructive" />
            <div>
              <div className="text-sm text-muted-foreground">Agotados</div>
              <div className="font-display text-3xl font-bold">{critical.length}</div>
            </div>
          </div>
        </Card>
        <Card className="p-5 bg-gradient-card border-warning/20 shadow-elegant">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-8 w-8 text-warning-foreground" />
            <div>
              <div className="text-sm text-muted-foreground">Stock bajo</div>
              <div className="font-display text-3xl font-bold">{low.length}</div>
            </div>
          </div>
        </Card>
        <Card className="p-5 bg-gradient-card border-success/20 shadow-elegant">
          <div className="flex items-center gap-3">
            <TrendingDown className="h-8 w-8 text-success rotate-180" />
            <div>
              <div className="text-sm text-muted-foreground">Saludables</div>
              <div className="font-display text-3xl font-bold">{healthy.length}</div>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Section title="Agotados" items={critical} icon={PackageX} tone="bg-destructive/15 text-destructive" />
        <Section title="Stock bajo" items={low} icon={AlertTriangle} tone="bg-warning/15 text-warning-foreground" />
        <Section title="Con stock" items={healthy} icon={TrendingDown} tone="bg-success/15 text-success" />
      </div>
    </div>
  );
}
