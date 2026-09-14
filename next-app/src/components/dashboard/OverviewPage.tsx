import Link from "next/link";
import type { MouseEvent, ReactNode } from "react";
import { formatAmount, formatDate, planLabel, statusClass, statusLabel } from "@/lib/dashboard-helpers";
import type { DashboardData } from "@/lib/dashboard-helpers";
import { NoPlanCard, PlanCard } from "./PlanCard";
import styles from "./Dashboard.module.css";

// Port 1:1 z renderOverviewPage/renderNoCustomer/renderError w dashboard/index.html.
export default function OverviewPage({
  active,
  email,
  data,
  loaded,
  error,
  unreadCount,
  onOpenMessages,
  onVisitSite,
}: {
  active: boolean;
  email: string;
  data: DashboardData | null;
  loaded: boolean;
  error: string | null;
  unreadCount: number;
  onOpenMessages: () => void;
  onVisitSite: (e: MouseEvent) => void;
}) {
  const sub = data?.subscription || null;
  const hasCustomer = !!data?.customer;

  let statusNode: ReactNode = "…";
  let statusSub = "";
  let planText = "…";
  let planSub = "";
  let renewalText = "…";
  let renewalSub = "";
  let overviewSub = "Ładuję dane konta…";
  let planCard: ReactNode = null;

  if (error) {
    statusNode = "Błąd";
  } else if (sub) {
    statusNode = (
      <span className={`${styles["status-badge"]} ${styles[statusClass(sub.status)]}`}>
        <span className={styles["status-dot"]}></span>
        {statusLabel(sub.status)}
      </span>
    );
    statusSub = "sub_" + (sub.id || "").slice(-8);
    planText = planLabel(sub.plan_name, sub.plan_amount, sub.plan_currency);
    planSub = formatAmount(sub.plan_amount, sub.plan_currency) + "/mies.";
    renewalText = formatDate(sub.current_period_end);
    renewalSub = sub.cancel_at_period_end ? "⚠ Nie odnowi się" : "Automatyczne odnowienie";
    overviewSub = "Konto: " + (data?.customer?.email || email);
    planCard = <PlanCard sub={sub} />;
  } else if (loaded && !hasCustomer) {
    statusNode = "Nowe konto";
    planText = "Brak planu";
    renewalText = "—";
    overviewSub = "Witaj! Wybierz plan żeby uruchomić stronę.";
    planCard = <NoPlanCard />;
  } else if (loaded) {
    statusNode = "Brak subskrypcji";
    planText = "—";
    renewalText = "—";
    planCard = <NoPlanCard />;
  }

  return (
    <div className={`${styles.page} ${active ? styles.active : ""}`}>
      <div className={styles["section-header"]}>
        <h1>
          Cześć,{" "}
          <span
            style={{
              background: "var(--grad)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            {email ? email.split("@")[0] + "!" : "!"}
          </span>
        </h1>
        <p>{overviewSub}</p>
      </div>

      <div className={styles["stats-grid"]}>
        <div className={`${styles["stat-card"]} ${styles.green}`}>
          <div className={styles["stat-label"]}>Status konta</div>
          <div className={styles["stat-value"]} style={{ fontSize: 20 }}>
            {statusNode}
          </div>
          <div className={styles["stat-sub"]}>{statusSub}</div>
        </div>
        <div className={`${styles["stat-card"]} ${styles.blue}`}>
          <div className={styles["stat-label"]}>Aktywny plan</div>
          <div className={styles["stat-value"]} style={{ fontSize: 20 }}>
            {planText}
          </div>
          <div className={styles["stat-sub"]}>{planSub}</div>
        </div>
        <div className={`${styles["stat-card"]} ${styles.purple}`}>
          <div className={styles["stat-label"]}>Następna płatność</div>
          <div className={styles["stat-value"]} style={{ fontSize: 20 }}>
            {renewalText}
          </div>
          <div className={styles["stat-sub"]}>{renewalSub}</div>
        </div>
      </div>

      <div className={styles["qa-grid"]}>
        <Link className={styles["qa-card"]} href="/galeria" target="_blank">
          <span className={styles["qa-icon"]}>⚡</span>
          <span className={styles["qa-label"]}>Szablony</span>
          <span className={styles["qa-sub"]}>Przeglądaj galerię i wybierz szablon</span>
        </Link>
        <a className={styles["qa-card"]} href="#" onClick={onVisitSite}>
          <span className={styles["qa-icon"]}>🌐</span>
          <span className={styles["qa-label"]}>Otwórz stronę</span>
          <span className={styles["qa-sub"]}>Podejrzyj swoją stronę live</span>
        </a>
        <a
          className={styles["qa-card"]}
          href="#"
          onClick={(e) => {
            e.preventDefault();
            onOpenMessages();
          }}
        >
          <span className={styles["qa-icon"]}>💬</span>
          <span className={styles["qa-label"]}>Wiadomości</span>
          <span className={styles["qa-sub"]}>{unreadCount > 0 ? unreadCount + " nieprzeczytanych" : "Sprawdź powiadomienia"}</span>
        </a>
        <a className={styles["qa-card"]} href="mailto:hello@webgen.pl">
          <span className={styles["qa-icon"]}>🛟</span>
          <span className={styles["qa-label"]}>Wsparcie</span>
          <span className={styles["qa-sub"]}>Napisz do naszego zespołu</span>
        </a>
      </div>

      {planCard}
      {error && <div className={styles["error-box"]}>⚠ {error}</div>}
    </div>
  );
}
