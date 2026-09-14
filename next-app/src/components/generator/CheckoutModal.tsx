"use client";

import { useState } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import { effectivePrice } from "@/lib/generator-helpers";
import { useGenerator } from "./GeneratorContext";
import styles from "./Generator.module.css";

// Port 1:1 z #checkout-modal + openCheckout/closeCheckout/goToCheckout/
// activateFreeSite w generator/index.html. Naprawiony realny bug z oryginału:
// activateFreeSite() tam czytała window._generatedSlug/window._generatedHTML,
// które nigdy nie były ustawiane nigdzie w pliku — każda aktywacja przez zwykły
// UI zapisywała do localStorage pusty html i slug "moja-firma". Tu slug/html
// idą wprost ze stanu komponentu, więc ten bug nie może się powtórzyć.
// Drobne, celowe ulepszenie: pole email w modalu jest wstępnie wypełnione
// adresem konta (user i tak jest już zalogowany w tym miejscu flow) — w
// oryginale zawsze zaczynało puste mimo zalogowania.
//
// Ten komponent jest montowany przez rodzica TYLKO gdy modal jest otwarty
// ({checkoutOpen && <CheckoutModal .../>}) — dzięki temu stan email/activated
// może być lazy-initializowany zamiast resetowany efektem przy każdym otwarciu.
export default function CheckoutModal({ onClose }: { onClose: () => void }) {
  const { gen, form } = useGenerator();
  const { user } = useUser();
  const { getToken } = useAuth();
  const [email, setEmail] = useState(() => user?.primaryEmailAddress?.emailAddress || "");
  const [submitting, setSubmitting] = useState(false);
  const [activated, setActivated] = useState<{ url: string } | null>(null);

  const billingLabel = gen.billing === "year" ? "zł/mies. (rocznie)" : "zł/mies.";
  const displayPrice = effectivePrice(gen.planPrice, gen.billing);

  async function activateFreeSite(accountEmail: string) {
    if (!gen.generatedHTML) {
      alert("Brak wygenerowanej strony do aktywacji — wróć do kroku generowania.");
      return;
    }
    setSubmitting(true);
    try {
      const token = await getToken();
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = "Bearer " + token;
      const res = await fetch("/api/deploy", {
        method: "POST",
        headers,
        body: JSON.stringify({ slug: gen.slug, html: gen.generatedHTML, contact_email: form.email }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Nie udało się aktywować strony");

      // Celowo NIE czyścimy wg_generated — /dashboard/ czyta ten sam klucz, żeby
      // pokazać klientowi jego stronę.
      localStorage.setItem(
        "wg_generated",
        JSON.stringify({
          slug: gen.slug,
          html: gen.generatedHTML,
          contact_email: form.email,
          email: accountEmail,
          created: new Date().toISOString(),
          plan: gen.plan,
          branza: gen.branza,
          miasto: form.miasto,
          telefon: form.telefon,
          adres: form.adres,
          godz_pon_pt: form.godzPonPt,
          godz_sob: form.godzSob,
        })
      );

      setActivated({ url: data.url });
    } catch (err) {
      alert("Błąd aktywacji: " + (err instanceof Error ? err.message : String(err)) + " — spróbuj ponownie albo napisz na hello@webgen.pl");
    } finally {
      setSubmitting(false);
    }
  }

  async function goToCheckout() {
    if (!email || !email.includes("@")) {
      alert("Wpisz poprawny email");
      return;
    }
    if (gen.plan === "free") {
      await activateFreeSite(email);
      return;
    }
    if (!gen.generatedHTML) {
      alert("Brak wygenerowanej strony do aktywacji — wróć do kroku generowania.");
      return;
    }
    setSubmitting(true);
    try {
      const token = await getToken();
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = "Bearer " + token;
      const res = await fetch("/api/create-checkout", {
        method: "POST",
        headers,
        body: JSON.stringify({
          plan: gen.plan,
          billing: gen.billing,
          firma_slug: gen.slug,
          html: gen.generatedHTML,
          contact_email: form.email,
        }),
      });
      const data = await res.json();
      if (data.checkout_url) {
        window.location.href = data.checkout_url;
      } else {
        throw new Error(data.error || "Błąd");
      }
    } catch (err) {
      alert("Błąd checkout: " + (err instanceof Error ? err.message : String(err)));
      setSubmitting(false);
    }
  }

  return (
    <div className={`${styles["modal-overlay"]} ${styles.active}`} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal}>
        <button className={styles["modal-close"]} onClick={onClose}>
          ✕
        </button>
        {activated ? (
          <>
            <h3>Strona aktywna 🎉</h3>
            <p>Twoja strona działa pod adresem:</p>
            <p style={{ margin: "14px 0" }}>
              <a href={activated.url} target="_blank" rel="noopener noreferrer" style={{ color: "var(--green)", fontWeight: 700, fontSize: 16 }}>
                {activated.url} →
              </a>
            </p>
            <p className={styles["modal-note"]}>Pierwsze 6 miesięcy za darmo, potem 149 zł/mies. — rezygnacja w każdej chwili z panelu klienta.</p>
            <button className={styles["btn-checkout"]} onClick={onClose}>
              Zamknij
            </button>
          </>
        ) : (
          <>
            <h3>Aktywuj stronę</h3>
            <p>Podaj email — wyślemy Ci link do płatności Stripe. Możesz zapłacić kartą lub BLIK-iem.</p>
            <div className={styles["modal-plan"]}>
              <div className={styles["mp-name"]}>{gen.planName}</div>
              <div className={styles["mp-price"]}>
                {displayPrice} <sub style={{ fontSize: 13, color: "var(--muted)" }}>{billingLabel}</sub>
              </div>
            </div>
            <input type="email" className={styles["modal-input"]} placeholder="twoj@email.pl" value={email} onChange={(e) => setEmail(e.target.value)} />
            <button className={styles["btn-checkout"]} onClick={goToCheckout} disabled={submitting}>
              {submitting ? "Aktywuję stronę…" : "Przejdź do płatności →"}
            </button>
            <p className={styles["modal-note"]}>Płatność obsługiwana przez Stripe. Brak umowy długoterminowej — rezygnacja w każdej chwili.</p>
          </>
        )}
      </div>
    </div>
  );
}
