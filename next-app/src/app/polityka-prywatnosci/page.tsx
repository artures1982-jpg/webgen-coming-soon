import type { Metadata } from "next";
import Link from "next/link";
import styles from "./page.module.css";

// Faza 0 migracji — dowód koncepcji: ta strona wybrana celowo jako pierwsza
// (docs/plan-migracji-nextjs.md, Faza 1) bo jest statyczna, bez auth, bez ruchu
// biznesowego. Treść skopiowana 1:1 z polityka-prywatnosci/index.html (stan 14.09).
export const metadata: Metadata = {
  title: "Polityka Prywatności — webgen.pl",
  alternates: {
    canonical: "https://www.webgen.pl/polityka-prywatnosci/",
  },
};

export default function PolitykaPrywatnosciPage() {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.eyebrow}>{"// webgen.pl"}</div>
        <h1>Polityka Prywatności</h1>
        <p className={styles.subtitle}>Jak przetwarzamy i chronimy Twoje dane osobowe</p>
        <p className={styles.meta}>
          Wersja: 1.1 · Data wejścia w życie: 21 marca 2026 r. · Ostatnia aktualizacja: 8 września
          2026 r.
        </p>
      </header>

      <h2>Informacje o Administratorze</h2>
      <p>
        Administratorem Twoich danych osobowych jest <strong>Webgen Artur Sapożnikow</strong>,
        jednoosobowa działalność gospodarcza wpisana do Centralnej Ewidencji i Informacji o
        Działalności Gospodarczej (CEIDG) prowadzonej przez ministra właściwego ds. gospodarki,
        NIP: 9521854979, REGON: 545358544, adres siedziby: ul. Urocza 8/7, 04-651 Warszawa,
        świadcząca usługi generowania stron internetowych przy użyciu sztucznej inteligencji pod
        marką Webgen.pl.
      </p>
      <div className={styles.contactBox}>
        <strong>Kontakt w sprawach RODO:</strong>
        <br />
        E-mail: <a href="mailto:privacy@webgen.pl">privacy@webgen.pl</a>
        <br />
        Kontakt ogólny: <a href="mailto:hello@webgen.pl">hello@webgen.pl</a>
      </div>

      <h2>Podstawy prawne przetwarzania</h2>
      <p>
        Przetwarzamy dane wyłącznie na podstawie co najmniej jednej z poniższych podstaw prawnych
        zgodnie z RODO:
      </p>
      <ul>
        <li>
          <strong>Art. 6 ust. 1 lit. b RODO</strong> — wykonanie umowy (rejestracja, subskrypcja,
          generowanie stron)
        </li>
        <li>
          <strong>Art. 6 ust. 1 lit. a RODO</strong> — Twoja zgoda (newsletter, pliki cookie
          analityczne/marketingowe)
        </li>
        <li>
          <strong>Art. 6 ust. 1 lit. c RODO</strong> — obowiązki prawne (faktury, podatki)
        </li>
        <li>
          <strong>Art. 6 ust. 1 lit. f RODO</strong> — prawnie uzasadniony interes (bezpieczeństwo,
          dochodzenie roszczeń)
        </li>
      </ul>

      <h2>Jakie dane zbieramy i w jakim celu</h2>

      <h3>Rejestracja i korzystanie z Usług</h3>
      <p>
        Adres e-mail oraz dane logowania i sesji — obsługiwane przez naszego dostawcę
        uwierzytelniania Clerk (patrz „Odbiorcy danych i przekazywanie do państw trzecich&rdquo;) — a
        także nazwa firmy, branża, miasto, numer telefonu (opcjonalnie), przesłane pliki (np.
        logo) oraz treść wprowadzona do generatora AI.
      </p>
      <p>
        <em>Cel:</em> świadczenie usługi. <em>Okres przechowywania:</em> czas trwania umowy + 5 lat
        (obowiązki podatkowe).
      </p>

      <h3>Płatności</h3>
      <p>
        Operatorem płatności jest <strong>Stripe, Inc.</strong> (USA). Webgen.pl nie przechowuje
        danych kart płatniczych. Stripe stosuje standardowe klauzule umowne zatwierdzone przez
        Komisję Europejską.
      </p>

      <h3>Komunikacja i wsparcie</h3>
      <p>
        Adres e-mail i treść wiadomości w korespondencji z obsługą klienta. <em>Okres:</em> 2 lata
        od ostatniego kontaktu.
      </p>

      <h3>Newsletter</h3>
      <p>
        Wyłącznie za Twoją zgodą. Możesz zrezygnować w każdej chwili klikając link w wiadomości
        lub pisząc na <a href="mailto:hello@webgen.pl">hello@webgen.pl</a>.
      </p>

      <h3>Analityka</h3>
      <p>
        Google Analytics 4 — wyłącznie po udzieleniu zgody na pliki cookie analityczne. Dane
        anonimizowane. <em>Okres:</em> 14 miesięcy.
      </p>

      <h2>Twoje prawa</h2>
      <p>Przysługują Ci następujące prawa — zrealizujemy je w ciągu 30 dni:</p>
      <ul>
        <li>
          <strong>Dostęp</strong> (art. 15 RODO) — uzyskanie kopii Twoich danych
        </li>
        <li>
          <strong>Sprostowanie</strong> (art. 16) — poprawienie błędnych danych
        </li>
        <li>
          <strong>Usunięcie</strong> (art. 17) — „prawo do bycia zapomnianym&rdquo;
        </li>
        <li>
          <strong>Ograniczenie przetwarzania</strong> (art. 18)
        </li>
        <li>
          <strong>Przenoszenie</strong> (art. 20) — otrzymanie danych w formacie JSON/CSV
        </li>
        <li>
          <strong>Sprzeciw</strong> (art. 21) — wobec przetwarzania na podstawie naszego interesu
        </li>
        <li>
          <strong>Wycofanie zgody</strong> — w każdym czasie, bez wpływu na wcześniejsze
          przetwarzanie
        </li>
        <li>
          <strong>Skarga do UODO</strong> — ul. Stawki 2, 00-193 Warszawa,{" "}
          <a href="https://uodo.gov.pl" target="_blank" rel="noopener noreferrer">
            uodo.gov.pl
          </a>
        </li>
      </ul>
      <p>
        Kontakt: <a href="mailto:privacy@webgen.pl">privacy@webgen.pl</a>
      </p>

      <h2>Odbiorcy danych i przekazywanie do państw trzecich</h2>
      <div className={styles.tableWrap}>
        <table>
          <thead>
            <tr>
              <th>Dostawca</th>
              <th>Cel</th>
              <th>Kraj / Zabezpieczenie</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Clerk, Inc.</td>
              <td>Uwierzytelnianie i zarządzanie kontem (logowanie, rejestracja, sesje, hasła)</td>
              <td>USA — Standardowe Klauzule Umowne UE</td>
            </tr>
            <tr>
              <td>Stripe, Inc.</td>
              <td>Obsługa płatności</td>
              <td>USA — Standardowe Klauzule Umowne UE</td>
            </tr>
            <tr>
              <td>Vercel, Inc.</td>
              <td>Hosting i infrastruktura</td>
              <td>USA — SKU UE</td>
            </tr>
            <tr>
              <td>Resend</td>
              <td>Wysyłka e-mail transakcyjnych</td>
              <td>USA — SKU UE</td>
            </tr>
            <tr>
              <td>Google LLC</td>
              <td>Analytics GA4 (za zgodą)</td>
              <td>USA — SKU UE</td>
            </tr>
            <tr>
              <td>Meta Platforms, Inc.</td>
              <td>Meta Pixel — pomiar i personalizacja reklam (za zgodą)</td>
              <td>USA — SKU UE</td>
            </tr>
            <tr>
              <td>Anthropic, PBC</td>
              <td>Model AI — personalizacja treści szablonu (plany Pro/Pro Max)</td>
              <td>USA — SKU UE</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2>Pliki cookie</h2>
      <p>Używamy trzech kategorii plików cookie:</p>
      <ul>
        <li>
          <strong>Niezbędne</strong> — sesja użytkownika, bezpieczeństwo CSRF, preferencje cookie.
          Zawsze aktywne, nie wymagają zgody.
        </li>
        <li>
          <strong>Analityczne</strong> — Google Analytics 4. Wymagają Twojej zgody. Dane
          anonimizowane.
        </li>
        <li>
          <strong>Marketingowe</strong> — Meta Pixel (reklamy Facebook/Instagram). Wymagają Twojej
          zgody.
        </li>
      </ul>
      <p>
        Możesz zarządzać zgodami w dowolnym momencie, klikając przycisk{" "}
        <strong>&quot;Ustawienia cookie&quot;</strong> widoczny po akceptacji banera lub w stopce
        strony.
      </p>

      <h2>Bezpieczeństwo danych</h2>
      <ul>
        <li>Szyfrowanie komunikacji TLS/HTTPS</li>
        <li>
          Logowanie i hasła obsługiwane przez wyspecjalizowanego dostawcę uwierzytelniania (Clerk)
          — webgen.pl nie przechowuje haseł użytkowników samodzielnie
        </li>
        <li>Dostęp do danych ograniczony zasadą minimalnych uprawnień</li>
        <li>Regularne tworzenie kopii zapasowych</li>
        <li>Procedury reagowania na incydenty bezpieczeństwa (art. 33–34 RODO)</li>
      </ul>

      <h2>Okresy przechowywania danych</h2>
      <div className={styles.tableWrap}>
        <table>
          <thead>
            <tr>
              <th>Kategoria</th>
              <th>Okres</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Dane konta użytkownika</td>
              <td>Czas trwania umowy + 5 lat</td>
            </tr>
            <tr>
              <td>Dane rozliczeniowe i faktury</td>
              <td>5 lat od końca roku podatkowego</td>
            </tr>
            <tr>
              <td>Korespondencja e-mail</td>
              <td>2 lata od ostatniego kontaktu</td>
            </tr>
            <tr>
              <td>Logi serwera i dane analityczne</td>
              <td>14 miesięcy</td>
            </tr>
            <tr>
              <td>Dane marketingowe / newsletter</td>
              <td>Do wycofania zgody</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2>Dzieci</h2>
      <p>
        Usługa skierowana jest do podmiotów prowadzących działalność gospodarczą. Nie zbieramy
        świadomie danych osób poniżej 18. roku życia.
      </p>

      <h2>Zmiany Polityki Prywatności</h2>
      <p>
        O istotnych zmianach informujemy e-mailem z co najmniej 14-dniowym wyprzedzeniem.
        Kontynuowanie korzystania z Usług po wejściu zmian w życie oznacza ich akceptację.
      </p>

      <h2>Kontakt</h2>
      <div className={styles.contactBox}>
        W sprawach dotyczących danych osobowych:
        <br />
        <strong>privacy@webgen.pl</strong>
        <br />
        <br />
        Odpowiadamy w ciągu 72 godzin. Wnioski z art. 15–22 RODO realizujemy w terminie 1 miesiąca.
      </div>

      <div className={styles.warning}>
        Dokument sporządzony zgodnie z RODO (UE) 2016/679, ustawą z dnia 10 maja 2018 r. o
        ochronie danych osobowych oraz ustawą z dnia 18 lipca 2002 r. o świadczeniu usług drogą
        elektroniczną. Dokument ma charakter informacyjny — zalecana weryfikacja przez radcę
        prawnego.
      </div>

      <footer className={styles.footer}>
        <p>© 2026 webgen.pl</p>
        <p style={{ marginTop: 8 }}>
          <Link href="/">Strona główna</Link>
          <Link href="/regulamin">Regulamin</Link>
          <Link href="/polityka-prywatnosci">Polityka prywatności</Link>
          <a href="mailto:hello@webgen.pl">Kontakt</a>
        </p>
      </footer>
    </div>
  );
}
