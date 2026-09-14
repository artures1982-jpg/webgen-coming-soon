import type { Metadata } from "next";
import Link from "next/link";
import legal from "@/styles/legal.module.css";
import styles from "./page.module.css";

// Faza 1 migracji — treść skopiowana 1:1 z regulamin/index.html (stan 14.09).
export const metadata: Metadata = {
  title: "Regulamin — webgen.pl",
  alternates: {
    canonical: "https://www.webgen.pl/regulamin/",
  },
};

export default function RegulaminPage() {
  return (
    <div className={legal.container}>
      <header className={legal.header}>
        <div className={legal.eyebrow}>{"// webgen.pl"}</div>
        <h1>Regulamin Świadczenia Usług</h1>
        <p className={legal.subtitle}>Warunki korzystania z usług webgen.pl drogą elektroniczną</p>
        <p className={legal.meta}>
          Wersja: 1.1 · Data wejścia w życie: 21 marca 2026 r. · Ostatnia aktualizacja: 8 września
          2026 r.
        </p>
      </header>

      <h2 className={styles.h2}>§ 1. Definicje</h2>
      <ul>
        <li>
          <strong>Regulamin</strong> — niniejszy dokument, sporządzony zgodnie z art. 8 ustawy o
          świadczeniu usług drogą elektroniczną
        </li>
        <li>
          <strong>Operator / Webgen.pl</strong> — Webgen Artur Sapożnikow, jednoosobowa
          działalność gospodarcza wpisana do CEIDG, NIP: 9521854979, REGON: 545358544, adres
          siedziby: ul. Urocza 8/7, 04-651 Warszawa, właściciel serwisu webgen.pl, kontakt:{" "}
          <a href="mailto:hello@webgen.pl">hello@webgen.pl</a>
        </li>
        <li>
          <strong>Użytkownik</strong> — osoba fizyczna, prawna lub jednostka organizacyjna
          korzystająca z Usług po rejestracji konta
        </li>
        <li>
          <strong>Konsument</strong> — osoba fizyczna zawierająca umowę niezwiązaną bezpośrednio z
          działalnością zawodową (art. 22¹ k.c.)
        </li>
        <li>
          <strong>Serwis</strong> — platforma dostępna pod adresem webgen.pl z biblioteką gotowych
          szablonów stron (Galeria Startowa) dla firm usługowych
        </li>
        <li>
          <strong>Plan</strong> — wybrany pakiet usług (Start, Pro lub Pro Max)
        </li>
        <li>
          <strong>Cennik</strong> — zestawienie planów i opłat dostępne na{" "}
          <Link href="/cennik">webgen.pl/cennik</Link>
        </li>
        <li>
          <strong>Treść generowana przez AI</strong> — w planach Pro i Pro Max: treść, zdjęcia i
          kolory wybranego szablonu dopasowane przez model językowy na podstawie danych
          Użytkownika; w planie Start szablon wypełniany jest danymi Użytkownika bez udziału AI
        </li>
      </ul>

      <h2 className={styles.h2}>§ 2. Postanowienia ogólne</h2>
      <ol>
        <li>Regulamin określa zasady świadczenia usług drogą elektroniczną przez Webgen.pl.</li>
        <li>
          Regulamin dostępny jest nieodpłatnie pod adresem <Link href="/regulamin">/regulamin</Link>{" "}
          w formie umożliwiającej pobranie i wydrukowanie.
        </li>
        <li>
          Korzystanie z Usług wymaga akceptacji Regulaminu i{" "}
          <Link href="/polityka-prywatnosci">Polityki Prywatności</Link>.
        </li>
        <li>
          W sprawach nieuregulowanych stosuje się prawo polskie — w szczególności Kodeks cywilny,
          ustawę o świadczeniu usług drogą elektroniczną i ustawę o prawach konsumenta.
        </li>
        <li>
          Operator zastrzega prawo do zmiany Regulaminu z 14-dniowym wyprzedzeniem (powiadomienie
          e-mail).
        </li>
      </ol>

      <h2 className={styles.h2}>§ 3. Wymagania techniczne</h2>
      <p>
        Urządzenie z dostępem do Internetu, aktualna przeglądarka (Chrome, Firefox, Safari, Edge),
        aktywny adres e-mail, włączone pliki cookie i JavaScript.
      </p>

      <h2 className={styles.h2}>§ 4. Rejestracja i zawarcie umowy</h2>
      <ol>
        <li>Umowa zawierana jest w momencie pomyślnej rejestracji konta i akceptacji Regulaminu.</li>
        <li>Użytkownik zobowiązuje się do podania prawdziwych danych i ich aktualizacji.</li>
        <li>Konto jest osobiste — niedozwolone jest udostępnianie danych logowania osobom trzecim.</li>
        <li>
          Operator może odmówić rejestracji lub zawiesić konto w przypadku naruszenia Regulaminu.
        </li>
      </ol>

      <h2 className={styles.h2}>§ 5. Plany subskrypcyjne i cennik</h2>
      <div className={styles.highlight}>
        Aktualne ceny dostępne na <Link href="/cennik">webgen.pl/cennik</Link>.
        <br />
        Plan Start jest bezpłatny przez pierwsze 6 miesięcy — bez karty płatniczej. Po tym okresie
        przechodzi automatycznie na 149 zł/mies.
      </div>
      <div className={legal.tableWrap}>
        <table>
          <thead>
            <tr>
              <th>Plan</th>
              <th>Cena</th>
              <th>Opis</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Start</td>
              <td>0 zł przez 6 mies., potem 149 zł/mies.</td>
              <td>
                Galeria Startowa szablonów, wybór i aktywacja szablonu darmowego, hosting na
                subdomenie webgen.pl
              </td>
            </tr>
            <tr>
              <td>Pro</td>
              <td>299 zł/mies.</td>
              <td>
                Szablony Pro, pełna personalizacja AI (treść, zdjęcia, kolory), lokalne SEO,
                formularz kontaktowy/rezerwacje
              </td>
            </tr>
            <tr>
              <td>Pro Max</td>
              <td>499 zł/mies.</td>
              <td>
                Wszystko z Pro, rozszerzona personalizacja AI, priorytetowa obsługa zmian
                (odpowiedź w 30 min), dedykowany czat
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p>
        Plany Pro i Pro Max są dostępne w rozliczeniu miesięcznym lub rocznym — rozliczenie roczne
        odpowiada 10 opłatom miesięcznym rozłożonym na 12 miesięcy (ok. -17% względem stawki
        miesięcznej). Wyboru okresu rozliczeniowego dokonuje się w procesie zakupu w Generatorze.
      </p>
      <p>
        Do planu Pro dostępne są dodatki à la carte: własna domena, integracja social media,
        statystyki odwiedzin, dodatkowe podstrony, sesja zdjęciowa AI, Google Business Profile,
        priorytetowe wsparcie — aktualne ceny na <Link href="/cennik">webgen.pl/cennik</Link>.
      </p>
      <p>Wszystkie ceny zawierają podatek VAT. Na wniosek Użytkownika wystawiamy fakturę VAT.</p>

      <h2 className={styles.h2}>§ 6. Płatności, faktury i zwroty</h2>
      <ol>
        <li>
          Płatności realizowane są za pośrednictwem operatora płatności{" "}
          <strong>Stripe, Inc.</strong> Akceptowane metody: karta (Visa, Mastercard, Amex), BLIK,
          przelew.
        </li>
        <li>Opłata naliczana jest z góry za każdy okres rozliczeniowy (miesiąc lub rok).</li>
        <li>W przypadku braku płatności przez 14 dni Operator może zawiesić konto.</li>
        <li>
          <strong>Konsumenci</strong> mają prawo odstąpić od umowy w ciągu <strong>14 dni</strong>{" "}
          od jej zawarcia, wysyłając oświadczenie na{" "}
          <a href="mailto:hello@webgen.pl">hello@webgen.pl</a>.
        </li>
        <li>
          Przy niedostępności Usług powyżej 72h z przyczyn leżących po stronie Operatora
          przysługuje proporcjonalne zmniejszenie opłaty.
        </li>
      </ol>

      <h2 className={styles.h2}>§ 7. Prawa i obowiązki Użytkownika</h2>
      <p>
        Użytkownik ma prawo do korzystania z Usług zgodnie z wybranym Planem, eksportu kodu HTML
        strony oraz uzyskania wsparcia technicznego.
      </p>
      <h3>Zabrania się:</h3>
      <ul>
        <li>
          Publikowania treści bezprawnych, naruszających prawa osób trzecich lub propagujących
          przemoc
        </li>
        <li>
          Prób nieautoryzowanego dostępu do systemów, ataków DDoS, wstrzykiwania złośliwego kodu
        </li>
        <li>Rozsyłania spamu za pośrednictwem stron webgen.pl</li>
        <li>Odsprzedawania lub sublicencjonowania konta bez pisemnej zgody Operatora</li>
        <li>Dekompilacji lub wstecznej inżynierii oprogramowania Serwisu</li>
      </ul>

      <h2 className={styles.h2}>§ 8. Anulowanie subskrypcji</h2>
      <ol>
        <li>Umowa zawierana jest na czas nieokreślony z możliwością rozwiązania przez każdą ze stron.</li>
        <li>
          Anulowanie możliwe w panelu klienta lub na{" "}
          <a href="mailto:hello@webgen.pl">hello@webgen.pl</a>. Skuteczne z końcem bieżącego
          okresu rozliczeniowego.
        </li>
        <li>Po anulowaniu Użytkownik ma 30 dni na eksport danych (HTML, zdjęcia).</li>
        <li>
          Operator może rozwiązać umowę natychmiastowo przy: naruszeniu Regulaminu, braku
          płatności powyżej 30 dni lub nakazu organu publicznego.
        </li>
      </ol>

      <h2 className={styles.h2}>§ 9. Własność intelektualna</h2>
      <ol>
        <li>Prawa do Serwisu (kod, design, znaki towarowe) należą do Operatora.</li>
        <li>
          Treści wygenerowane przez AI na podstawie danych Użytkownika — Użytkownik udziela
          Operatorowi nieodpłatnej licencji na hosting wyłącznie w celu świadczenia Usług.
        </li>
        <li>
          Użytkownik odpowiada za to, że materiały (logo, zdjęcia) nie naruszają praw osób
          trzecich.
        </li>
      </ol>

      <h2 className={styles.h2}>§ 10. Odpowiedzialność i dostępność Serwisu</h2>
      <p>
        Operator dokłada starań, aby Serwis działał nieprzerwanie, jednak nie gwarantuje
        konkretnego poziomu dostępności (SLA) — infrastruktura hostingowa jest utrzymywana w
        modelu best-effort, bez kontraktowej gwarancji uptime ze strony dostawcy usług
        hostingowych. Operator nie odpowiada za:
      </p>
      <ul>
        <li>Błędy w treściach generowanych przez AI — Użytkownik weryfikuje przed publikacją</li>
        <li>Efekty SEO (zależne od wielu zewnętrznych czynników)</li>
        <li>Przerwy wynikające z działań Użytkownika lub siły wyższej</li>
      </ul>
      <p>
        Całkowita odpowiedzialność Operatora wobec Użytkowników niebędących Konsumentami
        ograniczona jest do sumy opłat uiszczonych w ciągu 3 miesięcy poprzedzających zdarzenie.
      </p>

      <h2 className={styles.h2}>§ 11. Reklamacje</h2>
      <ol>
        <li>
          Reklamacje kieruj na <a href="mailto:hello@webgen.pl">hello@webgen.pl</a> z opisem
          problemu i oczekiwanym rozwiązaniem.
        </li>
        <li>
          Odpowiedź w ciągu <strong>14 dni</strong> (30 dni dla spraw złożonych).
        </li>
        <li>
          Konsumenci mogą korzystać z platformy ODR:{" "}
          <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer">
            ec.europa.eu/consumers/odr
          </a>
        </li>
      </ol>

      <h2 className={styles.h2}>§ 12. Postanowienia końcowe</h2>
      <ol>
        <li>Regulamin podlega prawu polskiemu.</li>
        <li>
          Spory rozstrzygane przez sądy powszechne właściwe dla siedziby Operatora (z
          zastrzeżeniem uprawnień Konsumentów).
        </li>
        <li>Jeśli jakiekolwiek postanowienie zostanie uznane za nieważne, pozostałe zachowują moc.</li>
        <li>Regulamin wchodzi w życie 21 marca 2026 r.</li>
      </ol>

      <div className={legal.warning}>
        Dokument sporządzony zgodnie z: ustawą z dnia 18 lipca 2002 r. o świadczeniu usług drogą
        elektroniczną, ustawą z dnia 30 maja 2014 r. o prawach konsumenta, Kodeksem cywilnym i
        RODO. Dokument ma charakter informacyjny — zalecana weryfikacja przez radcę prawnego.
      </div>

      <footer className={legal.footer}>
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
