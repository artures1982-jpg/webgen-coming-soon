"use client";

import { useState } from "react";
import styles from "./WaitlistForm.module.css";

// Port 1:1 z form-wrap w index.html (legacy) — walidacja e-maila po stronie klienta,
// bez realnego wysyłania nigdzie (ten sam "no-op" zachowanie co w oryginale, to tylko
// wizualne potwierdzenie zapisu na listę oczekujących).
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function WaitlistForm() {
  const [email, setEmail] = useState("");
  const [invalid, setInvalid] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit() {
    if (!EMAIL_RE.test(email.trim())) {
      setInvalid(true);
      setTimeout(() => setInvalid(false), 1500);
      return;
    }
    setSubmitted(true);
  }

  if (submitted) {
    return <p className={styles.formSuccess}>✓ Zapisano. Damy znać przy starcie.</p>;
  }

  return (
    <div>
      <div className={styles.formRow}>
        <input
          type="email"
          className={`${styles.formInput} ${invalid ? styles.invalid : ""}`}
          placeholder="twoj@email.pl"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSubmit();
          }}
        />
        <button type="button" className={styles.formBtn} onClick={handleSubmit}>
          Daj mi znać →
        </button>
      </div>
      <p className={styles.formNote}>
        Zero spamu. Albo{" "}
        <a href="/galeria">zobacz galerię szablonów już teraz →</a>
      </p>
    </div>
  );
}
