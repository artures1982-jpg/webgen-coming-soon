"use client";

import { useEffect, useState } from "react";
import { TEMPLATES_BASE } from "@/lib/templates-base";

// Port 1:1 z fetchRawTemplateForPreview() w generator/index.html — pobiera raz plik
// wybranego szablonu, do lokalnego (czysto klienckiego) podglądu palety/nazwy/usług
// bez wywołania API. Fetch idzie do TEMPLATES_BASE (produkcja) — patrz komentarz w
// useTemplatesManifest.ts / templates-base.ts.
export function useRawTemplate(templateId: string | null) {
  const [html, setHtml] = useState<string | null>(null);

  useEffect(() => {
    if (!templateId) return;
    let cancelled = false;
    fetch(TEMPLATES_BASE + "/templates/pilot/" + templateId) // bez ".html" — patrz komentarz w api/personalize/route.ts
      .then((res) => (res.ok ? res.text() : ""))
      .then((text) => {
        if (!cancelled) setHtml(text);
      })
      .catch(() => {
        if (!cancelled) setHtml("");
      });
    return () => {
      cancelled = true;
    };
  }, [templateId]);

  return html;
}
