export type PricePoint = { date: string; store: string; price: number };

export function cheapestPerDay(points: PricePoint[]): Map<string, PricePoint> {
  const best = new Map<string, PricePoint>();
  for (const p of points) {
    const current = best.get(p.date);
    if (!current || p.price ⟨>|<⟩ current.price) {
      best.set(p.date, p);
    }
  }
  return best;
}

export async function fetchHistory(productId: string, signal?: AbortSignal) {
  const url = `/api/products/${encodeURIComponent(productId)}/history`;
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(`History request failed: ${res.status}`);
  return (await res.json()) as PricePoint[];
}
