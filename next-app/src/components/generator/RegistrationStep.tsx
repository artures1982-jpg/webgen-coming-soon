"use client";

import { useState } from "react";
import { SignIn, SignUp } from "@clerk/nextjs";
import { useGenerator } from "./GeneratorContext";
import styles from "./Generator.module.css";

// Port 1:1 z panel-0 w generator/index.html: typ konta + RODO + dane firmowe
// zbierane PRZED autoryzacją, potem mountAuthWidget('signUp'/'signIn'). W React
// zamiast ręcznego window.getClerk().mountSignIn/mountSignUp z routing:'virtual'
// używamy bezpośrednio komponentów <SignIn>/<SignUp> z @clerk/nextjs — widget
// renderuje się w miejscu, bez nawigacji. UWAGA: routing="virtual" (dokładny
// odpowiednik oryginału) nie jest już dostępny dla tych komponentów w tej wersji
// Clerka (Core 3) — RoutingOptions dopuszcza tylko 'path'|'hash' (sprawdzone w
// node_modules/@clerk/shared/dist/types/clerk.d.ts, ten sam typ breaking change
// co przy <SignedIn>/appearance.variables w Fazie 3). routing="hash" jest
// najbliższym zamiennikiem: też nie wymaga catch-all route'a ani nawigacji,
// wewnętrzne pod-kroki widgetu (np. weryfikacja emaila) idą przez fragment #.
// Appearance identyczne jak /login, /rejestracja (Faza 3).
const CLERK_APPEARANCE = {
  variables: {
    colorPrimary: "#00E5A0",
    colorBackground: "#0F1420",
    colorForeground: "#F3F6FC",
    colorMutedForeground: "#8E97AC",
    colorInput: "#161B29",
    colorInputForeground: "#F3F6FC",
    colorNeutral: "#F3F6FC",
    fontFamily: "'Bricolage Grotesque', sans-serif",
    borderRadius: "10px",
  },
};

export default function RegistrationStep() {
  const { gen, patchGen } = useGenerator();
  const [rodo, setRodo] = useState(false);
  const [nazwaFirma, setNazwaFirma] = useState("");
  const [nip, setNip] = useState("");
  const [adresFirma, setAdresFirma] = useState("");

  function proceedToAuth() {
    if (!rodo) return;
    const pendingProfileFirma =
      gen.accountType === "firma" && (nazwaFirma || nip || adresFirma)
        ? { nazwa_firma: nazwaFirma, nip, adres_firma: adresFirma }
        : null;
    patchGen({ pendingProfileFirma, authMode: "signUp" });
  }

  if (gen.authMode !== "gate") {
    return (
      <div className={`${styles["step-panel"]} ${styles.active}`} style={{ maxWidth: 440, margin: "0 auto" }}>
        {gen.authMode === "signIn" ? (
          <SignIn routing="hash" appearance={CLERK_APPEARANCE} />
        ) : (
          <SignUp routing="hash" appearance={CLERK_APPEARANCE} />
        )}
        <p style={{ textAlign: "center", marginTop: 16, fontSize: 13, color: "var(--muted)" }}>
          {gen.authMode === "signIn" ? (
            <>
              Nie masz konta?{" "}
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  patchGen({ authMode: "signUp" });
                }}
                style={{ color: "var(--green)", textDecoration: "none", fontWeight: 600 }}
              >
                Zarejestruj się
              </a>
            </>
          ) : (
            <>
              Masz już konto?{" "}
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  patchGen({ authMode: "signIn" });
                }}
                style={{ color: "var(--green)", textDecoration: "none", fontWeight: 600 }}
              >
                Zaloguj się
              </a>
            </>
          )}
        </p>
      </div>
    );
  }

  return (
    <div className={`${styles["step-panel"]} ${styles.active} ${styles["panel-0"]}`}>
      <div className={styles["sp-header"]} style={{ textAlign: "center" }}>
        <div className={styles["sp-eyebrow"]}>{"// Rejestracja"}</div>
        <h1 className={styles["sp-title"]}>
          Utwórz darmowe
          <br />
          <span style={{ background: "var(--grad)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
            konto webgen
          </span>
        </h1>
        <p className={styles["sp-sub"]}>Pierwsze 6 miesięcy gratis. Wybierz typ konta.</p>
      </div>

      <div style={{ textAlign: "left" }}>
        <div className={styles["account-type-grid"]}>
          <div
            className={`${styles["account-type-card"]} ${gen.accountType === "individual" ? styles.selected : ""}`}
            onClick={() => patchGen({ accountType: "individual" })}
          >
            <div className={styles["account-type-icon"]}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="8" r="4" />
                <path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7" />
              </svg>
            </div>
            <div className={styles["account-type-name"]}>Klient indywidualny</div>
            <div className={styles["account-type-desc"]}>Działalność nierejestrowana, freelancer, osoba prywatna</div>
          </div>
          <div
            className={`${styles["account-type-card"]} ${gen.accountType === "firma" ? styles.selected : ""}`}
            onClick={() => patchGen({ accountType: "firma" })}
          >
            <div className={styles["account-type-icon"]}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                <rect x="5" y="3" width="14" height="18" rx="1" />
                <rect x="9" y="17" width="6" height="4" />
                <line x1="8" y1="7" x2="10" y2="7" />
                <line x1="14" y1="7" x2="16" y2="7" />
                <line x1="8" y1="11" x2="10" y2="11" />
                <line x1="14" y1="11" x2="16" y2="11" />
              </svg>
            </div>
            <div className={styles["account-type-name"]}>Klient firmowy</div>
            <div className={styles["account-type-desc"]}>Jednoosobowa działalność, spółka, firma z NIP</div>
          </div>
        </div>

        {gen.accountType === "firma" && (
          <div>
            <div
              style={{
                fontFamily: "var(--mono)",
                fontSize: 9,
                fontWeight: 700,
                letterSpacing: ".14em",
                textTransform: "uppercase",
                color: "var(--green)",
                marginBottom: 12,
              }}
            >
              Dane rejestrowe firmy
            </div>
            <div className={styles["form-group"]} style={{ marginBottom: 14 }}>
              <label className={styles["form-label"]} htmlFor="g-nazwa-firma">
                Pełna nazwa firmy
              </label>
              <input
                type="text"
                id="g-nazwa-firma"
                placeholder="np. AiO Oskar Sapożnikow"
                autoComplete="organization"
                value={nazwaFirma}
                onChange={(e) => setNazwaFirma(e.target.value)}
              />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 0 }}>
              <div className={styles["form-group"]} style={{ marginBottom: 0 }}>
                <label className={styles["form-label"]} htmlFor="g-nip">
                  NIP
                </label>
                <input type="text" id="g-nip" placeholder="np. 1544878899" maxLength={13} value={nip} onChange={(e) => setNip(e.target.value)} />
              </div>
              <div className={styles["form-group"]} style={{ marginBottom: 0 }}>
                <label className={styles["form-label"]} htmlFor="g-adres-firma">
                  Adres rejestrowy
                </label>
                <input
                  type="text"
                  id="g-adres-firma"
                  placeholder="ul. Błotna 3/48, Warszawa"
                  value={adresFirma}
                  onChange={(e) => setAdresFirma(e.target.value)}
                />
              </div>
            </div>
            <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 10, lineHeight: 1.5 }}>
              Dane trafią do stopki strony i profilu konta. Możesz uzupełnić później w ustawieniach.
            </div>
          </div>
        )}

        <label style={{ display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer", margin: "24px 0" }}>
          <input
            type="checkbox"
            checked={rodo}
            onChange={(e) => setRodo(e.target.checked)}
            style={{ width: 16, height: 16, minWidth: 16, marginTop: 2, accentColor: "var(--green)", cursor: "pointer" }}
          />
          <span style={{ fontSize: 12, color: "var(--muted)", lineHeight: 1.55 }}>
            Zapoznałem/am się z{" "}
            <a href="/polityka-prywatnosci/" target="_blank" style={{ color: "var(--green)" }}>
              Polityką Prywatności
            </a>{" "}
            i{" "}
            <a href="/regulamin/" target="_blank" style={{ color: "var(--green)" }}>
              Regulaminem
            </a>
            . Wyrażam zgodę na przetwarzanie danych w celu świadczenia usługi.
          </span>
        </label>

        <button
          onClick={proceedToAuth}
          disabled={!rodo}
          style={{
            width: "100%",
            background: rodo ? "var(--green)" : "rgba(0,229,160,.3)",
            color: rodo ? "#fff" : "rgba(255,255,255,.5)",
            border: "none",
            padding: "15px 24px",
            borderRadius: 10,
            fontSize: 16,
            fontWeight: 700,
            cursor: rodo ? "pointer" : "not-allowed",
            fontFamily: "var(--head)",
            transition: "all .2s",
          }}
        >
          Dalej →
        </button>

        <p style={{ textAlign: "center", marginTop: 16, fontSize: 12, color: "var(--muted)" }}>
          Masz już konto?{" "}
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              patchGen({ authMode: "signIn" });
            }}
            style={{ color: "var(--green)", textDecoration: "none" }}
          >
            Zaloguj się
          </a>
        </p>
      </div>
    </div>
  );
}
