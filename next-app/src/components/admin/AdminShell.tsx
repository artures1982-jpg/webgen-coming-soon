"use client";

import { useState } from "react";
import { SignIn, useClerk, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useAdminStripeData } from "@/hooks/useAdminStripeData";
import { ADMIN_ALLOWED_EMAILS } from "@/lib/admin-allowlist";
import styles from "./Admin.module.css";

// Port CZĘŚCIOWY z admin/index.html (checkAdminAuth/mountAdminSignIn/adminUnlock),
// plus NOWY dashboard (nie port — patrz src/app/api/admin/stripe-summary/route.ts):
// oryginalny loadStripeAdminData() był strukturalnie martwy (401 na każde
// zapytanie, bo /api/dashboard-data ignoruje ?email= na rzecz zweryfikowanej
// sesji — ten sam mechanizm bezpieczeństwa, który dziś chroni dane klientów).
// Reszta panelu (sidebar z 10 sekcjami, kanban zadań, Outreach CRM, SEO Monitor,
// Generator AI, Ustawienia, tabela klientów, tabela stron, logi deployów) była
// 100% fasadą albo strukturalnie złamana — Artur zdecydował portować tylko to,
// co faktycznie działa.
//
// routing="virtual" z oryginału (Clerk.mountSignIn) niedostępne w tej wersji
// @clerk/nextjs (Core 3) — routing="hash" jak w RegistrationStep.tsx generatora.

const CLERK_APPEARANCE = {
  variables: {
    colorPrimary: "#00E5A0",
    colorBackground: "#07090F",
    colorForeground: "#F3F6FC",
    colorMutedForeground: "#8E97AC",
    fontFamily: "'Bricolage Grotesque', sans-serif",
    borderRadius: "9px",
  },
};

function formatPln(n: number) {
  return n.toLocaleString("pl-PL") + " zł";
}

export default function AdminShell() {
  const { isLoaded, isSignedIn, user } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();

  if (!isLoaded) return null;

  const email = user?.primaryEmailAddress?.emailAddress || "";
  const allowed = isSignedIn && ADMIN_ALLOWED_EMAILS.includes(email);
  const deniedButSignedIn = isSignedIn && !allowed;

  if (!allowed) {
    return (
      <div className={styles["login-overlay"]}>
        <div className={styles["login-box"]}>
          <div className={styles["login-header"]}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: "linear-gradient(135deg,#00E5A0,#0066FF,#6B5FC9)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "var(--mono)",
                fontSize: 14,
                fontWeight: 700,
                color: "#fff",
              }}
            >
              W
            </div>
            <div style={{ fontSize: 18, fontWeight: 700 }}>
              webgen <span style={{ color: "rgba(94,107,133,.5)" }}>/ admin</span>
            </div>
          </div>

          {deniedButSignedIn && (
            <div className={styles["login-error"]}>Ten adres email nie ma dostępu do panelu admina.</div>
          )}

          {deniedButSignedIn ? (
            <DeniedGate onRetry={() => signOut()} />
          ) : (
            <SignIn routing="hash" appearance={CLERK_APPEARANCE} />
          )}

          <div className={styles["login-footer"]}>Panel administracyjny webgen.pl · dostęp tylko dla właściciela</div>
        </div>
      </div>
    );
  }

  return <AdminDashboard email={email} onLogout={() => signOut().then(() => router.replace("/"))} />;
}

// Port 1:1 z gałęzią "zalogowany, ale nie na allowliście" w checkAdminAuth() —
// oryginał od razu woła Clerk.signOut() i remountuje SignIn. Tu, żeby uniknąć
// wywoływania signOut() w efekcie renderu, decyzja jest za jednym kliknięciem.
function DeniedGate({ onRetry }: { onRetry: () => void }) {
  return (
    <button
      onClick={onRetry}
      style={{
        width: "100%",
        background: "transparent",
        border: "1px solid var(--border2)",
        color: "var(--muted)",
        padding: "10px 16px",
        borderRadius: 9,
        fontSize: 13,
        cursor: "pointer",
        fontFamily: "var(--head)",
      }}
    >
      Wyloguj i zaloguj innym kontem →
    </button>
  );
}

function AdminDashboard({ email, onLogout }: { email: string; onLogout: () => void }) {
  const { kpis, error, loaded } = useAdminStripeData();
  const [now] = useState(() => new Date().toLocaleDateString("pl-PL", { day: "numeric", month: "long", year: "numeric" }));

  return (
    <div className={styles.root}>
      <header className={styles.topbar}>
        <div className={styles["tb-logo"]}>
          <div className={styles["tb-logo-mark"]}>W</div>
          <div className={styles["tb-logo-text"]}>
            web<span style={{ color: "var(--green)" }}>gen</span>.pl
          </div>
          <div className={styles["tb-logo-badge"]}>ADMIN</div>
        </div>
        <div className={styles["tb-right"]}>
          <span className={styles["tb-email"]}>{email}</span>
          <button className={styles["tb-logout"]} onClick={onLogout}>
            Wyloguj
          </button>
        </div>
      </header>

      <div className={styles.content}>
        <div className={styles["ph-title"]}>Dashboard webgen.pl</div>
        <div className={styles["ph-sub"]}>{now}</div>

        {error ? (
          <div style={{ color: "var(--red)", fontFamily: "var(--mono)", fontSize: 13 }}>
            ⚠ Błąd pobierania danych ze Stripe.
          </div>
        ) : (
          <div className={styles.stats}>
            <div className={`${styles.stat} ${styles.g}`}>
              <div className={styles["stat-label"]}>MRR</div>
              <div className={styles["stat-val"]} style={{ color: "var(--green)" }}>
                {!loaded ? "…" : formatPln(kpis!.mrr)}
              </div>
            </div>
            <div className={`${styles.stat} ${styles.b}`}>
              <div className={styles["stat-label"]}>Płacący klienci</div>
              <div className={styles["stat-val"]}>{!loaded ? "…" : kpis!.payingClients}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
