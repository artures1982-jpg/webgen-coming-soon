import type { Metadata } from "next";
import Link from "next/link";
import HeroVisual from "@/components/HeroVisual";
import WaitlistForm from "@/components/WaitlistForm";
import Reveal from "@/components/Reveal";
import Footer from "@/components/Footer";
import Faq from "@/components/Faq";
import styles from "./page.module.css";

// Treść skopiowana 1:1 z index.html (legacy, stan po e72227c/eac259e — "/start/
// staje się stroną główną"), bez własnego <nav> (zastąpionego wspólnym <Nav/> z
// (marketing)/layout.tsx) i bez własnej stopki (zastąpionej wspólnym <Footer/>).
export const metadata: Metadata = {
  title: "Webgen — gotowe strony dla hydraulika, elektryka i fryzjera",
  description:
    "Gotowe strony dla hydraulika, elektryka, fryzjera, stomatologa i 8 innych branż — 53 warianty szablonów. Aktywuj za darmo, pełna personalizacja AI w planie Pro.",
  alternates: {
    canonical: "https://www.webgen.pl/",
  },
  openGraph: {
    type: "website",
    url: "https://www.webgen.pl/",
    siteName: "Webgen",
    title: "Webgen — gotowe strony dla hydraulika, elektryka i fryzjera",
    description:
      "Webgen to 53 gotowe warianty szablonów stron dla hydraulika, elektryka, fryzjera, stomatologa i innych usługowych branż. Aktywuj za darmo, a personalizację AI odblokujesz w planie Pro.",
    images: ["https://www.webgen.pl/og-image.png"],
    locale: "pl_PL",
  },
  twitter: {
    card: "summary_large_image",
    title: "Webgen — gotowe strony dla hydraulika, elektryka i fryzjera",
    description:
      "53 gotowe warianty szablonów dla hydraulika, elektryka, fryzjera, stomatologa i 8 innych branż usługowych. Aktywuj za darmo — pełną personalizację AI odblokujesz w Pro.",
  },
};

const JSON_LD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://www.webgen.pl/#organization",
      name: "Webgen",
      url: "https://www.webgen.pl/",
      logo: "https://www.webgen.pl/og-image.png",
    },
    {
      "@type": "WebSite",
      "@id": "https://www.webgen.pl/#website",
      url: "https://www.webgen.pl/",
      name: "Webgen",
      description:
        "Biblioteka gotowych szablonów stron dla hydraulika, elektryka, fryzjera, stomatologa i innych polskich firm usługowych — 12 branż, 53 warianty",
      publisher: { "@id": "https://www.webgen.pl/#organization" },
      inLanguage: "pl-PL",
    },
  ],
};

const MARQUEE_ITEMS = [
  "Hydraulicy",
  "Elektrycy",
  "Remonty",
  "Fryzjerzy i Barberzy",
  "Salony Fryzjerskie",
  "Studio Paznokci",
  "Medycyna Estetyczna",
  "Stomatolodzy",
  "Nieruchomości",
  "Import Aut z Ameryki",
  "Fotografia Ślubna",
  "Fotowoltaika",
];

const BENTO_CARDS = [
  {
    key: "b-a",
    className: styles.bA,
    href: "/galeria",
    title: "Galeria Startowa",
    desc: "Przeglądaj gotowe szablony dopasowane do Twojej branży i stylu. Wybierz i aktywuj w kilka minut, bez developera.",
    delay: 0.02,
  },
  {
    key: "b-b",
    className: styles.bB,
    title: "Lokalne SEO",
    desc: "Schema.org LocalBusiness i meta tagi pod polskie frazy.",
    delay: 0.08,
  },
  {
    key: "b-c",
    className: styles.bC,
    title: "Zoptymalizowana szybkość",
    desc: "Nie-blokujące fonty, priorytetowe ładowanie zdjęć na starcie.",
    delay: 0.14,
  },
  {
    key: "b-d",
    className: styles.bD,
    title: "12 branż, 53 warianty",
    desc: "Od hydraulików po stomatologów — każda branża ma kilka archetypów wizualnych do wyboru.",
    delay: 0.2,
  },
  {
    key: "b-e",
    className: styles.bE,
    title: "Personalizacja AI",
    desc: "Plany Pro i Pro Max dopasowują treść, zdjęcia i kolory wybranego szablonu do Twojej firmy — jednym kliknięciem.",
    delay: 0.26,
  },
  {
    key: "b-f",
    className: styles.bF,
    title: "Hosting w cenie",
    desc: "Publikacja jednym kliknięciem na subdomenie webgen.pl. SSL automatyczny, CDN globalny.",
    delay: 0.32,
  },
];

const STEPS = [
  {
    n: "01",
    title: "Wybierz szablon",
    desc: "Przeglądaj Galerię Startową i znajdź wariant dopasowany do Twojej branży i stylu — hydraulik, fryzjer, stomatolog i 9 innych kategorii.",
  },
  {
    n: "02",
    title: "Wpisz dane firmy",
    desc: "Nazwa, miasto, usługi, telefon — kilka pól w prostym formularzu. Żadnego kodu, żadnego developera.",
  },
  {
    n: "03",
    title: "Aktywuj stronę",
    desc: "Jedno kliknięcie i strona żyje na subdomenie *.webgen.pl. SSL i hosting w cenie, gotowe w kilka minut.",
  },
  {
    n: "04",
    title: "Rozwijaj się",
    desc: "Gdy będziesz gotowy na więcej — plan Pro dopasowuje treść, zdjęcia i kolory do Twojej firmy jednym kliknięciem AI.",
  },
];

const FAQ_ITEMS = [
  {
    q: "Czym właściwie jest Webgen?",
    a: "Biblioteką gotowych, zaprojektowanych stron dla polskich firm usługowych — hydraulików, elektryków, fryzjerów, stomatologów i innych. Wybierasz wariant dopasowany do branży, wpisujesz dane firmy i publikujesz — bez agencji i bez developera.",
  },
  {
    q: "Czy muszę umieć programować?",
    a: "Nie. Cały proces to formularz — nazwa firmy, miasto, usługi, dane kontaktowe. Szablon i publikacja dzieją się automatycznie.",
  },
  {
    q: "Ile to kosztuje na start?",
    a: "Nic. Plan Start jest darmowy przez pierwsze 6 miesięcy (potem 149 zł/mies.) i obejmuje pełną Galerię Startową oraz hosting na subdomenie *.webgen.pl.",
  },
  {
    q: "Jak długo trwa uruchomienie strony?",
    a: "Kilka minut — od wyboru szablonu do działającej strony pod własnym adresem *.webgen.pl.",
  },
  {
    q: "Co jeśli nie znajdę szablonu dla mojej branży?",
    a: "Napisz do nas (sekcja Kontakt niżej) — stale dodajemy nowe branże i warianty, a w niektórych przypadkach dobierzemy najbliższy pasujący szablon do dostosowania.",
  },
  {
    q: "Czy mogę zmienić szablon później?",
    a: "Tak, w dowolnym momencie możesz aktywować inny wariant z Galerii Startowej — Twoje dane firmy przenoszą się automatycznie.",
  },
];

export default function Home() {
  return (
    <div className={styles.page}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
      />

      <section className={styles.hero}>
        <div className={`${styles.wrap} ${styles.heroInner}`}>
          <div>
            <p className={styles.heroTag}>Start wkrótce</p>
            <h1 className={styles.heroTitle}>
              Strony dla hydraulika,
              <br />
              elektryka i fryzjera —<br />
              gotowe w <span className={styles.accent}>minutę</span>.
            </h1>
            <p className={styles.heroDesc}>
              Hydraulik, elektryk, fryzjer, stomatolog, studio paznokci czy fotograf ślubny —{" "}
              <strong>12 branż usługowych, 53 gotowe warianty</strong> szablonów. Wybierz szablon
              dopasowany do swojej firmy i aktywuj za darmo na start — a gdy będziesz gotowy na
              więcej, przejdź na Pro albo Pro Max z pełną personalizacją AI.
            </p>
            <WaitlistForm />
          </div>
          <HeroVisual />
        </div>
      </section>

      <section className={styles.marqueeSection} aria-hidden="true">
        <div className={styles.marqueeTrack}>
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
            <span key={i}>{item}</span>
          ))}
        </div>
      </section>

      <section id="jak-dziala" className={styles.stepsSection}>
        <div className={styles.wrap}>
          <p className={styles.secLabel}>{"// jak działa"}</p>
          <h2 className={styles.secHead}>Od wyboru szablonu do działającej strony — cztery kroki.</h2>
          <div className={styles.steps}>
            {STEPS.map((step, i) => (
              <Reveal key={step.n} delay={i * 0.06}>
                <div className={styles.step}>
                  <span className={styles.stepNum}>{step.n}</span>
                  <h3>{step.title}</h3>
                  <p>{step.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.bentoSection}>
        <div className={styles.wrap}>
          <p className={styles.secLabel}>{"// co dostajesz"}</p>
          <h2 className={styles.secHead}>
            Wszystko, czego firma usługowa potrzebuje od strony — bez agencji i bez trzech
            tygodni czekania.
          </h2>
          <div className={styles.bento}>
            {BENTO_CARDS.map((card) => (
              <Reveal key={card.key} delay={card.delay}>
                {card.href ? (
                  <Link href={card.href} className={`${styles.bcard} ${card.className}`}>
                    <h3>{card.title}</h3>
                    <p>{card.desc}</p>
                  </Link>
                ) : (
                  <div className={`${styles.bcard} ${card.className}`}>
                    <h3>{card.title}</h3>
                    <p>{card.desc}</p>
                  </div>
                )}
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.codeSection}>
        <div className={styles.wrap}>
          <p className={styles.secLabel}>{"// przykład generacji"}</p>
          <Reveal>
            <div className={styles.codeWrap}>
              <div className={styles.codeBar}>
                <div className={styles.codeLine} />
                <span className={styles.codeFile}>webgen — activate.js</span>
              </div>
              <div className={styles.codeBody}>
                <div>
                  <span className={styles.cc}>{"// Przykład: aktywacja szablonu dla firmy remontowej"}</span>
                </div>
                <div>&nbsp;</div>
                <div>
                  <span className={styles.ck}>const</span> strona ={" "}
                  <span className={styles.ck}>await</span> webgen.
                  <span className={styles.cfn}>activate</span>({"{"}
                </div>
                <div>
                  &nbsp;&nbsp;<span className={styles.cv}>szablon</span>:{" "}
                  <span className={styles.cs}>&quot;remonty-1-zaufany-fachowiec&quot;</span>,
                </div>
                <div>
                  &nbsp;&nbsp;<span className={styles.cv}>miasto</span>:{" "}
                  <span className={styles.cs}>&quot;Warszawa, Mokotów&quot;</span>,
                </div>
                <div>
                  &nbsp;&nbsp;<span className={styles.cv}>firma</span>:&nbsp;{" "}
                  <span className={styles.cs}>&quot;Just Perfect Remonty&quot;</span>,
                </div>
                <div>
                  &nbsp;&nbsp;<span className={styles.cv}>telefon</span>:{" "}
                  <span className={styles.cs}>&quot;+48 600 000 000&quot;</span>,
                </div>
                <div>
                  &nbsp;&nbsp;<span className={styles.cv}>plan</span>:{" "}
                  <span className={styles.cs}>&quot;start&quot;</span>
                </div>
                <div>{"});"}</div>
                <div>&nbsp;</div>
                <div>
                  <span className={styles.cc}>{"// → Szablon aktywowany w 8s"}</span>
                </div>
                <div>
                  <span className={styles.cc}>{"// → PageSpeed: 94/100"}</span>
                </div>
                <div>
                  <span className={styles.cc}>{"// → Schema.org LocalBusiness dodany"}</span>
                </div>
                <div>
                  <span className={styles.cc}>{"// → Dane firmy wypełnione automatycznie"}</span>
                </div>
                <div>&nbsp;</div>
                <div>
                  <span className={styles.ck}>console</span>.<span className={styles.cfn}>log</span>
                  {"(strona.url); "}
                  <span className={styles.cc}>{"// → justperfect.webgen.pl"}</span>
                  <span className={styles.tcur} />
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className={styles.pricing}>
        <div className={styles.wrap}>
          <p className={styles.secLabel}>{"// cennik"}</p>
          <div className={styles.priceGrid}>
            <Reveal delay={0.02}>
              <div className={`${styles.priceCard} ${styles.start}`}>
                <div className={styles.priceName}>Start</div>
                <div className={styles.priceValue}>0 zł</div>
                <div className={styles.priceNote}>przez pierwsze 6 miesięcy, potem 149 zł/mies.</div>
                <p className={styles.priceDesc}>
                  Uruchom stronę od razu. Płacisz dopiero gdy zacznie realnie pracować dla Twojej
                  firmy.
                </p>
                <div className={styles.priceList}>
                  <div>Pełna Galeria Startowa szablonów</div>
                  <div>Hosting na subdomenie *.webgen.pl</div>
                  <div>Aktywacja w kilka minut, bez karty</div>
                </div>
                <Link href="/generator" className={styles.priceCta}>
                  Zacznij za darmo →
                </Link>
              </div>
            </Reveal>

            <Reveal delay={0.1}>
              <div className={`${styles.priceCard} ${styles.pro}`}>
                <div className={styles.priceRibbon}>Najczęściej wybierany</div>
                <div className={styles.priceName}>Pro</div>
                <div className={styles.priceValue}>
                  299 <sub>zł/mies.</sub>
                </div>
                <div className={styles.priceNote}>rezygnacja w każdej chwili</div>
                <p className={styles.priceDesc}>
                  Personalizacja AI dopasowuje treść, zdjęcia i kolory szablonu do Twojej firmy.
                </p>
                <div className={styles.priceList}>
                  <div>Wszystko ze Start</div>
                  <div>Szablony Pro i personalizacja AI</div>
                  <div>Lokalne SEO i formularz kontaktowy</div>
                </div>
                <Link href="/cennik" className={styles.priceCta}>
                  Zobacz szczegóły →
                </Link>
              </div>
            </Reveal>

            <Reveal delay={0.18}>
              <div className={`${styles.priceCard} ${styles.max}`}>
                <div className={styles.priceName}>Pro Max</div>
                <div className={styles.priceValue}>
                  499 <sub>zł/mies.</sub>
                </div>
                <div className={styles.priceNote}>rezygnacja w każdej chwili</div>
                <p className={styles.priceDesc}>
                  Najszerszy pakiet — maksymalna personalizacja dla firm, które traktują stronę
                  poważnie.
                </p>
                <div className={styles.priceList}>
                  <div>Wszystko z Pro</div>
                  <div>Rozszerzona personalizacja AI</div>
                  <div>Priorytetowa obsługa zmian</div>
                </div>
                <Link href="/cennik" className={styles.priceCta}>
                  Zobacz szczegóły →
                </Link>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section id="faq" className={styles.faqSection}>
        <div className={styles.faqInner}>
          <p className={`${styles.secLabel} ${styles.secLabelCenter}`}>{"// faq"}</p>
          <h2 className={styles.faqTitle}>Często zadawane pytania</h2>
          <Faq items={FAQ_ITEMS} />
        </div>
      </section>

      <section id="kontakt" className={styles.kontaktSection}>
        <div className={styles.wrap}>
          <Reveal>
            <div className={styles.kontaktInner}>
              <p className={styles.secLabel}>{"// kontakt"}</p>
              <h2 className={styles.secHead}>Nie widzisz swojej branży? Masz pytanie?</h2>
              <p className={styles.kontaktDesc}>
                Napisz do nas — stale dodajemy nowe branże i warianty szablonów, a przy większych
                pytaniach odpowiadamy osobiście, nie botem.
              </p>
              <a href="mailto:hello@webgen.pl" className={styles.kontaktEmail}>
                hello@webgen.pl →
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      <section className={styles.flipCta}>
        <div className={styles.wrap}>
          <Reveal>
            <div className={styles.flipInner}>
              <p className={styles.secLabel}>{"// zacznij dziś"}</p>
              <h2 className={styles.flipTitle}>
                Szukasz strony dla hydraulika,
                <br />
                elektryka albo fryzjera? <span className={styles.accent}>Trafiłeś.</span>
              </h2>
              <p className={styles.flipDesc}>
                Zero kodu, zero agencji, zero czekania tygodniami. 12 branż, 53 gotowe warianty —
                wybierz szablon dla swojej firmy, wpisz dane i publikuj. Reszta dzieje się
                automatycznie.
              </p>
              <div className={styles.flipActions}>
                <Link href="/generator" className={`${styles.flipBtn} ${styles.solid}`}>
                  Zacznij za darmo →
                </Link>
                <Link href="/galeria" className={`${styles.flipBtn} ${styles.ghost}`}>
                  Zobacz galerię szablonów
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <Footer />
    </div>
  );
}
