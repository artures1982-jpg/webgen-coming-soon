"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./HeroVisual.module.css";

// Port 1:1 z hero-visual w index.html (legacy) — stos trzech "mockupów" przeglądarki
// + trzy chipy z count-up. Animacja liczników startuje dopiero gdy chip wjedzie w
// viewport (IntersectionObserver), tak jak w oryginale.
function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

function Counter({ target }: { target: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [value, setValue] = useState(() =>
    prefersReducedMotion() || (typeof window !== "undefined" && !("IntersectionObserver" in window))
      ? target
      : 0
  );

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (prefersReducedMotion() || !("IntersectionObserver" in window)) return;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          io.unobserve(entry.target);
          const duration = 1100;
          let start: number | null = null;
          function step(ts: number) {
            if (start === null) start = ts;
            const progress = Math.min((ts - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setValue(Math.round(eased * target));
            if (progress < 1) requestAnimationFrame(step);
            else setValue(target);
          }
          requestAnimationFrame(step);
        });
      },
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [target]);

  return <span ref={ref}>{value}</span>;
}

export default function HeroVisual() {
  return (
    <div className={styles.heroVisual} aria-hidden="true">
      <div className={`${styles.mock} ${styles.mockC}`}>
        <div className={styles.mockBar} />
        <div className={styles.mockFile}>stomatolog / start.html</div>
        <div className={styles.mockBody}>
          <div className={`${styles.mockLine} ${styles.w40}`} />
          <div className={styles.mockHero} />
          <div className={styles.mockCards}>
            <div />
            <div />
            <div />
          </div>
        </div>
      </div>
      <div className={`${styles.mock} ${styles.mockB}`}>
        <div className={styles.mockBar} />
        <div className={styles.mockFile}>fryzjer / pro.html</div>
        <div className={styles.mockBody}>
          <div className={`${styles.mockLine} ${styles.w60}`} />
          <div className={styles.mockHero} />
          <div className={styles.mockCards}>
            <div />
            <div />
            <div />
          </div>
        </div>
      </div>
      <div className={`${styles.mock} ${styles.mockA}`}>
        <div className={styles.mockBar} />
        <div className={styles.mockFile}>hydraulik / petarda.html</div>
        <div className={styles.mockBody}>
          <div className={`${styles.mockLine} ${styles.w60}`} />
          <div className={`${styles.mockLine} ${styles.w40}`} />
          <div className={styles.mockHero} />
          <div className={styles.mockCards}>
            <div />
            <div />
            <div />
          </div>
        </div>
      </div>

      <div className={`${styles.chip} ${styles.chipWarianty}`}>
        <span className={styles.n}>
          <Counter target={53} />
        </span>
        <span className={styles.l}>warianty</span>
      </div>
      <div className={`${styles.chip} ${styles.chipBranze}`}>
        <span className={styles.n}>
          <Counter target={12} />
        </span>
        <span className={styles.l}>branż</span>
      </div>
      <div className={`${styles.chip} ${styles.chipSpeed}`}>
        <span className={styles.n}>
          <Counter target={90} />+
        </span>
        <span className={styles.l}>pagespeed</span>
      </div>
    </div>
  );
}
