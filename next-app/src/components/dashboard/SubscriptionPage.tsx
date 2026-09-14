import type { DashboardData } from "@/lib/dashboard-helpers";
import { formatAmount, formatDate, statusClass } from "@/lib/dashboard-helpers";
import { NoPlanCard, PlanCard } from "./PlanCard";
import styles from "./Dashboard.module.css";

// Port 1:1 z renderSubscriptionPage() w dashboard/index.html.
export default function SubscriptionPage({
  active,
  data,
  loaded,
  error,
}: {
  active: boolean;
  data: DashboardData | null;
  loaded: boolean;
  error: string | null;
}) {
  const sub = data?.subscription || null;
  const invoices = data?.invoices || [];

  return (
    <div className={`${styles.page} ${active ? styles.active : ""}`}>
      <div className={styles["section-header"]}>
        <h1>Plan i płatności</h1>
        <p>Twoja aktywna subskrypcja i historia faktur</p>
      </div>

      {error ? (
        <div className={styles["error-box"]}>⚠ {error}</div>
      ) : !loaded ? (
        <div className={styles["loading-overlay"]}>
          <div className={styles.spinner}></div>
          <div className={styles["loading-text"]}>Pobieranie danych ze Stripe…</div>
        </div>
      ) : (
        <>
          {sub ? (
            <>
              <PlanCard sub={sub} />
              <div className={styles["btn-row"]}>
                {sub.status === "active" && !sub.cancel_at_period_end && (
                  <a href="mailto:hello@webgen.pl?subject=Rezygnacja z subskrypcji webgen" className={`${styles.btn} ${styles["btn-danger"]} ${styles["btn-sm"]}`}>
                    Anuluj subskrypcję
                  </a>
                )}
              </div>
            </>
          ) : (
            <NoPlanCard />
          )}

          <div className={styles.card} style={{ marginTop: 24 }}>
            <div className={styles["card-title"]}>Historia faktur</div>
            {invoices.length > 0 ? (
              invoices.map((inv) => (
                <div className={styles["invoice-row"]} key={inv.id}>
                  <div className={styles["invoice-num"]}>{inv.number || inv.id.slice(-8)}</div>
                  <div className={styles["invoice-date"]}>{formatDate(inv.date)}</div>
                  <div className={styles["invoice-amount"]}>{formatAmount(inv.amount, inv.currency)}</div>
                  <div className={styles["invoice-status"]}>
                    <span className={`${styles["status-badge"]} ${styles[statusClass(inv.status)]}`}>
                      {inv.status === "paid" ? "✓ Zapłacona" : inv.status}
                    </span>
                  </div>
                  <div className={styles["invoice-pdf"]}>
                    {inv.pdf ? (
                      <a href={inv.pdf} target="_blank" rel="noreferrer">
                        PDF ↓
                      </a>
                    ) : null}
                  </div>
                </div>
              ))
            ) : (
              <div style={{ padding: "20px 0", textAlign: "center", color: "var(--muted)", fontSize: 14 }}>
                Brak faktur — pojawią się po pierwszej płatności.
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
