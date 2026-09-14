"use client";

import { useEffect, useState } from "react";
import { flattenPalettes } from "@/lib/template-fill";
import type { PalettesByIndustry } from "@/lib/template-fill";
import { TEMPLATES_BASE } from "@/lib/templates-base";

// Port 1:1 z loadPalettes() w generator/index.html. Fetch idzie do TEMPLATES_BASE
// (produkcja) — patrz komentarz w useTemplatesManifest.ts / templates-base.ts.
export function usePalettes() {
  const [byIndustry, setByIndustry] = useState<PalettesByIndustry>({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch(TEMPLATES_BASE + "/templates/palettes.json")
      .then((res) => (res.ok ? res.json() : {}))
      .then((data: PalettesByIndustry) => {
        if (cancelled) return;
        setByIndustry(data && typeof data === "object" && !Array.isArray(data) ? data : {});
        setLoaded(true);
      })
      .catch(() => {
        if (cancelled) return;
        setByIndustry({});
        setLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { byIndustry, flat: flattenPalettes(byIndustry), loaded };
}
