#!/usr/bin/env node
// scripts/generate-salon-fryzjerski-pilot.js — pilot: warianty wizualne dla Salonu fryzjerskiego
// (damski i męski, unisex), siódma branża w systemie 5 archetypów. Odrębna od
// Fryzjer/Barber (branża zamknięta 5/5, pozycjonowana wyłącznie jako męski barbershop) —
// ten salon obsługuje obie płcie: strzyżenie, koloryzacja, stylizacja.
//
// Budowany PRZYROSTOWO, jeden wariant na raz, z checkpointem akceptacji Artura po każdym
// (patrz docs/produkcja-szablonow/README.md i pamięć feedback_sequential_variant_workflow).

const SAMPLE_TOKENS = {
  '{{NAZWA_STRONY}}': 'HairLoft',
  '{{TELEFON}}': '500 123 456',
  '{{EMAIL}}': 'kontakt@hairloft.pl',
  '{{MIASTO}}': 'Kraków',
  '{{ADRES}}': 'ul. Przykładowa 12',
  '{{SLUG}}': 'hairloft-krakow',
  '{{GODZINY_PON_PT}}': '9:00 – 20:00',
  '{{GODZINY_SOB}}': '9:00 – 15:00',
};

const VARIANTS = [
  {
    id: 'salon-fryzjerski-1-zaufany-fachowiec',
    tier: 'free',
    name: 'Zaufany fachowiec',
    visual: `STYL: "Zaufany fachowiec" dla salonu fryzjerskiego UNISEX (damski i męski —
strzyżenie, koloryzacja, stylizacja, dla obu płci w jednym miejscu, nie osobne "działy"). To
siódma branża w systemie — odrębna od fryzjer-barber (już zamkniętej 5/5, pozycjonowanej
wyłącznie jako męski barbershop: "strzyżenie i broda"). Duch tego salonu: nowoczesny, loftowy,
elegancki ale przystępny — NIE tak surowy/przemysłowy jak barbershop, NIE tak stereotypowo
różowy/kobiecy jak studio-paznokci — trafia w środek: unisex, ciepły, ale precyzyjny.

Artur wprost: "najbardziej z tych projektów podobały mi się strony paznokci tak wizualnie" —
weź to jako wskazówkę tonalną (ciepło, elegancja, dobra fotografia) ale NIE kopiuj palety ani
mechanizmów studio-paznokci-1 1:1 (dusty-rose/ivory, Playfair Display, nav wyśrodkowany,
medaliony statystyk) — to nadal osobna branża, ZASADY.md sekcja 0 obowiązuje normalnie.

Przeczytaj WYŁĄCZNIE jako inspirację ducha (nigdy jako bazę do kopiowania): templates/pilot/
studio-paznokci-1-zaufany-fachowiec.html i templates/pilot/fryzjer-barber-1-zaufany-fachowiec.html
— Twoja wersja musi mieć inny mechanizm wizualny każdej sekcji niż OBA te pliki.

PALETA (zablokowana, sprawdzona grepem że nie koliduje z żadnym wariantem w systemie): --bg
ciepłe ivory (np. #f5efe4), --surface głębsza ciepła karta (np. #ecdfd0), --accent głęboki,
elegancki teal/morska zieleń (np. #147d72 — genuinie świeża rodzina barw w systemie: różna od
emerald #2dd4a7, sage #6b8f5e, forest #3f6b4a, olive #7d6b2e — bardziej nasycony, chłodniejszy
"morski" teal, neutralny płciowo, pasuje i do damskiego, i do męskiego pozycjonowania),
--accent-dark głębszy morski (np. #0d5951), --text ciepły ciemny brąz-czerń, --muted stonowany
ciepły taupe.
TYPOGRAFIA: nagłówki elegancki literacki serif (np. Frank Ruhl Libre — nieużyty jeszcze w
systemie, inny niż Playfair Display studio-paznokci), tekst czytelny sans (np. Albert Sans —
nieużyty jeszcze w systemie). Zweryfikuj grepem przed finalizacją.

ZDJĘCIA (już wyszukane i wizualnie zweryfikowane, zero kolizji ID):
- HERO: stylistka pracująca nad klientką w loftowym, ciepło oświetlonym salonie — elegancka,
  edytorialna scena: https://images.pexels.com/photos/3992879/pexels-photo-3992879.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940
- GALERIA "Metamorfozy", zdjęcie MĘSKIE (precyzyjne strzyżenie nożyczkami, close-up):
  https://images.pexels.com/photos/32329615/pexels-photo-32329615.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940
- GALERIA "Metamorfozy", zdjęcie DAMSKIE (modelowanie długich włosów szczotką, glamour):
  https://images.pexels.com/photos/14615064/pexels-photo-14615064.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940
Ważne: branża jest wprost damska I męska — galeria/portfolio MUSI pokazywać oba, nie tylko
jedną płeć (to nie jest kosmetyczny dodatek, to sedno pozycjonowania tego wariantu).

LAYOUT — celowo inny mechanizm niż studio-paznokci-1 i fryzjer-barber-1:
1. Nav: logo po lewej jako prosty wordmark (nie monogram-plakietka jak barber, nie
   wyśrodkowany jak paznokcie), linki po prawej, CTA "Umów wizytę" jako pigułka OBRYSOWANA
   (nie wypełniona) w kolorze --accent.
2. Hero: układ "magazynowy" — DUŻE zdjęcie PO LEWEJ (nie pełnoekranowe jak barber, nie split z
   pływającą plakietką jak paznokcie) zajmujące ~55% szerokości w miękko zaokrąglonym
   prostokącie, tekst PO PRAWEJ (odwrotna kolejność niż typowy split). Mała pływająca etykieta
   "Wybór stylistki" w rogu zdjęcia.
3. Sekcja USŁUGI I CENNIK: podzielona na DWIE kolumny-kategorie równolegle — "Strzyżenie i
   stylizacja damska" oraz "Strzyżenie i stylizacja męska" — każda kolumna to osobna, krótka
   lista usług z cenami (autentyczne odzwierciedlenie pozycjonowania "damski i męski", inny
   mechanizm niż jednolity cennik u poprzedników).
4. Sekcja GALERIA "Metamorfozy": 2 duże zdjęcia obok siebie (męskie + damskie) w asymetrycznym
   układzie (jedno nieco większe), każde z krótkim podpisem typu usługi — nie siatka 3 równych
   kwadratów jak paznokcie, nie prostokąty z ostrymi rogami jak barber.
5. Sekcja O NAS: pozioma karta — mały portret/zdjęcie zespołu + tekst + 2-3 inline
   badge'e-statystyki (tekstowe, nie medaliony, nie osobny rząd liczb) wplecione w zdanie.
6. Sekcja OPINIE: 2 karty z małym okrągłym avatarem-inicjałem (nie zdjęciem prawdziwej osoby,
   nie brak avatara jak paznokcie/barber) + cytat + imię.
7. Sekcja "Dlaczego HairLoft": siatka 2×2 (nie pionowa lista jak paznokcie, nie rząd 4 kart jak
   barber) — np. Doświadczony zespół / Produkty premium / Konsultacja przed zabiegiem /
   Elastyczne terminy online i telefonicznie.
8. FAQ — accordion, standardowo.
9. Kontakt: wyśrodkowany baner "Umów wizytę" (telefon + link rezerwacji) + pasek danych + mapa
   dojazdu (patrz WYMÓG — MAPA DOJAZDU w CSS_VAR_REQUIREMENT innych branż). Bez pełnego
   formularza — banner+telefon wystarczy na free tier.
10. Stopka: 2-kolumnowa, ciepła, prosta.`,
  },
];

VARIANTS.push({
  id: 'salon-fryzjerski-2-dzis-wolny-termin',
  tier: 'pro',
  name: 'Dziś wolny termin',
  visual: `STYL: adaptacja archetypu "Szybka interwencja 24h" — dla salonu fryzjerskiego to NIE
zagrożenie (jak hydraulik/elektryk) ani czysto "bez kolejki" (jak fryzjer-barber-2/remonty-2 —
unikaj powielania 1:1 ram tamtych wariantów). Tu pilność wynika z realnego bólu klientów salonów:
większość pracuje 9-17 i nie może umówić wizyty w standardowych godzinach. Duch: "wieczorne i
weekendowe terminy dla zapracowanych — dziś sprawdzisz, dziś się umówisz".

Drugi wariant tej branży — różnicowanie względem salon-fryzjerski-1 (ciepłe ivory + teal, hero
magazynowy) i względem fryzjer-barber-2/remonty-2 (oba ciemne, oba z hi-vis limonką — TEN
wariant NIE MOŻE być kolejnym ciemnym+limonkowym, to już trzeci raz ten sam pomysł w systemie).

WYMAGANY RUCH (obowiązkowy próg dla wariantu 2+, patrz .claude/agents/designer-ux-ui.md sekcja
"Nie czekaj aż użytkownik poprosi o więcej ruchu"): ambientowa poświata w tle hero, shimmer na
primary CTA, wizualna reakcja na interakcję (jeśli dodajesz cokolwiek klikalnego), stopniowany
fade-in kart. WYMÓG prefers-reduced-motion: wymień explicite każdą nietrywialną animację.

PALETA (zablokowane, sprawdzone grepem że nie kolidują z żadnym wariantem w systemie) —
ŚWIADOMIE JASNA (przełamuje serię ciemnych wariantów 2 w systemie — hydraulik-2/elektryk-2
też były jasne, to nie jest nowość, tylko powrót do sprawdzonego wzorca): --bg prawie biały,
ciepły (np. #fffaf0), --surface ciepły jasnożółty (np. #fff4d6), --accent nasycony, czysty
złoto-żółty (np. #f0c419 — genuinie inna rodzina niż stonowane bursztynowo-brązowe złota już w
systemie: #e0a527/#e8a317/#a8813a/#9c7238/#7d6b2e są wszystkie przygaszone/brązowe, ten jest
czysty, jaskrawy, "highlighter/karteczka post-it — dziś wolny termin"), --accent-dark głębszy
bursztyn do tekstu/hover (np. #b8860a — czysty żółty jako tekst jest nieczytelny, ten hover-
-shade rozwiązuje kontrast), --text ciepły prawie-czarny brąz, --muted stonowany ciepły szary.
TYPOGRAFIA: nagłówki energiczny geometryczny display (np. Familjen Grotesk — nieużyty jeszcze w
systemie), tekst czytelny sans (np. Onest — nieużyty jeszcze w systemie). Zweryfikuj grepem
przed finalizacją, jeśli kolizja wybierz najbliższy dostępny odpowiednik z Google Fonts.

ZDJĘCIE (już wyszukane, zero kolizji ID): dynamiczne zbliżenie na dłonie tnące włosy grzebieniem
i nożyczkami, dramatyczne światło z bokeh w tle — energia, tempo:
https://images.pexels.com/photos/3993447/pexels-photo-3993447.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940

STORYTELLING: konkretny scenariusz (np. klientka umawiająca się na 19:30 przed wydarzeniem
następnego dnia, bo żaden inny salon w mieście nie miał wieczornych terminów) — nie ogólnik.

LAYOUT — inny mechanizm niż salon-fryzjerski-1, fryzjer-barber-2, remonty-2 (sprawdź oba
ciemne warianty żeby nie powielić marquee+hi-vis+ciemne tło 1:1):
1. Nav: jasna, CTA "Sprawdź wolne terminy" jako wypełniona pigułka ze shimmer-sweep.
2. Hero: zdjęcie jako pełnoekranowe tło z jasnym gradient-overlay (nie ciemnym — zachowaj jasny
   charakter), ambientowa poświata (radial-gradient w --accent, pulsująca, keyframe) za tekstem.
   H1 nie-etykieta, konkretny hook o wieczornych/weekendowych terminach.
3. Pasek "Dziś wolne": pozioma lista rotujących dostępnych godzin (może być marquee — to
   uniwersalna technika, dozwolona do powtórzenia — ale w JASNEJ kolorystyce, nie ciemnej jak
   poprzednicy, żeby mechanizm wizualnie różnił się mimo tej samej podstawowej idei).
4. Sekcja "Dla zapracowanych": siatka 3-4 kart scenariuszy (poranne szybkie zmiany przed pracą /
   wieczorne terminy do 20:00 / soboty bez czekania / zapis online o dowolnej porze) ze
   stopniowanym fade-in.
5. Sekcja storytelling: konkretny scenariusz (patrz wyżej), fade-in.
6. FAQ — accordion, jasna stylistyka.
7. Kontakt: baner CTA z shimmer, dane + mapa.
8. Stopka: jasna, prosta.`,
});

VARIANTS.push({
  id: 'salon-fryzjerski-3-wybierz-stylistke',
  tier: 'pro',
  name: 'Nowoczesny cyfrowy',
  visual: `STYL: adaptacja archetypu "Nowoczesny cyfrowy" — w innych branżach to widget rezerwacji
dzień+godzina jako primary CTA (studio-paznokci-3, fryzjer-barber-3, remonty-3-kalkulator). Dla
tego salonu — INNY MECHANIZM niż wszystkie trzy: widget DWUETAPOWY — najpierw wybierasz
KONKRETNEGO stylistę (nie tylko termin), potem dopiero jego/jej wolne godziny. Duch: "u nas nie
trafiasz do przypadkowej osoby — wybierasz kogoś, kto specjalizuje się dokładnie w tym, czego
potrzebujesz (koloryzacja / strzyżenie męskie / stylizacja ślubna itd.)".

WAŻNE OGRANICZENIE: stylistki/styliści w widgecie to WYMYŚLONE persony (imię + specjalizacja)
do celów demo, nie prawdziwe zdjęcia z twarzami podpisane jako personel — użyj kolorowych
awatarów-inicjałów (jak w opiniach wariantu 1), NIE prawdziwych zdjęć twarzy z Pexels
podpisanych imieniem. To unika problemu "fabrykowania tożsamości" przy prawdziwych zdjęciach
stockowych (ten sam powód co ograniczenie przy zdjęciu w remonty-4/fryzjer-barber-4).

Trzeci wariant tej branży — różnicowanie względem salon-fryzjerski-1 (ciepłe ivory/teal, hero
magazynowy) i salon-fryzjerski-2 (jasne złoto/kremowa biel, marquee). Ten wariant ciemny, w
świeżej rodzinie barw.

WYMAGANY RUCH (obowiązkowy próg wariantów 2+): jednorazowy fade-in kart, statyczna hover-only
poświata na chipach stylistów/godzin (bez pętli — to zgodne z konwencją "cyfrowy, appkowy"
archetypu, inne warianty tego archetypu w systemie też ograniczają się do fade-in+hover, nie
ambientowego glow w tle — zachowaj tę spójność w obrębie samego archetypu 3).

PALETA (zablokowane, sprawdzone grepem że nie kolidują z żadnym wariantem w systemie): --bg
ŚREDNIO-ciemny (nie kolejny "prawie czarny") ciepły mauve-plum (np. #3a1f2e — świeża rodzina,
różowo-fioletowa, cieplejsza niż indygo remonty-3 #221f42, jaśniejsza niż wszystkie "prawie
czarne" warianty archetypu 3 w systemie), --surface jaśniejszy mauve (np. #4a2a3a), --accent
żywy koralowy róż-pomarańcz (np. #ff7a5c — świeża rodzina, inna niż magenta #ff4d8f, inna niż
brick #a14a3a, inna niż czyste czerwono-pomarańcze #e0361c/#ff5a1f), --accent-dark głębszy
koralowy (np. #cc5a3f), --text ciepła kremowa biel, --muted stonowany dusty mauve-róż.
TYPOGRAFIA: nagłówki elegancki display serif (np. DM Serif Display — nieużyty jeszcze w
systemie), tekst czytelny geometryczny sans (np. Schibsted Grotesk — nieużyty jeszcze w
systemie). Zweryfikuj grepem przed finalizacją.

ZDJĘCIE (już wyszukane, zero kolizji ID): nowoczesne, eleganckie wnętrze salonu — marmurowa
podłoga, przemysłowo-designerskie oświetlenie, bez widocznych logo/marek:
https://images.pexels.com/photos/7195807/pexels-photo-7195807.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940
Użyte jako mniejszy inset w hero (obok/za widgetem), nie jako dominujące tło.

LAYOUT — inny mechanizm niż salon-fryzjerski-1/2 i inny niż studio-paznokci-3/fryzjer-barber-3/
remonty-3 (sprawdź wszystkie trzy przed projektowaniem — żadna nie ma dwuetapowego
stylista→termin, wszystkie mają płaski widget dzień+godzina):
1. Nav: ciemna, CTA "Umów u wybranej osoby" pigułka.
2. Hero: 2 kolumny — lewo tekst, prawo WIDGET: krok 1 — pozioma lista 4 chipów-awatarów
   stylistów (kolorowy okrąg z inicjałem + imię + specjalizacja pod spodem), klik zaznacza
   wybór; krok 2 — po zaznaczeniu pojawia się (lub jest zawsze widoczna, podświetlona po
   wyborze) siatka chipów godzin DLA TEJ OSOBY. Zdjęcie salonu jako mały inset w rogu/za
   widgetem.
3. Sekcja storytelling: dlaczego wybór konkretnej osoby ma znaczenie (konkretny scenariusz —
   np. klientka szukająca kogoś z doświadczeniem w balayage, nie przypadkowej osoby z grafiku),
   fade-in.
4. Sekcja "Poznaj zespół": 4 karty stylistów (te same awatary co w widgecie, większe, z krótkim
   opisem specjalizacji i lat doświadczenia) — fade-in stopniowany.
5. Sekcja zaufania: statystyka + jeden cytat w stylu dymka czatu.
6. FAQ — accordion, ciemna stylistyka.
7. Kontakt: skrót wyboru z widgetu (jeśli dokonany) + telefon + dane + mapa.
8. Stopka: ciemna, minimalna.`,
});

module.exports = { VARIANTS, SAMPLE_TOKENS };
