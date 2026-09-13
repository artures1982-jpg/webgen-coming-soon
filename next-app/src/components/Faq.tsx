"use client";

import { useState } from "react";
import styles from "./Faq.module.css";

export type FaqEntry = { q: string; a: string };

export default function Faq({ items }: { items: FaqEntry[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <>
      {items.map((item, i) => {
        const open = openIndex === i;
        return (
          <div key={item.q} className={`${styles.item} ${open ? styles.open : ""}`}>
            <div
              className={styles.q}
              onClick={() => setOpenIndex(open ? null : i)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") setOpenIndex(open ? null : i);
              }}
            >
              {item.q}
              <span className={styles.arrow}>+</span>
            </div>
            <div className={styles.a}>
              <p>{item.a}</p>
            </div>
          </div>
        );
      })}
    </>
  );
}
