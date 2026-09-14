"use client";

import { toWebP } from "@/lib/image-convert";
import { useGenerator } from "./GeneratorContext";
import styles from "./Generator.module.css";

// Port 1:1 z #logo-upload-area / handleLogoUpload() w generator/index.html.
export default function LogoUpload() {
  const { form, patchForm } = useGenerator();

  async function handleUpload(file: File | undefined) {
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert("Logo za duże — maks. 2 MB");
      return;
    }
    const data = await toWebP(file);
    if (data) patchForm({ logoBase64: data });
  }

  return (
    <div className={styles.field}>
      <label>
        Logo firmy <span className={styles.opt}>opcjonalnie — PNG / JPG</span>
      </label>
      <div
        className={`${styles["logo-upload-area"]} ${form.logoBase64 ? styles["has-file"] : ""}`}
        onClick={() => document.getElementById("f-logo")?.click()}
      >
        {!form.logoBase64 ? (
          <div>
            <div className={styles["lua-icon"]}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="16" rx="2" />
                <circle cx="8.5" cy="10" r="1.7" />
                <path d="M21 16l-5.5-5.5L9 17" />
              </svg>
            </div>
            <div className={styles["lua-text"]}>Kliknij lub przeciągnij logo</div>
            <div className={styles["lua-hint"]}>PNG lub JPG · maks. 2 MB</div>
          </div>
        ) : (
          <div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={form.logoBase64} alt="Logo" className={styles["lua-preview"]} />
            <div className={styles["lua-hint"]} style={{ color: "var(--green)" }}>
              ✓ Logo wczytane — kliknij aby zmienić
            </div>
          </div>
        )}
        <input
          type="file"
          id="f-logo"
          accept="image/png,image/jpeg,image/webp"
          onChange={(e) => handleUpload(e.target.files?.[0])}
          style={{ display: "none" }}
        />
      </div>
    </div>
  );
}
