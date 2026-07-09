import { createServerFn } from "@tanstack/react-start";

type ScanInput = { imageDataUrl: string; categories: { id: string; name: string }[]; suppliers: string[] };
export type ScannedProduct = {
  name?: string;
  barcode?: string;
  category?: string;
  supplier?: string;
  price?: number;
  cost?: number;
  minStock?: number;
};

export const scanProductFromImage = createServerFn({ method: "POST" })
  .inputValidator((input: ScanInput) => input)
  .handler(async ({ data }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("LOVABLE_API_KEY no configurada");

    const catList = data.categories.map((c) => `${c.id} (${c.name})`).join(", ");
    const supList = data.suppliers.join(", ");

    const system = `Eres un asistente experto en identificar productos de supermercado a partir de fotos del paquete. Extraes datos precisos y respondes SIEMPRE en JSON válido, sin texto adicional.`;

    const userText = `Analiza la foto del paquete de este producto de supermercado y devuelve un JSON con esta estructura EXACTA:
{
  "name": "nombre completo del producto incluyendo marca y presentación (ej: 'Leche Entera La Serenísima 1L')",
  "barcode": "código de barras EAN/UPC si es legible en la imagen, si no una cadena vacía",
  "category": "uno de estos ids: ${catList}",
  "supplier": "uno de estos proveedores si coincide con la marca, si no el más probable: ${supList}",
  "price": número estimado de precio de venta en pesos argentinos (ARS) según mercado actual,
  "cost": número estimado de costo (≈70% del precio),
  "minStock": número entero recomendado de stock mínimo (típicamente 10-30)
}
Responde SOLO con el JSON, sin markdown ni comentarios.`;

    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: system },
          {
            role: "user",
            content: [
              { type: "text", text: userText },
              { type: "image_url", image_url: { url: data.imageDataUrl } },
            ],
          },
        ],
      }),
    });

    if (!resp.ok) {
      const errBody = await resp.text();
      console.error(`AI gateway error [${resp.status}]: ${errBody}`);
      if (resp.status === 429) throw new Error("Límite de solicitudes alcanzado. Intenta en un momento.");
      if (resp.status === 402) throw new Error("Créditos de IA agotados. Agrega créditos en tu workspace.");
      throw new Error(`Error al analizar imagen (${resp.status})`);
    }

    const json = await resp.json();
    const content: string = json.choices?.[0]?.message?.content ?? "";
    const cleaned = content.replace(/```json\s*|\s*```/g, "").trim();
    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      throw new Error("La IA no devolvió un JSON válido");
    }
    return parsed;
  });
