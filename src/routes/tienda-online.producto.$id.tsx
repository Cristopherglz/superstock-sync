import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useApp } from "@/lib/store";
import { useTiendaUI } from "@/lib/tienda-ui";
import { CATEGORIES } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  ShoppingCart,
  Trash2,
  Truck,
  ShieldCheck,
  Barcode,
  Package,
  Minus,
  Plus,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/tienda-online/producto/$id")({
  component: ProductPage,
});

function ProductPage() {
  const { id } = Route.useParams();
  const { products, cart, addToCart, removeFromCart, setCartQty } = useApp();
  const { flyToCart } = useTiendaUI();
  const navigate = useNavigate();

  const product = products.find((p) => p.id === id);

  if (!product) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-20 text-center">
        <Package className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
        <h1 className="font-display text-2xl font-bold">Producto no encontrado</h1>
        <p className="text-muted-foreground mt-2">Puede que ya no esté disponible.</p>
        <Button asChild className="mt-6 bg-gradient-brand">
          <Link to="/tienda-online">Volver a la tienda</Link>
        </Button>
      </div>
    );
  }

  const qty = cart[product.id] ?? 0;
  const inCart = qty > 0;
  const cat = CATEGORIES.find((c) => c.id === product.category);
  const low = product.stock <= product.minStock;
  const margin = product.price - product.cost;

  const handleAdd = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    flyToCart({ image: product.image, from: { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 } });
    addToCart(product.id);
    toast.success(`${product.name} agregado`);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 py-6 lg:py-10">
      <button
        onClick={() => navigate({ to: "/tienda-online" })}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition mb-4"
      >
        <ArrowLeft className="h-4 w-4" /> Volver a los pasillos
      </button>

      <div className="grid lg:grid-cols-2 gap-6 lg:gap-10">
        <Card className="overflow-hidden shadow-elegant">
          <div className="aspect-square bg-secondary relative">
            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
            {low && (
              <Badge className="absolute top-3 right-3 bg-warning text-warning-foreground border-0">
                Últimas {product.stock} unidades
              </Badge>
            )}
          </div>
        </Card>

        <div className="flex flex-col">
          <div className="inline-flex items-center gap-2 text-xs">
            <span className="h-2 w-2 rounded-full" style={{ background: cat?.color }} />
            <span className="uppercase tracking-wider text-muted-foreground">{cat?.name}</span>
          </div>
          <h1 className="font-display text-3xl lg:text-4xl font-bold mt-2 leading-tight">{product.name}</h1>
          <div className="text-sm text-muted-foreground mt-1">Distribuido por {product.supplier}</div>

          <div className="mt-6 flex items-baseline gap-3">
            <div className="font-display text-4xl font-bold text-gradient-brand">
              ${product.price.toLocaleString("es-AR")}
            </div>
            {margin > 0 && (
              <div className="text-xs text-muted-foreground">
                Precio final con IVA incluido
              </div>
            )}
          </div>

          <div className="mt-6 flex flex-wrap gap-2 text-xs">
            <div className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1">
              <Barcode className="h-3.5 w-3.5" /> {product.barcode || "s/código"}
            </div>
            <div className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1">
              <Package className="h-3.5 w-3.5" /> SKU {product.sku}
            </div>
            <div className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-success bg-success/10 border-success/30">
              <ShieldCheck className="h-3.5 w-3.5" /> Producto verificado
            </div>
          </div>

          <div className="mt-6 rounded-xl bg-secondary/60 p-4 text-sm text-muted-foreground leading-relaxed">
            {product.name} de la línea {product.supplier}, disponible en tu supermercado Nimbus Market.
            Retirá por caja online y recibilo en tu domicilio. Stock actual: {product.stock} unidades en depósito.
          </div>

          <div className="mt-8 flex items-center gap-3">
            {inCart ? (
              <>
                <div className="inline-flex items-center rounded-full border bg-card shadow-sm overflow-hidden">
                  <button
                    onClick={() => setCartQty(product.id, qty - 1)}
                    className="h-11 w-11 flex items-center justify-center hover:bg-secondary transition"
                    aria-label="Quitar una unidad"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <div className="w-10 text-center font-semibold">{qty}</div>
                  <button
                    onClick={() => setCartQty(product.id, qty + 1)}
                    className="h-11 w-11 flex items-center justify-center hover:bg-secondary transition"
                    aria-label="Agregar una unidad"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                <Button
                  variant="outline"
                  className="border-destructive/40 text-destructive hover:bg-destructive/10 h-11"
                  onClick={() => {
                    removeFromCart(product.id);
                    toast.success("Quitado del carrito");
                  }}
                >
                  <Trash2 className="h-4 w-4 mr-2" /> Quitar del carrito
                </Button>
              </>
            ) : (
              <Button
                onClick={handleAdd}
                className="h-12 px-6 bg-gradient-brand hover:opacity-90 shadow-elegant text-base gap-2"
              >
                <ShoppingCart className="h-4 w-4" /> Agregar al carrito
              </Button>
            )}
          </div>

          <div className="mt-6 flex items-start gap-2 text-xs text-muted-foreground">
            <Truck className="h-4 w-4 shrink-0 mt-0.5 text-primary" />
            <div>
              Envío a domicilio el mismo día para pedidos antes de las 18:00 hs.
              Cargá tu dirección al finalizar la compra en la <Link to="/tienda-online/caja" className="text-primary underline">Caja</Link>.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
