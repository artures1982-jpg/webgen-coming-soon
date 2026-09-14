"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useGenerator } from "@/components/generator/GeneratorContext";

// Woła /api/generate-hero-image raz na wejściu do kroku 2, WYŁĄCZNIE dla Pro Max
// (mirror 1:1 useEnhanceOpis.ts, patrz tamten komentarz dla uzasadnienia retry
// pętli na getToken()). Zapisuje wynik w DWÓCH miejscach na raz —
// form.heroBase64 ORAZ form.zones.hero — bo istnieją dwa niezależne widgety
// zapisujące zdjęcie hero (HeroUpload.tsx i LayoutZonesSection.tsx) z niespójnym
// pierwszeństwem w collectFirma(); nadpisując oba, świeżo wygenerowany obraz
// wygrywa niezależnie który z nich collectFirma() akurat preferuje.
export function useGenerateHeroImage() {
  const { gen, form, patchForm, patchGen, setZone } = useGenerator();
  const { getToken } = useAuth();
  const [generating, setGenerating] = useState(false);

  const shouldRun = gen.plan === "promax" && !gen.heroImageGenerated && !!gen.branza;

  useEffect(() => {
    if (!shouldRun) return;
    let cancelled = false;

    (async () => {
      setGenerating(true);
      try {
        let token: string | null = null;
        for (let attempt = 0; attempt < 5 && !token && !cancelled; attempt++) {
          token = await getToken();
          if (!token) await new Promise((r) => setTimeout(r, 400));
        }
        if (!token) return;
        const res = await fetch("/api/generate-hero-image", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
          body: JSON.stringify({
            branza: gen.branza,
            miasto: form.miasto,
            uslugiLista: form.uslugi
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean),
          }),
        });
        if (cancelled || !res.ok) return;
        const data = await res.json();
        if (!cancelled && data.heroImage) {
          patchForm({ heroBase64: data.heroImage, heroUrl: "" });
          setZone("hero", { url: data.heroImage, source: "base64" });
        }
      } catch {
        // cichy fallback — strona zostaje przy domyślnym zdjęciu stockowym szablonu
      } finally {
        if (!cancelled) {
          setGenerating(false);
          patchGen({ heroImageGenerated: true });
        }
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldRun]);

  return { generating };
}
