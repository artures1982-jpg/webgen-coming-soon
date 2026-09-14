// Port 1:1 z funkcji pomocniczych dashboard/index.html (formatDate/formatAmount/
// planLabel/statusLabel/statusClass + katalog dodatków) — bez zmian logiki, tylko
// typowanie i wydzielenie z jednego wielkiego <script> do modułu współdzielonego
// przez komponenty panelu klienta.

export type Subscription = {
  id: string;
  status: string;
  current_period_end: number;
  current_period_start: number;
  cancel_at_period_end: boolean;
  plan_name: string;
  plan_amount: number;
  plan_currency: string;
  plan_interval: string;
  items?: { price_id?: string }[];
};

export type Invoice = {
  id: string;
  number: string;
  amount: number;
  currency: string;
  status: string;
  date: number;
  pdf: string | null;
};

export type DashboardData = {
  ok?: boolean;
  error?: string;
  customer: { id: string; email: string; name: string | null; created: number } | null;
  subscription: Subscription | null;
  invoices: Invoice[];
  note?: string;
};

export type GeneratedSite = {
  slug?: string;
  html?: string;
  plan?: string;
  created?: string;
  branza?: string;
  miasto?: string;
  dzielnica?: string;
  telefon?: string;
  email?: string;
  adres?: string;
  godz_pon_pt?: string;
  godz_sob?: string;
};

export function formatDate(ts: number | null | undefined): string {
  if (!ts) return "—";
  return new Date(ts * 1000).toLocaleDateString("pl-PL", { day: "numeric", month: "long", year: "numeric" });
}

export function formatAmount(amount: number | null | undefined, currency?: string): string {
  if (!amount) return "0 zł";
  const cur = (currency || "pln").toUpperCase();
  return cur === "PLN" ? (amount / 100).toFixed(0) + " zł" : (amount / 100).toFixed(2) + " " + cur;
}

export function planLabel(name: string | null | undefined, amount: number | null | undefined, currency?: string): string {
  if (name && name.length > 2) return name;
  if (amount) return formatAmount(amount, currency) + "/mies.";
  return "Plan webgen";
}

export function statusLabel(status: string | null | undefined): string {
  const map: Record<string, string> = {
    active: "Aktywny",
    trialing: "Okres próbny",
    past_due: "Zaległość",
    canceled: "Anulowany",
    incomplete: "Niekompletny",
    unpaid: "Nieopłacony",
  };
  return (status && map[status]) || status || "—";
}

export function statusClass(status: string | null | undefined): "active" | "trialing" | "past_due" | "canceled" | "none" {
  if (status === "active") return "active";
  if (status === "trialing") return "trialing";
  if (status === "past_due" || status === "unpaid") return "past_due";
  if (status === "canceled") return "canceled";
  return "none";
}

export type Addon = {
  id: string;
  icon: string;
  name: string;
  desc: string;
  price: string;
  once?: boolean;
  active: boolean;
};

// 7 dodatków à la carte nad planem Pro (Faza 5) — id musi się zgadzać z ADDON_PRICES
// w api/create-checkout.js / src/app/api/create-checkout/route.ts.
export const ADDON_CATALOG: Addon[] = [
  { id: "priorytetowe_wsparcie", icon: "🚀", name: "Priorytetowe wsparcie", desc: "Odpowiedź w 30 min, dedykowany czat, szybsze aktualizacje", price: "+99 zł/mies.", active: false },
  { id: "google_business", icon: "📍", name: "Google Business Profile", desc: "Zakładamy i optymalizujemy profil w Google Maps z opiniami", price: "+149 zł/mies.", active: false },
  { id: "social_media", icon: "📱", name: "Integracja Social Media", desc: "Live feed z Instagram/Facebook wpięty w Twoją stronę", price: "+79 zł/mies.", active: false },
  { id: "statystyki", icon: "📊", name: "Statystyki odwiedzin", desc: "Panel z ruchem na stronie, źródłami i konwersjami", price: "+49 zł/mies.", active: false },
  { id: "wlasna_domena", icon: "🔗", name: "Własna domena", desc: "Podpięcie Twojej domeny + konfiguracja DNS i SSL", price: "199 zł", once: true, active: false },
  { id: "dodatkowe_podstrony", icon: "📄", name: "Dodatkowe podstrony", desc: "3 osobne podstrony ofertowe (np. per usługa lub lokalizacja)", price: "149 zł", once: true, active: false },
  { id: "sesja_ai", icon: "📸", name: "Sesja zdjęciowa AI", desc: "Zdjęcia AI dopasowane do branży i klimatu firmy", price: "99 zł", once: true, active: false },
];

export type QuestionnaireMessage = {
  type: "questionnaire";
  date: string;
  read: boolean;
  answered?: boolean;
  answers?: Record<string, string>;
  firma?: { nazwa?: string; branza?: string; miasto?: string };
  slug?: string;
};

export type GenericMessage = {
  // Literal "undefined" (nie "string") żeby porównanie msg.type === "questionnaire"
  // w MessagesPage poprawnie zwężało typ unii — szeroki `string` uniemożliwiłby
  // TypeScriptowi wykluczenie tego wariantu w branchu true.
  type?: undefined;
  date: string;
  read: boolean;
  title?: string;
  body?: string;
};

export type WgMessage = QuestionnaireMessage | GenericMessage;

export const QUESTIONNAIRE_FIELDS = [
  { key: "adres", icon: "📍", label: "Adres siedziby", placeholder: "ul. Przykładowa 12, 00-001 Warszawa" },
  { key: "godz", icon: "🕐", label: "Godziny otwarcia", placeholder: "Pon–Pt 8:00–18:00, Sob 9:00–14:00" },
  { key: "lata", icon: "📅", label: "Lata działalności", placeholder: "np. 12" },
  { key: "realizacje", icon: "🏆", label: "Liczba realizacji", placeholder: "np. 350" },
  { key: "certyfikaty", icon: "🎓", label: "Certyfikaty / uprawnienia", placeholder: "np. SEP, ISO 9001" },
  { key: "social", icon: "📱", label: "Instagram / Facebook", placeholder: "np. @firma.warszawa" },
  { key: "ocena", icon: "⭐", label: "Ocena Google", placeholder: "np. 4.9 / 87 opinii" },
] as const;
