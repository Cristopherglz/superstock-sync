import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { useApp } from "@/lib/store";
import { CATEGORIES, SUPPLIERS } from "@/lib/mock-data";
import type { Product } from "@/lib/mock-data";
import { scanProductFromImage, type ScannedProduct } from "@/lib/scan-product.functions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Pencil, Trash2, Package, Filter, Camera, Loader2, Sparkles, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_panel/productos")({
  component: ProductosPage,
});

type Draft = Omit<Product, "id" | "updatedAt">;

const emptyDraft: Draft = {
  sku: "",
  name: "",
  category: "",
  price: 0,
  cost: 0,
  stock: 0,
  minStock: 0,
  supplier: "",
  barcode: "",
  image: "",
  publishedOnline: true,
};

const defaultDraft = (): Draft => ({
  ...emptyDraft,
  category: CATEGORIES[0].id,
  supplier: SUPPLIERS[0],
  minStock: 10,
  image: "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?auto=format&fit=crop&w=400&q=70",
});

type PhotoStatus = "pending" | "analyzing" | "done" | "error";
type PhotoEntry = { src: string; status: PhotoStatus };

function ProductosPage() {
  const { products, addProduct, updateProduct, deleteProduct } = useApp();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string>("all");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [draft, setDraft] = useState<Draft>(defaultDraft());
  const [scanning, setScanning] = useState(false);
  const [scanPhotos, setScanPhotos] = useState<PhotoEntry[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filtered = products.filter((p) => {
    const matchesQ =
      !q ||
      p.name.toLowerCase().includes(q.toLowerCase()) ||
      p.sku.toLowerCase().includes(q.toLowerCase()) ||
      p.barcode.includes(q);
    const matchesCat = cat === "all" || p.category === cat;
    return matchesQ && matchesCat;
  });

  const openNew = () => {
    setEditing(null);
    setDraft(defaultDraft());
    setScanPhotos([]);
    setOpen(true);
  };

  const readFileAsDataUrl = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error("No se pudo leer la imagen"));
      reader.readAsDataURL(file);
    });

  // Merge only into empty fields, never overwrite user-entered data.
  const mergeIntoDraft = (result: ScannedProduct, firstPhotoSrc: string | null) => {
    setDraft((d) => {
      const next: Draft = { ...d };
      const emptyStr = (s: string) => !s || !s.trim();
      const isDefaultImage = next.image === defaultDraft().image;

      if (emptyStr(next.name) && result.name) next.name = result.name;
      if (emptyStr(next.barcode) && result.barcode) next.barcode = result.barcode;
      if (result.category && CATEGORIES.some((c) => c.id === result.category) && emptyStr(d.category)) {
        next.category = result.category;
      }
      if (result.supplier && SUPPLIERS.includes(result.supplier) && emptyStr(d.supplier)) {
        next.supplier = result.supplier;
      }
      if (next.price === 0 && typeof result.price === "number") next.price = result.price;
      if (next.cost === 0 && typeof result.cost === "number") next.cost = result.cost;
      if (next.minStock === 0 && typeof result.minStock === "number") next.minStock = result.minStock;
      if (emptyStr(next.sku) && result.name) {
        next.sku =
          result.name.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6) +
          "-" +
          Math.floor(Math.random() * 900 + 100);
      }
      if (isDefaultImage && firstPhotoSrc) next.image = firstPhotoSrc;
      return next;
    });
  };

  const analyzeNewPhotos = async (allPhotos: PhotoEntry[], newIndexes: number[]) => {
    const newSources = newIndexes.map((i) => allPhotos[i].src);
    if (!newSources.length) return;
    setScanning(true);
    try {
      const result = await scanProductFromImage({
        data: {
          imageDataUrls: newSources,
          categories: CATEGORIES.map((c) => ({ id: c.id, name: c.name })),
          suppliers: [...SUPPLIERS],
        },
      });
      const firstOverall = allPhotos[0]?.src ?? null;
      mergeIntoDraft(result, firstOverall);
      setScanPhotos((prev) =>
        prev.map((p, i) => (newIndexes.includes(i) ? { ...p, status: "done" } : p)),
      );
      toast.success("Datos nuevos incorporados sin sobrescribir lo cargado");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Error al escanear";
      setScanPhotos((prev) =>
        prev.map((p, i) => (newIndexes.includes(i) ? { ...p, status: "error" } : p)),
      );
      toast.error(msg);
    } finally {
      setScanning(false);
    }
  };

  const handleScanFiles = async (files: FileList) => {
    const valid = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (!valid.length) {
      toast.error("Selecciona imágenes válidas");
      return;
    }
    try {
      const dataUrls = await Promise.all(valid.map(readFileAsDataUrl));
      const added: PhotoEntry[] = dataUrls.map((src) => ({ src, status: "analyzing" }));
      const startIndex = scanPhotos.length;
      const combined = [...scanPhotos, ...added];
      setScanPhotos(combined);
      const newIndexes = added.map((_, i) => startIndex + i);
      await analyzeNewPhotos(combined, newIndexes);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error al leer imágenes");
    }
  };

  const removeScanPhoto = (idx: number) => {
    setScanPhotos((prev) => prev.filter((_, i) => i !== idx));
  };

  const openEdit = (p: Product) => {
    setEditing(p);
    const { id: _id, updatedAt: _u, ...rest } = p;
    setDraft(rest);
    setScanPhotos([]);
    setOpen(true);
  };

  const save = () => {
    if (!draft.name || !draft.sku) {
      toast.error("Nombre y SKU son obligatorios");
      return;
    }
    if (editing) {
      updateProduct(editing.id, draft);
      toast.success("Producto actualizado y sincronizado con la tienda online");
    } else {
      addProduct(draft);
      toast.success("Producto creado y publicado en la tienda online");
    }
    setOpen(false);
  };

  const remove = (p: Product) => {
    if (confirm(`¿Eliminar "${p.name}"?`)) {
      deleteProduct(p.id);
      toast.success("Producto eliminado");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold">Productos</h1>
          <p className="text-muted-foreground mt-1">{products.length} productos en catálogo</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNew} className="bg-gradient-brand shadow-elegant hover:opacity-90 gap-2">
              <Plus className="h-4 w-4" /> Nuevo producto
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-display text-xl">
                {editing ? "Editar producto" : "Nuevo producto"}
              </DialogTitle>
            </DialogHeader>

            {!editing && (
              <div className="rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-gradient-brand p-2 shadow-elegant">
                    <Sparkles className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-sm">Escanear paquete con IA</div>
                    <div className="text-xs text-muted-foreground">
                      Sumá fotos del producto (frente, dorso, código de barras). Cada nueva foto <b>solo completa los campos vacíos</b>, nunca reemplaza lo que ya cargaste.
                    </div>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length) handleScanFiles(e.target.files);
                      e.target.value = "";
                    }}
                  />
                  <Button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={scanning}
                    className="bg-gradient-brand hover:opacity-90 gap-2 flex-1"
                  >
                    {scanning ? (
                      <><Loader2 className="h-4 w-4 animate-spin" /> Analizando...</>
                    ) : (
                      <><Camera className="h-4 w-4" /> {scanPhotos.length > 0 ? "Agregar otra foto" : "Tomar foto del paquete"}</>
                    )}
                  </Button>
                </div>
                {scanPhotos.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {scanPhotos.map((ph, i) => (
                      <div key={i} className="relative group">
                        <div className="relative h-16 w-16 rounded-lg overflow-hidden border">
                          <img
                            src={ph.src}
                            alt={`foto ${i + 1}`}
                            className={`h-full w-full object-cover transition ${ph.status === "analyzing" ? "blur-[1px] brightness-75" : ""}`}
                          />
                          {ph.status === "analyzing" && (
                            <>
                              <div className="absolute inset-0 flex items-center justify-center bg-primary/25">
                                <Loader2 className="h-5 w-5 text-white animate-spin drop-shadow" />
                              </div>
                              <div className="pointer-events-none absolute inset-x-0 top-0 h-full">
                                <div className="absolute inset-x-0 h-8 bg-gradient-to-b from-primary/40 via-primary/10 to-transparent animate-[scan_1.4s_ease-in-out_infinite]" />
                              </div>
                            </>
                          )}
                          {ph.status === "done" && (
                            <div className="absolute bottom-0.5 right-0.5 bg-success text-white rounded-full p-0.5 shadow">
                              <CheckCircle2 className="h-3 w-3" />
                            </div>
                          )}
                          {ph.status === "error" && (
                            <div className="absolute inset-0 flex items-center justify-center bg-destructive/70 text-white text-[10px] font-bold">
                              Error
                            </div>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => removeScanPhoto(i)}
                          className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-destructive text-white text-xs flex items-center justify-center shadow"
                          aria-label="Quitar foto"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                    <div className="self-center text-xs text-muted-foreground ml-1">
                      {scanPhotos.filter((p) => p.status === "done").length}/{scanPhotos.length} analizadas
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="grid gap-4 py-2 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <Label>Nombre</Label>
                <Input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>SKU</Label>
                <Input value={draft.sku} onChange={(e) => setDraft({ ...draft, sku: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Código de barras</Label>
                <Input value={draft.barcode} onChange={(e) => setDraft({ ...draft, barcode: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Categoría</Label>
                <Select value={draft.category} onValueChange={(v) => setDraft({ ...draft, category: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Proveedor</Label>
                <Select value={draft.supplier} onValueChange={(v) => setDraft({ ...draft, supplier: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {SUPPLIERS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Precio venta (ARS)</Label>
                <Input type="number" value={draft.price} onChange={(e) => setDraft({ ...draft, price: +e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Costo (ARS)</Label>
                <Input type="number" value={draft.cost} onChange={(e) => setDraft({ ...draft, cost: +e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Stock actual</Label>
                <Input type="number" value={draft.stock} onChange={(e) => setDraft({ ...draft, stock: +e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Stock mínimo</Label>
                <Input type="number" value={draft.minStock} onChange={(e) => setDraft({ ...draft, minStock: +e.target.value })} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>URL de imagen</Label>
                <Input value={draft.image} onChange={(e) => setDraft({ ...draft, image: e.target.value })} />
              </div>
              <div className="md:col-span-2 flex items-center justify-between rounded-lg border p-3 bg-secondary">
                <div>
                  <div className="text-sm font-medium">Publicar en tienda online</div>
                  <div className="text-xs text-muted-foreground">Sincroniza vía API con tu e-commerce en tiempo real</div>
                </div>
                <Switch checked={draft.publishedOnline} onCheckedChange={(v) => setDraft({ ...draft, publishedOnline: v })} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button onClick={save} className="bg-gradient-brand hover:opacity-90">Guardar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="p-4 shadow-elegant">
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="flex-1">
            <Input placeholder="Buscar por nombre, SKU o código de barras..." value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <div className="w-full sm:w-64 flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={cat} onValueChange={setCat}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las categorías</SelectItem>
                {CATEGORIES.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="rounded-lg border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-secondary/60">
                <TableHead>Producto</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead className="text-right">Precio</TableHead>
                <TableHead className="text-right">Stock</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((p) => {
                const low = p.stock <= p.minStock;
                const out = p.stock === 0;
                const cat = CATEGORIES.find((c) => c.id === p.category);
                return (
                  <TableRow key={p.id} className="hover:bg-secondary/40">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <img src={p.image} alt={p.name} className="h-10 w-10 rounded-lg object-cover border" />
                        <div>
                          <div className="font-medium">{p.name}</div>
                          <div className="text-xs text-muted-foreground">{p.supplier}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs">{p.sku}</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center gap-1.5 text-xs">
                        <span className="h-2 w-2 rounded-full" style={{ background: cat?.color }} />
                        {cat?.name}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-medium">${p.price.toLocaleString("es-AR")}</TableCell>
                    <TableCell className="text-right">
                      <span className={out ? "text-destructive font-semibold" : low ? "text-warning-foreground font-semibold" : ""}>
                        {p.stock}
                      </span>
                    </TableCell>
                    <TableCell>
                      {out ? (
                        <Badge variant="outline" className="border-destructive/40 text-destructive bg-destructive/10">Agotado</Badge>
                      ) : low ? (
                        <Badge variant="outline" className="border-warning/40 text-warning-foreground bg-warning/10">Stock bajo</Badge>
                      ) : p.publishedOnline ? (
                        <Badge variant="outline" className="border-success/40 text-success bg-success/10">Publicado</Badge>
                      ) : (
                        <Badge variant="outline">Oculto</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button size="icon" variant="ghost" onClick={() => openEdit(p)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => remove(p)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="py-12 text-center text-muted-foreground">
                    <Package className="h-8 w-8 mx-auto mb-2 opacity-40" />
                    No se encontraron productos
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
