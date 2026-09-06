# Rejestr błędów — szablony webgen.pl

**Ten plik jest OBOWIĄZKOWY do przeczytania przed budową i przed każdym przeglądem wariantu.**
Każda pozycja to błąd, który REALNIE trafił do gotowego pliku i został wyłapany dopiero później —
najczęściej przez Artura na telefonie, czyli najdrożej jak można.

Różnica wobec `ZASADY.md`: tam są reguły („jak ma być"), tutaj są **objawy i pułapki**
(„po czym poznasz, że jest źle" i „dlaczego kontrola tego nie złapała"). Zasady mówią, co
zrobić; rejestr mówi, gdzie się przewrócić.

Format: **objaw → przyczyna → jak wykryć → status**.

---

## B-01 · Karta `position:absolute` zasłania zdjęcie hero na mobile

- **Objaw:** na telefonie karta (kwitek z ceną, badge, podpis) przykrywa niemal całą fotografię.
- **Przyczyna:** `position:absolute` + szerokość rzędu 70–80% bez override'u w media query.
  Na desktopie warstwowa kompozycja wygląda dobrze, na wąskim ekranie karta siada na zdjęciu.
- **Jak wykryć:** WYŁĄCZNIE okiem, na zrzucie 360/390px. **Żaden pomiar tego nie widzi** — element
  absolutny nie generuje poziomego overflow, więc skan `scrollWidth` wychodzi zielony przy
  wizualnie zasłoniętym zdjęciu. To jedyna pułapka w `ZASADY.md` sekcja 6, której nie da się
  złapać pomiarem.
- **Poprawny wzorzec:** `position:relative` + ujemny margines (karta zostaje w normalnym flow i
  tylko „podchodzi" pod róg zdjęcia) albo `position:static` poniżej progu.
- **Status:** reguła `ZASADY.md` 6.8. Wystąpił 2× (auta-z-ameryki-1, wcześniej inne branże).

## B-02 · Nawigacja zbita w lewo na mobile

- **Objaw:** logo, telefon i hamburger stłoczone przy lewej krawędzi, pół paska puste.
- **Przyczyna:** prawą krawędź trzymały wyłącznie linki desktopowe (`flex:1`), a te są
  `display:none` poniżej progu — więc nic nie rozpycha układu.
- **Jak wykryć:** zrzut 390px; w kodzie brak `margin-left:auto` na `.nav-actions`.
- **Uwaga:** `justify-content:space-between` na kontenerze to **równoważna** implementacja tego
  samego wymogu — kontrola musi akceptować oba warianty, inaczej daje fałszywy alarm.
- **Status:** wykryte w fotograf-slubny-1, naprawione. Sprawdzane przez `sprawdz_szablon`.

## B-03 · Sekcja z `max-width` bez `margin:0 auto` przykleja się do lewej

- **Objaw:** cała sekcja FAQ (razem z tłem!) ma 820px i siedzi przy lewej krawędzi na desktopie.
- **Przyczyna:** `max-width` nałożone na sam `<section>`, bez automatycznych marginesów.
- **Poprawny wzorzec:** `max-width` na wewnętrznym kontenerze (`.faq .wrap`), nie na sekcji —
  wtedy tło zostaje pełnej szerokości, a treść się centruje.
- **Status:** wystąpił w 3 plikach fotograf-slubny naraz, naprawione 06.09.2026.

## B-04 · `disabled` na przycisku blokuje zdarzenie `click`

- **Objaw:** kliknięcie w „zajęty" element kalendarza nie robi nic w prawdziwej przeglądarce,
  mimo że kod obsługi wygląda poprawnie.
- **Przyczyna:** `element.disabled = true` blokuje zdarzenia u źródła.
- **Jak wykryć:** **testy programistyczne to przepuszczą** — trzeba realnego kliknięcia myszą.
- **Poprawny wzorzec:** `aria-disabled="true"` + własna obsługa stanu; element zostaje
  fokusowalny i komunikuje stan czytnikowi ekranu.
- **Status:** wykryte w fotograf-slubny-2.

## B-05 · Automatyczny scroll daje FAŁSZYWY obraz przy `scroll-behavior:smooth`

- **Objaw:** zrzut ekranu pokazuje pustą/czarną stronę, choć strona jest poprawna.
- **Przyczyna:** `window.scrollBy`, `scrollTop`, `scrollIntoViewIfNeeded` przy
  `scroll-behavior:smooth` są **asynchroniczne** — odczyt następuje przed dojechaniem. Do tego
  elementy z `IntersectionObserver` startują z `opacity:0` i potrzebują chwili na odsłonięcie.
- **Jak wykryć:** jeśli „strona jest pusta", NAJPIERW podejrzewaj test, nie stronę.
- **Poprawny wzorzec:** realny scroll (`page.mouse.wheel`) + odczekanie po scrollu. Ewentualnie
  chwilowo `scrollBehavior='auto'`.
- **Status:** ta pułapka dała fałszywy wynik **trzem różnym narzędziom** w jednej sesji.

## B-06 · Mechanizm konceptualny czytany jako zepsuta strona

- **Objaw:** klient pyta „czy tak ma być?" — puste, ponumerowane ramki w galerii miały oznaczać
  „resztę materiału z wesela", a czytały się jako **niezaładowane zdjęcia**.
- **Przyczyna:** mechanizm wymagał od widza odczytania intencji. Odruchowa interpretacja („to jest
  zepsute") zawsze wygrywa z intencją projektanta.
- **Jak wykryć:** jeśli element wygląda jak brakująca treść, jest brakującą treścią — niezależnie
  od zamysłu. Szczególnie groźne w branżach, gdzie zdjęcia SĄ produktem.
- **Poprawny wzorzec:** informację „to tylko fragment" nieś tekstem/liczbą („+780 kadrów"), nigdy
  pustym miejscem.
- **Status:** wykryte przez Artura w fotograf-slubny-1.

## B-07 · Dokładanie krycia na overlay to ślepa uliczka

- **Objaw:** tekst na zdjęciu nieczytelny; wzmocnienie gradientu nie pomaga.
- **Przyczyna:** przy jasnych kadrach potrzebne krycie przekracza 80%, a wtedy (wg `ZASADY.md`
  sekcja 4) zdjęcie renderuje się jak jednolita czerń i traci sens. Sprzeczne wymagania.
- **Poprawny wzorzec:** **zdjąć tekst ze zdjęcia** — podpis do sąsiadującego panelu na pełnym tle.
  Kontrast wynika wtedy z konstrukcji, nie z walki z jasnością kadru.
- **Status:** auta-z-ameryki-2, poprawiane dwukrotnie zanim zmieniono podejście.

## B-08 · Kalki tekstowe między wariantami tej samej branży

- **Objaw:** dwa warianty brzmią jak jedna oferta z podmienionym kolorem.
- **Przyczyna:** kolejny wariant powstaje z tego samego briefu i „dziedziczy" całe zdania.
- **Trzy stałe miejsca** (zawsze te same): akapit/karta kontaktowa, pierwsze zdanie stopki,
  otwarcie pierwszej odpowiedzi FAQ. Plus duplikacja wewnątrz pliku (oś procesu vs FAQ).
- **Jak wykryć:** `porownaj_teksty` (MCP) albo ręczne porównanie tych trzech miejsc PRZED czytaniem
  reszty.
- **Status:** `ZASADY.md` 5.1. Wystąpił **4×**.

## B-09 · Powtórzenie zdjęcia między wariantami tej samej branży

- **Objaw:** przy oglądaniu wariantów obok siebie widać te same fotografie.
- **Przyczyna:** ograniczona pula zdjęć w briefie i uznanie powtórzenia za „nieuniknione" zamiast
  dobrania nowych kadrów przez API (co zajmuje minuty).
- **Jak wykryć:** `sprawdz_szablon` porównuje ID Pexels w obrębie branży.
- **Status:** `ZASADY.md` sekcja 4. Wykryte przez MCP przy pierwszym uruchomieniu.
  Świadome odstępstwo: **fotograf-slubny** — Artur zdecydował zostawić (06.09.2026).

## B-10 · Błąd merytoryczny w liczbach, których klient sam nie sprawdzi… ale sprawdzi

- **Objaw:** przykładowa kalkulacja kosztu nie zgadzała się ze stawkami podanymi niżej na tej samej
  stronie (efektywna akcyza ~8,6% zamiast deklarowanych 18,6%).
- **Przyczyna:** liczby wpisane „na oko" zamiast policzone.
- **Jak wykryć:** przeliczyć ręcznie każdą kwotę pokazaną jako przykład. W branżach finansowych
  klient robi to kalkulatorem i traktuje rozjazd jako oszustwo.
- **Status:** auta-z-ameryki-1. Od tej pory kalkulatory są weryfikowane niezależnie 3×.

## B-11 · `grep` na gramatykę `{{MIASTO}}` ma lukę

- **Objaw:** „poza **miasto** {{MIASTO}}" przechodzi kontrolę.
- **Przyczyna:** wzorzec `(w|z|do|poza) \{\{MIASTO\}\}` sprawdza wyłącznie przyimek stojący
  **bezpośrednio** przed tokenem; odmieniany rzeczownik w środku go omija.
- **Status:** `ZASADY.md` sekcja 2. Wystąpił **2×** w jednej branży. Grep jest warunkiem
  koniecznym, nie wystarczającym — trzeba czytać całe zdania.

## B-12 · Nieaktualny mirror w `preview/`

- **Objaw:** na produkcję idzie wersja sprzed poprawek copywritera.
- **Przyczyna:** poprawki wchodzą do `templates/pilot/`, a mirror nie zostaje zsynchronizowany.
- **Jak wykryć:** `diff` obu kopii — kontrola `mirror_spojnosc` w `sprawdz_szablon`.
- **Status:** wykryte przez QA w fotograf-slubny-2, zanim trafiło na produkcję.

---

## Jak korzystać

**Przed budową wariantu:** przeczytaj B-01, B-02, B-03, B-06, B-07 (pułapki konstrukcyjne).
**Przed przeglądem:** przeczytaj B-08, B-09, B-11, B-12 (to, co najczęściej przechodzi).
**Gdy weryfikacja daje dziwny wynik:** sprawdź B-04 i B-05, zanim uznasz, że strona jest zepsuta.

**Dopisuj nowe pozycje.** Każdy błąd wyłapany przez Artura, a nie przez nas, to kandydat do
rejestru — bo znaczy, że żadna z naszych kontroli go nie widziała.
