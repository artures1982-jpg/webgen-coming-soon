"use client";

import { PLAN_SUMMARY_FEATURES, effectivePrice } from "@/lib/generator-helpers";
import { useGenerator } from "./GeneratorContext";
import styles from "./Generator.module.css";

// Port 1:1 z panel-6 w generator/index.html. Krok 5 (dawny "krok 6" w oryginale)
// nie wybiera planu od nowa — to zrobił krok 1 (wybór szablonu w /galeria/). Tu
// tylko podgląd read-only + link "Zmień szablon ←" wracający do kroku 1.
export default function SummaryStep({ active, onGenerate }: { active: boolean; onGenerate: () => void }) {
  const { gen, form, patchGen } = useGenerator();

  const addonList = Object.values(gen.addons);
  const addonsOnce = addonList.filter((a) => a.type === "once").reduce((s, a) => s + a.price, 0);
  const addonsMonth = addonList.filter((a) => a.type === "month").reduce((s, a) => s + a.price, 0);
  const planEffective = effectivePrice(gen.planPrice, gen.billing);
  const total = planEffective + addonsMonth;
  const features = PLAN_SUMMARY_FEATURES[gen.plan];

  return (
    <div className={`${styles["step-panel"]} ${active ? styles.active : ""}`}>
      <div className={styles["sp-header"]}>
        <div className={styles["sp-eyebrow"]}>{"// Krok 5 z 5"}</div>
        <h1 className={styles["sp-title"]}>
          Podsumowanie
          <br />
          <span style={{ background: "var(--grad)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
            i uruchomienie strony
          </span>
        </h1>
        <p className={styles["sp-sub"]}>
          Zacznij za darmo — 6 miesięcy bez opłat. Plan zmienisz wybierając inny szablon w kroku 1, albo w każdej chwili później.
        </p>
      </div>

      <div
        style={{
          background: "var(--s2)",
          border: "1px solid var(--border2)",
          borderRadius: 10,
          padding: "14px 18px",
          marginBottom: 22,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 8,
        }}
      >
        <div style={{ fontSize: 13, color: "var(--muted)" }}>
          Konfiguracja:{" "}
          <span style={{ color: "var(--text)", fontWeight: 600 }}>
            {form.nazwaStrony || "Twoja firma"} · {gen.branza} · {form.miasto}
          </span>
        </div>
        <div style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--green)" }}>
          {addonList.length > 0 ? addonList.length + " dodatek(ów) wybranych" : "Brak dodatków"}
        </div>
      </div>

      <div style={{ marginBottom: 20 }}>
        <div style={{ fontFamily: "var(--mono)", fontSize: 9, fontWeight: 700, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 10, paddingBottom: 6, borderBottom: "1px solid var(--border)" }}>
          Wybrany plan
        </div>
        <div style={{ position: "relative", background: "var(--s2)", border: "1.5px solid var(--green)", borderRadius: 10, padding: "16px 18px", display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 14, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text)", marginBottom: 6 }}>{gen.planName}</div>
            <div style={{ fontSize: 11, color: "var(--muted)", lineHeight: 1.7 }}>
              {features.map((f, i) => (
                <span key={i}>
                  <span style={{ color: "var(--green)" }}>✓</span> {f}
                  {i < features.length - 1 && <br />}
                </span>
              ))}
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
            <div style={{ fontFamily: "var(--mono)", fontSize: 19, fontWeight: 700, color: "var(--green)", whiteSpace: "nowrap" }}>
              {gen.planPrice === 0 ? "Bezpłatny" : planEffective + " zł/mies." + (gen.billing === "year" ? " (rocznie)" : "")}
            </div>
            <span
              onClick={() => patchGen({ currentStep: 1 })}
              style={{ fontSize: 12, color: "var(--green)", cursor: "pointer", textDecoration: "underline", whiteSpace: "nowrap" }}
            >
              Zmień szablon ←
            </span>
          </div>
        </div>
      </div>

      <div style={{ background: "var(--s2)", border: "1px solid var(--border2)", borderRadius: 10, padding: "16px 18px", marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
          <span style={{ fontSize: 13, color: "var(--muted)" }}>Wybrany plan:</span>
          <span style={{ fontSize: 14, fontWeight: 700, color: "var(--text)" }}>{gen.planName}</span>
        </div>
        <div style={{ marginBottom: 8 }}>
          {addonList.length > 0 ? (
            addonList.map((a) => (
              <div key={a.id} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--muted)", marginBottom: 4 }}>
                <span>{a.name}</span>
                <span style={{ fontFamily: "var(--mono)" }}>
                  {a.price} zł{a.type === "once" ? " jednorazowo" : "/mies."}
                </span>
              </div>
            ))
          ) : (
            <span style={{ color: "rgba(142,151,172,.4)" }}>Brak dodatków</span>
          )}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--border)", paddingTop: 10 }}>
          <span style={{ fontSize: 14, fontWeight: 700 }}>Razem</span>
          <span style={{ fontFamily: "var(--mono)", fontSize: 22, fontWeight: 700, color: "var(--green)" }}>
            {total} zł/mies.{addonsOnce > 0 ? " + " + addonsOnce + " zł jednorazowo" : ""}
          </span>
        </div>
      </div>

      <div className={styles["nav-btns"]}>
        <button className={styles["btn-prev"]} onClick={() => patchGen({ currentStep: 4 })}>
          ← Wróć
        </button>
        <button
          style={{
            background: "var(--green)",
            color: "var(--oncta)",
            border: "none",
            padding: "14px 32px",
            borderRadius: 10,
            fontSize: 16,
            fontWeight: 700,
            cursor: "pointer",
            fontFamily: "var(--head)",
            display: "flex",
            alignItems: "center",
            gap: 10,
            transition: "background .2s",
          }}
          onClick={onGenerate}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ width: 18, height: 18 }}>
            <path d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Generuj i aktywuj stronę
        </button>
      </div>
    </div>
  );
}
