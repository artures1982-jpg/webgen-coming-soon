import type { Metadata } from "next";
import { SignUp } from "@clerk/nextjs";
import styles from "../../auth.module.css";

// Port 1:1 z rejestracja/index.html — <SignUp> Clerka zamiast Clerk.mountSignUp().
export const metadata: Metadata = {
  title: "Rejestracja — webgen.pl",
  robots: { index: false, follow: false },
  alternates: { canonical: "https://www.webgen.pl/rejestracja/" },
};

export default function RejestracjaPage() {
  return (
    <>
      <div className={styles.heading}>
        <div className={styles.eyebrow}>{"// Nowe konto"}</div>
        <h1>
          Załóż konto
          <br />w <span className={styles.gradText}>webgen</span>
        </h1>
        <p>Bezpłatnie, w minutę. Wygenerujesz stronę zaraz po rejestracji.</p>
      </div>

      <div className={styles.clerkSlot}>
        <SignUp
          path="/rejestracja"
          routing="path"
          signInUrl="/login"
          forceRedirectUrl="/generator"
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
