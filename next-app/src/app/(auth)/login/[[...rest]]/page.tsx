import type { Metadata } from "next";
import { SignIn } from "@clerk/nextjs";
import styles from "../../auth.module.css";

// Port 1:1 z login/index.html — <SignIn> Clerka zamiast Clerk.mountSignIn(), ta sama
// paleta w appearance.variables. Przekierowanie po zalogowaniu i dla już-zalogowanego
// usera obsługuje teraz clerkMiddleware/@clerk/nextjs, nie ręczny window.getClerk().
export const metadata: Metadata = {
  title: "Logowanie — webgen.pl",
  robots: { index: false, follow: false },
  alternates: { canonical: "https://www.webgen.pl/login/" },
};

export default function LoginPage() {
  return (
    <>
      <div className={styles.heading}>
        <div className={styles.eyebrow}>{"// Panel klienta"}</div>
        <h1>
          Zaloguj się
          <br />
          do <span className={styles.gradText}>webgen</span>
        </h1>
        <p>Wejdź do swojego panelu i zarządzaj stroną firmową.</p>
      </div>

      <div className={styles.clerkSlot}>
        <SignIn
          path="/login"
          routing="path"
          signUpUrl="/rejestracja"
          forceRedirectUrl="/dashboard"
          appearance={{
            variables: {
              colorPrimary: "#00E5A0",
              colorBackground: "#0F1420",
              colorForeground: "#F3F6FC",
              colorMutedForeground: "#8E97AC",
              colorInput: "#161B29",
              colorInputForeground: "#F3F6FC",
              colorNeutral: "#F3F6FC",
              fontFamily: "'Bricolage Grotesque', sans-serif",
              borderRadius: "10px",
            },
          }}
        />
      </div>
    </>
  );
}
