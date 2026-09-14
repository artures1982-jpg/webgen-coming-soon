"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useGenerator } from "@/components/generator/GeneratorContext";

// Woła /api/enhance-opis raz na wejściu do kroku 2 dla Pro/Pro Max — dociosuje
// {{OPIS}} przez AI, na podstawie realnych danych klienta (branża/miasto/lata/
// realizacje/usługi), i wpisuje wynik z powrotem do form.opis. Stamtąd przepływa
// automatycznie przez collectFirma()→fillTemplate() do podglądu palety
// (PaletteSection.tsx) i do finalnego /api/personalize — bez duplikowania wołania AI.
// gen.opisEnhanced pilnuje jednorazowości; reset przy realnej edycji pola przez
// klienta (patchForm({opis}) spoza tego hooka) żeby nie nadpisywać świeżej edycji.
export function useEnhanceOpis() {
  const { gen, form, patchForm, patchGen } = useGenerator();
  const { getToken } = useAuth();
  const [enhancing, setEnhancing] = useState(false);

  const isPro = gen.plan === "pro" || gen.plan === "promax";
  const shouldRun = isPro && !gen.opisEnhanced && !!gen.branza;

  useEffect(() => {
    if (!shouldRun) return;
    let cancelled = false;

    (async () => {
      setEnhancing(true);
      try {
        // getToken() potrafi chwilowo zwrócić null tuż po przekierowaniu z
        // logowania (sesja Clerk jeszcze się dogrywa), mimo że isSignedIn już jest
        // true — złapane empirycznie: bez retry hook cicho oznaczał się jako
        // "zrobione" (finally niżej) BEZ wywołania AI, zostawiając puste pole.
        let token: string | null = null;
        for (let attempt = 0; attempt < 5 && !token && !cancelled; attempt++) {
          token = await getToken();
          if (!token) await new Promise((r) => setTimeout(r, 400));
        }
        if (!token) return;
        const res = await fetch("/api/enhance-opis", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
          body: JSON.stringify({
            branza: gen.branza,
            miasto: form.miasto,
            opisDraft: form.opis,
            lata: form.lata,
            realizacje: form.realizacje,
            uslugiLista: form.uslugi
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean),
          }),
        });
        if (cancelled || !res.ok) return;
        const data = await res.json();
        if (!cancelled && data.opis) patchForm({ opis: data.opis });
      } catch {
        // cichy fallback — draft klienta zostaje bez zmian, patrz plan pkt 4
      } finally {
        if (!cancelled) {
          setEnhancing(false);
          patchGen({ opisEnhanced: true });
        }
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldRun]);

  return { enhancing };
}
