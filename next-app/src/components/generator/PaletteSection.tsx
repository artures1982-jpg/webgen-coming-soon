"use client";

import { useMemo } from "react";
import { usePalettes } from "@/hooks/usePalettes";
import { useRawTemplate } from "@/hooks/useRawTemplate";
import { applyPalette, fillTemplate } from "@/lib/template-fill";
import { collectFirma } from "@/lib/generator-helpers";
import { useGenerator } from "./GeneratorContext";
import styles from "./Generator.module.css";

// Port 1:1 z blok "Paleta kolorów marki" + initPalettePreview/renderPaletteGrid/
// selectPalette/updatePalettePreview w generator/index.html. Czysto klienckie —
// żaden klik nie woła API, tylko lokalny fillTemplate+applyPalette do iframe.srcdoc.
export default function PaletteSection() {
  const { gen, form, patchForm } = useGenerator();
  const { byIndustry, flat, loaded: palettesLoaded } = usePalettes();
  const rawHtml = useRawTemplate(gen.templateId);

  const items = useMemo(() => {
    const industryPalettes = (gen.templateIndustry && byIndustry[gen.templateIndustry]) || [];
    return [{ id: "", name: "Domyślne kolory szablonu", accent: null as string | null, bg: "", accentDark: "" }, ...industryPalettes];
  }, [gen.templateIndustry, byIndustry]);

  const firma = useMemo(() => collectFirma(form, { branza: gen.branza, plan: gen.plan }), [form, gen.branza, gen.plan]);

  const previewSrcdoc = useMemo(() => {
    if (!rawHtml) return null;
    return applyPalette(fillTemplate(rawHtml, firma), form.paletteId, flat);
  }, [rawHtml, firma, form.paletteId, flat]);

  return (
    <div style={{ background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.12)", borderRadius: 12, padding: "18px 20px", marginBottom: 4 }}>
      <div style={{ fontFamily: "var(--mono)", fontSize: 9, fontWeight: 700, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--green)", marginBottom: 4 }}>
        Paleta kolorów marki
      </div>
      <p className={styles["field-hint"]} style={{ margin: "0 0 14px" }}>
        Domyślne kolory szablonu są już dobrane pod branżę — możesz je zmienić. Kliknij paletę, żeby zobaczyć efekt na żywo.
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(110px,1fr))", gap: 8, marginBottom: 14 }}>
        {!palettesLoaded ? (
          <div style={{ gridColumn: "1/-1", fontSize: 12, color: "var(--muted)", fontFamily: "var(--mono)" }}>Ładowanie palet…</div>
        ) : (
          items.map((p) => {
            const active = (form.paletteId || "") === p.id;
            return (
              <div
                key={p.id || "default"}
                onClick={() => patchForm({ paletteId: p.id || null })}
                style={{
                  cursor: "pointer",
                  borderRadius: 8,
                  padding: 8,
                  border: "1.5px solid " + (active ? "var(--green)" : "rgba(255,255,255,.12)"),
                  background: active ? "rgba(0,229,160,.08)" : "rgba(255,255,255,.03)",
                }}
              >
                {p.accent ? (
                  <div style={{ display: "flex", height: 20, borderRadius: 5, overflow: "hidden", marginBottom: 6 }}>
                    <div style={{ flex: 1, background: p.bg }}></div>
                    <div style={{ flex: 1, background: p.accent }}></div>
                    <div style={{ flex: 1, background: p.accentDark }}></div>
                  </div>
                ) : (
                  <div style={{ height: 20, borderRadius: 5, marginBottom: 6, border: "1px dashed rgba(255,255,255,.25)" }}></div>
                )}
                <div style={{ fontSize: 10, fontWeight: 600, color: active ? "var(--text)" : "var(--muted)" }}>{p.name}</div>
              </div>
            );
          })
        )}
      </div>
      <div style={{ borderRadius: 10, overflow: "hidden", border: "1px solid rgba(255,255,255,.14)", position: "relative", height: 340, background: "#0b0d12" }}>
        {previewSrcdoc && <iframe srcDoc={previewSrcdoc} sandbox="allow-same-origin" style={{ width: "100%", height: "100%", border: 0 }} />}
        {!previewSrcdoc && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "var(--mono)",
              fontSize: 11,
              color: "var(--muted)",
              background: "#0b0d12",
            }}
          >
            Ładowanie podglądu…
          </div>
        )}
      </div>
    </div>
  );
}
