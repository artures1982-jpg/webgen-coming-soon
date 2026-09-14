"use client";

import { useEffect } from "react";
import styles from "./Galeria.module.css";

export type ModalEntry = { branzaNazwa: string; tytul: string; file: string; templateId: string };

// Port 1:1 z #pmodal + openPreview/closePreview w galeria/index.html.
export default function PreviewModal({ entry, onClose }: { entry: ModalEntry | null; onClose: () => void }) {
  useEffect(() => {
    if (!entry) return;
    document.body.style.overflow = "hidden";
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
    };
  }, [entry, onClose]);

  return (
    <div className={`${styles.pmodal} ${entry ? styles.open : ""}`} onClick={(e) => e.target === e.currentTarget && onClose()}>
      {entry && (
        <div className={styles.pmodalBox}>
          <div className={styles.pmodalBar}>
            <div className={styles.pmodalInfo}>
              <div className={styles.pmodalBranza}>{entry.branzaNazwa}</div>
              <div className={styles.pmodalTitle}>{entry.tytul}</div>
            </div>
            <div className={styles.pmodalActions}>
              <a href={entry.file} target="_blank" rel="noopener noreferrer">
                Pełny ekran ↗
              </a>
              <a href={"/generator?template=" + encodeURIComponent(entry.templateId)} className={styles.pmodalCta}>
                Aktywuj ten szablon →
              </a>
              <button className={styles.pmodalClose} aria-label="Zamknij" onClick={onClose}>
                ✕
              </button>
            </div>
          </div>
          <iframe src={entry.file} title="Podgląd szablonu" />
        </div>
      )}
    </div>
  );
}
