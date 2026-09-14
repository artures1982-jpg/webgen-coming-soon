"use client";

import { useState } from "react";
import type { GeneratedSite } from "@/lib/dashboard-helpers";
import styles from "./Dashboard.module.css";

// Port 1:1 z renderWebsitePage/buildFirmaData/buildUpdateForm/downloadGeneratedHTML/
// sendUpdateRequest w dashboard/index.html.
function PsItem({ score, label }: { score: string; label: string }) {
  return (
    <div className={styles["ps-item"]}>
      <div className={`${styles["ps-score"]} ${styles.green}`}>{score}</div>
      <div className={styles["ps-label"]}>{label}</div>
    </div>
  );
}

function UpdateForm({
  slug,
  isPro,
  getAuthHeaders,
}: {
  slug: string;
  isPro: boolean;
  getAuthHeaders: () => Promise<Record<string, string>>;
}) {
  const [telefon, setTelefon] = useState("");
  const [godz, setGodz] = useState("");
  const [opis, setOpis] = useState("");
  const [sent, setSent] = useState(false);

  async function send() {
    if (!telefon && !godz && !opis) {
      alert("Opisz co chcesz zmienić.");
      return;
    }
    try {
      const authHeaders = await getAuthHeaders();
      const res = await fetch("/api/update-request", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders },
        body: JSON.stringify({ slug, update: { telefon, godz, opis } }),
      });
      const data = await res.json();
      if (res.status === 402) {
        alert("Aktualizacje treści na życzenie są dostępne w planie Pro. Przejdź na Pro w zakładce Subskrypcja.");
        return;
      }
      if (!data.ok) {
        alert("Błąd: " + (data.error || "nie udało się wysłać"));
        return;
      }
      setSent(true);
    } catch {
      alert("Błąd połączenia — spróbuj ponownie.");
    }
  }

  return (
    <div className={styles.card}>
      <div className={styles["card-title"]}>📬 Wyślij aktualizację strony</div>
      <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 18, lineHeight: 1.55 }}>
        Chcesz zmienić telefon, godziny, zdjęcia lub treści? Wypełnij poniżej — wdrożymy w ciągu 24h.
        {!isPro && " Ta funkcja jest dostępna w planie Pro."}
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div className={styles["update-row"]}>
          <div className={styles["update-field"]}>
            <label className={styles["input-label"]}>Telefon</label>
            <input type="tel" className={styles["input-field"]} placeholder="nowy numer telefonu" value={telefon} onChange={(e) => setTelefon(e.target.value)} />
          </div>
          <div className={styles["update-field"]}>
            <label className={styles["input-label"]}>Godziny otwarcia</label>
            <input type="text" className={styles["input-field"]} placeholder="np. Pon–Pt 8–18, Sob 9–14" value={godz} onChange={(e) => setGodz(e.target.value)} />
          </div>
        </div>
        <div className={styles["update-field"]}>
          <label className={styles["input-label"]}>Co chcesz zmienić? (opis)</label>
          <textarea
            className={styles["input-field"]}
            rows={3}
            style={{ resize: "vertical" }}
            placeholder="np. Dodaj nową usługę: montaż klimatyzacji. Zmień zdjęcie główne na..."
            value={opis}
            onChange={(e) => setOpis(e.target.value)}
          />
        </div>
        <div className={styles["btn-row"]}>
          <button onClick={send} className={`${styles.btn} ${styles["btn-primary"]} ${styles["btn-sm"]}`}>
            Wyślij prośbę o aktualizację
          </button>
          {sent && <span style={{ fontSize: 13, color: "var(--green)" }}>✓ Wysłano — odpiszemy w ciągu 24h</span>}
        </div>
      </div>
    </div>
  );
}

function FirmaDataCard({ generated }: { generated: GeneratedSite }) {
  const rows: { label: string; value?: string }[] = [
    { label: "Branża", value: generated.branza },
    { label: "Miasto", value: generated.miasto },
    { label: "Dzielnica", value: generated.dzielnica },
    { label: "Telefon", value: generated.telefon },
    { label: "Email", value: generated.email },
    { label: "Adres", value: generated.adres },
    {
      label: "Godziny",
      value: generated.godz_pon_pt ? generated.godz_pon_pt + (generated.godz_sob ? ", Sob: " + generated.godz_sob : "") : undefined,
    },
  ].filter((r) => r.value);
  if (!rows.length) return null;
  return (
    <div className={styles.card}>
      <div className={styles["card-title"]}>Dane użyte do generowania</div>
      <div className={styles["firma-grid"]}>
        {rows.map((r) => (
          <div className={styles["firma-field"]} key={r.label}>
            <div className={styles["firma-label"]}>{r.label}</div>
            <div className={styles["firma-val"]}>{r.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function downloadGeneratedHTML(generated: GeneratedSite) {
  if (!generated.html) {
    alert("Brak wygenerowanej strony.");
    return;
  }
  const blob = new Blob([generated.html], { type: "text/html" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = (generated.slug || "strona") + ".html";
  a.click();
}

export default function WebsitePage({
  active,
  generated,
  firmaSlug,
  getAuthHeaders,
}: {
  active: boolean;
  generated: GeneratedSite | null;
  firmaSlug: string | null;
  getAuthHeaders: () => Promise<Record<string, string>>;
}) {
  // Lazy initializer, nie wywołanie Date.now() prosto w ciele renderu (reguła
  // czystości komponentu) — jedna wartość "teraz" ustalona przy montowaniu wystarczy
  // do policzenia dni pozostałych z 90-dniowego okresu Free.
  const [nowTs] = useState(() => Date.now());
  const slug = generated?.slug || firmaSlug;

  if (!slug) {
    return (
      <div className={`${styles.page} ${active ? styles.active : ""}`}>
        <div className={styles["section-header"]}>
          <h1>Moja strona</h1>
          <p>Status, podgląd i aktualizacje wygenerowanej strony</p>
        </div>
        <div className={styles["no-plan"]}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🏗</div>
          <h3>Brak wygenerowanej strony</h3>
          <p>Przejdź do generatora i skonfiguruj swoją stronę firmową.</p>
          <a href="/generator/" className={`${styles.btn} ${styles["btn-primary"]}`}>
            Otwórz generator →
          </a>
        </div>
      </div>
    );
  }

  const subUrl = "https://" + slug + ".webgen.pl";

  if (!generated) {
    return (
      <div className={`${styles.page} ${active ? styles.active : ""}`}>
        <div className={styles["section-header"]}>
          <h1>Moja strona</h1>
          <p>Status, podgląd i aktualizacje wygenerowanej strony</p>
        </div>
        <div className={styles["site-url-box"]}>
          <div className={styles["site-url-label"]}>Twoja strona</div>
          <a href={subUrl} target="_blank" className={styles["site-url"]} rel="noreferrer">
            {subUrl} ↗
          </a>
        </div>
        <div className={styles["btn-row"]} style={{ marginBottom: 24 }}>
          <a href={subUrl} target="_blank" className={`${styles.btn} ${styles["btn-primary"]}`} rel="noreferrer">
            🌐 Otwórz stronę
          </a>
        </div>
        <UpdateForm slug={slug} isPro={false} getAuthHeaders={getAuthHeaders} />
      </div>
    );
  }

  const created = generated.created ? new Date(generated.created) : null;
  const daysLeft = created ? Math.max(0, 90 - Math.floor((nowTs - created.getTime()) / 86400000)) : 90;
  const isPro = !!generated.plan && generated.plan !== "free";

  return (
    <div className={`${styles.page} ${active ? styles.active : ""}`}>
      <div className={styles["section-header"]}>
        <h1>Moja strona</h1>
        <p>Status, podgląd i aktualizacje wygenerowanej strony</p>
      </div>

      <div className={styles["site-url-box"]}>
        <div className={styles["site-url-label"]}>Adres Twojej strony</div>
        <a href={subUrl} target="_blank" className={styles["site-url"]} rel="noreferrer">
          {subUrl} ↗
        </a>
        {generated.plan === "free" && daysLeft > 0 && (
          <div style={{ marginTop: 8, fontSize: 12, color: "var(--muted)" }}>
            Plan Free · pozostało <strong style={{ color: "var(--amber)" }}>{daysLeft} dni</strong>
          </div>
        )}
      </div>

      <div className={styles["btn-row"]} style={{ marginBottom: 24 }}>
        <a href={subUrl} target="_blank" className={`${styles.btn} ${styles["btn-primary"]}`} rel="noreferrer">
          🌐 Otwórz stronę
        </a>
        {generated.html && (
          <button onClick={() => downloadGeneratedHTML(generated)} className={`${styles.btn} ${styles["btn-outline"]}`}>
            ⬇ Pobierz HTML
          </button>
        )}
      </div>

      <div className={styles.card}>
        <div className={styles["card-title"]}>PageSpeed — ostatni pomiar</div>
        <div className={styles["ps-grid"]}>
          <PsItem score={isPro ? "94" : "87"} label="Performance" />
          <PsItem score="100" label="Accessibility" />
          <PsItem score={isPro ? "96" : "91"} label="Best Practices" />
          <PsItem score={isPro ? "93" : "82"} label="SEO" />
        </div>
        <div style={{ fontSize: 12, color: "var(--muted)" }}>Pomiary wykonane przez Google PageSpeed Insights. Odświeżamy co miesiąc.</div>
      </div>

      <FirmaDataCard generated={generated} />
      <UpdateForm slug={slug} isPro={isPro} getAuthHeaders={getAuthHeaders} />
    </div>
  );
}
