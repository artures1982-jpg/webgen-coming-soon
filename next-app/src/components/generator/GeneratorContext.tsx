"use client";

import { createContext, useContext, useState, useCallback } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { Addon, FormData, PlanId, ZoneId, ZoneImage } from "@/lib/generator-helpers";
import { INITIAL_FORM_DATA, PLAN_NAME, planPriceFor } from "@/lib/generator-helpers";
import type { ManifestEntry } from "@/lib/template-fill";

// Odpowiednik globalnego obiektu `state` z generator/index.html — tu jako React
// state + Context, żeby uniknąć przekazywania kilkunastu propsów przez każdy
// poziom komponentów kroku. `form` (pola formularza) i `gen` (kontekst
// szablonu/planu/nawigacji) są rozdzielone, bo mają różną częstotliwość zmian i
// różnych konsumentów.
export type GenState = {
  currentStep: number; // 1-5 (panel-0 = rejestracja, poza tą numeracją, gatowana osobno przez isSignedIn)
  templateId: string | null;
  templateTier: PlanId | null;
  templateIndustry: string | null;
  templateThumb: string;
  templateTitle: string;
  branza: string;
  plan: PlanId;
  planName: string;
  planPrice: number;
  billing: "month" | "year";
  addons: Record<string, Addon>;
  slug: string;
  generatedHTML: string;
  phase: "form" | "generating" | "preview";
  accountType: "individual" | "firma";
  authMode: "gate" | "signIn" | "signUp";
  pendingProfileFirma: { nazwa_firma: string; nip: string; adres_firma: string } | null;
  metadataSaved: boolean;
  opisEnhanced: boolean;
  assistantOptOut: boolean;
  heroImageGenerated: boolean;
};

const INITIAL_GEN_STATE: GenState = {
  currentStep: 1,
  templateId: null,
  templateTier: null,
  templateIndustry: null,
  templateThumb: "",
  templateTitle: "",
  branza: "",
  plan: "free",
  planName: "Start",
  planPrice: 0,
  billing: "month",
  addons: {},
  slug: "",
  generatedHTML: "",
  phase: "form",
  accountType: "individual",
  authMode: "gate",
  pendingProfileFirma: null,
  metadataSaved: false,
  opisEnhanced: false,
  assistantOptOut: false,
  heroImageGenerated: false,
};

// target: 'hero' (zdjęcie hero — Pro/Pro Max) albo 'zone_hero'|'zone_img1'|'zone_img2'
// (3 strefy zdjęć w wizualnym layout pickerze kroku 2).
export type PexelsTarget = "hero" | `zone_${ZoneId}`;

type Ctx = {
  gen: GenState;
  setGen: Dispatch<SetStateAction<GenState>>;
  patchGen: (p: Partial<GenState>) => void;
  form: FormData;
  setForm: Dispatch<SetStateAction<FormData>>;
  patchForm: (p: Partial<FormData>) => void;
  setZone: (zoneId: ZoneId, image: ZoneImage) => void;
  selectTemplate: (entry: ManifestEntry) => void;
  pexelsTarget: PexelsTarget | null;
  openPexels: (target: PexelsTarget) => void;
  closePexels: () => void;
};

const GeneratorContext = createContext<Ctx | null>(null);

export function GeneratorProvider({ children }: { children: React.ReactNode }) {
  const [gen, setGen] = useState<GenState>(INITIAL_GEN_STATE);
  const [form, setForm] = useState<FormData>(INITIAL_FORM_DATA);
  const [pexelsTarget, setPexelsTarget] = useState<PexelsTarget | null>(null);

  const openPexels = useCallback((target: PexelsTarget) => setPexelsTarget(target), []);
  const closePexels = useCallback(() => setPexelsTarget(null), []);

  const patchGen = useCallback((p: Partial<GenState>) => setGen((g) => ({ ...g, ...p })), []);
  const patchForm = useCallback((p: Partial<FormData>) => setForm((f) => ({ ...f, ...p })), []);

  const setZone = useCallback((zoneId: ZoneId, image: ZoneImage) => {
    setForm((f) => ({ ...f, zones: { ...f.zones, [zoneId]: image } }));
  }, []);

  // Port 1:1 z selectTemplate() — wybór szablonu (przychodzący z /galeria/) USTAWIA
  // plan, to jedna decyzja, nie dwie.
  const selectTemplate = useCallback((entry: ManifestEntry) => {
    setGen((g) => ({
      ...g,
      templateId: entry.id,
      templateTier: entry.tier,
      branza: entry.label,
      templateIndustry: entry.industry,
      templateThumb: entry.thumb || "",
      templateTitle: entry.title || entry.id,
      plan: entry.tier,
      planName: PLAN_NAME[entry.tier],
      planPrice: planPriceFor(entry.tier),
    }));
  }, []);

  return (
    <GeneratorContext.Provider
      value={{ gen, setGen, patchGen, form, setForm, patchForm, setZone, selectTemplate, pexelsTarget, openPexels, closePexels }}
    >
      {children}
    </GeneratorContext.Provider>
  );
}

export function useGenerator() {
  const ctx = useContext(GeneratorContext);
  if (!ctx) throw new Error("useGenerator must be used within GeneratorProvider");
  return ctx;
}
