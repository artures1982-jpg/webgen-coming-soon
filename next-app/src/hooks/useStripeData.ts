"use client";

import { useEffect, useState } from "react";
import type { DashboardData } from "@/lib/dashboard-helpers";

// Port 1:1 z loadStripeData() w dashboard/index.html — GET /api/dashboard-data z
// tokenem Clerk zamiast tylko emaila w query (weryfikacja realnej sesji po stronie
// serwera, patrz src/app/api/dashboard-data/route.ts).
export function useStripeData(email: string | null, getAuthHeaders: () => Promise<Record<string, string>>) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!email) return;
    let cancelled = false;

    (async () => {
      try {
        const headers = await getAuthHeaders();
        const res = await fetch("/api/dashboard-data?email=" + encodeURIComponent(email), { headers });
        const json = await res.json();
        if (cancelled) return;
        setData(json);
        setLoaded(true);
      } catch {
        if (cancelled) return;
        setError("Nie udało się pobrać danych. Sprawdź połączenie.");
        setLoaded(true);
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email]);

  return { data, loaded, error };
}
