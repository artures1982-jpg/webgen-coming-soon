import Link from "next/link";
import styles from "./layout.module.css";

// Minimalny top-bar (samo logo) zamiast pełnego <Nav> — port 1:1 zamysłu z
// login/index.html i rejestracja/index.html: strony auth są celowo bez linków
// nawigacyjnych/hamburgera, żeby nie rozpraszać w trakcie logowania/rejestracji.
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <nav className={styles.topBar}>
        <Link href="/" className={styles.logo}>
          <div className={styles.logoMark}>W</div>
          <div className={styles.logoName}>
            web<span>gen</span>
          </div>
        </Link>
      </nav>
      <main className={styles.main}>{children}</main>
    </>
  );
}
