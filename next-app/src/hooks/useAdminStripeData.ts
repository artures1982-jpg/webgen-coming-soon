"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";

// Woła NOWY /api/admin/stripe-summary (patrz komentarz w tym route'cie dla pełnego
// wyjaśnienia, dlaczego oryginalny loadStripeAdminData() z admin/index.html był
// strukturalnie martwy — pętlował po 5 hardcoded e-mailach bez nagłówka Authorization
// przez endpoint, który i tak ignoruje ?email= na rzecz zweryfikowanej sesji).
export type AdminStripeKpis = {
  mrr: number;
  payingClients: number;
};

export function useAdminStripeData() {
  const { getToken } = useAuth();
  const [kpis, setKpis] = useState<AdminStripeKpis | null>(null);
  const [error, setError] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const token = await getToken();
        const headers: Record<string, string> = token ? { Authorization: "Bearer " + token } : {};
        const res = await fetch("/api/admin/stripe-summary", { headers });
        if (!res.ok) throw new Error("HTTP " + res.status);
        const data = await res.json();
        if (cancelled) return;
        setKpis({ mrr: data.mrr || 0, payingClients: data.payingClients || 0 });
        setLoaded(true);
      } catch {
        if (cancelled) return;
        setError(true);
        setLoaded(true);
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { kpis, error, loaded };
}
