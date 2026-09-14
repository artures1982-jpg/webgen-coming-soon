"use client";

import { toWebP } from "@/lib/image-convert";
import { useGenerator } from "./GeneratorContext";
import styles from "./Generator.module.css";

// Port 1:1 z #hero-section (widoczna tylko Pro/Pro Max) w generator/index.html —
// handleHeroUpload() (plik z dysku → heroBase64) i selectPexelsPhoto('hero') →
// heroUrl. Oba zbiegają się w tym samym podglądzie "wypełnione".
export default function HeroUpload() {
  const { form, patchForm, openPexels } = useGenerator();
  const preview = form.heroBase64 || form.heroUrl;

  async function handleUpload(file: File | undefined) {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert("Zdjęcie hero za duże — maks. 5 MB");
      return;
    }
    const data = await toWebP(file);
    if (data) patchForm({ heroBase64: data, heroUrl: "" });
  }

  return (
    <div className={styles.field}>
      <label>
        Zdjęcie hero <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--green)", marginLeft: 6 }}>PRO</span>
      </label>
      <button type="button" onClick={() => openPexels("hero")} className={styles["btn-pexels"]}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 8h3l1.5-2h7L17 8h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z" />
          <circle cx="12" cy="13" r="3.5" />
        </svg>{" "}
        Wybierz zdjęcie hero z Pexels
      </button>
      <div className={`${styles["logo-upload-area"]} ${preview ? styles["has-file"] : ""}`} onClick={() => document.getElementById("f-hero")?.click()}>
        {!preview ? (
          <div>
            <div className={styles["lua-icon"]}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="16" rx="2" />
                <circle cx="8.5" cy="10" r="1.7" />
                <path d="M21 16l-5.5-5.5L9 17" />
              </svg>
            </div>
            <div className={styles["lua-text"]}>Lub kliknij żeby wgrać własne zdjęcie</div>
            <div className={styles["lua-hint"]}>PNG lub JPG · maks. 5 MB · 16:9</div>
          </div>
        ) : (
          <div style={{ display: "flex" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview} alt="Hero" className={styles["lua-preview"]} style={{ maxHeight: 80, maxWidth: 220 }} />
            <div className={styles["lua-hint"]} style={{ color: "var(--green)" }}>
              ✓ Zdjęcie hero wczytane
            </div>
          </div>
        )}
        <input
          type="file"
          id="f-hero"
          accept="image/png,image/jpeg,image/webp"
          onChange={(e) => handleUpload(e.target.files?.[0])}
          style={{ display: "none" }}
        />
      </div>
    </div>
  );
}
