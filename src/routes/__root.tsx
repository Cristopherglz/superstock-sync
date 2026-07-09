import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/outfit/500.css";
import "@fontsource/outfit/600.css";
import "@fontsource/outfit/700.css";
import "@fontsource/outfit/800.css";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { AppProvider } from "../lib/store";
import { Toaster } from "../components/ui/sonner";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-soft px-4">
      <div className="max-w-md text-center">
        <h1 className="text-8xl font-bold text-gradient-brand">404</h1>
        <h2 className="mt-4 text-xl font-semibold">Página no encontrada</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          La página que buscás no existe o fue movida.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-gradient-brand px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-elegant transition hover:opacity-90"
          >
            Ir al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold">Esta página no cargó</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Algo salió mal. Podés reintentar o volver al inicio.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => { router.invalidate(); reset(); }}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Reintentar
          </button>
          <a href="/" className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-accent">
            Ir al inicio
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { name: "theme-color", content: "#2563eb" },
      { name: "mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-status-bar-style", content: "default" },
      { name: "apple-mobile-web-app-title", content: "Nimbus Stock" },
      { title: "Nimbus Stock — Control de inventario para supermercados" },
      { name: "description", content: "Sistema moderno de control de stock con API para tienda online. Gestión de productos, alertas, categorías y sincronización en tiempo real." },
      { property: "og:title", content: "Nimbus Stock — Control de inventario para supermercados" },
      { property: "og:description", content: "Sistema moderno de control de stock con API para tienda online. Gestión de productos, alertas, categorías y sincronización en tiempo real." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Nimbus Stock — Control de inventario para supermercados" },
      { name: "twitter:description", content: "Sistema moderno de control de stock con API para tienda online. Gestión de productos, alertas, categorías y sincronización en tiempo real." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/ef497f82-63df-4024-93e7-ed2cdf35ec1f/id-preview-e0774321--09cb8423-1722-42fe-bc84-33fe45811e13.lovable.app-1783427933280.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/ef497f82-63df-4024-93e7-ed2cdf35ec1f/id-preview-e0774321--09cb8423-1722-42fe-bc84-33fe45811e13.lovable.app-1783427933280.png" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", type: "image/png", href: "/app-icon-192.png" },
      { rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
      { rel: "manifest", href: "/manifest.webmanifest" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <AppProvider>
        <Outlet />
        <Toaster richColors position="top-right" />
      </AppProvider>
    </QueryClientProvider>
  );
}
