import { formatAmount, formatDate, planLabel, statusClass, statusLabel } from "@/lib/dashboard-helpers";
import type { Subscription } from "@/lib/dashboard-helpers";
import styles from "./Dashboard.module.css";

// Port 1:1 z buildPlanCard()/buildNoPlanCard() w dashboard/index.html — używane
// zarówno na stronie "Przegląd" jak i "Plan i płatności" w oryginale, tu jako jeden
// współdzielony komponent zamiast dwóch kopii tego samego stringa HTML.
export function PlanCard({ sub }: { sub: Subscription }) {
  return (
    <div className={`${styles["plan-card"]} ${styles["active-plan"]}`}>
      <div className={styles["plan-header"]}>
        <div>
          <div className={styles["plan-name"]}>{planLabel(sub.plan_name, sub.plan_amount, sub.plan_currency)}</div>
          <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 4, fontFamily: "var(--mono)" }}>
            sub_{(sub.id || "").slice(-10)}
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div className={styles["plan-price"]}>
            {formatAmount(sub.plan_amount, sub.plan_currency)}
            <span>/mies.</span>
          </div>
          <span className={`${styles["status-badge"]} ${styles[statusClass(sub.status)]}`} style={{ marginTop: 6, display: "inline-flex" }}>
            <span className={styles["status-dot"]}></span>
            {statusLabel(sub.status)}
          </span>
        </div>
      </div>
      <div className={styles["plan-dates"]}>
        <div className={styles["plan-date-item"]}>
          <div className={styles["plan-date-label"]}>Okres od</div>
          <div className={styles["plan-date-val"]}>{formatDate(sub.current_period_start)}</div>
        </div>
        <div className={styles["plan-date-item"]}>
          <div className={styles["plan-date-label"]}>Odnowienie</div>
          <div className={styles["plan-date-val"]}>{formatDate(sub.current_period_end)}</div>
        </div>
      </div>
      {sub.cancel_at_period_end && (
        <div className={styles["warn-box"]} style={{ marginTop: 14 }}>
          ⚠ Subskrypcja wygaśnie {formatDate(sub.current_period_end)} i nie zostanie odnowiona.
        </div>
      )}
    </div>
  );
}

export function NoPlanCard() {
  return (
    <div className={styles["no-plan"]}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>📭</div>
      <h3>Brak aktywnego planu</h3>
      <p>
        Kup plan Pro żeby odblokować personalizację AI, SEO i aktualizacje na życzenie.
        <br />
        Plan Free wystarczy żeby aktywować darmowy szablon.
      </p>
      <a href="/cennik/" className={`${styles.btn} ${styles["btn-primary"]}`}>
        Zobacz plany i ceny →
      </a>
    </div>
  );
}
