"use client";

import { TIER_LABEL } from "@/lib/generator-helpers";
import { TEMPLATES_BASE } from "@/lib/templates-base";
import { useGenerator } from "./GeneratorContext";
import styles from "./Generator.module.css";

// Port 1:1 z panel-1 + renderTemplateSummary() w generator/index.html. "Zmień"
// wraca do /galeria/ zamiast cofać do wyboru na miejscu — generator nie ma już
// własnej siatki branż/galerii (project_generator_scope_brand_fit).
export default function TemplateLocationStep({ active }: { active: boolean }) {
  const { gen, form, patchForm, patchGen } = useGenerator();

  function next() {
    if (!form.miasto.trim()) {
      alert("Wpisz miasto");
      return;
    }
    patchGen({ currentStep: 2 });
  }

  return (
    <div className={`${styles["step-panel"]} ${active ? styles.active : ""}`}>
      <div className={styles["sp-header"]}>
        <div className={styles["sp-eyebrow"]}>{"// Krok 1 z 5"}</div>
        <h1 className={styles["sp-title"]}>Prawie gotowe!</h1>
        <p className={styles["sp-sub"]}>Zostało tylko miasto i dzielnica — reszta jest już ustawiona.</p>
      </div>

      {gen.templateId && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            background: "rgba(0,229,160,.06)",
            border: "1px solid rgba(0,229,160,.25)",
            borderRadius: 12,
            padding: "14px 16px",
          }}
        >
          {gen.templateThumb && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={TEMPLATES_BASE + gen.templateThumb}
              alt=""
              style={{ width: 64, height: 44, objectFit: "cover", borderRadius: 6, flexShrink: 0 }}
            />
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>
              Wybrany szablon: {gen.templateTitle}{" "}
              <span style={{ fontFamily: "var(--mono)", fontSize: 9, fontWeight: 700, letterSpacing: ".06em", color: "var(--muted)" }}>
                {TIER_LABEL[gen.templateTier || "free"]}
              </span>
            </div>
            <div style={{ fontSize: 12, color: "var(--muted)" }}>{gen.branza}</div>
          </div>
          <a href="/galeria/" style={{ color: "var(--green)", fontSize: 12, fontWeight: 700, whiteSpace: "nowrap", textDecoration: "none" }}>
            Zmień
          </a>
        </div>
      )}

      <div className={`${styles["form-grid"]} ${styles.cols2}`} style={{ marginTop: 28 }}>
        <div className={styles.field}>
          <label>
            Miasto <span className={styles.req}>*</span>
          </label>
          <input type="text" placeholder="np. Warszawa" required value={form.miasto} onChange={(e) => patchForm({ miasto: e.target.value })} />
        </div>
        <div className={styles.field}>
          <label>
            Dzielnica <span className={styles.opt}>opcjonalnie</span>
          </label>
          <input type="text" placeholder="np. Mokotów" value={form.dzielnica} onChange={(e) => patchForm({ dzielnica: e.target.value })} />
        </div>
      </div>

      <div className={styles["nav-btns"]}>
        <button className={styles["btn-next"]} onClick={next}>
          Dalej →
        </button>
      </div>
    </div>
  );
}
