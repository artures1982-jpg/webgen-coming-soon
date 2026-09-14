"use client";

import type { ReactNode } from "react";
import { ADDONS_CONFIG, ADDONS_MONTHLY, ADDONS_ONCE, effectivePrice } from "@/lib/generator-helpers";
import { useGenerator } from "./GeneratorContext";
import styles from "./Generator.module.css";

// Port 1:1 z panel-5 w generator/index.html (wyświetlane jako "Krok 4 z 5" —
// numeracja paneli w tym porcie jest sekwencyjna 1-5, bez historycznej luki po
// usuniętym starym kroku wyboru planu).
export default function AddonsStep({ active }: { active: boolean }) {
  const { gen, patchGen } = useGenerator();

  function toggleAddon(id: string) {
    const cfg = ADDONS_CONFIG[id];
    patchGen({
      addons: gen.addons[id]
        ? Object.fromEntries(Object.entries(gen.addons).filter(([k]) => k !== id))
        : { ...gen.addons, [id]: { id, ...cfg } },
    });
  }

  const addonList = Object.values(gen.addons);
  const addonsOnce = addonList.filter((a) => a.type === "once").reduce((s, a) => s + a.price, 0);
  const addonsMonth = addonList.filter((a) => a.type === "month").reduce((s, a) => s + a.price, 0);
  const planEffective = effectivePrice(gen.planPrice, gen.billing);
  const total = planEffective + addonsMonth;
  const billingSuffix = gen.billing === "year" && gen.planPrice > 0 ? "/mies. (rocznie)" : "/mies.";
  const totalStr = addonsOnce > 0 ? total + " zł" + billingSuffix + " + " + addonsOnce + " zł jednorazowo" : total + " zł" + billingSuffix;

  return (
    <div className={`${styles["step-panel"]} ${active ? styles.active : ""}`}>
      <div className={styles["sp-header"]}>
        <div className={styles["sp-eyebrow"]}>{"// Krok 4 z 5"}</div>
        <h1 className={styles["sp-title"]}>
          Chcesz coś
          <br />
          dodać?
        </h1>
        <p className={styles["sp-sub"]}>Miesięczne możesz anulować w każdej chwili. Jednorazowe — aktywujemy w ciągu 48h.</p>
      </div>

      {gen.planPrice > 0 && (
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontFamily: "var(--mono)", fontSize: 9, fontWeight: 700, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--green)", marginBottom: 10 }}>
            {"// Rozliczanie planu "}
            <span style={{ color: "var(--muted)", textTransform: "none", letterSpacing: "normal" }}>{gen.planName}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", background: "rgba(255,255,255,.07)", border: "1.5px solid rgba(255,255,255,.12)", borderRadius: 10, padding: 4, width: "fit-content" }}>
            <button
              onClick={() => patchGen({ billing: "month" })}
              style={{
                background: gen.billing === "month" ? "rgba(0,229,160,.15)" : "transparent",
                border: gen.billing === "month" ? "1.5px solid var(--green)" : "none",
                color: gen.billing === "month" ? "var(--green)" : "var(--muted)",
                padding: "8px 20px",
                borderRadius: 7,
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "var(--head)",
                transition: "all .2s",
              }}
            >
              Miesięcznie
            </button>
            <button
              onClick={() => patchGen({ billing: "year" })}
              style={{
                background: gen.billing === "year" ? "rgba(0,229,160,.15)" : "transparent",
                border: gen.billing === "year" ? "1.5px solid var(--green)" : "none",
                color: gen.billing === "year" ? "var(--green)" : "var(--muted)",
                padding: "8px 20px",
                borderRadius: 7,
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "var(--head)",
                transition: "all .2s",
              }}
            >
              Rocznie <span style={{ background: "rgba(0,229,160,.15)", color: "var(--green)", fontSize: 10, padding: "2px 6px", borderRadius: 4, marginLeft: 4 }}>-17%</span>
            </button>
          </div>
        </div>
      )}

      <div style={{ fontFamily: "var(--mono)", fontSize: 9, fontWeight: 700, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--green)", marginBottom: 12 }}>
        {"// Miesięczne"}
      </div>
      <div className={styles["addon-list"]}>
        {ADDONS_MONTHLY.map((id) => (
          <AddonItem key={id} id={id} selected={!!gen.addons[id]} onToggle={() => toggleAddon(id)} />
        ))}
      </div>

      <div style={{ fontFamily: "var(--mono)", fontSize: 9, fontWeight: 700, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--muted)", marginTop: 28, marginBottom: 12 }}>
        {"// Jednorazowe (setup)"}
      </div>
      <div className={styles["addon-list"]}>
        {ADDONS_ONCE.map((id) => (
          <AddonItem key={id} id={id} selected={!!gen.addons[id]} onToggle={() => toggleAddon(id)} />
        ))}
      </div>

      <div className={styles["addon-summary"]}>
        <div className={styles["as-row"]}>
          <span>Plan</span>
          <span>{gen.planPrice === 0 ? "bezpłatny" : planEffective + billingSuffix}</span>
        </div>
        {addonList.map((a) => (
          <div className={styles["as-row"]} key={a.id}>
            <span>{a.name}</span>
            <span>
              {a.price} zł{a.type === "month" ? "/mies." : " jednorazowo"}
            </span>
          </div>
        ))}
        <div className={`${styles["as-row"]} ${styles.total}`}>
          <span>Razem</span>
          <span>{totalStr}</span>
        </div>
      </div>

      <div className={styles["nav-btns"]}>
        <button className={styles["btn-prev"]} onClick={() => patchGen({ currentStep: 3 })}>
          ← Wróć
        </button>
        <button className={styles["btn-next"]} onClick={() => patchGen({ currentStep: 5 })}>
          Dalej — generuj stronę →
        </button>
      </div>
    </div>
  );
}

function AddonItem({ id, selected, onToggle }: { id: string; selected: boolean; onToggle: () => void }) {
  const cfg = ADDONS_CONFIG[id];
  return (
    <div className={`${styles["addon-item"]} ${selected ? styles.selected : ""}`} onClick={onToggle}>
      <div className={styles["addon-check"]}>✓</div>
      <div className={styles["addon-icon-wrap"]}>{ADDON_ICONS[id]}</div>
      <div className={styles["addon-info"]}>
        <div className={styles["addon-name"]}>{cfg.name}</div>
        <div className={styles["addon-desc"]}>{ADDON_DESC[id]}</div>
      </div>
      <div>
        <div className={styles["addon-price-tag"]}>
          {cfg.type === "month" ? "+" : ""}
          {cfg.price} zł
        </div>
        <span className={styles["addon-price-type"]}>{cfg.type === "month" ? "miesięcznie" : "jednorazowo"}</span>
      </div>
    </div>
  );
}

const ADDON_DESC: Record<string, string> = {
  social_media: "Live feed z Instagram/Facebook wpięty w Twoją stronę",
  priorytetowe_wsparcie: "Odpowiedź w 30 min, dedykowany czat, szybsze aktualizacje",
  google_business: "Założymy i zoptymalizujemy profil w Mapach Google — zdjęcia, opisy, opinie",
  dodatkowe_podstrony: "3 osobne podstrony ofertowe (np. per usługa lub lokalizacja)",
  sesja_ai: "Zdjęcia AI dopasowane do branży i klimatu firmy",
};

const ADDON_ICONS: Record<string, ReactNode> = {
  social_media: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <rect x="7" y="2" width="10" height="20" rx="2" />
      <line x1="11" y1="18" x2="13" y2="18" />
    </svg>
  ),
  priorytetowe_wsparcie: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2c3 2 5 6 5 10 0 2-1 4-2 5l-3 3-3-3c-1-1-2-3-2-5 0-4 2-8 5-10z" />
      <circle cx="12" cy="10" r="1.7" />
      <path d="M9 16l-3 5 5-1" />
      <path d="M15 16l3 5-5-1" />
    </svg>
  ),
  google_business: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 21s7-6.6 7-12a7 7 0 0 0-14 0c0 5.4 7 12 7 12z" />
      <circle cx="12" cy="9" r="2.3" />
    </svg>
  ),
  dodatkowe_podstrony: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 3h7l4 4v14a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" />
      <line x1="9" y1="12" x2="15" y2="12" />
      <line x1="9" y1="16" x2="15" y2="16" />
    </svg>
  ),
  sesja_ai: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 8h3l1.5-2h7L17 8h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z" />
      <circle cx="12" cy="13" r="3.5" />
    </svg>
  ),
};
