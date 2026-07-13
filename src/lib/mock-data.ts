import {
  Milk,
  CupSoda,
  Croissant,
  Apple,
  Beef,
  SprayCan,
  Cookie,
  Wheat,
  Coffee,
  Fish,
  Baby,
  PawPrint,
  Wine,
  Snowflake,
  Utensils,
  Sandwich,
  type LucideIcon,
} from "lucide-react";

export type Category = { id: string; name: string; color: string; icon: LucideIcon };

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
  discountPct: number; // 0 = no discount
  updatedAt: string;
};

export const CATEGORIES: Category[] = [
  { id: "lacteos", name: "Lácteos", color: "oklch(0.75 0.12 220)", icon: Milk },
  { id: "bebidas", name: "Bebidas", color: "oklch(0.65 0.18 250)", icon: CupSoda },
  { id: "panaderia", name: "Panadería", color: "oklch(0.78 0.15 75)", icon: Croissant },
  { id: "frutas", name: "Verdulería", color: "oklch(0.70 0.18 145)", icon: Apple },
  { id: "carnes", name: "Carnes", color: "oklch(0.60 0.20 25)", icon: Beef },
  { id: "pescaderia", name: "Pescadería", color: "oklch(0.68 0.14 210)", icon: Fish },
  { id: "fiambres", name: "Fiambres", color: "oklch(0.65 0.18 15)", icon: Sandwich },
  { id: "almacen", name: "Almacén", color: "oklch(0.70 0.13 90)", icon: Wheat },
  { id: "congelados", name: "Congelados", color: "oklch(0.72 0.12 230)", icon: Snowflake },
  { id: "desayuno", name: "Desayuno", color: "oklch(0.68 0.14 55)", icon: Coffee },
  { id: "limpieza", name: "Limpieza", color: "oklch(0.70 0.13 190)", icon: SprayCan },
  { id: "snacks", name: "Snacks", color: "oklch(0.75 0.15 60)", icon: Cookie },
  { id: "bebes", name: "Bebés", color: "oklch(0.80 0.10 340)", icon: Baby },
  { id: "mascotas", name: "Mascotas", color: "oklch(0.70 0.12 130)", icon: PawPrint },
  { id: "bodega", name: "Bodega", color: "oklch(0.50 0.18 20)", icon: Wine },
  { id: "hogar", name: "Hogar y Bazar", color: "oklch(0.70 0.10 280)", icon: Utensils },
];

export const SUPPLIERS = [
  "La Serenísima",
  "Sancor",
  "Ilolay",
  "Milkaut",
  "Coca-Cola FEMSA",
  "Cervecería Quilmes",
  "Pepsico Argentina",
  "Molinos Río de la Plata",
  "Bagley",
  "Arcor",
  "Georgalos",
  "Mondelez Argentina",
  "Havanna",
  "Frigorífico Rioplatense",
  "Swift",
  "Paladini",
  "Cagnoli",
  "Granja Tres Arroyos",
  "Marolio",
  "Molto",
  "Unilever Argentina",
  "Procter & Gamble",
  "Clorox Argentina",
  "Ala",
  "Bodega Trapiche",
  "Bodega Norton",
  "Bodegas Chandon",
  "Nestlé Argentina",
  "Danone Argentina",
  "La Salteña",
  "Mercado Central",
  "Establecimiento Las Marías",
  "Molinos Cañuelas",
  "Alicorp",
];

const IMG = (q: string) =>
  `https://images.unsplash.com/${q}?auto=format&fit=crop&w=500&q=70`;

const P = (
  id: string,
  sku: string,
  name: string,
  category: string,
  price: number,
  cost: number,
  stock: number,
  minStock: number,
  supplier: string,
  barcode: string,
  img: string,
  discountPct = 0,
  publishedOnline = true,
): Product => ({
  id,
  sku,
  name,
  category,
  price,
  cost,
  stock,
  minStock,
  supplier,
  barcode,
  image: IMG(img),
  publishedOnline,
  discountPct,
  updatedAt: "2026-07-06",
});

export const INITIAL_PRODUCTS: Product[] = [
  // Lácteos
  P("p1", "LAC-001", "Leche Entera La Serenísima 1L", "lacteos", 890, 620, 124, 40, "La Serenísima", "7791234000012", "photo-1550583724-b2692b85b150"),
  P("p2", "LAC-002", "Yogur Griego Ilolay 500g", "lacteos", 1450, 980, 12, 20, "Ilolay", "7791234000029", "photo-1488477181946-6428a0291777", 15),
  P("p12", "LAC-014", "Queso Cremoso Sancor 500g", "lacteos", 3450, 2400, 28, 20, "Sancor", "7791234000128", "photo-1486297678162-eb2a19b0a32d"),
  P("p13", "LAC-018", "Manteca La Serenísima 200g", "lacteos", 1690, 1120, 40, 15, "La Serenísima", "7791234000135", "photo-1589985270826-4b7bb135bc9d"),
  P("p14", "LAC-022", "Crema de Leche Milkaut 200g", "lacteos", 980, 640, 55, 20, "Milkaut", "7791234000142", "photo-1628088062854-d1870b4553da"),

  // Bebidas
  P("p3", "BEB-014", "Coca-Cola 2.25L", "bebidas", 2100, 1450, 86, 30, "Coca-Cola FEMSA", "7791234000036", "photo-1554866585-cd94860890b7"),
  P("p4", "BEB-021", "Agua Mineral Villavicencio 1.5L", "bebidas", 780, 480, 240, 60, "Coca-Cola FEMSA", "7791234000043", "photo-1560847468-5eef330bd6ee"),
  P("p15", "BEB-032", "Cerveza Quilmes 1L", "bebidas", 1590, 990, 96, 30, "Cervecería Quilmes", "7791234000159", "photo-1600788886242-5c96aabe3757", 10),
  P("p16", "BEB-041", "Fanta Naranja 2.25L", "bebidas", 1980, 1350, 60, 25, "Coca-Cola FEMSA", "7791234000166", "photo-1624517452488-04869289c4ca"),
  P("p17", "BEB-055", "Jugo Cepita Naranja 1L", "bebidas", 1290, 820, 48, 20, "Coca-Cola FEMSA", "7791234000173", "photo-1600271886742-f049cd451bba"),

  // Panadería
  P("p5", "PAN-003", "Pan Lactal Integral Bimbo", "panaderia", 1250, 820, 32, 25, "Molinos Río de la Plata", "7791234000050", "photo-1509440159596-0249088772ff"),
  P("p18", "PAN-009", "Medialunas de manteca x6", "panaderia", 1850, 1200, 24, 15, "Molinos Río de la Plata", "7791234000180", "photo-1620980776848-84cc0f38d5c1"),
  P("p19", "PAN-014", "Facturas surtidas x12", "panaderia", 3200, 2100, 18, 10, "Molinos Río de la Plata", "7791234000197", "photo-1568051243851-f9b136146e97", 20),

  // Frutas y Verduras
  P("p6", "FRU-007", "Manzana Roja x kg", "frutas", 1890, 1200, 55, 30, "Mercado Central", "7791234000067", "photo-1560806887-1e4cd0b6cbd6"),
  P("p7", "FRU-012", "Banana x kg", "frutas", 1290, 780, 7, 25, "Mercado Central", "7791234000074", "photo-1571771894821-ce9b6c11b08e"),
  P("p20", "FRU-018", "Tomate Perita x kg", "frutas", 1490, 950, 35, 20, "Mercado Central", "7791234000203", "photo-1592924357228-91a4daadcfea"),
  P("p21", "FRU-024", "Palta Hass x u", "frutas", 890, 560, 60, 20, "Mercado Central", "7791234000210", "photo-1523049673857-eb18f1d7b578"),
  P("p22", "FRU-030", "Lechuga Mantecosa x u", "frutas", 690, 420, 42, 20, "Mercado Central", "7791234000227", "photo-1622206151226-18ca2c9ab4a1"),

  // Carnes
  P("p8", "CAR-005", "Bife de Chorizo x kg", "carnes", 9800, 7200, 18, 15, "Frigorífico Rioplatense", "7791234000081", "photo-1607623814075-e51df1bdc82f"),
  P("p23", "CAR-011", "Milanesa de Nalga x kg", "carnes", 8200, 5900, 24, 15, "Swift", "7791234000234", "photo-1544025162-d76694265947", 10),
  P("p24", "CAR-018", "Pollo Entero Granja Tres Arroyos x kg", "carnes", 3900, 2800, 30, 15, "Granja Tres Arroyos", "7791234000241", "photo-1587593810167-a84920ea0781"),

  // Pescadería
  P("p25", "PES-002", "Filet de Merluza x kg", "pescaderia", 6200, 4400, 16, 10, "Frigorífico Rioplatense", "7791234000258", "photo-1519708227418-c8fd9a32b7a2"),
  P("p26", "PES-006", "Salmón Rosado x kg", "pescaderia", 14900, 10500, 8, 6, "Frigorífico Rioplatense", "7791234000265", "photo-1519708227418-c8fd9a32b7a2", 15),

  // Fiambres
  P("p27", "FIA-003", "Jamón Cocido Paladini 200g", "fiambres", 2890, 1980, 42, 20, "Paladini", "7791234000272", "photo-1560717845-968823efbee1"),
  P("p28", "FIA-008", "Salame Milán Cagnoli 300g", "fiambres", 3990, 2750, 22, 12, "Cagnoli", "7791234000289", "photo-1601001435957-74f0958a93c5"),
  P("p29", "FIA-014", "Queso Sardo x 100g", "fiambres", 1290, 820, 36, 15, "Sancor", "7791234000296", "photo-1552767059-ce182ead6c1b"),

  // Almacén
  P("p30", "ALM-002", "Fideos Spaghetti Matarazzo 500g", "almacen", 890, 560, 120, 30, "Molinos Río de la Plata", "7791234000302", "photo-1621996346565-e3dbc646d9a9"),
  P("p31", "ALM-008", "Arroz Gallo Oro 1kg", "almacen", 1690, 1100, 88, 30, "Molinos Cañuelas", "7791234000319", "photo-1586201375761-83865001e31c"),
  P("p32", "ALM-014", "Aceite Girasol Natura 900ml", "almacen", 2490, 1650, 74, 25, "Molinos Cañuelas", "7791234000326", "photo-1474979266404-7eaacbcd87c5", 12),
  P("p33", "ALM-020", "Azúcar Ledesma 1kg", "almacen", 1290, 820, 96, 30, "Marolio", "7791234000333", "photo-1615485500704-8e990f9900f7"),
  P("p34", "ALM-028", "Yerba Mate Playadito 1kg", "almacen", 3690, 2550, 68, 25, "Establecimiento Las Marías", "7791234000340", "photo-1591802071006-4cb8ab72d90c"),
  P("p35", "ALM-034", "Sal Fina Celusal 500g", "almacen", 590, 380, 110, 30, "Marolio", "7791234000357", "photo-1518110925495-b37653e15af6"),
  P("p36", "ALM-040", "Puré de tomate La Campagnola 520g", "almacen", 1190, 780, 82, 30, "Arcor", "7791234000364", "photo-1607013251379-e6eecfffe234"),

  // Congelados
  P("p37", "CON-003", "Hamburguesas Paty x4", "congelados", 3290, 2200, 46, 20, "Molinos Río de la Plata", "7791234000371", "photo-1568901346375-23c9450c58cd"),
  P("p38", "CON-008", "Papas Prefritas McCain 1kg", "congelados", 3890, 2650, 38, 20, "Alicorp", "7791234000388", "photo-1573080496219-bb080dd4f877", 15),
  P("p39", "CON-014", "Helado Frigor 1L", "congelados", 4990, 3400, 24, 12, "Nestlé Argentina", "7791234000395", "photo-1567206563064-6f60f40a2b57"),

  // Desayuno
  P("p40", "DES-002", "Café La Virginia molido 250g", "desayuno", 3490, 2350, 52, 20, "Molinos Cañuelas", "7791234000401", "photo-1442512595331-e89e73853f31"),
  P("p41", "DES-008", "Té Green Hills x25", "desayuno", 890, 560, 88, 25, "Establecimiento Las Marías", "7791234000418", "photo-1594631252845-29fc4cc8cde9"),
  P("p42", "DES-014", "Mermelada Arcor Frutilla 454g", "desayuno", 1890, 1250, 44, 15, "Arcor", "7791234000425", "photo-1597528380147-e8e5ca9d5edb"),

  // Limpieza
  P("p9", "LIM-011", "Detergente Magistral 900ml", "limpieza", 1980, 1350, 64, 20, "Procter & Gamble", "7791234000098", "photo-1585421514738-01798e348b17"),
  P("p43", "LIM-018", "Lavandina Ayudín 1L", "limpieza", 1290, 820, 78, 25, "Clorox Argentina", "7791234000432", "photo-1610557892470-55d9e80c0bce"),
  P("p44", "LIM-024", "Jabón en Polvo Ala 800g", "limpieza", 3290, 2200, 42, 15, "Unilever Argentina", "7791234000449", "photo-1622503660741-04e6c7c1ecf5"),
  P("p45", "LIM-030", "Papel Higiénico Elite x4", "limpieza", 2490, 1650, 96, 30, "Procter & Gamble", "7791234000456", "photo-1584556812952-905ffd0c611a"),

  // Snacks
  P("p10", "SNK-022", "Papas Fritas Lays 250g", "snacks", 1650, 1050, 0, 20, "Pepsico Argentina", "7791234000104", "photo-1566478989037-eec170784d0b"),
  P("p11", "SNK-023", "Chocolate Milka con Leche 100g", "snacks", 990, 620, 152, 40, "Mondelez Argentina", "7791234000111", "photo-1548907040-4baa42d10919", 25),
  P("p46", "SNK-034", "Alfajor Havanna Mixto x1", "snacks", 890, 560, 180, 40, "Havanna", "7791234000463", "photo-1541599540903-216a46ca1dc0"),
  P("p47", "SNK-041", "Galletitas Oreo 118g", "snacks", 1290, 820, 88, 25, "Mondelez Argentina", "7791234000470", "photo-1558961363-fa8fdf82db35"),
  P("p48", "SNK-048", "Turrón Georgalos", "snacks", 690, 420, 120, 30, "Georgalos", "7791234000487", "photo-1548907040-4baa42d10919"),

  // Bebés
  P("p49", "BEB-102", "Pañales Pampers Premium G x24", "bebes", 12900, 9200, 32, 12, "Procter & Gamble", "7791234000494", "photo-1607453998774-d533f65dac99"),
  P("p50", "BEB-108", "Toallitas Húmedas Huggies x80", "bebes", 3990, 2700, 44, 15, "Procter & Gamble", "7791234000500", "photo-1519689680058-324335c77eba"),

  // Mascotas
  P("p51", "MAS-004", "Alimento Perro Dog Chow 3kg", "mascotas", 8990, 6300, 28, 10, "Nestlé Argentina", "7791234000517", "photo-1568640347023-a616a30bc3bd", 10),
  P("p52", "MAS-010", "Alimento Gato Whiskas 1kg", "mascotas", 4290, 2900, 36, 12, "Nestlé Argentina", "7791234000524", "photo-1571566882372-1598d88abd90"),

  // Bodega
  P("p53", "BOD-003", "Vino Trapiche Malbec 750ml", "bodega", 4990, 3400, 48, 20, "Bodega Trapiche", "7791234000531", "photo-1553361371-9b22f78e8b1d"),
  P("p54", "BOD-009", "Vino Norton Cabernet 750ml", "bodega", 4290, 2950, 52, 20, "Bodega Norton", "7791234000548", "photo-1584916201218-f4242ceb4809"),
  P("p55", "BOD-015", "Espumante Chandon Extra Brut", "bodega", 12900, 9100, 22, 10, "Bodegas Chandon", "7791234000555", "photo-1567696911980-2eed69a46042", 15),

  // Hogar
  P("p56", "HOG-003", "Vaso de Vidrio x6", "hogar", 5990, 4100, 26, 10, "Marolio", "7791234000562", "photo-1573487745699-d5d5f9f4bcb1"),
  P("p57", "HOG-010", "Sartén antiadherente 26cm", "hogar", 12900, 8700, 12, 6, "Marolio", "7791234000579", "photo-1584990347449-a2d4c2bd3ef2"),
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
