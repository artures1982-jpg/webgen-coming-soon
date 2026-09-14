// Stałe i typy generatora — wydzielone z generator/index.html (kod inline w <script>
// tego pliku dzielił się na state/const wymieszane z manipulacją DOM; tu zostaje sama
// logika/dane, bez efektów ubocznych).

export type Addon = { id: string; name: string; price: number; type: "month" | "once" };

// Dodatki à la carte nad planem Pro — id musi się zgadzać z ADDON_PRICES w
// src/app/api/create-checkout/route.ts. Własna domena/SSL i statystyki NIE są tu —
// są wbundlowane w cenę Pro/Pro Max (patrz PLAN_SUMMARY_FEATURES.pro), sprzedawanie
// ich osobno byłoby podwójnym pobraniem opłaty za to samo (usunięte 2026-09-15).
export const ADDONS_CONFIG: Record<string, Omit<Addon, "id">> = {
  social_media: { name: "Integracja Social Media", price: 79, type: "month" },
  priorytetowe_wsparcie: { name: "Priorytetowe wsparcie", price: 99, type: "month" },
  google_business: { name: "Google Business Profile", price: 149, type: "month" },
  dodatkowe_podstrony: { name: "Dodatkowe podstrony", price: 149, type: "once" },
  sesja_ai: { name: "Sesja zdjęciowa AI", price: 99, type: "once" },
};

export const ADDONS_MONTHLY = ["social_media", "priorytetowe_wsparcie", "google_business"] as const;
export const ADDONS_ONCE = ["dodatkowe_podstrony", "sesja_ai"] as const;

// Bazowe ceny miesięczne planów — jedno miejsce, z którego liczona jest cena roczna
// (-17%, czyli 10 miesięcy rozłożone na 12).
export const PLAN_BASE_PRICE: Record<"pro" | "promax", number> = { pro: 299, promax: 499 };

export const TIER_LABEL: Record<string, string> = { free: "START", pro: "PRO", promax: "PRO MAX" };

export type PlanId = "free" | "pro" | "promax";

export const PLAN_NAME: Record<PlanId, string> = { free: "Start", pro: "Pro", promax: "Pro Max" };

export function planPriceFor(tier: PlanId): number {
  if (tier === "free") return 0;
  return PLAN_BASE_PRICE[tier];
}

export function effectivePrice(basePrice: number, billing: "month" | "year"): number {
  if (basePrice === 0) return 0;
  return billing === "year" ? Math.round((basePrice * 10) / 12) : basePrice;
}

export const PLAN_SUMMARY_FEATURES: Record<PlanId, string[]> = {
  free: ["Pełna Galeria Startowa", "Hosting na subdomenie webgen.pl", "Lokalne SEO i formularz kontaktowy"],
  pro: ["Szablony Pro + personalizacja AI", "Własna domena, SSL i statystyki", "Aktualizacje treści na życzenie"],
  promax: ["Wszystko z Pro", "Rozszerzona personalizacja AI", "Priorytetowa obsługa zmian — odpowiedź w 30 min"],
};

export const STEPS = [
  { n: 1, label: "Szablon i lokalizacja" },
  { n: 2, label: "Dane firmy" },
  { n: 3, label: "Social media" },
  { n: 4, label: "Dodatki" },
  { n: 5, label: "Podgląd i aktywacja" },
] as const;

// Domyślne zapytania Pexels per branża (etykieta manifestu, np. "Hydraulika") — jeśli
// branża nie ma wpisu, pada na 'professional service'.
export const PEXELS_BRANZA_MAP: Record<string, string> = {
  Hydraulika: "plumber water pipes repair",
  Elektryka: "electrician wiring installation",
  "Remonty i wykończenia": "home renovation interior design modern",
  Malowanie: "house painting walls interior",
  "Salon piękności": "beauty salon spa treatment",
  Sprzątanie: "professional cleaning service home",
  Ogrodnictwo: "garden landscaping green plants",
  Gastronomia: "restaurant food kitchen chef",
  Fryzjer: "hair salon hairdresser styling",
  "Salon urody": "beauty salon cosmetics spa",
  Mechanik: "car mechanic auto workshop repair",
  Glazurnik: "tiling floor bathroom renovation",
  Fotograf: "professional photography studio",
  Fizjoterapia: "physiotherapy massage wellness",
  Klimatyzacja: "air conditioning HVAC installation",
  Stolarz: "carpentry woodwork furniture craft",
};

export type ZoneId = "hero" | "img1" | "img2";
export type ZoneImage = { url: string; source: "base64" | "pexels" } | null;

export type FormData = {
  miasto: string;
  dzielnica: string;
  nazwaStrony: string;
  telefon: string;
  email: string;
  adres: string;
  godzPonPt: string;
  godzSob: string;
  lata: string;
  realizacje: string;
  nazwaFirma: string;
  nip: string;
  adresFirma: string;
  opis: string;
  uslugi: string;
  logoBase64: string;
  heroBase64: string;
  heroUrl: string;
  paletteId: string | null;
  zones: Record<ZoneId, ZoneImage>;
  facebook: string;
  instagram: string;
  tiktok: string;
  whatsapp: string;
  booksy: string;
  maps: string;
  googleOcena: string;
  googleOpinie: string;
};

export const INITIAL_FORM_DATA: FormData = {
  miasto: "",
  dzielnica: "",
  nazwaStrony: "",
  telefon: "",
  email: "",
  adres: "",
  godzPonPt: "",
  godzSob: "",
  lata: "",
  realizacje: "",
  nazwaFirma: "",
  nip: "",
  adresFirma: "",
  opis: "",
  uslugi: "",
  logoBase64: "",
  heroBase64: "",
  heroUrl: "",
  paletteId: null,
  zones: { hero: null, img1: null, img2: null },
  facebook: "",
  instagram: "",
  tiktok: "",
  whatsapp: "",
  booksy: "",
  maps: "",
  googleOcena: "",
  googleOpinie: "",
};

// Bliźniak collectFirmaData() z generator/index.html — zbiera FormData + kontekst
// szablonu w jeden obiekt wysyłany do fillTemplate/applyPalette (klient) i
// /api/personalize (serwer). Pola SEO (usp/obszar/certyfikaty/platnosci/keywords/faq)
// i galeria[12] z oryginału pominięte celowo — nie miały odpowiadającego UI, zawsze
// były puste (martwy kod, patrz historia portu).
export function collectFirma(
  form: FormData,
  ctx: { branza: string; plan: PlanId }
) {
  const galeria = [form.zones.img1?.url, form.zones.img2?.url].filter((x): x is string => !!x);
  const heroFromZone = form.zones.hero;
  return {
    nazwa_strony: form.nazwaStrony,
    nazwa: form.nazwaStrony,
    nazwa_firma: form.nazwaFirma,
    nip: form.nip,
    adres_firma: form.adresFirma,
    uslugi_lista: form.uslugi
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
    branza: ctx.branza,
    miasto: form.miasto,
    dzielnica: form.dzielnica,
    telefon: form.telefon,
    email: form.email,
    adres: form.adres,
    godz_pon_pt: form.godzPonPt || "8:00–18:00",
    godz_sob: form.godzSob || "9:00–14:00",
    lata: form.lata,
    realizacje: form.realizacje,
    opis: form.opis,
    facebook: form.facebook,
    instagram: form.instagram,
    tiktok: form.tiktok,
    whatsapp: form.whatsapp,
    booksy: form.booksy,
    maps: form.maps,
    google_ocena: form.googleOcena,
    google_opinie: form.googleOpinie,
    paletteId: form.paletteId,
    galeria,
    galeriaUrls: galeria,
    logo_base64: form.logoBase64,
    plan: ctx.plan,
    hero_base64: heroFromZone && heroFromZone.source === "base64" ? heroFromZone.url : form.heroBase64,
    heroUrl: heroFromZone && heroFromZone.source === "pexels" ? heroFromZone.url : form.heroUrl,
  };
}

export type Firma = ReturnType<typeof collectFirma>;

// Port 1:1 z saveQuestionnaireIfMissing() w generator/index.html — jeśli po
// wygenerowaniu strony brakuje danych (adres/godziny/lata/realizacje/social/ocena),
// dopisuje wiadomość typu "questionnaire" do localStorage.wg_messages (ten sam
// klucz i kształt co czyta next-app/src/hooks/useMessages.ts w panelu klienta) i
// wysyła informacyjny e-mail przez /api/notify-client (fire-and-forget).
export function saveQuestionnaireIfMissing(firma: Firma, slug: string, accountEmail: string | null) {
  const missing: string[] = [];
  if (!firma.adres) missing.push("adres");
  if (!firma.godz_pon_pt) missing.push("godz");
  if (!firma.lata) missing.push("lata");
  if (!firma.realizacje) missing.push("realizacje");
  if (!firma.instagram && !firma.facebook) missing.push("social");
  if (!firma.google_ocena) missing.push("ocena");

  if (missing.length > 0) {
    try {
      const msgs = JSON.parse(localStorage.getItem("wg_messages") || "[]");
      msgs.push({
        id: Date.now(),
        type: "questionnaire",
        date: new Date().toISOString(),
        read: false,
        answered: false,
        firma: { nazwa: firma.nazwa, branza: firma.branza, miasto: firma.miasto },
        slug,
        missing,
      });
      localStorage.setItem("wg_messages", JSON.stringify(msgs));
    } catch {
      // localStorage niedostępny — pomiń po cichu, jak w oryginale
    }
  }

  if (accountEmail) {
    fetch("/api/notify-client", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: accountEmail, firma, slug, hasMissing: missing.length > 0 }),
    }).catch(() => {});
  }
}
