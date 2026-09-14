"use client";

import { TEMPLATES_BASE } from "@/lib/templates-base";
import { TIER_LABEL, previewFile, templateManifestId } from "@/lib/galeria-data";
import type { GalleryEntry } from "@/lib/galeria-data";
import styles from "./Galeria.module.css";

// Port 1:1 z budowaniem karty w oryginalnej pętli interleaved.forEach(). W
// oryginale WSZYSTKIE 53 karty żyją w DOM naraz i paginacja/filtrowanie
// przełącza klasę .hide — tu prościej (i z tym samym efektem wizualnym):
// GaleriaShell renderuje tylko karty bieżącej strony, więc komponent nie musi
// znać pojęcia "ukryta karta" wcale.
export default function TemplateCard({
  entry,
  onOpen,
}: {
  entry: GalleryEntry;
  onOpen: (args: { branzaNazwa: string; tytul: string; file: string; templateId: string }) => void;
}) {
  const { branza, wariant } = entry;
  const [num, tytul, tagline, tier] = wariant;
  const file = previewFile(branza.slug, num, tytul, branza.titled);
  const thumb = TEMPLATES_BASE + "/galeria/thumbs/" + branza.slug + "-" + num + ".webp";

  return (
    <div
      className={styles.card}
      onClick={() => onOpen({ branzaNazwa: branza.nazwa, tytul, file: TEMPLATES_BASE + file, templateId: templateManifestId(branza.slug, num, tytul) })}
    >
      <span className={`${styles.tierBadge} ${styles[tier]}`}>{TIER_LABEL[tier]}</span>
      <div className={styles.cardThumbWrap}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className={styles.cardThumb} src={thumb} alt="" loading="lazy" />
      </div>
      <div className={styles.cardBody}>
        <div className={styles.cardTop}>
          <span className={styles.cardNum}>{num}</span>
          <span className={styles.cardBranza}>{branza.nazwa}</span>
        </div>
        <div className={styles.cardTagline}>{tagline}</div>
        <div className={styles.cardBtn}>Podgląd →</div>
      </div>
    </div>
  );
}
