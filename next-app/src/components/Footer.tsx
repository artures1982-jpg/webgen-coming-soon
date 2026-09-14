import Link from "next/link";
import styles from "./Footer.module.css";

// Wspólna stopka stron marketingowych — patrz komentarz w Footer.module.css.
export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.fCopy}>© 2026 Webgen · NIP 9521854979 · REGON 545358544</div>
      <div className={styles.fLinks}>
        <Link href="/">Strona główna</Link>
        <a href="mailto:hello@webgen.pl">Kontakt</a>
      </div>
    </footer>
  );
}
