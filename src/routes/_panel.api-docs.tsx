import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Copy, Zap, Lock, Webhook } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_panel/api-docs")({
  component: ApiDocsPage,
});

const ENDPOINTS = [
  { m: "GET", path: "/api/v1/products", desc: "Listar todos los productos publicados en la tienda online" },
  { m: "GET", path: "/api/v1/products/:sku", desc: "Obtener un producto por SKU" },
  { m: "POST", path: "/api/v1/products", desc: "Crear un producto y publicarlo automáticamente" },
  { m: "PATCH", path: "/api/v1/products/:sku", desc: "Actualizar stock, precio o publicación" },
  { m: "DELETE", path: "/api/v1/products/:sku", desc: "Despublicar y eliminar del catálogo" },
  { m: "GET", path: "/api/v1/inventory/low-stock", desc: "Productos por debajo del mínimo" },
  { m: "POST", path: "/api/v1/webhooks/order", desc: "Recibir órdenes desde tu tienda online" },
];

const METHOD_COLORS: Record<string, string> = {
  GET: "bg-success/15 text-success border-success/30",
  POST: "bg-primary/15 text-primary border-primary/30",
  PATCH: "bg-warning/15 text-warning-foreground border-warning/30",
  DELETE: "bg-destructive/15 text-destructive border-destructive/30",
};

const CURL = `curl -X POST https://api.nimbus-stock.com/v1/products \\
  -H "Authorization: Bearer sk_live_••••••••••••" \\
  -H "Content-Type: application/json" \\
  -d '{
    "sku": "LAC-001",
    "name": "Leche Entera 1L",
    "price": 890,
    "stock": 124,
    "category": "lacteos",
    "publishedOnline": true
  }'`;

function ApiDocsPage() {
  const copy = (t: string) => {
    navigator.clipboard.writeText(t);
    toast.success("Copiado al portapapeles");
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-3">
          <Zap className="h-3 w-3" /> REST API · v1
        </div>
        <h1 className="font-display text-3xl font-bold">API de sincronización</h1>
        <p className="text-muted-foreground mt-2 max-w-2xl">
          Conectá tu tienda online, ERP o app móvil. Cada cambio en el inventario se propaga en tiempo real.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {[
          { icon: Zap, t: "Tiempo real", d: "Latencia < 100ms" },
          { icon: Lock, t: "Autenticación", d: "API keys + OAuth 2.0" },
          { icon: Webhook, t: "Webhooks", d: "Eventos de stock y órdenes" },
        ].map((f) => (
          <Card key={f.t} className="p-5 shadow-elegant bg-gradient-card">
            <f.icon className="h-6 w-6 text-primary mb-3" />
            <div className="font-semibold">{f.t}</div>
            <div className="text-sm text-muted-foreground">{f.d}</div>
          </Card>
        ))}
      </div>

      <Card className="shadow-elegant overflow-hidden">
        <div className="p-5 border-b bg-secondary/40">
          <h3 className="font-display font-semibold">Endpoints disponibles</h3>
          <p className="text-sm text-muted-foreground">Base URL: <code className="text-primary">https://api.nimbus-stock.com</code></p>
        </div>
        <div className="divide-y">
          {ENDPOINTS.map((e) => (
            <div key={e.path + e.m} className="p-4 flex items-center gap-4 hover:bg-secondary/30 transition">
              <Badge variant="outline" className={`font-mono text-[10px] w-16 justify-center ${METHOD_COLORS[e.m]}`}>
                {e.m}
              </Badge>
              <code className="font-mono text-sm flex-1 truncate">{e.path}</code>
              <span className="hidden md:block text-sm text-muted-foreground">{e.desc}</span>
            </div>
          ))}
        </div>
      </Card>

      <Card className="shadow-elegant overflow-hidden">
        <div className="p-5 border-b flex items-center justify-between bg-secondary/40">
          <div>
            <h3 className="font-display font-semibold">Ejemplo — crear un producto</h3>
            <p className="text-sm text-muted-foreground">Publica automáticamente en tu tienda online</p>
          </div>
          <Button size="sm" variant="outline" onClick={() => copy(CURL)} className="gap-2">
            <Copy className="h-3.5 w-3.5" /> Copiar
          </Button>
        </div>
        <pre className="p-5 text-sm overflow-x-auto bg-sidebar text-sidebar-foreground font-mono leading-relaxed">
{CURL}
        </pre>
      </Card>

      <Card className="p-6 shadow-elegant bg-gradient-hero text-white">
        <h3 className="font-display text-xl font-bold">¿Listo para conectar?</h3>
        <p className="mt-2 text-white/80 max-w-lg">
          Generá tu API key desde la sección de integraciones y empezá a sincronizar tu catálogo con Shopify, WooCommerce, VTEX o tu propio e-commerce.
        </p>
        <Button variant="secondary" className="mt-4">Generar API key</Button>
      </Card>
    </div>
  );
}
