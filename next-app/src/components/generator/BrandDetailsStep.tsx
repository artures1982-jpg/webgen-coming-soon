"use client";

import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useGenerator } from "./GeneratorContext";
import PaletteSection from "./PaletteSection";
import LogoUpload from "./LogoUpload";
import HeroUpload from "./HeroUpload";
import LayoutZonesSection from "./LayoutZonesSection";
import styles from "./Generator.module.css";

// Port 1:1 z panel-2 w generator/index.html — dane strony/kontakt/paleta/logo/
// hero/usługi/layout. prefillFirmaFromProfile() z oryginału staje się prostym
// useEffect czytającym Clerk unsafeMetadata raz przy wejściu na krok.
// `firmaFromProfile` jest liczone bezpośrednio z metadanych Clerka przy renderze
// (nie trzymane w osobnym useState) — te pola są i tak readOnly gdy pochodzą z
// profilu, więc idempotentny patchForm() w efekcie jest bezpieczny do powtórzenia.
export default function BrandDetailsStep({ active }: { active: boolean }) {
  const { gen, form, patchForm, patchGen } = useGenerator();
  const { user } = useUser();
  const meta = (user?.unsafeMetadata || {}) as { accountType?: string; profileFirma?: { nazwa_firma?: string; nip?: string; adres_firma?: string } };
  const firmaFromProfile = meta.accountType === "firma" && !!meta.profileFirma;

  useEffect(() => {
    if (!active || !firmaFromProfile || !meta.profileFirma) return;
    const pf = meta.profileFirma;
    patchForm({
      nazwaFirma: pf.nazwa_firma || "",
      nip: pf.nip || "",
      adresFirma: pf.adres_firma || "",
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, firmaFromProfile, meta.profileFirma]);

  function prev() {
    patchGen({ currentStep: 1 });
  }

  function next() {
    if (!form.nazwaStrony.trim()) {
      alert("Wpisz nazwę strony");
      return;
    }
    if (!form.telefon.trim()) {
      alert("Wpisz telefon");
      return;
    }
    if (!form.email.trim()) {
      alert("Wpisz email");
      return;
    }
    patchGen({ currentStep: 3 });
  }

  const isPro = gen.plan === "pro" || gen.plan === "promax";

  return (
    <div className={`${styles["step-panel"]} ${active ? styles.active : ""}`}>
      <div className={styles["sp-header"]}>
        <div className={styles["sp-eyebrow"]}>{"// Krok 2 z 5"}</div>
        <h1 className={styles["sp-title"]}>
          Dane strony
          <br />i kontakt
        </h1>
        <p className={styles["sp-sub"]}>Nazwę strony zobaczą klienci w Google. Dane firmowe trafią do stopki i faktur.</p>
      </div>

      <div className={styles["form-grid"]}>
        {/* NAZWA STRONY */}
        <div style={{ background: "rgba(0,229,160,.05)", border: "1px solid rgba(0,229,160,.15)", borderRadius: 12, padding: "18px 20px", marginBottom: 4 }}>
          <div style={{ fontFamily: "var(--mono)", fontSize: 9, fontWeight: 700, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--green)", marginBottom: 12 }}>
            Nazwa strony (marka)
          </div>
          <div className={styles.field} style={{ marginBottom: 0 }}>
            <label>
              Nazwa wyświetlana na stronie <span className={styles.req}>*</span>
            </label>
            <input
              type="text"
              value={form.nazwaStrony}
              onChange={(e) => patchForm({ nazwaStrony: e.target.value })}
              placeholder="np. Hydraulik Warszawa 24/7 lub Pan Hydraulik"
              style={{ fontSize: 16, fontWeight: 600 }}
            />
            <div className={styles["field-hint"]}>Ta nazwa pojawi się w Google, nagłówku i logo. Może być inna niż nazwa firmy.</div>
          </div>
        </div>

        <PaletteSection />

        {/* KONTAKT */}
        <div className={`${styles["form-grid"]} ${styles.cols2}`}>
          <div className={styles.field}>
            <label>
              Telefon <span className={styles.req}>*</span>
            </label>
            <input type="tel" value={form.telefon} onChange={(e) => patchForm({ telefon: e.target.value })} placeholder="np. 600 100 200" />
          </div>
          <div className={styles.field}>
            <label>
              Email kontaktowy <span className={styles.req}>*</span>
            </label>
            <input type="email" value={form.email} onChange={(e) => patchForm({ email: e.target.value })} placeholder="kontakt@firma.pl" />
          </div>
        </div>
        <div className={styles.field}>
          <label>
            Adres <span className={styles.opt}>opcjonalnie</span>
          </label>
          <input type="text" value={form.adres} onChange={(e) => patchForm({ adres: e.target.value })} placeholder="np. ul. Puławska 10, Warszawa" />
        </div>
        <div className={`${styles["form-grid"]} ${styles.cols2}`}>
          <div className={styles.field}>
            <label>
              Godziny Pon–Pt <span className={styles.opt}>opcjonalnie</span>
            </label>
            <input type="text" value={form.godzPonPt} onChange={(e) => patchForm({ godzPonPt: e.target.value })} placeholder="8:00–18:00" />
          </div>
          <div className={styles.field}>
            <label>
              Godziny Sob <span className={styles.opt}>opcjonalnie</span>
            </label>
            <input type="text" value={form.godzSob} onChange={(e) => patchForm({ godzSob: e.target.value })} placeholder="9:00–14:00" />
          </div>
        </div>
        <div className={`${styles["form-grid"]} ${styles.cols2}`}>
          <div className={styles.field}>
            <label>
              Lata doświadczenia <span className={styles.opt}>opcjonalnie</span>
            </label>
            <input type="number" min={1} max={50} value={form.lata} onChange={(e) => patchForm({ lata: e.target.value })} placeholder="np. 10" />
          </div>
          <div className={styles.field}>
            <label>
              Liczba realizacji <span className={styles.opt}>opcjonalnie</span>
            </label>
            <input type="number" min={1} value={form.realizacje} onChange={(e) => patchForm({ realizacje: e.target.value })} placeholder="np. 250" />
          </div>
        </div>

        {/* DANE FIRMOWE */}
        <details style={{ marginBottom: 4 }} open={firmaFromProfile}>
          <summary
            style={{
              cursor: "pointer",
              userSelect: "none",
              padding: "14px 18px",
              background: "rgba(255,255,255,.04)",
              border: "1px solid rgba(255,255,255,.12)",
              borderRadius: 10,
              fontSize: 13,
              fontWeight: 600,
              color: "var(--muted)",
              display: "flex",
              alignItems: "center",
              gap: 8,
              listStyle: "none",
            }}
          >
            <span style={{ fontSize: 15 }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                <rect x="5" y="3" width="14" height="18" rx="1" />
                <rect x="9" y="17" width="6" height="4" />
                <line x1="8" y1="7" x2="10" y2="7" />
                <line x1="14" y1="7" x2="16" y2="7" />
                <line x1="8" y1="11" x2="10" y2="11" />
                <line x1="14" y1="11" x2="16" y2="11" />
              </svg>
            </span>
            Dane firmowe — pełna nazwa, NIP, adres rejestrowy
            <span style={{ marginLeft: "auto", fontSize: 11, fontFamily: "var(--mono)", color: "rgba(142,151,172,.5)" }}>opcjonalnie</span>
            {firmaFromProfile && <span style={{ marginLeft: 8, fontFamily: "var(--mono)", fontSize: 10, color: "var(--green)" }}>✓ z profilu</span>}
          </summary>
          <div
            style={{
              padding: "16px 18px 4px",
              border: "1px solid rgba(255,255,255,.12)",
              borderTop: "none",
              borderRadius: "0 0 10px 10px",
              background: "rgba(255,255,255,.02)",
            }}
          >
            <div
              style={{
                fontSize: 12,
                color: "var(--muted)",
                marginBottom: 14,
                lineHeight: 1.55,
                padding: "10px 12px",
                background: "rgba(0,229,160,.05)",
                borderRadius: 7,
                borderLeft: "3px solid rgba(0,229,160,.3)",
              }}
            >
              Te dane trafiają wyłącznie do <strong style={{ color: "var(--text)" }}>stopki strony i danych Schema.org</strong> (legalName). Klienci B2B
              często sprawdzają NIP przed zamówieniem.
            </div>
            <div className={`${styles["form-grid"]} ${styles.cols2}`} style={{ marginBottom: 12 }}>
              <div className={styles.field}>
                <label>
                  Pełna nazwa firmy <span className={styles.opt}>stopka</span>
                </label>
                <input
                  type="text"
                  readOnly={firmaFromProfile}
                  value={form.nazwaFirma}
                  onChange={(e) => patchForm({ nazwaFirma: e.target.value })}
                  placeholder="np. AiO Oskar Sapożnikow"
                  style={firmaFromProfile ? { opacity: 0.7, cursor: "default", background: "rgba(0,229,160,.05)" } : undefined}
                />
              </div>
              <div className={styles.field}>
                <label>
                  NIP <span className={styles.opt}>stopka</span>
                </label>
                <input
                  type="text"
                  readOnly={firmaFromProfile}
                  value={form.nip}
                  onChange={(e) => patchForm({ nip: e.target.value })}
                  placeholder="np. 1544878899"
                  style={firmaFromProfile ? { opacity: 0.7, cursor: "default", background: "rgba(0,229,160,.05)" } : undefined}
                />
              </div>
            </div>
            <div className={styles.field} style={{ marginBottom: 12 }}>
              <label>
                Adres rejestrowy <span className={styles.opt}>stopka</span>
              </label>
              <input
                type="text"
                readOnly={firmaFromProfile}
                value={form.adresFirma}
                onChange={(e) => patchForm({ adresFirma: e.target.value })}
                placeholder="np. ul. Błotna 3/48, 00-001 Warszawa"
                style={firmaFromProfile ? { opacity: 0.7, cursor: "default", background: "rgba(0,229,160,.05)" } : undefined}
              />
            </div>
            {firmaFromProfile && (
              <div style={{ marginTop: 10, marginBottom: 10, fontSize: 12, color: "var(--muted)" }}>
                ✓ Dane pobrane z profilu konta.{" "}
                <a href="/dashboard/" style={{ color: "var(--green)", textDecoration: "none" }}>
                  Zmień w ustawieniach →
                </a>
              </div>
            )}
          </div>
        </details>

        <div className={styles.field}>
          <label>
            Krótki opis działalności <span className={styles.opt}>opcjonalnie — AI uzupełni</span>
          </label>
          <textarea
            value={form.opis}
            onChange={(e) => patchForm({ opis: e.target.value })}
            placeholder="np. Jesteśmy ekipą remontową z Mokotowa..."
          />
          <div className={styles["field-hint"]}>Jeśli zostawisz puste — AI sam napisze opis na podstawie branży i lokalizacji.</div>
        </div>

        <LogoUpload />
        {isPro && <HeroUpload />}

        <div className={styles.field}>
          <label>
            Twoje usługi <span className={styles.opt}>opcjonalnie — oddziel przecinkiem</span>
          </label>
          <input
            type="text"
            value={form.uslugi}
            onChange={(e) => patchForm({ uslugi: e.target.value })}
            placeholder="np. Wymiana rur, Usuwanie awarii, Montaż instalacji, Przeglądy"
          />
          <div className={styles["field-hint"]}>AI wygeneruje karty usług na ich podstawie. Bez tego — AI dobierze sam dla Twojej branży.</div>
        </div>

        <LayoutZonesSection />
      </div>

      <div className={styles["nav-btns"]}>
        <button className={styles["btn-prev"]} onClick={prev}>
          ← Wróć
        </button>
        <button className={styles["btn-next"]} onClick={next}>
          Dalej →
        </button>
      </div>
    </div>
  );
}
