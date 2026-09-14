"use client";

import { useGenerator } from "./GeneratorContext";
import styles from "./Generator.module.css";

// Port 1:1 z #preview-panel w generator/index.html. Przycisk "← Zmień styl"
// (showVariantPicker) z oryginału pominięty — wołał martwy #variant-popup, który
// istnieje wyłącznie dla nieosiągalnej ścieżki 3 wariantów (patrz useGeneration.ts).
// "Pobierz HTML" świadomie usunięte z całego produktu (i tu, i w panelu klienta) —
// Artur nie chce, żeby klienci mogli zabrać gotowy HTML poza webgen.pl.
export default function PreviewPanel({ onActivate }: { onActivate: () => void }) {
  const { gen } = useGenerator();

  return (
    <div className={styles["preview-panel"]}>
      <div className={styles["sp-header"]}>
        <div className={styles["sp-eyebrow"]}>{"// Gotowe!"}</div>
        <h1 className={styles["sp-title"]}>
          Twoja strona
          <br />
          jest gotowa
        </h1>
        <p className={styles["sp-sub"]}>Sprawdź podgląd poniżej. Możesz ją aktywować.</p>
      </div>
      <div className={styles["preview-toolbar"]}>
        <div className={styles["pt-info"]}>
          <div className={styles["pt-label"]}>Podgląd strony</div>
          <div className={styles["pt-url"]}>{(gen.slug || "twoja-firma") + ".webgen.pl"}</div>
        </div>
        <div className={styles["pt-btns"]}>
          <button className={styles["btn-activate"]} onClick={onActivate}>
            Aktywuj stronę →
          </button>
        </div>
      </div>
      <iframe className={styles["preview-frame"]} sandbox="allow-same-origin" srcDoc={gen.generatedHTML} />
    </div>
  );
}
