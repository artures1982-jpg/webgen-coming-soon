// Port 1:1 z BRANZE/CATEGORIES + funkcje pomocnicze w galeria/index.html. Dane
// celowo NIE zunifikowane z templates/manifest.json mimo dużego pokrycia pól
// (id/industry/label/title/tagline/tier/thumb) — manifest nie ma pogrupowania
// kategorii ani flagi `titled` (która branża ma tytuł wariantu w nazwie pliku
// podglądu), a różnice w konwencji nazw plików między /preview/ (ludzki,
// per-branża) i /templates/pilot/ (manifest, per-id) są realne, nie kosmetyczne.
// Unifikacja tych dwóch źródeł to osobna decyzja architektoniczna, nie coś do
// przemycenia przy migracji jednej strony.
export type Wariant = [num: string, tytul: string, tagline: string, tier: "free" | "pro" | "promax"];

export type Branza = {
  slug: string;
  nazwa: string;
  titled: boolean;
  warianty: Wariant[];
};

export const BRANZE: Branza[] = [
  {
    slug: "hydraulik",
    nazwa: "Hydraulik",
    titled: false,
    warianty: [
      ["1", "Zaufany fachowiec", "Cennik i gwarancja widoczne od razu — bez dzwonienia po wycenę.", "free"],
      ["2", "Szybka interwencja", "Awaria o 3 w nocy? Numer alarmowy większy niż cokolwiek innego na stronie.", "pro"],
      ["3", "Nowoczesny cyfrowy", "Zamiast dzwonić — wypełniasz formularz wyceny i czekasz na odpowiedź, nie na kolejkę.", "pro"],
      ["4", "Rodzinna firma", "Poznajesz właściciela firmy, zanim jeszcze zadzwonisz.", "pro"],
      ["5", "Premium korporacyjny", "Studia przypadków z liczbami — dla klientów, którzy podpisują umowy, nie SMS-y.", "promax"],
      ["6", "Minimalistyczny", "Cała oferta na jednym ekranie — ładuje się, zanim zdążysz mrugnąć.", "pro"],
    ],
  },
  {
    slug: "elektryk",
    nazwa: "Elektryk",
    titled: false,
    warianty: [
      ["1", "Zaufany fachowiec", "Zdjęcia z realnych zleceń zamiast pustych obietnic „fachowiec z doświadczeniem”.", "free"],
      ["2", "Szybka interwencja", "Zwarcie, brak prądu, iskrzenie — wybierasz zagrożenie i trafiasz prosto do numeru alarmowego.", "pro"],
      ["3", "Nowoczesny cyfrowy", "Zero rozmów telefonicznych — wycenę zgłaszasz formularzem w mniej niż minutę.", "pro"],
      ["4", "Rodzinna firma", "Rzemiosło przejęte po rodzicu — historia firmy, zanim zobaczysz cennik.", "pro"],
      ["5", "Premium korporacyjny", "Proces krok po kroku i lista firm, które już podpisały umowę.", "promax"],
    ],
  },
  {
    slug: "remonty",
    nazwa: "Remonty",
    titled: false,
    warianty: [
      ["1", "Zaufany fachowiec", "Cennik liczony za metr kwadratowy, nie „wycena indywidualna”.", "free"],
      ["2", "Szybki start", "Pasek na żywo pokazuje, kiedy ekipa naprawdę może zacząć.", "pro"],
      ["3", "Kalkulator online", "Wpisujesz metraż i zakres — kalkulator liczy orientacyjny koszt remontu od razu.", "pro"],
      ["4", "Rodzinna firma", "Ta sama ekipa od lat — poznajesz twarze, zanim wejdą do Twojego domu.", "pro"],
      ["5", "Premium", "Formularz zapytania pod klienta biznesowego — dewelopera, zarządcę, inwestora.", "promax"],
    ],
  },
  {
    slug: "fryzjer-barber",
    nazwa: "Fryzjer / Barber",
    titled: false,
    warianty: [
      ["1", "Zaufany fachowiec", "Cennik i portfolio prawdziwych fryzur — widzisz efekt, zanim usiądziesz na fotelu.", "free"],
      ["2", "Bez kolejki", "Widzisz na żywo, ile miejsc zostało dziś bez zapisu.", "pro"],
      ["3", "Nowoczesny cyfrowy", "Rezerwacja w 60 sekund — od otwarcia strony do potwierdzonego terminu.", "pro"],
      ["4", "Rodzinna firma", "Trzy pokolenia tej samej rodziny przy tym samym fotelu.", "pro"],
      ["5", "Premium", "Barber na firmowy event albo stały kontrakt z hotelem — to też ich klient.", "promax"],
    ],
  },
  {
    slug: "salon-fryzjerski",
    nazwa: "Salon fryzjerski",
    titled: false,
    warianty: [
      ["1", "Zaufany fachowiec", "Cennik damski i męski w jednej, czytelnej siatce usług.", "free"],
      ["2", "Dziś wolny termin", "Terminy wieczorne i weekendowe — dla tych, co pracują do 17.", "pro"],
      ["3", "Wybierz stylistkę", "Najpierw wybierasz konkretną stylistkę, dopiero potem jej wolny termin.", "pro"],
      ["4", "Rodzinna firma", "Salon prowadzony przez matkę i córkę — dwa pokolenia pod jednym dachem.", "pro"],
      ["5", "Premium", "Prywatny gabinet, nie salon z ulicy — umawiasz się przez zapytanie, nie w locie.", "promax"],
    ],
  },
  {
    slug: "studio-paznokci",
    nazwa: "Studio paznokci",
    titled: false,
    warianty: [
      ["1", "Zaufany fachowiec", "Cennik na pierwszym ekranie i galeria prawdziwych wzorów, nie stockowe dłonie.", "free"],
      ["2", "Express", "Wolne okienko za 20 minut? Sprawdzasz od razu, nie czekasz na odpowiedź w wiadomości.", "pro"],
      ["3", "Nowoczesny cyfrowy", "Rezerwujesz termin jednym kliknięciem, bez przechodzenia na inną stronę.", "pro"],
      ["4", "Rodzinna firma", "Znasz jej prace z Instagrama — tu poznajesz też cennik i wolne terminy.", "pro"],
      ["5", "Premium", "Portfolio jak z magazynu, nie z folderu zdjęć w telefonie.", "promax"],
    ],
  },
  {
    slug: "medycyna-estetyczna",
    nazwa: "Medycyna estetyczna",
    titled: false,
    warianty: [
      ["1", "Zaufany lekarz", "Cennik bez gwiazdek i „zależy od zabiegu” — kwoty podane wprost.", "free"],
      ["2", "Elastyczne terminy", "Umawiasz się, kiedy Tobie pasuje — nie kiedy akurat jest okienko.", "pro"],
      ["3", "Dobierz zabieg", "Zaznaczasz, co Cię trapi — strona podpowiada, o czym porozmawiać na konsultacji.", "pro"],
      ["4", "Kameralny gabinet", "Dwie stałe lekarki, nie przypadkowa osoba z grafiku sieciówki.", "pro"],
      ["5", "Program indywidualny", "Program opieki rozłożony na miesiące, nie pojedynczy zabieg pod promocję.", "promax"],
    ],
  },
  {
    slug: "stomatolog",
    nazwa: "Stomatolog",
    titled: true,
    warianty: [
      ["1", "Uczciwy plan leczenia", "Plan leczenia na piśmie — co konieczne, co zalecane, co opcjonalne, z cenami.", "free"],
      ["2", "Lekarz prowadzący", "Jeden lekarz koordynuje cały wieloetapowy plan — nie gubisz się między specjalistami.", "pro"],
      ["3", "Pokój bez strachu", "Klikasz i widzisz krok po kroku, jak wygląda wizyta — łącznie z sygnałem stop.", "promax"],
    ],
  },
  {
    slug: "nieruchomosci",
    nazwa: "Nieruchomości",
    titled: true,
    warianty: [
      ["1", "Zaufany pośrednik", "Aktualne oferty widoczne od razu na stronie, nie tylko „zadzwoń po listę”.", "free"],
      ["2", "Sprzedaż w Twoim terminie", "Tempo sprzedaży policzone z realnej bazy kupujących, nie z marketingowego sloganu.", "pro"],
      ["3", "Kalkulator wyceny", "Wpisujesz parametry mieszkania — kalkulator od razu szacuje jego wartość rynkową.", "pro"],
      ["4", "Kameralne biuro", "Ta sama osoba prowadzi Cię od pierwszej wyceny aż po podpis u notariusza.", "pro"],
      ["5", "Segment premium", "Oferty, których nie znajdziesz w żadnym portalu — sprzedaż w pełnej dyskrecji.", "promax"],
    ],
  },
  {
    slug: "auta-z-ameryki",
    nazwa: "Auta z Ameryki",
    titled: true,
    warianty: [
      ["1", "Zaufany importer", "Pełny rachunek kosztów, zanim jeszcze wystartuje licytacja.", "free"],
      ["2", "Kalkulator sprowadzenia", "Wpisujesz cenę z licytacji — kalkulator liczy, ile zapłacisz w Polsce z cłem i akcyzą.", "pro"],
      ["3", "Auto na zamówienie", "Zamawiasz konkretny model — oni znajdą go na aukcji i przywiozą pod dom.", "promax"],
    ],
  },
  {
    slug: "fotograf-slubny",
    nazwa: "Fotograf ślubny",
    titled: true,
    warianty: [
      ["1", "Zaufany fotograf", "Cała stykówka z jednego wesela — dowód, nie wyselekcjonowane 10 najlepszych kadrów.", "free"],
      ["2", "Wolne terminy", "Klikasz datę ślubu w kalendarzu i od razu widzisz, czy fotograf ma jeszcze wolny termin.", "pro"],
      ["3", "Historia jednego dnia", "Jeden ślub, opowiedziany godzina po godzinie — od przygotowań po pierwszy taniec.", "promax"],
    ],
  },
  {
    slug: "fotowoltaika",
    nazwa: "Fotowoltaika",
    titled: false,
    warianty: [
      ["1", "Uczciwe wyliczenie", "Wyliczenie z Twoich własnych faktur za prąd, nie ze średniej krajowej.", "free"],
      ["2", "Instalacja na żywo", "Podgląd produkcji instalacji na żywo — zanim jeszcze podpiszesz umowę.", "pro"],
      ["3", "Kąt padania", "Przesuwasz suwak godziny i widzisz, ile prądu da twój dach o każdej porze dnia.", "promax"],
    ],
  },
];

export type Category = { id: string; nazwa: string; branze: string[] };

export const CATEGORIES: Category[] = [
  { id: "dom", nazwa: "Dom i naprawy", branze: ["hydraulik", "elektryk", "remonty", "fotowoltaika"] },
  { id: "uroda", nazwa: "Uroda i zdrowie", branze: ["fryzjer-barber", "salon-fryzjerski", "studio-paznokci", "medycyna-estetyczna", "stomatolog"] },
  { id: "nieruchomosci-auta", nazwa: "Nieruchomości i auta", branze: ["nieruchomosci", "auta-z-ameryki"] },
  { id: "fotografia", nazwa: "Fotografia", branze: ["fotograf-slubny"] },
];

export const TIER_ORDER = ["free", "pro", "promax"] as const;
export const TIER_FILTER_LABEL: Record<string, string> = { free: "Start", pro: "Pro", promax: "Pro Max" };
export const TIER_LABEL: Record<string, string> = { free: "Start", pro: "Pro", promax: "Max" };

export function branzaObj(slug: string): Branza | undefined {
  return BRANZE.find((b) => b.slug === slug);
}
export function categoryOf(id: string): Category | undefined {
  return CATEGORIES.find((c) => c.id === id);
}
export function categoryCount(cat: Category): number {
  return cat.branze.reduce((n, slug) => n + (branzaObj(slug)?.warianty.length || 0), 0);
}
export function tierCount(tier: string): number {
  let n = 0;
  BRANZE.forEach((b) => b.warianty.forEach((w) => w[3] === tier && n++));
  return n;
}
export const TOTAL_COUNT = BRANZE.reduce((n, b) => n + b.warianty.length, 0);

function slugifyPl(s: string): string {
  return s
    .toLowerCase()
    .replace(/ą/g, "a")
    .replace(/ć/g, "c")
    .replace(/ę/g, "e")
    .replace(/ł/g, "l")
    .replace(/ń/g, "n")
    .replace(/ó/g, "o")
    .replace(/ś/g, "s")
    .replace(/ź/g, "z")
    .replace(/ż/g, "z")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Port 1:1 z previewFile() — bez rozszerzenia .html (cleanUrls produkcji, patrz
// komentarz w oryginale o document-latency-insight z audytu PageSpeed).
export function previewFile(branza: string, num: string, tytul: string, titled: boolean): string {
  let path = "/preview/" + branza + "/" + branza + "-" + num;
  if (titled) path += "-" + slugifyPl(tytul);
  return path + "-preview-wypelniony";
}

// Port 1:1 z templateManifestId() — ten sam slug co previewFile, ale bez sufiksu
// pliku; to jest `id` z templates/manifest.json, którego generator używa przez
// ?template=.
export function templateManifestId(branza: string, num: string, tytul: string): string {
  return branza + "-" + num + "-" + slugifyPl(tytul);
}

export type GalleryEntry = { branza: Branza; wariant: Wariant };

// Port 1:1 z round-robin interleaving w oryginale — karty przemieszane między
// branżami (po jednej z każdej na rundę), żeby w widoku "Wszystkie" te same
// branże nie stały blokiem obok siebie.
export function interleavedEntries(): GalleryEntry[] {
  const queues = BRANZE.map((b) => ({ b, items: [...b.warianty] }));
  const result: GalleryEntry[] = [];
  let remaining = true;
  while (remaining) {
    remaining = false;
    for (const q of queues) {
      const w = q.items.shift();
      if (w) {
        result.push({ branza: q.b, wariant: w });
        remaining = true;
      }
    }
  }
  return result;
}
