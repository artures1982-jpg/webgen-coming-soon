"use client";

import { ADDON_CATALOG } from "@/lib/dashboard-helpers";
import type { Addon, DashboardData, GeneratedSite } from "@/lib/dashboard-helpers";
import styles from "./Dashboard.module.css";

// Port 1:1 z renderAddonsPage/addonRow/activateAddon w dashboard/index.html.
// data.subscription.items nigdy nie jest wypełnione przez /api/dashboard-data (ani w
// oryginale, ani w porcie — patrz src/app/api/dashboard-data/route.ts), więc
// "aktywne dodatki" zawsze wychodzi puste. To zachowanie 1:1 z produkcją, nie regresja.
export default function AddonsPage({
  active,
  email,
  data,
  generated,
  getAuthHeaders,
}: {
  active: boolean;
  email: string;
  data: DashboardData | null;
  generated: GeneratedSite | null;
  getAuthHeaders: () => Promise<Record<string, string>>;
}) {
  const activeItems = (data?.subscription?.items || []).map((i) => i.price_id || "");
  const catalog: Addon[] = ADDON_CATALOG.map((a) => ({ ...a, active: activeItems.includes(a.id) }));
  const monthly = catalog.filter((a) => !a.once);
  const once = catalog.filter((a) => a.once);
  const aktywne = monthly.filter((a) => a.active);

  async function activateAddon(addonId: string) {
    if (!email) {
      alert("Zaloguj się ponownie, żeby dokupić dodatek.");
      return;
    }
    try {
      const authHeaders = await getAuthHeaders();
      const res = await fetch("/api/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders },
        body: JSON.stringify({
          plan: "pro",
          billing: "month",
          addons: [addonId],
          firma_slug: generated?.slug || "",
          email,
        }),
      });
      const data = await res.json();
      if (data.checkout_url) window.location.href = data.checkout_url;
      else alert("Błąd: " + (data.error || "nie udało się utworzyć płatności"));
    } catch {
      alert("Błąd połączenia — spróbuj ponownie.");
    }
  }

  function AddonRow({ a }: { a: Addon }) {
    return (
      <div className={styles["addon-row"]}>
        <div className={styles["addon-row-icon"]}>{a.icon}</div>
        <div className={styles["addon-row-info"]}>
          <div className={styles["addon-row-name"]}>{a.name}</div>
          <div className={styles["addon-row-desc"]}>{a.desc}</div>
        </div>
        <div className={styles["addon-row-price"]}>{a.price}</div>
        <div className={styles["addon-row-status"]}>
          {a.active ? (
            <span className={`${styles["status-badge"]} ${styles.active}`}>
              <span className={styles["status-dot"]}></span>Aktywny
            </span>
          ) : (
            <button type="button" onClick={() => activateAddon(a.id)} className={`${styles.btn} ${styles["btn-outline"]} ${styles["btn-sm"]}`}>
              Dodaj
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.page} ${active ? styles.active : ""}`}>
      <div className={styles["section-header"]}>
        <h1>Dodatki</h1>
        <p>Rozszerz swoją stronę o dodatkowe funkcje i zasięg</p>
      </div>

      {aktywne.length > 0 && (
        <div className={styles.card}>
          <div className={styles["card-title"]}>✅ Aktywne dodatki</div>
          {aktywne.map((a) => (
            <AddonRow a={a} key={a.id} />
          ))}
        </div>
      )}

      <div className={styles.card}>
        <div className={styles["card-title"]}>{"// Miesięczne — anuluj w każdej chwili"}</div>
        {monthly.map((a) => (
          <AddonRow a={a} key={a.id} />
        ))}
      </div>

      <div className={styles.card}>
        <div className={styles["card-title"]}>{"// Jednorazowe — aktywacja w 48h"}</div>
        {once.map((a) => (
          <AddonRow a={a} key={a.id} />
        ))}
      </div>

      <div className={styles["info-box"]}>
        Dodatki działają w ramach planu Pro — jeśli nie masz go jeszcze aktywnego, checkout doda go razem z wybranym dodatkiem.
      </div>
    </div>
  );
}
