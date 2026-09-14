import type { Metadata } from "next";
import Link from "next/link";
import Reveal from "@/components/Reveal";
import Faq from "@/components/Faq";
import AddonCheckout, { type Addon } from "@/components/AddonCheckout";
import Footer from "@/components/Footer";
import styles from "./page.module.css";

// Faza 1 migracji — treść skopiowana 1:1 z cennik/index.html (stan 14.09). Checkout
// dodatków (AddonCheckout) ma UI kompletne, ale realne wysłanie do /api/create-checkout
// czeka na Fazę 2 (Route Handlers) i Fazę 3 (@clerk/nextjs) — patrz komentarz w tym
// komponencie.
export const metadata: Metadata = {
  title: "Cennik — Webgen | Start za darmo, Pro od 299 zł/mies.",
  description:
    "Webgen — cennik. Start za darmo przez pierwsze 6 miesięcy, Pro od 299 zł/mies. z domeną, SSL i statystykami w cenie. Zero dopłat za podstawy, bez umów długoterminowych.",
  alternates: {
    canonical: "https://www.webgen.pl/cennik/",
  },
  openGraph: {
    type: "website",
    url: "https://www.webgen.pl/cennik/",
    siteName: "Webgen",
    title: "Cennik Webgen — Start za darmo, Pro od 299 zł/mies.",
    description:
      "Start: darmowa Galeria Startowa przez 6 miesięcy. Pro (299 zł/mies.) i Pro Max (499 zł/mies.) dodają personalizację AI, domenę, SSL i statystyki w cenie oraz obsługę zmian mailowo.",
    images: ["https://www.webgen.pl/og-image.png"],
    locale: "pl_PL",
  },
  twitter: {
    card: "summary_large_image",
    title: "Cennik Webgen — Start za darmo, Pro od 299 zł/mies.",
    description:
      "Przeglądaj gotowe szablony za darmo przez 6 miesięcy, albo odblokuj personalizację AI, domenę i statystyki w cenie planu Pro lub Pro Max.",
  },
};

const ADDONS: Addon[] = [
  {
    id: "social_media",
    icon: "01",
    name: "Integracja Social Media",
    desc: "Live feed z Instagram/Facebook wpięty w Twoją stronę",
    price: "79",
    priceLabel: "79 zł/mies",
  },
  {
    id: "dodatkowe_podstrony",
    icon: "02",
    name: "Dodatkowe podstrony",
    desc: "3 osobne podstrony ofertowe (np. per usługa lub lokalizacja)",
    price: "149",
    priceLabel: "149 zł",
  },
  {
    id: "sesja_ai",
    icon: "03",
    name: "Sesja zdjęciowa AI",
    desc: "Zdjęcia AI dopasowane do branży i klimatu firmy",
    price: "99",
    priceLabel: "99 zł",
  },
  {
    id: "google_business",
    icon: "04",
    name: "Google Business Profile",
    desc: "Zdominuj lokalne Mapy Google i zbieraj opinie, które przyciągają klientów",
    price: "149",
    priceLabel: "149 zł/mies",
  },
  {
    id: "priorytetowe_wsparcie",
    icon: "05",
    name: "Priorytetowe wsparcie",
    desc: "Odpowiedź w 30 min, dedykowany czat, szybsze aktualizacje",
    price: "99",
    priceLabel: "99 zł/mies",
  },
];

const FAQ_ITEMS = [
  {
    q: "Czy jest umowa długoterminowa?",
    a: "Nie. Płacisz miesięcznie i możesz zrezygnować w każdej chwili. Przy rezygnacji możesz pobrać kod HTML swojej strony — zostaje Twój.",
  },
  {
    q: "Jak długo trwa uruchomienie strony?",
    a: "Wybierasz szablon z Galerii Startowej i aktywujesz go od razu — strona jest gotowa w kilka minut, nie godzin.",
  },
  {
    q: "Czy muszę mieć własną domenę?",
    a: "Nie. Strona domyślnie działa na subdomenie *.webgen.pl. W planach Pro i Pro Max własną domenę (np. .pl) rejestrujemy, podpinamy i konfigurujemy z SSL w cenie abonamentu — bez dodatkowej opłaty za podstawy.",
  },
  {
    q: "Jak zmienić treść strony po aktywacji?",
    a: 'W planie Pro wystarczy wysłać email — np. "zmień numer telefonu na...".',
  },
  {
    q: "Czy mogę płacić rocznie?",
    a: "Tak. Płatność roczna w planach Pro (2990 zł) i Pro Max (4990 zł) to koszt równy 10 miesiącom — 2 miesiące dostajesz gratis. Opcję rozliczenia wybierasz w generatorze przy aktywacji planu.",
  },
  {
    q: "Czy Webgen działa w całej Polsce, czy tylko w dużych miastach?",
    a: "Tak, działamy w całej Polsce, nie tylko w największych miastach. Szablony w Galerii Startowej sprawdzają się zarówno w Warszawie i Krakowie, jak i w mniejszych miejscowościach, a lokalne SEO strona dopasowuje automatycznie do nazwy Twojego miasta.",
  },
];

export default function CennikPage() {
  return (
    <div className={styles.page}>
      <div className={styles.pageGlow}>
        <div className={`${styles.meshBlob} ${styles.mb1}`} />
        <div className={`${styles.meshBlob} ${styles.mb2}`} />
      </div>

      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <p className={styles.heroEyebrow}>Cennik</p>
          <h1>
            Prosty cennik,
            <br />
            <span className={styles.gradText}>bez ukrytych kosztów.</span>
          </h1>
          <p className={styles.heroSub}>
            Przeglądaj i aktywuj szablon za darmo przez pierwsze 6 miesięcy, albo odblokuj
            personalizację AI z planem Pro lub Pro Max — z domeną, SSL i statystykami w cenie, bez
            dopłat za podstawy. Rezygnacja w każdej chwili, bez umów.
          </p>
        </div>
      </section>

      <section className={styles.pricingSection}>
        <div className={styles.pricingInner}>
          <div className={styles.plansGrid}>
            <Reveal>
              <div className={styles.plan}>
                <div className={styles.planHeader}>
                  <div className={styles.planName}>Start</div>
                  <div className={styles.planPrice}>
                    0 <sub>zł/mies.</sub>
                  </div>
                  <p className={styles.planDesc}>
                    Darmowo przez pierwsze 6 miesięcy, potem 149 zł/mies. Przeglądaj i aktywuj
                    szablon — bez karty, bez zobowiązań.
                  </p>
                </div>
                <div className={styles.planDivider} />
                <div className={styles.planFeatures}>
                  <div className={styles.pf}>
                    <span className={`${styles.pfCheck} ${styles.pfYes}`}>✓</span>Pełna Galeria
                    Startowa szablonów
                  </div>
                  <div className={styles.pf}>
                    <span className={`${styles.pfCheck} ${styles.pfYes}`}>✓</span>Wybór i
                    aktywacja szablonu darmowego
                  </div>
                  <div className={styles.pf}>
                    <span className={`${styles.pfCheck} ${styles.pfYes}`}>✓</span>Hosting na
                    subdomenie *.webgen.pl
                  </div>
                  <div className={styles.pf}>
                    <span className={`${styles.pfCheck} ${styles.pfYes}`}>✓</span>Lokalne SEO
                    wbudowane
                  </div>
                  <div className={styles.pf}>
                    <span className={`${styles.pfCheck} ${styles.pfYes}`}>✓</span>Formularz
                    kontaktowy
                  </div>
                  <div className={`${styles.pf} ${styles.pfDim}`}>
                    <span className={styles.pfCheck}>–</span>Szablony Pro
                  </div>
                  <div className={`${styles.pf} ${styles.pfDim}`}>
                    <span className={styles.pfCheck}>–</span>Personalizacja AI
                  </div>
                </div>
                <Link href="/generator" className={`${styles.planBtn} ${styles.planBtnOutline}`}>
                  Zacznij za darmo →
                </Link>
              </div>
            </Reveal>

            <Reveal delay={0.1}>
              <div className={`${styles.plan} ${styles.planFeatured}`}>
                <div className={styles.planTag}>Najczęściej wybierany</div>
                <div className={styles.planHeader}>
                  <div className={styles.planName}>Pro</div>
                  <div className={styles.planPrice}>
                    299 <sub>zł/mies.</sub>
                  </div>
                  <div className={styles.planPriceAlt}>
                    lub <strong>2990 zł/rok</strong> — 2 miesiące gratis
                  </div>
                  <p className={styles.planDesc}>
                    Wybierasz szablon Pro, a AI i nasz zespół zajmują się resztą — treścią,
                    zdjęciami, domeną i utrzymaniem.
                  </p>
                </div>
                <div className={styles.planDivider} />
                <div className={styles.planFeatures}>
                  <div className={styles.pf}>
                    <span className={`${styles.pfCheck} ${styles.pfYes}`}>✓</span>Wszystko ze
                    Start
                  </div>
                  <div className={styles.pf}>
                    <span className={`${styles.pfCheck} ${styles.pfYes}`}>✓</span>Dostęp do
                    szablonów Pro
                  </div>
                  <div className={styles.pf}>
                    <span className={`${styles.pfCheck} ${styles.pfYes}`}>✓</span>Pełna
                    personalizacja AI (treść, zdjęcia, kolory)
                  </div>
                  <div className={styles.pf}>
                    <span className={`${styles.pfCheck} ${styles.pfYes}`}>✓</span>Własna domena +
                    SSL w cenie — rejestrujemy i podpinamy za Ciebie
                  </div>
                  <div className={styles.pf}>
                    <span className={`${styles.pfCheck} ${styles.pfYes}`}>✓</span>Statystyki i
                    analityka w cenie, bez osobnego abonamentu
                  </div>
                  <div className={styles.pf}>
                    <span className={`${styles.pfCheck} ${styles.pfYes}`}>✓</span>Lokalne SEO
                    wbudowane
                  </div>
                  <div className={styles.pf}>
                    <span className={`${styles.pfCheck} ${styles.pfYes}`}>✓</span>Formularz
                    kontaktowy / rezerwacje
                  </div>
                  <div className={styles.pf}>
                    <span className={`${styles.pfCheck} ${styles.pfYes}`}>✓</span>Zmiana treści na
                    życzenie — wysyłasz maila, my wdrażamy
                  </div>
                </div>
                <Link
                  href="/galeria?plan=pro"
                  className={`${styles.planBtn} ${styles.planBtnPrimary}`}
                >
                  Pro 299 zł/mies. →
                </Link>
              </div>
            </Reveal>

            <Reveal delay={0.18}>
              <div className={`${styles.plan} ${styles.planMax}`}>
                <div className={styles.planHeader}>
                  <div className={styles.planName}>Pro Max</div>
                  <div className={styles.planPrice}>
                    499 <sub>zł/mies.</sub>
                  </div>
                  <div className={styles.planPriceAlt}>
                    lub <strong>4990 zł/rok</strong> — 2 miesiące gratis
                  </div>
                  <p className={styles.planDesc}>
                    Najszerszy pakiet — maksymalna personalizacja i priorytetowa opieka dla firm,
                    które traktują stronę poważnie.
                  </p>
                </div>
                <div className={styles.planDivider} />
                <div className={styles.planFeatures}>
                  <div className={styles.pf}>
                    <span className={`${styles.pfCheck} ${styles.pfYes}`}>✓</span>Wszystko z Pro
                  </div>
                  <div className={styles.pf}>
                    <span className={`${styles.pfCheck} ${styles.pfYes}`}>✓</span>Rozszerzona
                    personalizacja AI
                  </div>
                  <div className={styles.pf}>
                    <span className={`${styles.pfCheck} ${styles.pfYes}`}>✓</span>Priorytetowa
                    obsługa zmian — odpowiedź w 30 min, dedykowany czat
                  </div>
                </div>
                <Link
                  href="/galeria?plan=promax"
                  className={`${styles.planBtn} ${styles.planBtnPrimary}`}
                >
                  Pro Max 499 zł/mies. →
                </Link>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section className={styles.addonsSection}>
        <div className={styles.addonsInner}>
          <div className={styles.addonsTitle}>Dodatki, które realnie zwiększają sprzedaż</div>
          <p className={styles.addonsSub}>
            Podstawy — domena, SSL, statystyki — są już w cenie Pro. Dodatki poniżej to opcje,
            które pomagają zdobywać nowych klientów, nie kolejna dopłata za technikalia.
          </p>
          <AddonCheckout addons={ADDONS} />
        </div>
      </section>

      <div className={styles.faqSection}>
        <div className={styles.faqInner}>
          <h2 className={styles.faqTitle}>Często zadawane pytania</h2>
          <Faq items={FAQ_ITEMS} />
        </div>
      </div>

      <Footer />
    </div>
  );
}
