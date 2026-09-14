"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import { applyPalette, fillTemplate, slugifyName } from "@/lib/template-fill";
import { collectFirma, saveQuestionnaireIfMissing } from "@/lib/generator-helpers";
import type { FormData as GenFormData, PlanId } from "@/lib/generator-helpers";
import { TEMPLATES_BASE } from "@/lib/templates-base";
import { usePalettes } from "./usePalettes";
import { useTemplatesManifest } from "./useTemplatesManifest";

// Port 1:1 z startGenerate()/startFromTemplate()/finishGenerationFromTemplate() w
// generator/index.html. Ścieżka legacy "3 równoległe /api/generate" (klasyczny/
// nowoczesny/elegancki + #variant-popup) NIE jest portowana — potwierdzone martwa:
// state.templateId jest zawsze ustawiony (panel-0 wymusza ?template= z /galeria/),
// więc ta gałąź nigdy się nie wykonuje w produkcji.
const LIVE_MESSAGES_PRO = [
  ["Analizuję Twoje dane…", null],
  ["Personalizuję wybrany szablon…", "Treść, zdjęcia i kolory dopasowane do Ciebie"],
  ["Optymalizuję SEO…", "Meta tagi, Schema.org, nagłówki"],
  ["Prawie gotowe!", "Zaraz zobaczysz swoją stronę…"],
] as const;
const LIVE_MESSAGES_FREE = [
  ["Wypełniam szablon Twoimi danymi…", null],
  ["Prawie gotowe!", "Zaraz zobaczysz swoją stronę…"],
] as const;

export function useGeneration(opts: {
  templateId: string | null;
  templateTier: PlanId | null;
  branza: string;
  plan: PlanId;
  form: GenFormData;
  onSuccess: (html: string, slug: string) => void;
  onError: (message: string) => void;
  onProRequired: () => void;
}) {
  const { onSuccess, onError, onProRequired } = opts;
  const { user } = useUser();
  const { getToken, isSignedIn } = useAuth();
  const { manifest } = useTemplatesManifest();
  const { flat: palettesFlat } = usePalettes();

  const [running, setRunning] = useState(false);
  const [elapsedSec, setElapsedSec] = useState(0);
  const [progress, setProgress] = useState(0);
  const [msgIdx, setMsgIdx] = useState(0);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const progressRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const msgRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearAll = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (progressRef.current) clearInterval(progressRef.current);
    if (msgRef.current) clearInterval(msgRef.current);
    timerRef.current = null;
    progressRef.current = null;
    msgRef.current = null;
  }, []);

  useEffect(() => clearAll, [clearAll]);

  const messages = opts.templateTier === "pro" || opts.templateTier === "promax" ? LIVE_MESSAGES_PRO : LIVE_MESSAGES_FREE;

  async function getAuthHeaders(): Promise<Record<string, string>> {
    if (!isSignedIn) return {};
    const token = await getToken();
    return token ? { Authorization: "Bearer " + token } : {};
  }

  const start = useCallback(async () => {
    const { templateId, templateTier, branza, plan, form } = opts;
    const firma = collectFirma(form, { branza, plan });
    const slug = slugifyName(firma.nazwa_strony || firma.nazwa);

    setRunning(true);
    setElapsedSec(0);
    setProgress(0);
    setMsgIdx(0);

    const startTs = Date.now();
    timerRef.current = setInterval(() => setElapsedSec(Math.floor((Date.now() - startTs) / 1000)), 1000);
    progressRef.current = setInterval(() => setProgress((p) => Math.min(p + (Math.random() * 1.5 + 0.3), 88)), 800);
    msgRef.current = setInterval(() => setMsgIdx((i) => Math.min(i + 1, messages.length - 1)), 4000);

    function finish(html: string, finalSlug: string) {
      clearAll();
      setProgress(100);
      setRunning(false);
      try {
        saveQuestionnaireIfMissing(firma, finalSlug, user?.primaryEmailAddress?.emailAddress || null);
      } catch {
        // jak w oryginale — błąd zapisu wiadomości nie blokuje pokazania podglądu
      }
      onSuccess(html, finalSlug);
    }

    function fail(message: string) {
      clearAll();
      setRunning(false);
      onError(message);
    }

    if (!templateId) {
      fail("Nie znaleziono wybranego szablonu — wróć do Galerii Startowej i wybierz ponownie.");
      return;
    }
    const tpl = manifest.find((t) => t.id === templateId);
    if (!tpl) {
      fail("Nie znaleziono wybranego szablonu — wróć do Galerii Startowej i wybierz ponownie.");
      return;
    }

    if (templateTier === "free") {
      try {
        const res = await fetch(TEMPLATES_BASE + "/templates/pilot/" + tpl.id); // bez ".html" — patrz komentarz w api/personalize/route.ts
        if (!res.ok) throw new Error("Nie udało się pobrać pliku szablonu (" + res.status + ")");
        const raw = await res.text();
        finish(applyPalette(fillTemplate(raw, firma), firma.paletteId, palettesFlat), slug);
      } catch (err) {
        fail("Błąd wczytywania szablonu: " + (err instanceof Error ? err.message : String(err)));
      }
      return;
    }

    // pro/promax — pełna personalizacja AI
    const email = user?.primaryEmailAddress?.emailAddress;
    if (!email) {
      fail("Zaloguj się, żeby użyć personalizacji AI.");
      return;
    }
    try {
      const authHeaders = await getAuthHeaders();
      const res = await fetch("/api/personalize", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders },
        body: JSON.stringify({ templateId, firma }),
      });
      const data = await res.json();
      if (!data.success || !data.html) {
        if (data.code === "PRO_REQUIRED") {
          clearAll();
          setRunning(false);
          onProRequired();
          return;
        }
        throw new Error(data.error || "Nie udało się spersonalizować strony");
      }
      finish(data.html, data.slug || slug);
    } catch (err) {
      fail("Błąd personalizacji: " + (err instanceof Error ? err.message : String(err)));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opts.templateId, opts.templateTier, opts.branza, opts.plan, opts.form, manifest, palettesFlat, user, isSignedIn]);

  return {
    running,
    elapsedSec,
    progress,
    message: messages[msgIdx][0],
    subMessage: messages[msgIdx][1] || opts.branza + " · " + opts.form.miasto,
    start,
  };
}
