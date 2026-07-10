import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useApp, type CustomerInfo } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { ShoppingBag, Trash2, Minus, Plus, ArrowLeft, Truck, CheckCircle2, Receipt } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/tienda-online/caja")({
  head: () => ({ meta: [{ title: "Caja — Nimbus Market" }, { name: "robots", content: "noindex" }] }),
  component: CajaPage,
});

function CajaPage() {
  const { products, cart, setCartQty, removeFromCart, clearCart, customer, setCustomer } = useApp();
  const navigate = useNavigate();
  const [placed, setPlaced] = useState<{ id: string; total: number; items: number } | null>(null);
  const [form, setForm] = useState<CustomerInfo>(customer);

  const lines = Object.entries(cart)
    .map(([id, qty]) => {
      const p = products.find((x) => x.id === id);
      return p ? { p, qty } : null;
    })
    .filter((x): x is { p: (typeof products)[number]; qty: number } => !!x);

  const subtotal = lines.reduce((s, l) => s + l.p.price * l.qty, 0);
  const shipping = subtotal > 15000 || subtotal === 0 ? 0 : 1500;
  const total = subtotal + shipping;
  const itemsCount = lines.reduce((s, l) => s + l.qty, 0);

  const set = <K extends keyof CustomerInfo>(k: K, v: CustomerInfo[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const submit = () => {
    if (!form.fullName || !form.phone || !form.address || !form.city) {
      toast.error("Completá nombre, teléfono, dirección y localidad");
      return;
    }
    if (form.wantsInvoice && !form.cuit) {
      toast.error("Ingresá tu CUIT para la factura");
      return;
    }
    if (lines.length === 0) return;
    setCustomer(form);
    const orderId = "N" + Math.floor(100000 + Math.random() * 900000);
    setPlaced({ id: orderId, total, items: itemsCount });
    clearCart();
    toast.success("¡Pedido confirmado!");
  };

  if (placed) {
    return (
      <div className="max-w-xl mx-auto px-6 py-16 text-center">
        <div className="mx-auto h-16 w-16 rounded-full bg-success/15 text-success flex items-center justify-center">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <h1 className="mt-6 font-display text-3xl font-bold">Pedido confirmado</h1>
        <p className="mt-2 text-muted-foreground">
          Nº <span className="font-mono font-semibold text-foreground">{placed.id}</span> · {placed.items} productos
          · total <span className="font-semibold text-foreground">${placed.total.toLocaleString("es-AR")}</span>
        </p>
        <p className="mt-3 text-sm text-muted-foreground max-w-md mx-auto">
          Te contactamos por WhatsApp al {form.phone} para confirmar el horario de entrega en {form.address}, {form.city}.
        </p>
        <div className="mt-8 flex flex-wrap gap-3 justify-center">
          <Button asChild className="bg-gradient-brand hover:opacity-90">
            <Link to="/tienda-online">Seguir comprando</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 py-6 lg:py-10">
      <button
        onClick={() => navigate({ to: "/tienda-online" })}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition mb-4"
      >
        <ArrowLeft className="h-4 w-4" /> Seguir comprando
      </button>

      <h1 className="font-display text-3xl lg:text-4xl font-bold">Caja</h1>
      <p className="text-muted-foreground mt-1">
        Revisá tu carrito, ajustá cantidades y completá tus datos para recibir el pedido.
      </p>

      {lines.length === 0 ? (
        <Card className="mt-8 p-10 text-center">
          <ShoppingBag className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
          <div className="font-display text-xl font-semibold">Tu carrito está vacío</div>
          <p className="text-sm text-muted-foreground mt-1">Volvé a los pasillos y armá tu compra.</p>
          <Button asChild className="mt-6 bg-gradient-brand hover:opacity-90">
            <Link to="/tienda-online">Explorar pasillos</Link>
          </Button>
        </Card>
      ) : (
        <div className="mt-6 grid lg:grid-cols-[1fr_380px] gap-6">
          <div className="space-y-6">
            {/* Cart lines */}
            <Card className="p-4 sm:p-6 shadow-elegant">
              <div className="font-display font-semibold mb-4">Tu carrito ({itemsCount})</div>
              <div className="divide-y">
                {lines.map(({ p, qty }) => (
                  <div key={p.id} className="py-4 flex items-center gap-3 sm:gap-4">
                    <img src={p.image} alt={p.name} className="h-16 w-16 rounded-xl object-cover border shrink-0" />
                    <div className="flex-1 min-w-0">
                      <Link
                        to="/tienda-online/producto/$id"
                        params={{ id: p.id }}
                        className="font-medium line-clamp-2 hover:text-primary transition"
                      >
                        {p.name}
                      </Link>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        ${p.price.toLocaleString("es-AR")} c/u
                      </div>
                    </div>
                    <div className="inline-flex items-center rounded-full border bg-card overflow-hidden shrink-0">
                      <button
                        onClick={() => setCartQty(p.id, qty - 1)}
                        className="h-9 w-9 flex items-center justify-center hover:bg-secondary transition"
                        aria-label="Menos"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <div className="w-8 text-center text-sm font-semibold">{qty}</div>
                      <button
                        onClick={() => setCartQty(p.id, qty + 1)}
                        className="h-9 w-9 flex items-center justify-center hover:bg-secondary transition"
                        aria-label="Más"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <div className="w-20 text-right font-semibold hidden sm:block">
                      ${(p.price * qty).toLocaleString("es-AR")}
                    </div>
                    <button
                      onClick={() => { removeFromCart(p.id); toast.success("Quitado del carrito"); }}
                      className="h-9 w-9 flex items-center justify-center rounded-lg hover:bg-destructive/10 text-destructive transition shrink-0"
                      aria-label="Quitar"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </Card>

            {/* Customer form */}
            <Card className="p-4 sm:p-6 shadow-elegant">
              <div className="flex items-center gap-2 mb-4">
                <Truck className="h-4 w-4 text-primary" />
                <div className="font-display font-semibold">Datos de envío</div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                  <Label>Nombre completo *</Label>
                  <Input value={form.fullName} onChange={(e) => set("fullName", e.target.value)} placeholder="Juan Pérez" />
                </div>
                <div className="space-y-2">
                  <Label>Teléfono / WhatsApp *</Label>
                  <Input value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+54 9 11 ..." inputMode="tel" />
                </div>
                <div className="space-y-2">
                  <Label>Localidad *</Label>
                  <Input value={form.city} onChange={(e) => set("city", e.target.value)} placeholder="CABA" />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label>Dirección (calle, número, piso, depto) *</Label>
                  <Input value={form.address} onChange={(e) => set("address", e.target.value)} placeholder="Av. Corrientes 1234, 5°B" />
                </div>
                <div className="space-y-2">
                  <Label>Código postal</Label>
                  <Input value={form.zip} onChange={(e) => set("zip", e.target.value)} placeholder="C1043" />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label>Notas para el repartidor</Label>
                  <Textarea
                    value={form.notes}
                    onChange={(e) => set("notes", e.target.value)}
                    placeholder="Timbre roto, tocar el 2°B..."
                    rows={2}
                  />
                </div>
              </div>

              <div className="mt-5 rounded-xl border p-4 bg-secondary/40">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Receipt className="h-4 w-4 text-primary" />
                    <div>
                      <div className="text-sm font-medium">Quiero factura A</div>
                      <div className="text-xs text-muted-foreground">Emitimos la factura a tu CUIT</div>
                    </div>
                  </div>
                  <Switch checked={form.wantsInvoice} onCheckedChange={(v) => set("wantsInvoice", v)} />
                </div>
                {form.wantsInvoice && (
                  <div className="mt-3 space-y-2">
                    <Label>CUIT</Label>
                    <Input value={form.cuit} onChange={(e) => set("cuit", e.target.value)} placeholder="30-12345678-9" inputMode="numeric" />
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Summary */}
          <div className="lg:sticky lg:top-20 self-start">
            <Card className="p-6 shadow-elevated">
              <div className="font-display font-semibold text-lg mb-4">Resumen</div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>${subtotal.toLocaleString("es-AR")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Envío</span>
                  <span className={shipping === 0 ? "text-success font-medium" : ""}>
                    {shipping === 0 ? "Gratis" : `$${shipping.toLocaleString("es-AR")}`}
                  </span>
                </div>
                {shipping > 0 && (
                  <div className="text-xs text-muted-foreground pt-1">
                    Sumá ${(15000 - subtotal).toLocaleString("es-AR")} más y el envío es gratis.
                  </div>
                )}
                <div className="border-t pt-3 mt-3 flex justify-between items-baseline">
                  <span className="font-display font-semibold">Total</span>
                  <span className="font-display font-bold text-2xl">${total.toLocaleString("es-AR")}</span>
                </div>
              </div>
              <Button
                onClick={submit}
                className="w-full mt-5 h-12 bg-gradient-brand hover:opacity-90 shadow-elegant text-base"
              >
                Confirmar pedido
              </Button>
              <p className="text-[11px] text-muted-foreground mt-3 text-center">
                Sin registro. Pagás al recibir en tu domicilio.
              </p>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
