"use client";

import Link from "next/link";
import { useState } from "react";
import { Show, UserButton } from "@clerk/nextjs";
import styles from "./Nav.module.css";

// Jeden współdzielony komponent nawigacji zamiast identycznej wstawki ręcznie
// skopiowanej dziś w 5 plikach statycznej strony — patrz docs/plan-migracji-nextjs.md,
// sekcja 3, wiersz 7. Ten duplikat spowodował realnego buga (chip zalogowanego usera
// wypychający hamburger poza ekran, naprawiany 5x tą samą łatką, commit 9ffc84d).
//
// Faza 3: prawdziwy stan logowania przez <Show when="signed-in"|"signed-out">. UWAGA:
// <SignedIn>/<SignedOut> zostały USUNIĘTE w Clerk Core 3 (@clerk/nextjs@7) na rzecz
// <Show> — próba użycia starych komponentów rzuca błąd w runtime, nie tylko warning
// (złapane na `next build`, patrz node_modules/@clerk/nextjs/.../removedControlComponents.d.ts,
// który wprost ostrzega że wiedza modeli AI o tym API jest przestarzała). Lekcja z buga
// z hamburgerem zastosowana od razu: .wgNavUser (chip w górnym pasku) jest ukryty na
// mobile w Nav.module.css — tożsamość na telefonie żyje wyłącznie w drawerze.
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
            <Show when="signed-out">
              <Link href="/login" className={styles.wgNavLogin}>
                Logowanie
              </Link>
              <Link href="/generator" className={styles.wgNavCta}>
                Zacznij za darmo →
              </Link>
            </Show>
            <Show when="signed-in">
              <div className={styles.wgNavUser}>
                <UserButton />
              </div>
            </Show>
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
        <Show when="signed-out">
          <Link href="/login" className={styles.wgNavLogin} onClick={() => setOpen(false)}>
            Logowanie
          </Link>
          <Link href="/generator" className={styles.wgNavDrawerCta} onClick={() => setOpen(false)}>
            Zacznij za darmo →
          </Link>
        </Show>
        <Show when="signed-in">
          <div className={styles.wgDrawerUser}>
            <UserButton />
            <Link href="/dashboard" onClick={() => setOpen(false)}>
              Panel klienta
            </Link>
          </div>
        </Show>
      </div>
    </>
  );
}
