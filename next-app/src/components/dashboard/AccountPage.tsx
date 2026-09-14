"use client";

import { useState } from "react";
import type { useUser } from "@clerk/nextjs";
import styles from "./Dashboard.module.css";

type ProfileFirma = { nazwa_firma?: string; nip?: string; adres_firma?: string };
type Notifications = { updates?: boolean; billing?: boolean; seo?: boolean };
// @clerk/types nie jest bezpośrednią zależnością (tylko przechodnia przez
// @clerk/nextjs) — typ Usera wyprowadzony ze zwrotu useUser() zamiast importu
// z pakietu, który mógłby nie zostać rozwiązany przez TypeScript w tym monorepo.
type ClerkUser = NonNullable<ReturnType<typeof useUser>["user"]>;

// Port 1:1 z renderAccountPage/saveProfileFirma/saveNotifications/exportAccountData
// w dashboard/index.html. user.update({unsafeMetadata}) jest DEPRECATED w tej wersji
// Clerka (Core 3) na rzecz user.updateMetadata({unsafeMetadata}), które robi
// deep-merge — nie trzeba już ręcznie robić Object.assign z istniejącymi metadanymi.
export default function AccountPage({
  active,
  email,
  created,
  generated,
  firma,
  user,
}: {
  active: boolean;
  email: string;
  created: string;
  generated: unknown;
  firma: unknown;
  user: ClerkUser;
}) {
  const meta = (user.unsafeMetadata || {}) as {
    accountType?: string;
    profileFirma?: ProfileFirma;
    notifications?: Notifications;
  };
  const accountType = meta.accountType || "individual";

  // Lazy initializer, nie useEffect+setState — wartości formularza inicjują się raz
  // z metadanych Clerka przy montowaniu (ten komponent żyje przez cały czas trwania
  // panelu, nie jest remontowany przy zmianie zakładki, więc jedna inicjalizacja
  // odpowiada oryginalnemu renderAccountPage() wołanemu przy starcie).
  const [pfNazwa, setPfNazwa] = useState(() => meta.profileFirma?.nazwa_firma || "");
  const [pfNip, setPfNip] = useState(() => meta.profileFirma?.nip || "");
  const [pfAdres, setPfAdres] = useState(() => meta.profileFirma?.adres_firma || "");
  const [pfSaved, setPfSaved] = useState(false);

  const [notifUpdates, setNotifUpdates] = useState(() => meta.notifications?.updates !== false);
  const [notifBilling, setNotifBilling] = useState(() => meta.notifications?.billing !== false);
  const [notifSeo, setNotifSeo] = useState(() => !!meta.notifications?.seo);
  const [notifSaved, setNotifSaved] = useState(false);

  async function saveProfileFirma() {
    try {
      await user.updateMetadata({
        unsafeMetadata: { profileFirma: { nazwa_firma: pfNazwa, nip: pfNip, adres_firma: pfAdres } },
      });
      setPfSaved(true);
      setTimeout(() => setPfSaved(false), 2500);
    } catch {
      alert("Błąd zapisu");
    }
  }

  async function saveNotifications() {
    try {
      await user.updateMetadata({
        unsafeMetadata: { notifications: { updates: notifUpdates, billing: notifBilling, seo: notifSeo } },
      });
      setNotifSaved(true);
      setTimeout(() => setNotifSaved(false), 2500);
    } catch {
      // ciche pominięcie — jak w oryginale
    }
  }

  function exportAccountData() {
    try {
      const data = {
        email,
        metadata: user.unsafeMetadata || {},
        firma: firma || {},
        messages: JSON.parse(localStorage.getItem("wg_messages") || "[]"),
        generated: generated || {},
      };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "webgen-account-export.json";
      a.click();
    } catch {
      alert("Błąd eksportu");
    }
  }

  return (
    <div className={`${styles.page} ${active ? styles.active : ""}`}>
      <div className={styles["section-header"]}>
        <h1>Ustawienia konta</h1>
        <p>Dane logowania, profil firmy i preferencje</p>
      </div>

      <div className={styles.card} style={{ maxWidth: 580 }}>
        <div className={styles["card-title"]}>Dane konta</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 20 }}>
          <div className={styles["firma-field"]}>
            <div className={styles["firma-label"]}>Email</div>
            <div className={styles["firma-val"]} style={{ fontSize: 13, wordBreak: "break-all" }}>
              {email || "—"}
            </div>
          </div>
          <div className={styles["firma-field"]}>
            <div className={styles["firma-label"]}>Typ konta</div>
            <div className={styles["firma-val"]}>{accountType === "firma" ? "🏢 Firmowy" : "👤 Indywidualny"}</div>
          </div>
          <div className={styles["firma-field"]}>
            <div className={styles["firma-label"]}>Konto od</div>
            <div className={styles["firma-val"]}>{created}</div>
          </div>
        </div>
        <div className={styles["btn-row"]}>
          <a href="mailto:hello@webgen.pl?subject=Zmiana hasła do konta webgen" className={`${styles.btn} ${styles["btn-outline"]} ${styles["btn-sm"]}`}>
            🔑 Zmień hasło
          </a>
          <a href="mailto:hello@webgen.pl?subject=Zmiana emaila konta webgen" className={`${styles.btn} ${styles["btn-outline"]} ${styles["btn-sm"]}`}>
            ✉️ Zmień email
          </a>
        </div>
        <p style={{ fontSize: 12, color: "var(--muted)", marginTop: 12, lineHeight: 1.5 }}>
          W celu zmiany hasła lub emaila napisz do nas — zweryfikujemy Twoją tożsamość i dokonamy zmiany w ciągu 24h.
        </p>
      </div>

      {accountType === "firma" && (
        <div className={styles.card} style={{ maxWidth: 580 }}>
          <div className={styles["card-title"]}>Profil firmy</div>
          <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 18, lineHeight: 1.55 }}>
            Dane rejestrowe trafiają do stopki strony i Schema.org. Wypełnij żeby Twoja strona była kompletna prawnie.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div className={styles["update-field"]}>
              <label className={styles["input-label"]}>Pełna nazwa firmy</label>
              <input
                type="text"
                className={styles["input-field"]}
                placeholder="np. AiO Oskar Sapożnikow"
                value={pfNazwa}
                onChange={(e) => setPfNazwa(e.target.value)}
              />
            </div>
            <div className={styles["update-row"]}>
              <div className={styles["update-field"]}>
                <label className={styles["input-label"]}>NIP</label>
                <input
                  type="text"
                  className={styles["input-field"]}
                  placeholder="np. 1544878899"
                  maxLength={13}
                  value={pfNip}
                  onChange={(e) => setPfNip(e.target.value)}
                />
              </div>
              <div className={styles["update-field"]}>
                <label className={styles["input-label"]}>Adres rejestrowy</label>
                <input
                  type="text"
                  className={styles["input-field"]}
                  placeholder="ul. Błotna 3, 00-001 Warszawa"
                  value={pfAdres}
                  onChange={(e) => setPfAdres(e.target.value)}
                />
              </div>
            </div>
            <div className={styles["btn-row"]}>
              <button onClick={saveProfileFirma} className={`${styles.btn} ${styles["btn-primary"]} ${styles["btn-sm"]}`}>
                Zapisz dane firmy
              </button>
              {pfSaved && <span style={{ fontSize: 13, color: "var(--green)", display: "inline-flex", alignItems: "center" }}>✓ Zapisano</span>}
            </div>
          </div>
        </div>
      )}

      <div className={styles.card} style={{ maxWidth: 580 }}>
        <div className={styles["card-title"]}>Powiadomienia</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <label style={{ display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer" }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>Email przy aktualizacji strony</div>
              <div style={{ fontSize: 12, color: "var(--muted)" }}>Powiadom mnie gdy webgen wprowadzi zmiany</div>
            </div>
            <input
              type="checkbox"
              checked={notifUpdates}
              onChange={(e) => setNotifUpdates(e.target.checked)}
              style={{ accentColor: "var(--green)", width: 18, height: 18 }}
            />
          </label>
          <label style={{ display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer" }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>Przypomnienie o płatności</div>
              <div style={{ fontSize: 12, color: "var(--muted)" }}>7 dni przed odnowieniem subskrypcji</div>
            </div>
            <input
              type="checkbox"
              checked={notifBilling}
              onChange={(e) => setNotifBilling(e.target.checked)}
              style={{ accentColor: "var(--green)", width: 18, height: 18 }}
            />
          </label>
          <label style={{ display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer" }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>Raporty SEO</div>
              <div style={{ fontSize: 12, color: "var(--muted)" }}>Miesięczne podsumowanie pozycji w Google</div>
            </div>
            <input
              type="checkbox"
              checked={notifSeo}
              onChange={(e) => setNotifSeo(e.target.checked)}
              style={{ accentColor: "var(--green)", width: 18, height: 18 }}
            />
          </label>
        </div>
        <div className={styles["btn-row"]} style={{ marginTop: 16 }}>
          <button onClick={saveNotifications} className={`${styles.btn} ${styles["btn-outline"]} ${styles["btn-sm"]}`}>
            Zapisz preferencje
          </button>
          {notifSaved && <span style={{ fontSize: 13, color: "var(--green)" }}>✓ Zapisano</span>}
        </div>
      </div>

      <div className={styles.card} style={{ maxWidth: 580, borderColor: "rgba(209,77,95,.15)" }}>
        <div className={styles["card-title"]} style={{ color: "var(--red)" }}>
          Strefa niebezpieczna
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>Eksport danych</div>
              <div style={{ fontSize: 12, color: "var(--muted)" }}>Pobierz wszystkie dane konta w formacie JSON</div>
            </div>
            <button onClick={exportAccountData} className={`${styles.btn} ${styles["btn-outline"]} ${styles["btn-sm"]}`}>
              ⬇ Eksportuj
            </button>
          </div>
          <hr className={styles.divider} />
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>Anulowanie subskrypcji</div>
              <div style={{ fontSize: 12, color: "var(--muted)" }}>Strona pozostaje aktywna do końca okresu rozliczeniowego</div>
            </div>
            <a href="mailto:hello@webgen.pl?subject=Anulowanie subskrypcji webgen" className={`${styles.btn} ${styles["btn-danger"]} ${styles["btn-sm"]}`}>
              Anuluj plan
            </a>
          </div>
          <hr className={styles.divider} />
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>Usuń konto</div>
              <div style={{ fontSize: 12, color: "var(--muted)" }}>Trwałe usunięcie konta i wszystkich danych</div>
            </div>
            <a href="mailto:hello@webgen.pl?subject=Usunięcie konta webgen" className={`${styles.btn} ${styles["btn-danger"]} ${styles["btn-sm"]}`}>
              Usuń konto
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
