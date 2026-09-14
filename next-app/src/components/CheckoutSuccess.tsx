"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import styles from "./CheckoutSuccess.module.css";

// Odpytuje /api/deploy-status co ~2s, aż webhook Stripe (api/webhooks/stripe/
// route.ts) skończy wdrażać stronę — deploy jest asynchroniczny względem tego
// przekierowania, więc w chwili wejścia na tę stronę strona może jeszcze nie
// istnieć. Patrz plan docelowego flow aktywacji: to zastępuje stary, złamany
// /success na webgen.pl (localStorage nie działał między domenami).
const POLL_INTERVAL_MS = 2000;
const TIMEOUT_MS = 30000;

type Status = "loading" | "ready" | "timeout" | "error";

export default function CheckoutSuccess({ sessionId }: { sessionId: string | null }) {
  const [status, setStatus] = useState<Status>(sessionId ? "loading" : "error");
  const [url, setUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const startedAtRef = useRef<number | null>(null);

  useEffect(() => {
    if (!sessionId) return;
    let cancelled = false;
    startedAtRef.current = Date.now();

    async function poll() {
      try {
        const res = await fetch("/api/deploy-status?session_id=" + encodeURIComponent(sessionId!));
        const data = await res.json();
        if (cancelled) return;

        if (!res.ok) {
          setStatus("error");
          setErrorMsg(data.error || "Nie udało się sprawdzić statusu aktywacji.");
          return;
        }
        if (data.ready) {
          setStatus("ready");
          setUrl(data.url);
          return;
        }
        if (Date.now() - (startedAtRef.current || 0) > TIMEOUT_MS) {
          setStatus("timeout");
          return;
        }
        setTimeout(poll, POLL_INTERVAL_MS);
      } catch {
        if (!cancelled) {
          setStatus("error");
          setErrorMsg("Błąd połączenia — spróbuj odświeżyć stronę.");
        }
      }
    }

    poll();
    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <p className={styles.eyebrow}>{"// Aktywacja strony"}</p>

        {status === "loading" && (
          <>
            <div className={styles.spinner} />
            <h1 className={styles.title}>Przygotowujemy Twoją stronę</h1>
            <p className={styles.hint}>Płatność przyjęta — trwa wdrożenie. To zwykle kilka sekund.</p>
          </>
        )}

        {status === "ready" && url && (
          <>
            <h1 className={styles.title}>Strona aktywna 🎉</h1>
            <p className={styles.hint}>Twoja strona działa pod adresem:</p>
            <a href={url} target="_blank" rel="noopener noreferrer" className={styles.link}>
              {url} →
            </a>
            <Link href="/dashboard" className={styles.dashboardLink}>
              Przejdź do panelu klienta →
            </Link>
          </>
        )}

        {status === "timeout" && (
          <>
            <h1 className={styles.title}>Przygotowanie trochę się przedłuża</h1>
            <p className={styles.hint}>
              Płatność na pewno przeszła — wdrożenie czasem trwa dłużej. Sprawdź panel klienta za chwilę albo napisz do
              nas, jeśli strona nie pojawi się w ciągu kilku minut.
            </p>
            <Link href="/dashboard" className={styles.link}>
              Przejdź do panelu klienta →
            </Link>
          </>
        )}

        {status === "error" && (
          <>
            <h1 className={styles.title}>Coś poszło nie tak</h1>
            <p className={styles.hint}>
              {sessionId ? errorMsg || "Nie udało się sprawdzić statusu aktywacji." : "Brak informacji o płatności w linku."}
            </p>
            <p className={styles.error}>Napisz do nas na hello@webgen.pl, jeśli problem się powtórzy.</p>
            <Link href="/dashboard" className={styles.dashboardLink}>
              Przejdź do panelu klienta →
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
