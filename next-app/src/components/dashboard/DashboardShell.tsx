"use client";

import { useCallback, useEffect, useState } from "react";
import type { MouseEvent } from "react";
import { useAuth, useClerk, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useMessages } from "@/hooks/useMessages";
import { useStripeData } from "@/hooks/useStripeData";
import type { GeneratedSite } from "@/lib/dashboard-helpers";
import OverviewPage from "./OverviewPage";
import WebsitePage from "./WebsitePage";
import SubscriptionPage from "./SubscriptionPage";
import AddonsPage from "./AddonsPage";
import MessagesPage from "./MessagesPage";
import AccountPage from "./AccountPage";
import styles from "./Dashboard.module.css";

type PageId = "overview" | "website" | "subscription" | "addons" | "messages" | "account";

const NAV_ITEMS: { id: PageId; icon: string; label: string }[] = [
  { id: "overview", icon: "🏠", label: "Przegląd" },
  { id: "website", icon: "🌐", label: "Moja strona" },
  { id: "subscription", icon: "💳", label: "Plan i płatności" },
  { id: "addons", icon: "✨", label: "Dodatki" },
  { id: "messages", icon: "💬", label: "Wiadomości" },
  { id: "account", icon: "⚙️", label: "Ustawienia" },
];

// Port 1:1 z dashboard/index.html — SPA z jednym <html>, przełączanie stron przez
// klasę .active (nie unmount/remount) tak jak w oryginalnym showPage(), teraz przez
// stan Reacta. Auth: window.getClerk()/window.Clerk zastąpione przez useUser/useAuth/
// useClerk z @clerk/nextjs (Faza 3) — to samo zachowanie (redirect na /login/ jeśli
// niezalogowany), ale przez idiomatyczne hooki zamiast ręcznej inicjalizacji SDK.
export default function DashboardShell() {
  const { isLoaded, isSignedIn, user } = useUser();
  const { getToken } = useAuth();
  const { signOut } = useClerk();
  const router = useRouter();

  const [activePage, setActivePage] = useState<PageId>("overview");
  // Lazy initializer, nie useEffect+setState — jednorazowy odczyt localStorage przy
  // montowaniu jest dozwolonym wyjątkiem od reguły czystości renderu, w przeciwieństwie
  // do wywołania setState wewnątrz efektu (patrz useMessages.ts, ten sam wzorzec).
  const [firma] = useState<Record<string, unknown> | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      return JSON.parse(localStorage.getItem("wg_firma") || "null");
    } catch {
      return null;
    }
  });
  const [localGenerated] = useState<GeneratedSite | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      return JSON.parse(localStorage.getItem("wg_generated") || "null");
    } catch {
      return null;
    }
  });
  // localStorage istnieje tylko na tej samej domenie/przeglądarce, w której klient
  // wygenerował stronę — na innym urządzeniu (albo po aktywacji płatnego planu,
  // gdzie deploy robi teraz webhook Stripe zamiast klienta, patrz
  // api/webhooks/stripe/route.ts) tego klucza po prostu nie ma. Fallback na
  // unsafeMetadata Clerk (jedyne trwałe, wielo-urządzeniowe źródło slug/URL) —
  // niepełny (bez html/danych firmowych, WebsitePage już to obsługuje jako
  // opcjonalne pola), ale wystarczający żeby link do strony w ogóle się pokazał.
  // Musi być liczone przy KAŻDYM renderze (nie lazy useState) — user.unsafeMetadata
  // z Clerka jest dostępne dopiero po isLoaded, czyli nie na pierwszym renderze.
  const clerkMeta = user?.unsafeMetadata as { firma_slug?: string; site_url?: string; site_plan?: string; site_activated_at?: string } | undefined;
  const generated: GeneratedSite | null =
    localGenerated ||
    (clerkMeta?.firma_slug
      ? { slug: clerkMeta.firma_slug, plan: clerkMeta.site_plan, created: clerkMeta.site_activated_at }
      : null);

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.replace("/login/?redirect=" + encodeURIComponent(window.location.pathname));
    }
  }, [isLoaded, isSignedIn, router]);

  const email = user?.primaryEmailAddress?.emailAddress || "";
  const created = user?.createdAt ? new Date(user.createdAt).toLocaleDateString("pl-PL") : "—";

  const getAuthHeaders = useCallback(async (): Promise<Record<string, string>> => {
    if (!isSignedIn) return {};
    const token = await getToken();
    return token ? { Authorization: "Bearer " + token } : {};
  }, [isSignedIn, getToken]);

  const { data: stripeData, loaded: stripeLoaded, error: stripeError } = useStripeData(email || null, getAuthHeaders);
  const { messages, unreadCount, markAllReadDelayed, submitQuestionnaire } = useMessages();

  // Port 1:1: renderMessages() w oryginale planuje "oznacz jako przeczytane" po 800ms
  // przy KAŻDYM wywołaniu — w init (niezależnie od aktywnej strony) i przy każdym
  // wejściu na zakładkę Wiadomości. Odtworzone jako dwa niezależne triggery.
  useEffect(() => {
    markAllReadDelayed();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    if (activePage === "messages") markAllReadDelayed();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activePage]);

  function visitSite(e: MouseEvent) {
    e.preventDefault();
    const slug = generated?.slug || (firma?.slug as string | undefined);
    if (slug) window.open("https://" + slug + ".webgen.pl", "_blank");
    else setActivePage("website");
  }

  function handleSubmitQuestionnaire(idx: number, answers: Record<string, string>) {
    getAuthHeaders().then((headers) => submitQuestionnaire(idx, answers, headers));
  }

  function doLogout() {
    if (confirm("Wylogować się?")) {
      signOut().then(() => router.replace("/login/?from=logout"));
    }
  }

  const avatarLetter = email ? email[0].toUpperCase() : "?";

  if (!isLoaded || !isSignedIn) return null;

  return (
    <div className={styles.root}>
      <nav className={styles.nav}>
        <Link href="/" className={styles["nav-logo"]}>
          <div className={styles["nav-logo-mark"]}>W</div>
          <div className={styles["nav-logo-name"]}>
            web<span>gen</span>
          </div>
        </Link>
        <div className={styles["nav-spacer"]}></div>
        <a
          className={styles["nav-msg-btn"]}
          href="#"
          title="Wiadomości"
          onClick={(e) => {
            e.preventDefault();
            setActivePage("messages");
          }}
        >
          💬
          <span className={`${styles["nav-badge"]} ${unreadCount > 0 ? styles.visible : ""}`}>{unreadCount > 9 ? "9+" : unreadCount}</span>
        </a>
        <div className={styles["nav-user"]} onClick={doLogout}>
          <div className={styles["nav-avatar"]}>{avatarLetter}</div>
          <span className={styles["nav-email"]}>{email}</span>
        </div>
        <button className={styles["nav-logout"]} onClick={doLogout}>
          Wyloguj
        </button>
      </nav>

      <div className={styles.layout}>
        <aside className={styles.sidebar}>
          <div className={styles["sidebar-label"]}>Twoje konto</div>
          {NAV_ITEMS.map((item) => (
            <a
              key={item.id}
              className={`${styles["nav-item"]} ${activePage === item.id ? styles.active : ""}`}
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setActivePage(item.id);
              }}
            >
              <span className={styles["ni-icon"]}>{item.icon}</span> {item.label}
              {item.id === "messages" && (
                <span className={`${styles["ni-badge"]} ${unreadCount > 0 ? styles.visible : ""}`}>{unreadCount > 9 ? "9+" : unreadCount}</span>
              )}
            </a>
          ))}
          <div className={styles["sidebar-help"]} style={{ marginTop: "auto" }}>
            <div className={styles["sidebar-label"]}>Pomoc</div>
            <a className={styles["nav-item"]} href="mailto:hello@webgen.pl">
              <span className={styles["ni-icon"]}>✉️</span> Kontakt z nami
            </a>
            <a className={styles["nav-item"]} href="/cennik/">
              <span className={styles["ni-icon"]}>📊</span> Cennik
            </a>
            <a className={styles["nav-item"]} href="/generator/">
              <span className={styles["ni-icon"]}>⚡</span> Generator stron
            </a>
          </div>
        </aside>

        <main className={styles.main}>
          <OverviewPage
            active={activePage === "overview"}
            email={email}
            data={stripeData}
            loaded={stripeLoaded}
            error={stripeError}
            unreadCount={unreadCount}
            onOpenMessages={() => setActivePage("messages")}
            onVisitSite={visitSite}
          />
          <WebsitePage
            active={activePage === "website"}
            generated={generated}
            firmaSlug={(firma?.slug as string) || null}
            getAuthHeaders={getAuthHeaders}
          />
          <SubscriptionPage active={activePage === "subscription"} data={stripeData} loaded={stripeLoaded} error={stripeError} />
          <AddonsPage active={activePage === "addons"} email={email} data={stripeData} generated={generated} getAuthHeaders={getAuthHeaders} />
          <MessagesPage active={activePage === "messages"} messages={messages} unreadCount={unreadCount} onSubmitQuestionnaire={handleSubmitQuestionnaire} />
          {user && (
            <AccountPage active={activePage === "account"} email={email} created={created} generated={generated} firma={firma} user={user} />
          )}
        </main>
      </div>
    </div>
  );
}
