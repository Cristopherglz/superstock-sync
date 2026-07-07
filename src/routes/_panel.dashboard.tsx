import { createFileRoute } from "@tanstack/react-router";
import { useApp } from "@/lib/store";
import { CATEGORIES, SALES_LAST_7_DAYS } from "@/lib/mock-data";
import { Card } from "@/components/ui/card";
import {
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  Package,
  AlertTriangle,
  ShoppingCart,
  TrendingUp,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export const Route = createFileRoute("/_panel/dashboard")({
  component: Dashboard,
});

function fmt(n: number) {
  return "$" + n.toLocaleString("es-AR");
}

function Dashboard() {
  const { products, user } = useApp();

  const totalValue = products.reduce((s, p) => s + p.stock * p.cost, 0);
  const totalUnits = products.reduce((s, p) => s + p.stock, 0);
  const lowStock = products.filter((p) => p.stock <= p.minStock && p.stock > 0).length;
  const outOfStock = products.filter((p) => p.stock === 0).length;

  const byCategory = CATEGORIES.map((c) => ({
    name: c.name,
    stock: products.filter((p) => p.category === c.id).reduce((s, p) => s + p.stock, 0),
    color: c.color,
  }));

  const kpis = [
    { label: "Ventas semana", value: fmt(2545000), delta: "+12.4%", up: true, icon: DollarSign, tint: "from-primary to-primary-glow" },
    { label: "Unidades en stock", value: totalUnits.toLocaleString("es-AR"), delta: "+3.2%", up: true, icon: Package, tint: "from-sky-500 to-cyan-400" },
    { label: "Órdenes activas", value: "128", delta: "+8", up: true, icon: ShoppingCart, tint: "from-blue-600 to-indigo-500" },
    { label: "Valor inventario", value: fmt(totalValue), delta: "-1.8%", up: false, icon: TrendingUp, tint: "from-indigo-500 to-blue-500" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold">Buen día, {user?.name.split(" ")[0]} 👋</h1>
          <p className="text-muted-foreground mt-1">
            Un vistazo a la operación de tu supermercado en tiempo real.
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
          Sincronizado hace 12s con la tienda online
        </div>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {kpis.map((k) => {
          const Icon = k.icon;
          return (
            <Card key={k.label} className="p-5 relative overflow-hidden bg-gradient-card border shadow-elegant">
              <div className={`absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br ${k.tint} opacity-10 blur-2xl`} />
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-sm text-muted-foreground">{k.label}</div>
                  <div className="mt-2 font-display text-2xl font-bold">{k.value}</div>
                  <div className={`mt-2 inline-flex items-center gap-1 text-xs font-medium ${k.up ? "text-success" : "text-destructive"}`}>
                    {k.up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                    {k.delta} vs semana anterior
                  </div>
                </div>
                <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${k.tint} flex items-center justify-center text-white shadow-elegant`}>
                  <Icon className="h-5 w-5" />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="p-6 lg:col-span-2 bg-card shadow-elegant">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-display font-semibold text-lg">Ventas — últimos 7 días</h3>
              <p className="text-sm text-muted-foreground">Ingresos y órdenes por día</p>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer>
              <AreaChart data={SALES_LAST_7_DAYS}>
                <defs>
                  <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.55 0.18 255)" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="oklch(0.55 0.18 255)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0.015 245)" vertical={false} />
                <XAxis dataKey="day" stroke="oklch(0.5 0.03 250)" fontSize={12} />
                <YAxis stroke="oklch(0.5 0.03 250)" fontSize={12} tickFormatter={(v) => "$" + (v / 1000) + "k"} />
                <Tooltip
                  contentStyle={{
                    background: "white",
                    border: "1px solid oklch(0.92 0.015 245)",
                    borderRadius: 12,
                    boxShadow: "0 10px 30px -10px rgba(30,64,175,0.2)",
                  }}
                  formatter={(v: number) => fmt(v)}
                />
                <Area type="monotone" dataKey="sales" stroke="oklch(0.52 0.18 255)" strokeWidth={2.5} fill="url(#salesGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6 bg-card shadow-elegant">
          <div className="mb-6">
            <h3 className="font-display font-semibold text-lg">Stock por categoría</h3>
            <p className="text-sm text-muted-foreground">Unidades totales</p>
          </div>
          <div className="h-72">
            <ResponsiveContainer>
              <BarChart data={byCategory} layout="vertical" margin={{ left: 20 }}>
                <XAxis type="number" stroke="oklch(0.5 0.03 250)" fontSize={11} />
                <YAxis type="category" dataKey="name" stroke="oklch(0.5 0.03 250)" fontSize={11} width={100} />
                <Tooltip cursor={{ fill: "oklch(0.96 0.02 245)" }} contentStyle={{ borderRadius: 12, border: "1px solid oklch(0.92 0.015 245)" }} />
                <Bar dataKey="stock" radius={[0, 8, 8, 0]} fill="oklch(0.55 0.18 255)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Alerts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="p-6 shadow-elegant border-warning/30 bg-warning/5">
          <div className="flex items-start gap-4">
            <div className="h-10 w-10 rounded-xl bg-warning/20 flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-warning-foreground" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold">Stock bajo</h4>
              <p className="text-sm text-muted-foreground mt-1">
                {lowStock} productos por debajo del mínimo. Reponé antes del fin de semana.
              </p>
            </div>
            <div className="font-display text-3xl font-bold text-warning-foreground">{lowStock}</div>
          </div>
        </Card>
        <Card className="p-6 shadow-elegant border-destructive/30 bg-destructive/5">
          <div className="flex items-start gap-4">
            <div className="h-10 w-10 rounded-xl bg-destructive/20 flex items-center justify-center">
              <Package className="h-5 w-5 text-destructive" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold">Agotados</h4>
              <p className="text-sm text-muted-foreground mt-1">
                {outOfStock} productos sin stock y despublicados de la tienda online.
              </p>
            </div>
            <div className="font-display text-3xl font-bold text-destructive">{outOfStock}</div>
          </div>
        </Card>
      </div>
    </div>
  );
}
