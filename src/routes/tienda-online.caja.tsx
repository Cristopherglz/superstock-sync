import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { useApp, effectivePrice, type CustomerInfo, type Order } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ShoppingBag,
  Trash2,
  Minus,
  Plus,
  ArrowLeft,
  Truck,
  CheckCircle2,
  Receipt,
  Calendar,
  Clock,
  CreditCard,
  MessageCircle,
  Printer,
  Download,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/tienda-online/caja")({
  head: () => ({ meta: [{ title: "Caja — Nimbus Market" }, { name: "robots", content: "noindex" }] }),
  component: CajaPage,
});

const WHATSAPP_NUMBER = "+54 9 11 5678-9010";
const WHATSAPP_LINK = "https://wa.me/5491156789010";

// Delivery slots: Mon-Sat, 9-20hs
function buildDeliveryOptions() {
  const days: { value: string; label: string }[] = [];
  const now = new Date();
  for (let i = 1; i <= 10 && days.length < 6; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() + i);
    const dow = d.getDay(); // 0=sun..6=sat
    if (dow === 0) continue; // skip Sunday
    const iso = d.toISOString().slice(0, 10);
    const label = d.toLocaleDateString("es-AR", { weekday: "long", day: "2-digit", month: "short" });
    days.push({ value: iso, label: label.charAt(0).toUpperCase() + label.slice(1) });
  }
  const times: string[] = [];
  for (let h = 9; h <= 20; h++) times.push(`${String(h).padStart(2, "0")}:00`);
  return { days, times };
}

function CajaPage() {
  const { products, cart, setCartQty, removeFromCart, clearCart, customer, setCustomer, addOrder } = useApp();
  const navigate = useNavigate();
  const [placed, setPlaced] = useState<Order | null>(null);
  const [form, setForm] = useState<CustomerInfo>(customer);
  const { days, times } = buildDeliveryOptions();
  const [slotDate, setSlotDate] = useState(days[0]?.value ?? "");
  const [slotTime, setSlotTime] = useState("10:00");
  const [mpOpen, setMpOpen] = useState(false);
  const [mpProcessing, setMpProcessing] = useState(false);

  const lines = Object.entries(cart)
    .map(([id, qty]) => {
      const p = products.find((x) => x.id === id);
      return p ? { p, qty } : null;
    })
    .filter((x): x is { p: (typeof products)[number]; qty: number } => !!x);

  const subtotal = lines.reduce((s, l) => s + effectivePrice(l.p) * l.qty, 0);
  const shipping = subtotal > 15000 || subtotal === 0 ? 0 : 1500;
  const total = subtotal + shipping;
  const itemsCount = lines.reduce((s, l) => s + l.qty, 0);

  const set = <K extends keyof CustomerInfo>(k: K, v: CustomerInfo[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const validate = () => {
    if (!form.fullName || !form.phone || !form.address || !form.city) {
      toast.error("Completá nombre, teléfono, dirección y localidad");
      return false;
    }
    if (form.wantsInvoice && !form.cuit) { toast.error("Ingresá tu CUIT para la factura"); return false; }
    if (!slotDate || !slotTime) { toast.error("Elegí día y horario de entrega"); return false; }
    if (lines.length === 0) return false;
    return true;
  };

  const createOrder = (paymentMethod: Order["paymentMethod"], paymentStatus: Order["paymentStatus"]) => {
    setCustomer(form);
    const order = addOrder({
      customer: form,
      lines: lines.map(({ p, qty }) => ({ productId: p.id, name: p.name, qty, price: effectivePrice(p), image: p.image })),
      subtotal,
      shipping,
      total,
      paymentMethod,
      paymentStatus,
      deliveryStatus: "pending",
      deliverySlotDate: slotDate,
      deliverySlotTime: slotTime,
    });
    setPlaced(order);
    clearCart();
    return order;
  };

  const payCash = () => {
    if (!validate()) return;
    createOrder("cash", "pending");
    toast.success("Pedido confirmado — pagás al recibir");
  };

  const payMP = () => {
    if (!validate()) return;
    setMpOpen(true);
  };

  const confirmMP = async () => {
    setMpProcessing(true);
    // Simulate MP checkout
    await new Promise((r) => setTimeout(r, 1600));
    setMpProcessing(false);
    setMpOpen(false);
    const order = createOrder("mercadopago", "paid");
    toast.success("Pago acreditado con Mercado Pago");
    void order;
  };

  if (placed) return <SuccessScreen order={placed} onNew={() => setPlaced(null)} />;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 py-6 lg:py-10">
      <button
        onClick={() => navigate({ to: "/tienda-online" })}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition mb-4"
      >
        <ArrowLeft className="h-4 w-4" /> Seguir comprando
      </button>

      <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold">Caja</h1>
      <p className="text-muted-foreground mt-1 text-sm">
        Revisá tu carrito, elegí el horario de entrega y pagá.
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
            <Card className="p-4 sm:p-6 shadow-elegant">
              <div className="font-display font-semibold mb-4">Tu carrito ({itemsCount})</div>
              <div className="divide-y">
                {lines.map(({ p, qty }) => {
                  const eff = effectivePrice(p);
                  return (
                    <div key={p.id} className="py-4 grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3">
                      <img src={p.image} alt="" className="h-14 w-14 sm:h-16 sm:w-16 rounded-xl object-cover border shrink-0" />
                      <div className="min-w-0">
                        <Link to="/tienda-online/producto/$id" params={{ id: p.id }} className="font-medium text-sm sm:text-base line-clamp-2 hover:text-primary transition">
                          {p.name}
                        </Link>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          ${eff.toLocaleString("es-AR")} c/u
                          {p.discountPct > 0 && <span className="ml-1 line-through">${p.price.toLocaleString("es-AR")}</span>}
                        </div>
                        <div className="mt-2 flex items-center gap-2">
                          <div className="inline-flex items-center rounded-full border bg-card overflow-hidden">
                            <button onClick={() => setCartQty(p.id, qty - 1)} className="h-8 w-8 flex items-center justify-center hover:bg-secondary transition" aria-label="Menos"><Minus className="h-3 w-3" /></button>
                            <div className="w-7 text-center text-sm font-semibold">{qty}</div>
                            <button onClick={() => setCartQty(p.id, qty + 1)} className="h-8 w-8 flex items-center justify-center hover:bg-secondary transition" aria-label="Más"><Plus className="h-3 w-3" /></button>
                          </div>
                          <button onClick={() => { removeFromCart(p.id); toast.success("Quitado del carrito"); }} className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-destructive/10 text-destructive transition" aria-label="Quitar"><Trash2 className="h-4 w-4" /></button>
                        </div>
                      </div>
                      <div className="text-right font-semibold shrink-0">
                        ${(eff * qty).toLocaleString("es-AR")}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

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
                  <Label>Dirección *</Label>
                  <Input value={form.address} onChange={(e) => set("address", e.target.value)} placeholder="Av. Corrientes 1234, 5°B" />
                </div>
                <div className="space-y-2">
                  <Label>Código postal</Label>
                  <Input value={form.zip} onChange={(e) => set("zip", e.target.value)} placeholder="C1043" />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label>Notas para el repartidor</Label>
                  <Textarea value={form.notes} onChange={(e) => set("notes", e.target.value)} placeholder="Timbre roto, tocar el 2°B..." rows={2} />
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

            <Card className="p-4 sm:p-6 shadow-elegant">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="h-4 w-4 text-primary" />
                <div className="font-display font-semibold">Fecha y horario de entrega</div>
              </div>
              <p className="text-xs text-muted-foreground mb-4">
                Entregamos de lunes a sábados, entre las 9:00 y las 20:00 hs.
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <Label className="text-xs">Día</Label>
                  <Select value={slotDate} onValueChange={setSlotDate}>
                    <SelectTrigger className="mt-1.5"><SelectValue placeholder="Elegí un día" /></SelectTrigger>
                    <SelectContent>
                      {days.map((d) => <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Franja horaria</Label>
                  <Select value={slotTime} onValueChange={setSlotTime}>
                    <SelectTrigger className="mt-1.5"><Clock className="h-3.5 w-3.5 mr-1 text-muted-foreground" /><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {times.map((t) => <SelectItem key={t} value={t}>{t} hs</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </Card>
          </div>

          <div className="lg:sticky lg:top-20 self-start">
            <Card className="p-5 sm:p-6 shadow-elevated">
              <div className="font-display font-semibold text-lg mb-4">Resumen</div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>${subtotal.toLocaleString("es-AR")}</span></div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Envío</span>
                  <span className={shipping === 0 ? "text-success font-medium" : ""}>{shipping === 0 ? "Gratis" : `$${shipping.toLocaleString("es-AR")}`}</span>
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
                onClick={payMP}
                className="w-full mt-5 h-12 text-base gap-2 shadow-elegant text-white"
                style={{ background: "linear-gradient(135deg, #00b1ea, #009ee3)" }}
              >
                <CreditCard className="h-4 w-4" /> Pagar con Mercado Pago
              </Button>
              <Button
                onClick={payCash}
                variant="outline"
                className="w-full mt-2 h-11 gap-2"
              >
                Pagar al recibir (efectivo)
              </Button>
              <p className="text-[11px] text-muted-foreground mt-3 text-center">
                Compra segura · sin registro
              </p>
            </Card>
          </div>
        </div>
      )}

      <MPDialog open={mpOpen} onClose={() => setMpOpen(false)} amount={total} onConfirm={confirmMP} processing={mpProcessing} />
    </div>
  );
}

function MPDialog({ open, onClose, amount, onConfirm, processing }: { open: boolean; onClose: () => void; amount: number; onConfirm: () => void; processing: boolean }) {
  return (
    <Dialog open={open} onOpenChange={(v) => !processing && !v && onClose()}>
      <DialogContent className="max-w-sm p-0 overflow-hidden">
        <DialogHeader className="p-0">
          <div className="p-6 text-white flex items-center gap-3" style={{ background: "linear-gradient(135deg, #00b1ea, #009ee3)" }}>
            <div className="h-12 w-12 rounded-xl bg-white/20 flex items-center justify-center font-black text-lg">MP</div>
            <div>
              <DialogTitle className="text-white font-display">Mercado Pago</DialogTitle>
              <div className="text-white/85 text-xs">Checkout seguro</div>
            </div>
          </div>
        </DialogHeader>
        <div className="p-6 space-y-4">
          <div className="text-center">
            <div className="text-xs text-muted-foreground uppercase tracking-wider">Total a pagar</div>
            <div className="font-display font-black text-3xl mt-1">${amount.toLocaleString("es-AR")}</div>
          </div>
          <div className="rounded-lg border p-3 space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Método</span><span className="font-medium">Tarjeta / Dinero en cuenta</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Comercio</span><span className="font-medium">Nimbus Market</span></div>
          </div>
          <Button onClick={onConfirm} disabled={processing} className="w-full h-11 text-white" style={{ background: "linear-gradient(135deg, #00b1ea, #009ee3)" }}>
            {processing ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Procesando pago...</> : "Confirmar pago"}
          </Button>
          <p className="text-[10px] text-muted-foreground text-center">
            Demo · Simulación del flujo de Mercado Pago. En producción se redirige al checkout real.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function SuccessScreen({ order, onNew }: { order: Order; onNew: () => void }) {
  const printRef = useRef<HTMLDivElement>(null);

  const printReceipt = () => window.print();

  const downloadReceipt = () => {
    const html = printRef.current?.outerHTML ?? "";
    const doc = `<!doctype html><html><head><meta charset="utf-8"><title>Comprobante ${order.id}</title><style>body{font-family:system-ui,sans-serif;padding:24px;max-width:600px;margin:auto;color:#0f172a}h1{margin:0}table{width:100%;border-collapse:collapse;margin-top:16px}td,th{padding:8px;border-bottom:1px solid #e2e8f0;text-align:left;font-size:14px}.tot{font-weight:700;font-size:18px}</style></head><body>${html}</body></html>`;
    const blob = new Blob([doc], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `comprobante-${order.id}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
      <div className="text-center">
        <div className="mx-auto h-16 w-16 rounded-full bg-success/15 text-success flex items-center justify-center">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <h1 className="mt-6 font-display text-2xl sm:text-3xl font-bold">¡Pedido confirmado!</h1>
        <p className="mt-2 text-muted-foreground text-sm">
          Nº <span className="font-mono font-semibold text-foreground">{order.id}</span> · {order.lines.length} productos · <span className="font-semibold text-foreground">${order.total.toLocaleString("es-AR")}</span>
        </p>
        {order.paymentStatus === "paid" ? (
          <div className="inline-flex items-center gap-1.5 mt-3 text-sm text-success bg-success/10 border border-success/30 rounded-full px-3 py-1">
            <CheckCircle2 className="h-3.5 w-3.5" /> Pagado con Mercado Pago
          </div>
        ) : (
          <div className="inline-flex items-center gap-1.5 mt-3 text-sm text-warning-foreground bg-warning/15 border border-warning/40 rounded-full px-3 py-1">
            Pagás al recibir · {order.paymentMethod}
          </div>
        )}
      </div>

      <div ref={printRef} className="mt-6 rounded-2xl border p-5 sm:p-6 bg-card shadow-elegant">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="font-display font-bold text-lg">Nimbus Market</div>
            <div className="text-xs text-muted-foreground">Comprobante de compra</div>
          </div>
          <div className="text-right">
            <div className="font-mono text-sm">{order.id}</div>
            <div className="text-xs text-muted-foreground">{new Date(order.createdAt).toLocaleString("es-AR")}</div>
          </div>
        </div>
        <div className="mt-4 grid gap-1 text-sm">
          <div><span className="text-muted-foreground">Cliente:</span> {order.customer.fullName}</div>
          <div><span className="text-muted-foreground">Entrega:</span> {order.customer.address}, {order.customer.city}</div>
          <div><span className="text-muted-foreground">Día y hora:</span> {order.deliverySlotDate} · {order.deliverySlotTime} hs</div>
        </div>
        <table className="w-full mt-4 text-sm">
          <thead className="text-xs text-muted-foreground border-b">
            <tr><th className="text-left py-2">Producto</th><th className="text-center">Cant.</th><th className="text-right">Subtotal</th></tr>
          </thead>
          <tbody>
            {order.lines.map((l) => (
              <tr key={l.productId} className="border-b last:border-0">
                <td className="py-2">{l.name}</td>
                <td className="text-center">{l.qty}</td>
                <td className="text-right">${(l.qty * l.price).toLocaleString("es-AR")}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="mt-4 flex justify-between font-semibold text-lg">
          <span>Total</span><span>${order.total.toLocaleString("es-AR")}</span>
        </div>
      </div>

      <div className="mt-6 flex flex-col sm:flex-row gap-2">
        <Button onClick={printReceipt} variant="outline" className="flex-1 gap-2"><Printer className="h-4 w-4" /> Imprimir</Button>
        <Button onClick={downloadReceipt} variant="outline" className="flex-1 gap-2"><Download className="h-4 w-4" /> Descargar</Button>
      </div>

      <div className="mt-6 rounded-2xl border p-5 bg-gradient-to-br from-success/5 to-primary/5 text-center">
        <MessageCircle className="h-8 w-8 mx-auto text-success" />
        <div className="font-display font-semibold mt-2">¿Tenés alguna consulta?</div>
        <p className="text-sm text-muted-foreground mt-1">Escribinos por WhatsApp y te ayudamos con tu pedido.</p>
        <a href={WHATSAPP_LINK} target="_blank" rel="noreferrer" className="inline-flex mt-4 items-center gap-2 rounded-full bg-success text-white px-5 py-2.5 text-sm font-medium hover:opacity-90 shadow-elegant">
          <MessageCircle className="h-4 w-4" /> {WHATSAPP_NUMBER}
        </a>
      </div>

      <div className="mt-6 flex justify-center gap-2">
        <Button asChild variant="outline"><Link to="/tienda-online">Seguir comprando</Link></Button>
        <Button onClick={onNew} className="bg-gradient-brand hover:opacity-90">Hacer otro pedido</Button>
      </div>
    </div>
  );
}

// silence unused
