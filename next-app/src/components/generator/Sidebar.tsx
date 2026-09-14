"use client";

import { STEPS, effectivePrice } from "@/lib/generator-helpers";
import { useGenerator } from "./GeneratorContext";
import styles from "./Generator.module.css";

// Port 1:1 z .sidebar w generator/index.html (goToStep/setStep — tylko wstecz).
// .sidebar-tip/.cost-preview z oryginału pominięte — martwy kod (JS odwoływał się
// do id-ków, których nie było w markupie, patrz komentarz w Generator.module.css).
export default function Sidebar({ visible }: { visible: boolean }) {
  const { gen, patchGen } = useGenerator();

  function goToStep(n: number) {
    if (n > gen.currentStep) return;
    patchGen({ currentStep: n });
  }

  const price = effectivePrice(gen.planPrice, gen.billing);
  const priceLabel = gen.planPrice === 0 ? "Bezpłatny" : price + (gen.billing === "year" ? " zł/mies. (rocznie)" : " zł/mies.");

  return (
    <aside className={styles.sidebar}>
      <div>
        <div className={styles["steps-label"]}>Postęp</div>
        <div className={styles.steps}>
          {STEPS.map((s) => (
            <div
              key={s.n}
              className={`${styles.step} ${!visible ? styles.active : gen.currentStep === s.n ? styles.active : gen.currentStep > s.n ? styles.done : ""}`}
              onClick={() => visible && goToStep(s.n)}
            >
              <div className={styles["step-num"]}>{visible && gen.currentStep > s.n ? "" : s.n}</div>
              <div className={styles["step-label"]}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {gen.templateId && (
        <div
          style={{
            marginTop: "auto",
            padding: "10px 14px",
            background: "rgba(0,229,160,.07)",
            border: "1px solid rgba(0,229,160,.18)",
            borderRadius: 9,
          }}
        >
          <div
            style={{
              fontFamily: "var(--mono)",
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: ".12em",
              textTransform: "uppercase",
              color: "var(--green)",
              opacity: 0.7,
              marginBottom: 4,
            }}
          >
            Wybrany plan
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>{gen.planName}</span>
            <span style={{ fontFamily: "var(--mono)", fontSize: 13, fontWeight: 700, color: "var(--green)" }}>{priceLabel}</span>
          </div>
        </div>
      )}
    </aside>
  );
}
