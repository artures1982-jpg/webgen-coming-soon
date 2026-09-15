"use client";

import { useEffect, useState } from "react";
import styles from "./CookieConsent.module.css";

// Port React z shared/cookie-consent.js (statyczne strony) — ten sam kontrakt:
// GA4 (gtag.js) ładuje się WYŁĄCZNIE po zgodzie na cookie analityczne, bo polityka
// prywatności obiecuje dokładnie to. Historia pełnego kontekstu (dlaczego to w ogóle
// istnieje, cookie-consent.html) — patrz komentarz na górze shared/cookie-consent.js
// i pamięć projektu project_google_analytics_setup_2026_09_15.
const GA_MEASUREMENT_ID = "G-N2TJE2MCE2";
const STORAGE_KEY = "wg_cookie_consent";
const CONSENT_VERSION = "1.0";

type Consent = { version: string; timestamp: string; necessary: true; analytics: boolean; marketing: boolean };

function readConsent(): Consent | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (data.version !== CONSENT_VERSION) return null;
    return data;
  } catch {
    return null;
  }
}

function writeConsent(analytics: boolean, marketing: boolean): Consent {
  const data: Consent = { version: CONSENT_VERSION, timestamp: new Date().toISOString(), necessary: true, analytics, marketing };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  return data;
}

function loadGoogleAnalytics() {
  const w = window as unknown as { _wgGaLoaded?: boolean; dataLayer?: unknown[]; gtag?: (...args: unknown[]) => void };
  if (w._wgGaLoaded) return;
  w._wgGaLoaded = true;
  const s = document.createElement("script");
  s.async = true;
  s.src = "https://www.googletagmanager.com/gtag/js?id=" + GA_MEASUREMENT_ID;
  document.head.appendChild(s);
  w.dataLayer = w.dataLayer || [];
  function gtag(...args: unknown[]) {
    w.dataLayer!.push(args);
  }
  gtag("js", new Date());
  gtag("config", GA_MEASUREMENT_ID, { anonymize_ip: true });
  w.gtag = gtag;
}

function removeAnalyticsCookies() {
  ["_ga", "_gid"].forEach((name) => {
    document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=." + location.hostname;
  });
}

function applyConsent(consent: Consent) {
  if (consent.analytics) loadGoogleAnalytics();
  else removeAnalyticsCookies();
  // Meta Pixel jeszcze nie jest wdrożony w kodzie — pole marketing zapisywane na
  // przyszłość (polityka prywatności już o nim wspomina), nic tu jeszcze nie włącza.
}

export default function CookieConsent() {
  const [bannerOpen, setBannerOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [showSettingsBtn, setShowSettingsBtn] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);

  useEffect(() => {
    const consent = readConsent();
    if (consent) {
      // setState przesunięty do mikrotaska — odczyt localStorage to zewnętrzny
      // system (patrz react-hooks/set-state-in-effect), ten sam wzorzec co
      // gałąź "brak zgody" niżej (setTimeout), nie synchroniczne setState wprost
      // w ciele efektu.
      Promise.resolve().then(() => {
        applyConsent(consent);
        setAnalytics(consent.analytics);
        setMarketing(consent.marketing);
        setShowSettingsBtn(true);
      });
    } else {
      const t = setTimeout(() => setBannerOpen(true), 400);
      return () => clearTimeout(t);
    }
  }, []);

  function save(nextAnalytics: boolean, nextMarketing: boolean) {
    const consent = writeConsent(nextAnalytics, nextMarketing);
    applyConsent(consent);
    setAnalytics(nextAnalytics);
    setMarketing(nextMarketing);
    setBannerOpen(false);
    setSettingsOpen(false);
    setShowSettingsBtn(true);
  }

  return (
    <>
      {bannerOpen && (
        <div className={styles.banner} role="dialog" aria-label="Ustawienia plików cookie" aria-live="polite">
          <div className={styles.bannerBefore} />
          <div className={styles.bannerInner}>
            <div className={styles.bannerIcon} aria-hidden="true">
              🍪
            </div>
            <div className={styles.bannerText}>
              <h3>Szanujemy Twoją prywatność</h3>
              <p>
                Używamy plików cookie, aby poprawić jakość Twoich odwiedzin. Część z nich jest niezbędna, inne pomagają nam
                zrozumieć, jak korzystasz z Serwisu. Więcej informacji znajdziesz w{" "}
                <a href="/polityka-prywatnosci" target="_blank">
                  Polityce Prywatności
                </a>
                .
              </p>
            </div>
            <div className={styles.bannerActions}>
              <button className={`${styles.btn} ${styles.btnSettings}`} onClick={() => setSettingsOpen(true)}>
                Dostosuj
              </button>
              <button className={`${styles.btn} ${styles.btnReject}`} onClick={() => save(false, false)}>
                Tylko niezbędne
              </button>
              <button className={`${styles.btn} ${styles.btnAccept}`} onClick={() => save(true, true)}>
                Akceptuję wszystkie
              </button>
            </div>
          </div>
        </div>
      )}

      {settingsOpen && (
        <>
          <div className={`${styles.overlay} ${styles.overlayActive}`} onClick={() => setSettingsOpen(false)} />
          <div className={`${styles.modal} ${styles.modalActive}`} role="dialog" aria-modal="true" aria-labelledby="wg-modal-title">
            <div className={styles.modalBox}>
              <div className={styles.modalHeader}>
                <h2 id="wg-modal-title">Ustawienia plików cookie</h2>
                <p>
                  Poniżej możesz wybrać, które kategorie plików cookie akceptujesz. Szczegóły w{" "}
                  <a href="/polityka-prywatnosci" target="_blank">
                    Polityce Prywatności
                  </a>
                  .
                </p>
                <button className={styles.modalClose} onClick={() => setSettingsOpen(false)} aria-label="Zamknij">
                  ✕
                </button>
              </div>

              <div className={styles.modalBody}>
                <div className={styles.category}>
                  <div className={styles.catHeader}>
                    <div className={styles.catInfo}>
                      <div className={styles.catTitle}>
                        Niezbędne
                        <span className={`${styles.catBadge} ${styles.badgeRequired}`}>ZAWSZE WŁĄCZONE</span>
                      </div>
                      <p className={styles.catDesc}>
                        Konieczne do prawidłowego działania Serwisu. Bez nich strona nie może funkcjonować poprawnie.
                      </p>
                    </div>
                    <label className={styles.toggle}>
                      <input type="checkbox" checked disabled readOnly />
                      <span className={styles.toggleSlider} />
                    </label>
                  </div>
                </div>

                <div className={styles.category}>
                  <div className={styles.catHeader}>
                    <div className={styles.catInfo}>
                      <div className={styles.catTitle}>
                        Analityczne
                        <span className={`${styles.catBadge} ${styles.badgeOptional}`}>OPCJONALNE</span>
                      </div>
                      <p className={styles.catDesc}>
                        Pomagają nam rozumieć, jak użytkownicy korzystają z Serwisu (Google Analytics 4). Dane są
                        anonimizowane i nie służą do śledzenia osobistego.
                      </p>
                    </div>
                    <label className={styles.toggle}>
                      <input type="checkbox" checked={analytics} onChange={(e) => setAnalytics(e.target.checked)} />
                      <span className={styles.toggleSlider} />
                    </label>
                  </div>
                </div>

                <div className={styles.category}>
                  <div className={styles.catHeader}>
                    <div className={styles.catInfo}>
                      <div className={styles.catTitle}>
                        Marketingowe
                        <span className={`${styles.catBadge} ${styles.badgeOptional}`}>OPCJONALNE</span>
                      </div>
                      <p className={styles.catDesc}>
                        Umożliwiają personalizację reklam (Meta Pixel / Facebook). Ta funkcja jest jeszcze w
                        przygotowaniu — zaznaczenie zgody nic dziś nie włącza.
                      </p>
                    </div>
                    <label className={styles.toggle}>
                      <input type="checkbox" checked={marketing} onChange={(e) => setMarketing(e.target.checked)} />
                      <span className={styles.toggleSlider} />
                    </label>
                  </div>
                </div>
              </div>

              <div className={styles.modalFooter}>
                <button className={`${styles.btn} ${styles.btnAcceptAll}`} onClick={() => save(true, true)}>
                  Akceptuję wszystkie
                </button>
                <button className={`${styles.btn} ${styles.btnSave}`} onClick={() => save(analytics, marketing)}>
                  Zapisz moje ustawienia
                </button>
                <button className={`${styles.btn} ${styles.btnRejectAll}`} onClick={() => save(false, false)}>
                  Tylko niezbędne
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {showSettingsBtn && !bannerOpen && (
        <button className={`${styles.settingsBtn} ${styles.settingsBtnVisible}`} onClick={() => setSettingsOpen(true)}>
          🍪 Ustawienia cookie
        </button>
      )}
    </>
  );
}
