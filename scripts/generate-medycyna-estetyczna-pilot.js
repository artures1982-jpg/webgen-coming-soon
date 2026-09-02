#!/usr/bin/env node
// scripts/generate-medycyna-estetyczna-pilot.js — pilot: warianty wizualne dla branży
// Medycyna estetyczna (gabinet lekarski: botoks, wypełniacze, mezoterapia, laseroterapia,
// zabiegi na twarz i ciało). Ósma branża w systemie 5 archetypów.
//
// WAŻNE — Artur wprost (2026-09-02): "Nie trzymaj się sztywno ram typu szybka pomoc 24,
// bardziej celujemy w premium" — cała branża ma skłaniać się ku premium/upscale, NIE tylko
// wariant 5. Wariant 2 (zwykle "Szybka interwencja 24h") NIE MOŻE być urgency/pogotowie —
// zamiast tego adaptuj archetyp na coś w rodzaju "dogodny termin, bez wielotygodniowego
// oczekiwania", stonowanie, bez syren/alarmizmu, dalej elegancko.
//
// Budowany PRZYROSTOWO, jeden wariant na raz, z checkpointem akceptacji Artura po każdym.

const SAMPLE_TOKENS = {
  '{{NAZWA_STRONY}}': 'GlowMed',
  '{{TELEFON}}': '500 123 456',
  '{{EMAIL}}': 'kontakt@glowmed.pl',
  '{{MIASTO}}': 'Kraków',
  '{{ADRES}}': 'ul. Przykładowa 12',
  '{{SLUG}}': 'glowmed-krakow',
  '{{GODZINY_PON_PT}}': '9:00 – 19:00',
  '{{GODZINY_SOB}}': '9:00 – 14:00',
};

const VARIANTS = [
  {
    id: 'medycyna-estetyczna-1-zaufany-lekarz',
    tier: 'free',
    name: 'Zaufany lekarz',
    visual: `STYL: adaptacja archetypu "Zaufany fachowiec" dla medycyny estetycznej — tu zaufanie
nie buduje się rzemiosłem, tylko kwalifikacjami medycznymi. Duch: "to lekarz medycyny, nie
kosmetolog z kursu weekendowego" — dyplom, specjalizacja, bezpieczeństwo, realne (nie
przesadzone) efekty. Klientela dorosła, damska i męska, ale przeważnie kobiety 30-55 lat.

CAŁA BRANŻA CELUJE W PREMIUM (instrukcja Artura, 2026-09-02) — nawet ten wariant free-tier ma
wyglądać elegancko, klinicznie-czysto, nie "tanio i szybko". Zero różowego cukierkowego spa-kitchu,
zero agresywnego marketingu "efekty od razu, bez bólu, promocja -50%". Ton: rzeczowy, spokojny,
medyczny, ale ciepły — nie zimny/korporacyjny jak szpital.

Przeczytaj WYŁĄCZNIE jako inspirację ducha (nigdy jako bazę do kopiowania): templates/pilot/
studio-paznokci-1-zaufany-fachowiec.html (branża najbliższa tematycznie, ale medycyna estetyczna
MUSI wyglądać poważniej/klinicznie, nie jak manicure) — Twoja wersja musi mieć inny mechanizm
wizualny każdej sekcji.

PALETA — sprawdź grepem że nie koliduje z żadnym wariantem w systemie: unikaj już zajętych
rodzin barw (teal #147d72, emerald #2dd4a7/#0b5c3f, sage #6b8f5e, coral #ff7a5c, dusty-blue
#5b7c99, champagne #f6ecd8, róż #c9718c/#ff4d8f). Zaproponuj chłodną, kliniczną, ale elegancką
kombinację — np. stonowany szałwiowo-miętowy chłód LUB głęboki, matowy burgund/wino na
kremowej bieli LUB ciepły dusty-rose (inny odcień niż już użyte różowe) na czystej bieli
medycznej. Typografia: elegancki, czytelny serif nagłówkowy (zweryfikuj grepem że nieużyty w
systemie) + czysty, medyczny sans (też zweryfikowany).

ZDJĘCIA (już wyszukane i zweryfikowane curl 200, użyj TYCH DOKŁADNYCH URL, nie zgaduj innych):
- Wnętrze gabinetu (nowoczesny, elegancki treatment room z aparaturą, marmurowy blat, bez ludzi):
  https://images.pexels.com/photos/11024139/pexels-photo-11024139.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940
- Portret lekarki w białym kitlu, pewna siebie, profesjonalna:
  https://images.pexels.com/photos/38618416/pexels-photo-38618416.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940
Jeśli potrzebujesz więcej zdjęć — NIE zgaduj ID (nie masz przeglądarki, a ID strony Pexels
czasem nie pokrywa się z ID CDN, co już raz spowodowało 404 w tym projekcie). Zostaw czytelny
placeholder w kodzie: <!-- PHOTO NEEDED: krótki opis --> i wypisz w raporcie, uzupełnię i
zweryfikuję curl-em.

TREŚĆ — zakaz przesady: żadnych medycznych obietnic wyniku ("całkowicie usuniesz zmarszczki",
"efekt lepszy niż chirurgia"), żadnych fałszywych opinii pacjentek z nazwiskiem. Zabiegi opisuj
rzeczowo (nazwa zabiegu, na co pomaga, ile trwa, cena orientacyjna) — nie "magicznie odmłodnisz
się o 10 lat". To realna branża regulowana, przesadzone obietnice są też prawnie ryzykowne dla
klienta końcowego (właściciela gabinetu), nie tylko kwestia stylu.

LAYOUT — zaproponuj bespoke mechanizm każdej sekcji (nav, hero, usługi/cennik, o lekarce/gabinecie,
"dlaczego my", opinie, FAQ, kontakt z mapą) — different from studio-paznokci-1 i od ducha
"rzemieślniczego" pozostałych branż w systemie. To gabinet medyczny, nie warsztat.`,
  },
];

module.exports = { VARIANTS, SAMPLE_TOKENS };
