export type Category = { id: string; name: string; color: string };

export type Product = {
  id: string;
  sku: string;
  name: string;
  category: string;
  price: number;
  cost: number;
  stock: number;
  minStock: number;
  supplier: string;
  barcode: string;
  image: string;
  publishedOnline: boolean;
  updatedAt: string;
};

export const CATEGORIES: Category[] = [
  { id: "lacteos", name: "Lácteos", color: "oklch(0.75 0.12 220)" },
  { id: "bebidas", name: "Bebidas", color: "oklch(0.65 0.18 250)" },
  { id: "panaderia", name: "Panadería", color: "oklch(0.78 0.15 75)" },
  { id: "frutas", name: "Frutas y Verduras", color: "oklch(0.70 0.18 145)" },
  { id: "carnes", name: "Carnes", color: "oklch(0.60 0.20 25)" },
  { id: "limpieza", name: "Limpieza", color: "oklch(0.70 0.13 190)" },
  { id: "snacks", name: "Snacks", color: "oklch(0.75 0.15 60)" },
];

export const SUPPLIERS = [
  "La Serenísima",
  "Coca-Cola FEMSA",
  "Molinos Río",
  "Frigorífico Rioplatense",
  "Unilever",
  "Arcor",
  "Mercado Central",
];

const IMG = (q: string) =>
  `https://images.unsplash.com/${q}?auto=format&fit=crop&w=400&q=70`;

export const INITIAL_PRODUCTS: Product[] = [
  { id: "p1", sku: "LAC-001", name: "Leche Entera 1L", category: "lacteos", price: 890, cost: 620, stock: 124, minStock: 40, supplier: "La Serenísima", barcode: "7791234000012", image: IMG("photo-1550583724-b2692b85b150"), publishedOnline: true, updatedAt: "2026-07-06" },
  { id: "p2", sku: "LAC-002", name: "Yogur Griego 500g", category: "lacteos", price: 1450, cost: 980, stock: 12, minStock: 20, supplier: "La Serenísima", barcode: "7791234000029", image: IMG("photo-1488477181946-6428a0291777"), publishedOnline: true, updatedAt: "2026-07-05" },
  { id: "p3", sku: "BEB-014", name: "Coca-Cola 2.25L", category: "bebidas", price: 2100, cost: 1450, stock: 86, minStock: 30, supplier: "Coca-Cola FEMSA", barcode: "7791234000036", image: IMG("photo-1554866585-cd94860890b7"), publishedOnline: true, updatedAt: "2026-07-06" },
  { id: "p4", sku: "BEB-021", name: "Agua Mineral 1.5L", category: "bebidas", price: 780, cost: 480, stock: 240, minStock: 60, supplier: "Coca-Cola FEMSA", barcode: "7791234000043", image: IMG("photo-1560847468-5eef330bd6ee"), publishedOnline: true, updatedAt: "2026-07-06" },
  { id: "p5", sku: "PAN-003", name: "Pan Lactal Integral", category: "panaderia", price: 1250, cost: 820, stock: 32, minStock: 25, supplier: "Molinos Río", barcode: "7791234000050", image: IMG("photo-1509440159596-0249088772ff"), publishedOnline: true, updatedAt: "2026-07-06" },
  { id: "p6", sku: "FRU-007", name: "Manzana Roja x kg", category: "frutas", price: 1890, cost: 1200, stock: 55, minStock: 30, supplier: "Mercado Central", barcode: "7791234000067", image: IMG("photo-1560806887-1e4cd0b6cbd6"), publishedOnline: true, updatedAt: "2026-07-06" },
  { id: "p7", sku: "FRU-012", name: "Banana x kg", category: "frutas", price: 1290, cost: 780, stock: 7, minStock: 25, supplier: "Mercado Central", barcode: "7791234000074", image: IMG("photo-1571771894821-ce9b6c11b08e"), publishedOnline: true, updatedAt: "2026-07-05" },
  { id: "p8", sku: "CAR-005", name: "Bife de Chorizo x kg", category: "carnes", price: 9800, cost: 7200, stock: 18, minStock: 15, supplier: "Frigorífico Rioplatense", barcode: "7791234000081", image: IMG("photo-1607623814075-e51df1bdc82f"), publishedOnline: true, updatedAt: "2026-07-06" },
  { id: "p9", sku: "LIM-011", name: "Detergente Multiuso 900ml", category: "limpieza", price: 1980, cost: 1350, stock: 64, minStock: 20, supplier: "Unilever", barcode: "7791234000098", image: IMG("photo-1585421514738-01798e348b17"), publishedOnline: true, updatedAt: "2026-07-06" },
  { id: "p10", sku: "SNK-022", name: "Papas Fritas 250g", category: "snacks", price: 1650, cost: 1050, stock: 0, minStock: 20, supplier: "Arcor", barcode: "7791234000104", image: IMG("photo-1566478989037-eec170784d0b"), publishedOnline: false, updatedAt: "2026-07-04" },
  { id: "p11", sku: "SNK-023", name: "Chocolate con Leche 100g", category: "snacks", price: 990, cost: 620, stock: 152, minStock: 40, supplier: "Arcor", barcode: "7791234000111", image: IMG("photo-1548907040-4baa42d10919"), publishedOnline: true, updatedAt: "2026-07-06" },
  { id: "p12", sku: "LAC-014", name: "Queso Cremoso 500g", category: "lacteos", price: 3450, cost: 2400, stock: 28, minStock: 20, supplier: "La Serenísima", barcode: "7791234000128", image: IMG("photo-1486297678162-eb2a19b0a32d"), publishedOnline: true, updatedAt: "2026-07-06" },
];

export const SALES_LAST_7_DAYS = [
  { day: "Mié", sales: 285000, orders: 142 },
  { day: "Jue", sales: 312000, orders: 158 },
  { day: "Vie", sales: 425000, orders: 214 },
  { day: "Sáb", sales: 512000, orders: 268 },
  { day: "Dom", sales: 398000, orders: 197 },
  { day: "Lun", sales: 265000, orders: 132 },
  { day: "Mar", sales: 348000, orders: 176 },
];
