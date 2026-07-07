import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { INITIAL_PRODUCTS, type Product } from "./mock-data";

export type Role = "admin" | "empleado";
export type User = { email: string; name: string; role: Role };

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
};

const AppCtx = createContext<Ctx | null>(null);

const LS_USER = "sm_user";
const LS_PRODUCTS = "sm_products";

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const u = localStorage.getItem(LS_USER);
      if (u) setUser(JSON.parse(u));
      const p = localStorage.getItem(LS_PRODUCTS);
      if (p) setProducts(JSON.parse(p));
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem(LS_PRODUCTS, JSON.stringify(products));
  }, [products, hydrated]);

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

  const deleteProduct: Ctx["deleteProduct"] = (id) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <AppCtx.Provider value={{ user, login, logout, products, addProduct, updateProduct, deleteProduct }}>
      {children}
    </AppCtx.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppCtx);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
