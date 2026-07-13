import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { INITIAL_PRODUCTS, type Product } from "./mock-data";

export type Role = "admin" | "empleado";
export type User = { email: string; name: string; role: Role };

export type CustomerInfo = {
  fullName: string;
  phone: string;
  address: string;
  city: string;
  zip: string;
  notes: string;
  wantsInvoice: boolean;
  cuit: string;
};

export type OrderLine = { productId: string; name: string; qty: number; price: number; image: string };
export type PaymentStatus = "pending" | "paid" | "failed";
export type DeliveryStatus = "pending" | "preparing" | "on_route" | "delivered" | "cancelled";
export type Order = {
  id: string;
  createdAt: string;
  customer: CustomerInfo;
  lines: OrderLine[];
  subtotal: number;
  shipping: number;
  total: number;
  paymentMethod: "mercadopago" | "cash";
  paymentStatus: PaymentStatus;
  deliveryStatus: DeliveryStatus;
  deliverySlotDate: string; // YYYY-MM-DD
  deliverySlotTime: string; // HH:mm
  deliveryCode: string; // clave que el cliente entrega al repartidor
  read: boolean;
};

const emptyCustomer: CustomerInfo = {
  fullName: "",
  phone: "",
  address: "",
  city: "",
  zip: "",
  notes: "",
  wantsInvoice: false,
  cuit: "",
};

const DEMO_USERS: Record<string, { password: string; user: User }> = {
  "admin@market.com": {
    password: "admin123",
    user: { email: "admin@market.com", name: "Laura Fernández", role: "admin" },
  },
  "empleado@market.com": {
    password: "empleado123",
    user: { email: "empleado@market.com", name: "Diego Ramírez", role: "empleado" },
  },
};

type Ctx = {
  user: User | null;
  login: (email: string, password: string) => { ok: boolean; error?: string };
  logout: () => void;
  products: Product[];
  addProduct: (p: Omit<Product, "id" | "updatedAt">) => void;
  updateProduct: (id: string, patch: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  cart: Record<string, number>;
  addToCart: (id: string, qty?: number) => void;
  removeFromCart: (id: string) => void;
  setCartQty: (id: string, qty: number) => void;
  clearCart: () => void;
  customer: CustomerInfo;
  setCustomer: (c: CustomerInfo) => void;
  orders: Order[];
  addOrder: (o: Omit<Order, "id" | "createdAt" | "read" | "deliveryCode">) => Order;
  updateOrder: (id: string, patch: Partial<Order>) => void;
  markOrdersRead: () => void;
  lowStockProducts: Product[];
  unreadOrders: Order[];
};

const AppCtx = createContext<Ctx | null>(null);

const LS_USER = "sm_user";
const LS_PRODUCTS = "sm_products_v2";
const LS_CART = "sm_cart";
const LS_CUSTOMER = "sm_customer";
const LS_ORDERS = "sm_orders";

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [cart, setCart] = useState<Record<string, number>>({});
  const [customer, setCustomerState] = useState<CustomerInfo>(emptyCustomer);
  const [orders, setOrders] = useState<Order[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const u = localStorage.getItem(LS_USER);
      if (u) setUser(JSON.parse(u));
      const p = localStorage.getItem(LS_PRODUCTS);
      if (p) {
        const parsed = JSON.parse(p) as Product[];
        setProducts(parsed.map((x) => ({ ...x, discountPct: x.discountPct ?? 0 })));
      }
      const c = localStorage.getItem(LS_CART);
      if (c) setCart(JSON.parse(c));
      const cu = localStorage.getItem(LS_CUSTOMER);
      if (cu) setCustomerState({ ...emptyCustomer, ...JSON.parse(cu) });
      const o = localStorage.getItem(LS_ORDERS);
      if (o) setOrders(JSON.parse(o));
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem(LS_PRODUCTS, JSON.stringify(products));
  }, [products, hydrated]);
  useEffect(() => {
    if (hydrated) localStorage.setItem(LS_CART, JSON.stringify(cart));
  }, [cart, hydrated]);
  useEffect(() => {
    if (hydrated) localStorage.setItem(LS_CUSTOMER, JSON.stringify(customer));
  }, [customer, hydrated]);
  useEffect(() => {
    if (hydrated) localStorage.setItem(LS_ORDERS, JSON.stringify(orders));
  }, [orders, hydrated]);

  const login: Ctx["login"] = (email, password) => {
    const rec = DEMO_USERS[email.trim().toLowerCase()];
    if (!rec || rec.password !== password) return { ok: false, error: "Credenciales inválidas" };
    setUser(rec.user);
    localStorage.setItem(LS_USER, JSON.stringify(rec.user));
    return { ok: true };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(LS_USER);
  };

  const addProduct: Ctx["addProduct"] = (p) => {
    const id = "p" + Math.random().toString(36).slice(2, 9);
    setProducts((prev) => [
      { ...p, id, updatedAt: new Date().toISOString().slice(0, 10) },
      ...prev,
    ]);
  };
  const updateProduct: Ctx["updateProduct"] = (id, patch) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...patch, updatedAt: new Date().toISOString().slice(0, 10) } : p)),
    );
  };
  const deleteProduct: Ctx["deleteProduct"] = (id) =>
    setProducts((prev) => prev.filter((p) => p.id !== id));

  const addToCart: Ctx["addToCart"] = (id, qty = 1) =>
    setCart((c) => ({ ...c, [id]: (c[id] || 0) + qty }));
  const removeFromCart: Ctx["removeFromCart"] = (id) =>
    setCart((c) => { const n = { ...c }; delete n[id]; return n; });
  const setCartQty: Ctx["setCartQty"] = (id, qty) =>
    setCart((c) => { const n = { ...c }; if (qty <= 0) delete n[id]; else n[id] = qty; return n; });
  const clearCart = () => setCart({});
  const setCustomer = (c: CustomerInfo) => setCustomerState(c);

  const addOrder: Ctx["addOrder"] = (o) => {
    const id = "N" + Math.floor(100000 + Math.random() * 900000);
    // Palabra clave fácil de recordar + 3 dígitos (ej: NIMBUS-427)
    const words = ["NIMBUS", "FRESCO", "PALTA", "MATE", "TANGO", "SOL", "LUNA", "PAMPA", "RIO", "CIELO"];
    const deliveryCode = `${words[Math.floor(Math.random() * words.length)]}-${Math.floor(100 + Math.random() * 900)}`;
    const order: Order = { ...o, id, createdAt: new Date().toISOString(), deliveryCode, read: false };
    setOrders((prev) => [order, ...prev]);
    return order;
  };
  const updateOrder: Ctx["updateOrder"] = (id, patch) =>
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, ...patch } : o)));
  const markOrdersRead = () => setOrders((prev) => prev.map((o) => ({ ...o, read: true })));

  const lowStockProducts = useMemo(
    () => products.filter((p) => p.stock <= p.minStock),
    [products],
  );
  const unreadOrders = useMemo(() => orders.filter((o) => !o.read), [orders]);

  return (
    <AppCtx.Provider
      value={{
        user, login, logout,
        products, addProduct, updateProduct, deleteProduct,
        cart, addToCart, removeFromCart, setCartQty, clearCart,
        customer, setCustomer,
        orders, addOrder, updateOrder, markOrdersRead,
        lowStockProducts, unreadOrders,
      }}
    >
      {children}
    </AppCtx.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppCtx);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}

// Discounted price helper
export function effectivePrice(p: { price: number; discountPct: number }) {
  if (!p.discountPct) return p.price;
  return Math.round(p.price * (1 - p.discountPct / 100));
}
