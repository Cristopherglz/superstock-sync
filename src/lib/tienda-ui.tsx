import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";

type FlyPayload = { image: string; from: { x: number; y: number } };
type Ctx = {
  cartAnchor: { x: number; y: number } | null;
  registerCartAnchor: (pos: { x: number; y: number } | null) => void;
  flyToCart: (payload: FlyPayload) => void;
  bump: number;
};

const TiendaCtx = createContext<Ctx | null>(null);

export function TiendaUIProvider({ children }: { children: ReactNode }) {
  const [cartAnchor, setCartAnchor] = useState<{ x: number; y: number } | null>(null);
  const [flights, setFlights] = useState<Array<{ id: number; image: string; from: { x: number; y: number }; to: { x: number; y: number } }>>([]);
  const [bump, setBump] = useState(0);
  const idRef = useRef(0);

  const registerCartAnchor = useCallback((pos: { x: number; y: number } | null) => {
    setCartAnchor(pos);
  }, []);

  const flyToCart = useCallback(
    (payload: FlyPayload) => {
      if (!cartAnchor) {
        setBump((b) => b + 1);
        return;
      }
      const id = ++idRef.current;
      setFlights((f) => [...f, { id, image: payload.image, from: payload.from, to: cartAnchor }]);
      setTimeout(() => {
        setFlights((f) => f.filter((x) => x.id !== id));
        setBump((b) => b + 1);
      }, 750);
    },
    [cartAnchor],
  );

  return (
    <TiendaCtx.Provider value={{ cartAnchor, registerCartAnchor, flyToCart, bump }}>
      {children}
      <div className="pointer-events-none fixed inset-0 z-[100]">
        {flights.map((f) => (
          <FlyingItem key={f.id} image={f.image} from={f.from} to={f.to} />
        ))}
      </div>
    </TiendaCtx.Provider>
  );
}

function FlyingItem({ image, from, to }: { image: string; from: { x: number; y: number }; to: { x: number; y: number } }) {
  const [pos, setPos] = useState(from);
  const [scale, setScale] = useState(1);
  useEffect(() => {
    const t = requestAnimationFrame(() => {
      setPos(to);
      setScale(0.2);
    });
    return () => cancelAnimationFrame(t);
  }, [to]);
  return (
    <img
      src={image}
      alt=""
      className="absolute h-16 w-16 rounded-xl object-cover shadow-elevated ring-2 ring-primary"
      style={{
        left: 0,
        top: 0,
        transform: `translate(${pos.x - 32}px, ${pos.y - 32}px) scale(${scale}) rotate(${scale === 1 ? 0 : 20}deg)`,
        transition: "transform 700ms cubic-bezier(0.5, -0.2, 0.4, 1.2), opacity 700ms ease-in",
        opacity: scale === 1 ? 1 : 0.2,
      }}
    />
  );
}

export function useTiendaUI() {
  const ctx = useContext(TiendaCtx);
  if (!ctx) throw new Error("useTiendaUI must be used within TiendaUIProvider");
  return ctx;
}
