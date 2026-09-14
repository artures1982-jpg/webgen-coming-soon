"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Footer from "@/components/Footer";
import {
  CATEGORIES,
  TIER_ORDER,
  TIER_FILTER_LABEL,
  TOTAL_COUNT,
  branzaObj,
  categoryOf,
  categoryCount,
  tierCount,
  interleavedEntries,
} from "@/lib/galeria-data";
import TemplateCard from "./TemplateCard";
import PreviewModal from "./PreviewModal";
import type { ModalEntry } from "./PreviewModal";
import styles from "./Galeria.module.css";

const PAGE_SIZE = 12;
const ALL_ENTRIES = interleavedEntries();

// Port 1:1 z galeria/index.html — filtrowanie po kategorii/branży/planie +
// paginacja + modal podglądu. ?plan= z URL ustawia wstępny filtr planu (linkowane
// z /cennik/) — tu czytane server-side w page.tsx i przekazane jako initialTier,
// zamiast client-side useSearchParams()+Suspense, żeby uniknąć dodatkowej granicy
// Suspense dla czysto jednorazowej wartości startowej.
export default function GaleriaShell({ initialTier }: { initialTier: string | null }) {
  const [activeCat, setActiveCat] = useState("all");
  const [activeSub, setActiveSub] = useState<string | null>(null);
  const [activeTier, setActiveTier] = useState<string | null>(initialTier);
  const [page, setPage] = useState(1);
  const [modalEntry, setModalEntry] = useState<ModalEntry | null>(null);

  function selectCategory(catId: string) {
    setActiveCat(catId);
    setActiveSub(null);
    setPage(1);
  }
  function selectSub(slug: string | null) {
    setActiveSub((s) => (slug === null ? null : s === slug ? null : slug));
    setPage(1);
  }
  function selectTier(tier: string | null) {
    setActiveTier((t) => (tier === null ? null : t === tier ? null : tier));
    setPage(1);
  }

  const matching = useMemo(() => {
    const branzeToShow = activeCat !== "all" ? (activeSub ? [activeSub] : categoryOf(activeCat)?.branze || []) : null;
    return ALL_ENTRIES.filter((e) => {
      if (branzeToShow && !branzeToShow.includes(e.branza.slug)) return false;
      if (activeTier && e.wariant[3] !== activeTier) return false;
      return true;
    });
  }, [activeCat, activeSub, activeTier]);

  const totalPages = Math.max(1, Math.ceil(matching.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * PAGE_SIZE;
  const pageItems = matching.slice(start, start + PAGE_SIZE);

  function goToPage(n: number) {
    setPage(n);
    document.getElementById("gallery")?.scrollIntoView({ block: "start", behavior: "smooth" });
  }

  const activeCategory = activeCat !== "all" ? categoryOf(activeCat) : undefined;

  return (
    <div className={styles.root}>
      <div className={styles.pageGlow}>
        <div className={`${styles.meshBlob} ${styles.mb1}`}></div>
        <div className={`${styles.meshBlob} ${styles.mb2}`}></div>
      </div>

      <section className={styles.hero}>
        <div className={styles.heroEyebrow}>Galeria</div>
        <h1>
          53 gotowe warianty,
          <br />
          <span>12 branż</span>
        </h1>
        <p className={styles.heroSub}>
          Każdy szablon zobaczysz wypełniony realną treścią, zanim go wybierzesz. Filtruj po kategorii i sprawdź podgląd na żywo.
        </p>
      </section>

      <div className={styles.filters}>
        <select
          className={styles.catSelect}
          aria-label="Filtruj po kategorii"
          value={activeCat}
          onChange={(e) => selectCategory(e.target.value)}
        >
          <option value="all">Wszystkie kategorie ({TOTAL_COUNT})</option>
          {CATEGORIES.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.nazwa} ({categoryCount(cat)})
            </option>
          ))}
        </select>
      </div>

      {activeCategory && (
        <div className={styles.subfilters}>
          <button
            className={`${styles.chip} ${styles.sub} ${activeSub === null ? styles.active : ""}`}
            onClick={() => selectSub(null)}
          >
            Cała kategoria <span className={styles.n}>{categoryCount(activeCategory)}</span>
          </button>
          {activeCategory.branze.map((slug) => {
            const b = branzaObj(slug)!;
            return (
              <button
                key={slug}
                className={`${styles.chip} ${styles.sub} ${activeSub === slug ? styles.active : ""}`}
                onClick={() => selectSub(slug)}
              >
                {b.nazwa} <span className={styles.n}>{b.warianty.length}</span>
              </button>
            );
          })}
        </div>
      )}

      <div className={styles.subfilters}>
        <button className={`${styles.chip} ${styles.sub} ${activeTier === null ? styles.active : ""}`} onClick={() => selectTier(null)}>
          Wszystkie plany <span className={styles.n}>{TOTAL_COUNT}</span>
        </button>
        {TIER_ORDER.map((tier) => (
          <button key={tier} className={`${styles.chip} ${styles.sub} ${activeTier === tier ? styles.active : ""}`} onClick={() => selectTier(tier)}>
            {TIER_FILTER_LABEL[tier]} <span className={styles.n}>{tierCount(tier)}</span>
          </button>
        ))}
      </div>

      <div className={styles.countRow}>
        {matching.length === 0
          ? "0 / " + TOTAL_COUNT + " szablonów"
          : start + 1 + "–" + Math.min(start + PAGE_SIZE, matching.length) + " z " + matching.length + " szablonów"}
      </div>

      <div className={styles.gallery} id="gallery">
        {pageItems.map((entry) => (
          <TemplateCard key={entry.branza.slug + entry.wariant[0]} entry={entry} onOpen={setModalEntry} />
        ))}
      </div>

      {totalPages > 1 && (
        <div className={styles.pagination}>
          <button className={`${styles.pageBtn} ${styles.nav}`} disabled={currentPage === 1} onClick={() => goToPage(currentPage - 1)}>
            ← Poprzednia
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
            <button key={n} className={`${styles.pageBtn} ${n === currentPage ? styles.active : ""}`} onClick={() => goToPage(n)}>
              {n}
            </button>
          ))}
          <button className={`${styles.pageBtn} ${styles.nav}`} disabled={currentPage === totalPages} onClick={() => goToPage(currentPage + 1)}>
            Następna →
          </button>
        </div>
      )}

      <section className={styles.customCta}>
        <div className={styles.heroEyebrow}>Nie widzisz tu swojej strony?</div>
        <h2 className={styles.customCtaTitle}>Albo nie pasuje Ci żaden z szablonów?</h2>
        <p className={styles.heroSub}>Zaprojektujemy dla Ciebie stronę od zera, dopasowaną wyłącznie do Twojej firmy.</p>
        <Link href="/#kontakt" className={styles.customCtaBtn}>
          Zamów projekt indywidualny →
        </Link>
      </section>

      <PreviewModal entry={modalEntry} onClose={() => setModalEntry(null)} />

      <Footer />
    </div>
  );
}
