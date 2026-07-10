import { createFileRoute, Link } from "@tanstack/react-router";
import { useApp } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Store, ExternalLink, ShoppingBag, Boxes, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/_panel/tienda")({
  component: TiendaPanel,
});

function TiendaPanel() {
  const { products } = useApp();
  const published = products.filter((p) => p.publishedOnline).length;
  const inStock = products.filter((p) => p.publishedOnline && p.stock > 0).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold">Tienda Online</h1>
        <p className="text-muted-foreground mt-1">
          Tu supermercado publicado como una web independiente, sincronizada con este panel.
        </p>
      </div>

      <Card className="p-6 shadow-elegant bg-gradient-hero text-white overflow-hidden relative">
        <div className="absolute -right-8 -bottom-8 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
        <div className="relative flex flex-col lg:flex-row lg:items-center gap-6">
          <div className="flex-1">
            <Badge className="bg-white/15 text-white border-white/20">Independiente · sin registro</Badge>
            <h2 className="mt-3 font-display text-2xl lg:text-3xl font-bold">Nimbus Market</h2>
            <p className="text-white/80 mt-2 max-w-xl">
              Los clientes navegan los pasillos, arman su carrito y pagan al recibir.
              Cada cambio en este panel se refleja en tiempo real en la tienda.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Button asChild className="bg-white text-primary hover:bg-white/90 gap-2">
                <Link to="/tienda-online" target="_blank">
                  <ExternalLink className="h-4 w-4" /> Abrir tienda online
                </Link>
              </Button>
              <Button asChild variant="outline" className="border-white/40 text-white hover:bg-white/10">
                <Link to="/tienda-online/caja">Ver caja de ejemplo</Link>
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 min-w-[240px]">
            <Stat icon={Boxes} label="Publicados" value={published} />
            <Stat icon={ShoppingBag} label="En stock" value={inStock} />
            <Stat icon={ShieldCheck} label="Estado" value="Live" />
          </div>
        </div>
      </Card>

      <div className="grid md:grid-cols-3 gap-4">
        <FeatureCard
          icon={Store}
          title="Pasillos digitales"
          text="Los clientes reconocen las secciones del súper y navegan más rápido."
        />
        <FeatureCard
          icon={ShoppingBag}
          title="Carrito flotante"
          text="Un botón arrastrable que sigue al cliente por toda la tienda."
        />
        <FeatureCard
          icon={ShieldCheck}
          title="Compra sin cuenta"
          text="Solo piden nombre, teléfono y dirección. Facturación opcional con CUIT."
        />
      </div>
    </div>
  );
}

function Stat({ icon: Icon, label, value }: { icon: typeof Store; label: string; value: number | string }) {
  return (
    <div className="rounded-xl bg-white/10 border border-white/15 p-3 text-center">
      <Icon className="h-4 w-4 mx-auto opacity-80" />
      <div className="font-display text-xl font-bold mt-1">{value}</div>
      <div className="text-[10px] uppercase tracking-wider opacity-70">{label}</div>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, text }: { icon: typeof Store; title: string; text: string }) {
  return (
    <Card className="p-5 shadow-elegant">
      <div className="h-9 w-9 rounded-lg bg-gradient-brand flex items-center justify-center shadow-elegant">
        <Icon className="h-4 w-4 text-white" />
      </div>
      <div className="mt-3 font-display font-semibold">{title}</div>
      <p className="text-sm text-muted-foreground mt-1">{text}</p>
    </Card>
  );
}
