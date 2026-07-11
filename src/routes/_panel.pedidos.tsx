import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useApp, type DeliveryStatus, type Order } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { ClipboardList, Package, Phone, MapPin, Calendar, CreditCard, Banknote } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/_panel/pedidos")({
  component: PedidosPage,
});

const STATUS: { value: DeliveryStatus; label: string; tone: string }[] = [
  { value: "pending", label: "Pendiente", tone: "bg-muted text-foreground" },
  { value: "preparing", label: "Preparando", tone: "bg-warning/20 text-warning-foreground" },
  { value: "on_route", label: "En camino", tone: "bg-primary/15 text-primary" },
  { value: "delivered", label: "Entregado", tone: "bg-success/15 text-success" },
  { value: "cancelled", label: "Cancelado", tone: "bg-destructive/15 text-destructive" },
];

function PedidosPage() {
  const { orders, updateOrder } = useApp();
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"all" | DeliveryStatus>("all");
  const navigate = useNavigate();

  const filtered = useMemo(() => {
    return orders.filter((o) => {
      const matchesQ =
        !q ||
        o.id.toLowerCase().includes(q.toLowerCase()) ||
        o.customer.fullName.toLowerCase().includes(q.toLowerCase()) ||
        o.customer.phone.includes(q);
      const matchesF = filter === "all" || o.deliveryStatus === filter;
      return matchesQ && matchesF;
    });
  }, [orders, q, filter]);

  const pending = orders.filter((o) => o.deliveryStatus === "pending" || o.deliveryStatus === "preparing").length;
  const revenue = orders.filter((o) => o.paymentStatus === "paid").reduce((s, o) => s + o.total, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold">Pedidos</h1>
          <p className="text-muted-foreground mt-1">
            {orders.length} pedidos · {pending} activos · ${revenue.toLocaleString("es-AR")} cobrado
          </p>
        </div>
        <Button variant="outline" onClick={() => navigate({ to: "/tienda-online" })}>
          Abrir tienda online
        </Button>
      </div>

      <Card className="p-4 shadow-elegant">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <Input placeholder="Buscar por N° pedido, cliente o teléfono..." value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <div className="w-full sm:w-56">
            <Select value={filter} onValueChange={(v) => setFilter(v as "all" | DeliveryStatus)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                {STATUS.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {filtered.length === 0 ? (
        <Card className="p-12 text-center shadow-elegant">
          <ClipboardList className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
          <div className="font-display font-semibold text-lg">Todavía no hay pedidos</div>
          <p className="text-sm text-muted-foreground mt-1">Cuando un cliente compre en la tienda online, aparecerá acá.</p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filtered.map((o) => (
            <OrderCard key={o.id} order={o} onUpdate={(patch) => { updateOrder(o.id, patch); toast.success("Pedido actualizado"); }} />
          ))}
        </div>
      )}
    </div>
  );
}

function OrderCard({ order, onUpdate }: { order: Order; onUpdate: (p: Partial<Order>) => void }) {
  const created = new Date(order.createdAt);
  return (
    <Card className="p-4 sm:p-5 shadow-elegant">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3 sm:flex sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <div className="font-display font-bold text-lg">Pedido #{order.id}</div>
            {order.paymentStatus === "paid" ? (
              <Badge className="bg-success/15 text-success border-success/30">Pagado</Badge>
            ) : (
              <Badge variant="outline" className="border-warning/40 text-warning-foreground bg-warning/10">Pago pendiente</Badge>
            )}
            <Badge variant="outline" className="gap-1">
              {order.paymentMethod === "mercadopago" ? <CreditCard className="h-3 w-3" /> : <Banknote className="h-3 w-3" />}
              {order.paymentMethod === "mercadopago" ? "Mercado Pago" : "Efectivo"}
            </Badge>
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {created.toLocaleString("es-AR")}
          </div>
        </div>
        <div className="font-display font-bold text-xl sm:text-2xl shrink-0">${order.total.toLocaleString("es-AR")}</div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg bg-secondary/50 p-3">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Cliente</div>
          <div className="font-medium text-sm mt-1">{order.customer.fullName}</div>
          <div className="text-xs text-muted-foreground flex items-center gap-1.5 mt-1"><Phone className="h-3 w-3" />{order.customer.phone}</div>
          <div className="text-xs text-muted-foreground flex items-start gap-1.5 mt-1"><MapPin className="h-3 w-3 mt-0.5" /><span>{order.customer.address}, {order.customer.city}</span></div>
        </div>
        <div className="rounded-lg bg-secondary/50 p-3">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Entrega solicitada</div>
          <div className="text-sm font-medium mt-1 flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" />{order.deliverySlotDate} · {order.deliverySlotTime} hs</div>
          <div className="mt-2">
            <Select value={order.deliveryStatus} onValueChange={(v) => onUpdate({ deliveryStatus: v as DeliveryStatus })}>
              <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
              <SelectContent>
                {STATUS.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="mt-4">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
          <Package className="h-3 w-3 inline mr-1" /> {order.lines.length} productos
        </div>
        <div className="flex flex-wrap gap-2">
          {order.lines.map((l) => (
            <div key={l.productId} className="flex items-center gap-2 rounded-lg border bg-card p-2 pr-3">
              <img src={l.image} alt="" className="h-8 w-8 rounded object-cover" />
              <div>
                <div className="text-xs font-medium leading-tight max-w-[180px] truncate">{l.name}</div>
                <div className="text-[10px] text-muted-foreground">×{l.qty} · ${(l.price * l.qty).toLocaleString("es-AR")}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {order.paymentStatus !== "paid" && (
        <div className="mt-4 flex gap-2">
          <Button size="sm" onClick={() => onUpdate({ paymentStatus: "paid" })} className="bg-success text-white hover:bg-success/90">
            Marcar como pagado
          </Button>
        </div>
      )}
    </Card>
  );
}
