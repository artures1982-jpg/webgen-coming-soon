"use client";

import { useEffect, useState } from "react";
import type { ManifestEntry } from "@/lib/template-fill";
import { TEMPLATES_BASE } from "@/lib/templates-base";

// Port 1:1 z loadTemplatesManifest() w generator/index.html — generator już nie ma
// własnej siatki branż/galerii (project_generator_scope_brand_fit), tylko dociąga
// dane wybranego wcześniej w /galeria/ szablonu (miniaturka, tier, industry).
// Fetch idzie do TEMPLATES_BASE (produkcja), nie względnej ścieżki — te pliki nie
// żyją w next-app/public, tylko w templates/ w korzeniu repo (patrz templates-base.ts).
export function useTemplatesManifest() {
  const [manifest, setManifest] = useState<ManifestEntry[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch(TEMPLATES_BASE + "/templates/manifest.json")
      .then((res) => (res.ok ? res.json() : []))
      .then((data: ManifestEntry[]) => {
        if (cancelled) return;
        setManifest(Array.isArray(data) ? data : []);
        setLoaded(true);
      })
      .catch(() => {
        if (cancelled) return;
        setManifest([]);
        setLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { manifest, loaded };
}
