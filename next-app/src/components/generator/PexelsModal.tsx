"use client";

import { useEffect, useState } from "react";
import { PEXELS_BRANZA_MAP } from "@/lib/generator-helpers";
import { useGenerator } from "./GeneratorContext";
import type { PexelsTarget } from "./GeneratorContext";

type Photo = { src?: { medium?: string; large?: string; large2x?: string; original?: string } };

function defaultQueryFor(target: PexelsTarget, branza: string): string {
  if (target === "hero") return PEXELS_BRANZA_MAP[branza] || branza || "professional service";
  const zoneId = target.replace("zone_", "");
  const hint: Record<string, string> = { hero: "", img1: " team work", img2: " before after" };
  return (PEXELS_BRANZA_MAP[branza] || "professional service") + (hint[zoneId] || "");
}

// Port 1:1 z #pexels-modal w generator/index.html — 100% inline-stylowany w
// oryginale (patrz komentarz w Generator.module.css), więc tu też inline zamiast
// klas modułu, żeby port był mechaniczny.
//
// Rozbity na dwa komponenty: zewnętrzny czyta tylko `pexelsTarget` z kontekstu i
// nie renderuje nic gdy modal zamknięty — dzięki temu PexelsModalContent montuje
// się na nowo przy każdym otwarciu (naturalny unmount/mount zamiast efektu
// resetującego stan), a domyślne zapytanie może być lazy-initializerem zamiast
// synchronicznego setState w efekcie.
export default function PexelsModal() {
  const { pexelsTarget } = useGenerator();
  if (!pexelsTarget) return null;
  return <PexelsModalContent target={pexelsTarget} />;
}

function PexelsModalContent({ target }: { target: PexelsTarget }) {
  const { closePexels, setZone, patchForm, gen } = useGenerator();
  const [query, setQuery] = useState(() => defaultQueryFor(target, gen.branza));
  const [photos, setPhotos] = useState<Photo[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Automatyczne wyszukanie domyślnego zapytania przy otwarciu modalu — wzorzec
  // fetch().then() bez synchronicznego setState w ciele efektu (setLoading/
  // setError idą przez zdarzenie kliknięcia w searchNow, nie efekt).
  useEffect(() => {
    let cancelled = false;
    fetch("/api/pexels?q=" + encodeURIComponent(query || "business") + "&per_page=36")
      .then((res) => {
        if (!res.ok) throw new Error("HTTP " + res.status);
        return res.json();
      })
      .then((data) => {
        if (!cancelled) setPhotos(data.photos || []);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : String(err));
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function searchNow() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/pexels?q=" + encodeURIComponent(query || "business") + "&per_page=36");
      if (!res.ok) throw new Error("HTTP " + res.status);
      const data = await res.json();
      setPhotos(data.photos || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  function selectPhoto(url: string) {
    if (target === "hero") {
      patchForm({ heroUrl: url });
    } else {
      const zoneId = target.replace("zone_", "") as "hero" | "img1" | "img2";
      setZone(zoneId, { url, source: "pexels" });
    }
    closePexels();
  }

  return (
    <div
      style={{
        display: "flex",
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "rgba(0,0,0,.88)",
        backdropFilter: "blur(10px)",
        alignItems: "center",
        justifyContent: "center",
      }}
      onClick={(e) => e.target === e.currentTarget && closePexels()}
    >
      <div
        style={{
          background: "#0F1420",
          border: "1px solid rgba(255,255,255,.14)",
          borderRadius: 18,
          width: "min(1100px,96vw)",
          maxHeight: "92vh",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <div style={{ padding: "18px 24px 14px", borderBottom: "1px solid rgba(255,255,255,.08)", display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 20 }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 8h3l1.5-2h7L17 8h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z" />
              <circle cx="12" cy="13" r="3.5" />
            </svg>
          </span>
          <h3 style={{ flex: 1, fontSize: 17, fontWeight: 800, margin: 0 }}>
            Wybierz zdjęcie — <span style={{ color: "#00E5A0" }}>Pexels</span>
          </h3>
          <button
            onClick={closePexels}
            style={{ background: "none", border: "none", color: "#8E97AC", fontSize: 22, cursor: "pointer", lineHeight: 1, padding: "4px 8px", borderRadius: 6 }}
          >
            ✕
          </button>
        </div>

        <div style={{ display: "flex", gap: 10, padding: "14px 24px", borderBottom: "1px solid rgba(255,255,255,.08)" }}>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="np. hydraulik, remont, fryzjer…"
            onKeyDown={(e) => e.key === "Enter" && searchNow()}
            style={{
              flex: 1,
              background: "rgba(255,255,255,.06)",
              border: "1.5px solid rgba(255,255,255,.12)",
              borderRadius: 9,
              padding: "10px 14px",
              fontSize: 14,
              color: "#F3F6FC",
              fontFamily: "var(--head)",
              outline: "none",
            }}
          />
          <button
            onClick={searchNow}
            style={{ background: "#00E5A0", color: "#05100d", border: "none", padding: "10px 22px", borderRadius: 9, fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "var(--head)" }}
          >
            Szukaj →
          </button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, padding: "14px 20px", overflowY: "scroll", flex: 1, minHeight: 280, maxHeight: "65vh", alignContent: "start" }}>
          {loading && (
            <div style={{ gridColumn: "1/-1", textAlign: "center", padding: 40, color: "#8E97AC", fontFamily: "var(--mono)", fontSize: 13 }}>Szukam...</div>
          )}
          {!loading && error && (
            <div style={{ gridColumn: "1/-1", textAlign: "center", padding: 32, color: "#D14D5F", fontSize: 13 }}>{error}</div>
          )}
          {!loading && !error && photos && photos.length === 0 && (
            <div style={{ gridColumn: "1/-1", textAlign: "center", padding: 32, color: "#8E97AC", fontSize: 13 }}>Brak wyników dla: {query}</div>
          )}
          {!loading &&
            !error &&
            photos?.map((p, i) => {
              const src = p.src?.medium || p.src?.large;
              const full = p.src?.large2x || p.src?.large || p.src?.original;
              if (!src) return null;
              return (
                <div
                  key={i}
                  onClick={() => selectPhoto(full || src)}
                  style={{ cursor: "pointer", borderRadius: 10, overflow: "hidden", border: "2px solid transparent", transition: "all .18s" }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} loading="lazy" alt="" style={{ width: "100%", height: "auto", display: "block", borderRadius: 8 }} />
                </div>
              );
            })}
        </div>

        <div style={{ padding: "12px 24px", borderTop: "1px solid rgba(255,255,255,.08)", fontSize: 11, color: "rgba(142,151,172,.4)", fontFamily: "var(--mono)", textAlign: "center" }}>
          Zdjęcia:{" "}
          <a href="https://pexels.com" target="_blank" rel="noreferrer" style={{ color: "#00E5A0", textDecoration: "none" }}>
            Pexels
          </a>{" "}
          · bezpłatne do użytku komercyjnego
        </div>
      </div>
    </div>
  );
}
