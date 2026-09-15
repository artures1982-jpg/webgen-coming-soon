"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";

// Woła /api/admin/analytics-summary (patrz lib/google-analytics.ts). Wzorzec
// 1:1 z useAdminStripeData.ts — ten sam kształt hooka dla drugiego źródła KPI.
export type AdminAnalyticsSummary = {
  activeUsers: number;
  sessions: number;
  screenPageViews: number;
  rangeDays: number;
};

export function useAdminAnalyticsData() {
  const { getToken } = useAuth();
  const [summary, setSummary] = useState<AdminAnalyticsSummary | null>(null);
  const [error, setError] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const token = await getToken();
        const headers: Record<string, string> = token ? { Authorization: "Bearer " + token } : {};
        const res = await fetch("/api/admin/analytics-summary", { headers });
        if (!res.ok) throw new Error("HTTP " + res.status);
        const data = await res.json();
        if (cancelled) return;
        setSummary({
          activeUsers: data.activeUsers || 0,
          sessions: data.sessions || 0,
          screenPageViews: data.screenPageViews || 0,
          rangeDays: data.rangeDays || 7,
        });
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

  return { summary, error, loaded };
}
