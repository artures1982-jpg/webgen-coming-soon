"use client";

import Link from "next/link";
import { useState } from "react";
import styles from "./Nav.module.css";

// Jeden współdzielony komponent nawigacji zamiast identycznej wstawki ręcznie
// skopiowanej dziś w 5 plikach statycznej strony (index.html, cennik/, regulamin/,
// polityka-prywatnosci/, generator/) — patrz docs/plan-migracji-nextjs.md, sekcja 3,
// wiersz 7. Dokładnie ten duplikat spowodował dziś realnego buga (chip zalogowanego
// usera wypychający hamburger poza ekran, naprawiany 5x tą samą łatką).
//
// Stan zalogowania (chip avatar+email, wpis w drawerze) świadomie NIE jest tu jeszcze
// odtworzony — to należy do Fazy 3 (auth @clerk/nextjs), nie do tego dowodu koncepcji.
const LINKS = [
  { href: "/#jak-dziala", label: "Jak działa" },
  { href: "/galeria", label: "Galeria" },
  { href: "/cennik", label: "Cennik" },
  { href: "/generator", label: "Generator" },
  { href: "/#faq", label: "FAQ" },
];

export default function Nav() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <nav className={styles.wgNav}>
        <div className={styles.wgNavInner}>
          <Link href="/" className={styles.wgNavLogo}>
            <div className={styles.wgNavLogoMark}>W</div>
            <div className={styles.wgNavLogoName}>
              web<span>gen</span>
            </div>
          </Link>
          <ul className={styles.wgNavLinks}>
            {LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href}>{l.label}</Link>
              </li>
            ))}
          </ul>
          <div className={styles.wgNavRight}>
            <Link href="/login" className={styles.wgNavLogin}>
              Logowanie
            </Link>
            <Link href="/generator" className={styles.wgNavCta}>
              Zacznij za darmo →
            </Link>
            <button
              className={styles.wgNavHamburger}
              aria-label="Menu"
              onClick={() => setOpen((v) => !v)}
            >
              {open ? "✕" : "☰"}
            </button>
          </div>
        </div>
      </nav>

      <div className={`${styles.wgNavDrawer} ${open ? styles.open : ""}`}>
        {LINKS.map((l) => (
          <Link key={l.href} href={l.href} onClick={() => setOpen(false)}>
            {l.label}
          </Link>
        ))}
        <Link href="/login" className={styles.wgNavLogin} onClick={() => setOpen(false)}>
          Logowanie
        </Link>
        <Link href="/generator" className={styles.wgNavDrawerCta} onClick={() => setOpen(false)}>
          Zacznij za darmo →
        </Link>
      </div>
    </>
  );
}
