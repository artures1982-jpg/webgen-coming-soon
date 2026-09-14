"use client";

import { toWebP } from "@/lib/image-convert";
import type { ZoneId } from "@/lib/generator-helpers";
import { useGenerator } from "./GeneratorContext";
import styles from "./Generator.module.css";

// Port 1:1 z blok "VISUAL LAYOUT — ZDJĘCIA" + updateLivePreview() w
// generator/index.html. W oryginale updateLivePreview() synchronizuje DOM mocka
// ręcznie po każdym oninput; tu wartości mocka są po prostu odczytywane
// bezpośrednio z `form` przy renderze — nie trzeba osobnej funkcji synchronizującej.
function Zone({ zoneId, height, label, sublabel }: { zoneId: ZoneId; height: number; label: string; sublabel?: string }) {
  const { form, setZone, openPexels } = useGenerator();
  const zone = form.zones[zoneId];

  async function handleUpload(file: File | undefined) {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert("Plik za duży — maks. 5 MB");
      return;
    }
    try {
      const data = await toWebP(file);
      setZone(zoneId, { url: data, source: "base64" });
    } catch {
      const reader = new FileReader();
      reader.onload = (ev) => setZone(zoneId, { url: ev.target?.result as string, source: "base64" });
      reader.readAsDataURL(file);
    }
  }

  return (
    <div>
      <div
        className={`${styles["img-zone"]} ${zone ? styles["has-img"] : ""}`}
        style={{ height, borderRadius: 8 }}
        onClick={() => document.getElementById("inp-" + zoneId)?.click()}
      >
        {zone && (
          // eslint-disable-next-line @next/next/no-img-element
          <img className={styles["zone-preview"]} src={zone.url} alt="" />
        )}
        <div className={styles["img-zone-overlay"]}>
          <span>Zmień</span>
        </div>
        <div className={styles["img-zone-icon"]}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="16" rx="2" />
            <circle cx="8.5" cy="10" r="1.7" />
            <path d="M21 16l-5.5-5.5L9 17" />
          </svg>
        </div>
        <div className={styles["img-zone-label"]}>
          {label}
          {sublabel && (
            <>
              <br />
              <span style={{ fontSize: 9, color: "rgba(142,151,172,.5)" }}>{sublabel}</span>
            </>
          )}
        </div>
        <div className={styles["img-zone-hint"]}>Kliknij = dysk</div>
        <input
          type="file"
          id={"inp-" + zoneId}
          accept="image/*"
          style={{ display: "none" }}
          onChange={(e) => handleUpload(e.target.files?.[0])}
        />
      </div>
      <div className={styles["img-zone-btns"]}>
        <button className={styles["btn-zone-pexels"]} onClick={() => openPexels(`zone_${zoneId}`)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 8h3l1.5-2h7L17 8h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z" />
            <circle cx="12" cy="13" r="3.5" />
          </svg>{" "}
          Dodaj z Pexels
        </button>
        <button className={`${styles["btn-zone-clear"]} ${zone ? styles.visible : ""}`} onClick={() => setZone(zoneId, null)}>
          ✕ Usuń
        </button>
      </div>
    </div>
  );
}

export default function LayoutZonesSection() {
  const { form } = useGenerator();
  const uslugi = form.uslugi
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const defaults = ["Usługa 1", "Usługa 2", "Usługa 3"];

  return (
    <div className={styles.field}>
      <label style={{ marginBottom: 12, display: "block" }}>
        Zdjęcia strony <span className={styles.opt}>kliknij pole lub dodaj z Pexels</span>
      </label>
      <div className={styles["layout-preview"]}>
        <div className={styles["lp-header"]}>
          <div className={styles["lp-label"]}>Podgląd layoutu Twojej strony</div>
          <div>
            <span className={styles["lp-dot"]} style={{ background: "#ff5f57" }}></span>
            <span className={styles["lp-dot"]} style={{ background: "#febc2e" }}></span>
            <span className={styles["lp-dot"]} style={{ background: "#28c840" }}></span>
          </div>
        </div>
        <div style={{ padding: 12 }}>
          {/* NAV */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "5px 8px",
              background: "rgba(255,255,255,.07)",
              borderRadius: 4,
              marginBottom: 8,
              border: "0.5px solid rgba(255,255,255,.12)",
            }}
          >
            <div
              style={{
                width: form.nazwaStrony ? "auto" : 40,
                maxWidth: form.nazwaStrony ? 80 : undefined,
                height: 6,
                background: "rgba(0,229,160,.5)",
                borderRadius: 3,
                overflow: "hidden",
                whiteSpace: "nowrap",
                fontSize: form.nazwaStrony ? 6 : undefined,
                color: "rgba(0,229,160,.9)",
                display: "flex",
                alignItems: "center",
                padding: "0 4px",
                fontFamily: "monospace",
                fontWeight: 700,
              }}
            >
              {form.nazwaStrony}
            </div>
            <div style={{ display: "flex", gap: 5 }}>
              <div style={{ width: 22, height: 4, background: "rgba(255,255,255,.16)", borderRadius: 2 }}></div>
              <div style={{ width: 22, height: 4, background: "rgba(255,255,255,.16)", borderRadius: 2 }}></div>
              <div style={{ width: 22, height: 4, background: "rgba(255,255,255,.16)", borderRadius: 2 }}></div>
            </div>
            <div style={{ width: 30, height: 6, background: "rgba(0,229,160,.3)", borderRadius: 3 }}></div>
          </div>

          {/* HERO ZONE */}
          <div style={{ marginBottom: 8 }}>
            <Zone zoneId="hero" height={120} label="Zdjęcie główne — Hero" sublabel="pełna szerokość · pierwsze wrażenie" />
          </div>

          {/* O NAS */}
          <div style={{ background: "rgba(255,255,255,.04)", borderRadius: 6, padding: 8, marginBottom: 7, border: "0.5px solid rgba(255,255,255,.09)" }}>
            <div style={{ fontSize: 8, color: "rgba(142,151,172,.4)", fontFamily: "monospace", marginBottom: 5, textTransform: "uppercase", letterSpacing: ".08em" }}>
              {"// O nas"}
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <div style={{ flex: 1 }}>
                <div style={{ height: 5, background: "rgba(255,255,255,.14)", borderRadius: 2, marginBottom: 3, width: "75%" }}></div>
                <div style={{ height: 3, background: "rgba(255,255,255,.08)", borderRadius: 2, marginBottom: 2 }}></div>
                <div style={{ height: 3, background: "rgba(255,255,255,.08)", borderRadius: 2, width: "85%" }}></div>
              </div>
              <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(0,229,160,.7)", minWidth: 24 }}>{form.lata ? form.lata + "+" : "10+"}</div>
                  <div style={{ height: 3, background: "rgba(255,255,255,.09)", borderRadius: 1, width: 24, marginTop: 2 }}></div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(0,229,160,.7)", minWidth: 28 }}>{form.realizacje || "250"}</div>
                  <div style={{ height: 3, background: "rgba(255,255,255,.09)", borderRadius: 1, width: 28, marginTop: 2 }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* USŁUGI */}
          <div style={{ background: "rgba(255,255,255,.04)", borderRadius: 6, padding: 8, marginBottom: 7, border: "0.5px solid rgba(255,255,255,.09)" }}>
            <div style={{ fontSize: 8, color: "rgba(142,151,172,.4)", fontFamily: "monospace", marginBottom: 5, textTransform: "uppercase", letterSpacing: ".08em" }}>
              {"// Usługi"}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 4 }}>
              {[0, 1, 2].map((i) => (
                <div key={i} style={{ background: "rgba(255,255,255,.06)", borderRadius: 4, padding: 5, borderLeft: "2px solid rgba(0,229,160,.4)" }}>
                  <div style={{ fontSize: 9, fontWeight: 600, color: uslugi[i] ? "rgba(0,229,160,.9)" : "rgba(255,255,255,.5)", marginBottom: 2 }}>
                    {uslugi[i] || defaults[i]}
                  </div>
                  <div style={{ height: 3, background: "rgba(255,255,255,.08)", borderRadius: 1 }}></div>
                </div>
              ))}
            </div>
          </div>

          {/* GALERIA */}
          <div style={{ background: "rgba(255,255,255,.04)", borderRadius: 6, padding: 8, marginBottom: 7, border: "0.5px solid rgba(255,255,255,.09)" }}>
            <div style={{ fontSize: 8, color: "rgba(142,151,172,.4)", fontFamily: "monospace", marginBottom: 5, textTransform: "uppercase", letterSpacing: ".08em" }}>
              {"// Galeria / Realizacje"}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
              <Zone zoneId="img1" height={80} label="Realizacja 1" />
              <Zone zoneId="img2" height={80} label="Realizacja 2" />
            </div>
          </div>

          {/* KONTAKT */}
          <div style={{ background: "rgba(255,255,255,.04)", borderRadius: 6, padding: 8, marginBottom: 7, border: "0.5px solid rgba(255,255,255,.09)" }}>
            <div style={{ fontSize: 8, color: "rgba(142,151,172,.4)", fontFamily: "monospace", marginBottom: 5, textTransform: "uppercase", letterSpacing: ".08em" }}>
              {"// Kontakt"}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <div style={{ flex: 1 }}>
                <div style={{ height: 4, background: "rgba(255,255,255,.12)", borderRadius: 1, marginBottom: 3, width: "55%" }}></div>
                <div style={{ height: 3, background: "rgba(255,255,255,.08)", borderRadius: 1, marginBottom: 2 }}></div>
                <div style={{ height: 3, background: "rgba(255,255,255,.08)", borderRadius: 1, width: "80%" }}></div>
              </div>
              <div
                style={{
                  width: 70,
                  height: 42,
                  border: "0.5px dashed rgba(255,255,255,.16)",
                  borderRadius: 4,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <span style={{ fontSize: 9, color: "rgba(136,146,170,.3)" }}>map</span>
              </div>
            </div>
          </div>

          {/* FOOTER */}
          <div
            style={{
              background: "rgba(255,255,255,.06)",
              borderRadius: 4,
              padding: "5px 8px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              border: "0.5px solid rgba(255,255,255,.09)",
            }}
          >
            <div style={{ width: 32, height: 5, background: "rgba(0,229,160,.3)", borderRadius: 2 }}></div>
            <div style={{ display: "flex", gap: 4 }}>
              <div style={{ width: 16, height: 3, background: "rgba(255,255,255,.12)", borderRadius: 1 }}></div>
              <div style={{ width: 16, height: 3, background: "rgba(255,255,255,.12)", borderRadius: 1 }}></div>
              <div style={{ width: 16, height: 3, background: "rgba(255,255,255,.12)", borderRadius: 1 }}></div>
            </div>
          </div>
        </div>
      </div>
      <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 4 }}>Kliknij pole = plik z dysku · przycisk Pexels = wyszukiwarka zdjęć</div>
    </div>
  );
}
