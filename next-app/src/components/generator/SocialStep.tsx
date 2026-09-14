"use client";

import { useGenerator } from "./GeneratorContext";
import styles from "./Generator.module.css";

// Port 1:1 z panel-3 w generator/index.html — wszystko opcjonalne, brak walidacji.
export default function SocialStep({ active }: { active: boolean }) {
  const { form, patchForm, patchGen } = useGenerator();

  return (
    <div className={`${styles["step-panel"]} ${active ? styles.active : ""}`}>
      <div className={styles["sp-header"]}>
        <div className={styles["sp-eyebrow"]}>{"// Krok 3 z 5"}</div>
        <h1 className={styles["sp-title"]}>
          Social media
          <br />i rezerwacje
        </h1>
        <p className={styles["sp-sub"]}>Wszystkie opcjonalne — wpisz te które masz.</p>
      </div>

      <div className={styles["form-grid"]}>
        <div className={`${styles["form-grid"]} ${styles.cols2}`}>
          <div className={styles.field}>
            <label>
              Facebook URL <span className={styles.opt}>opcjonalnie</span>
            </label>
            <input type="url" value={form.facebook} onChange={(e) => patchForm({ facebook: e.target.value })} placeholder="https://facebook.com/twojafirma" />
          </div>
          <div className={styles.field}>
            <label>
              Instagram URL <span className={styles.opt}>opcjonalnie</span>
            </label>
            <input type="url" value={form.instagram} onChange={(e) => patchForm({ instagram: e.target.value })} placeholder="https://instagram.com/twojafirma" />
          </div>
        </div>
        <div className={`${styles["form-grid"]} ${styles.cols2}`}>
          <div className={styles.field}>
            <label>
              TikTok URL <span className={styles.opt}>opcjonalnie</span>
            </label>
            <input type="url" value={form.tiktok} onChange={(e) => patchForm({ tiktok: e.target.value })} placeholder="https://tiktok.com/@twojafirma" />
          </div>
          <div className={styles.field}>
            <label>
              WhatsApp (numer) <span className={styles.opt}>opcjonalnie</span>
            </label>
            <input type="tel" value={form.whatsapp} onChange={(e) => patchForm({ whatsapp: e.target.value })} placeholder="np. 600100200 (bez +48)" />
            <div className={styles["field-hint"]}>Pojawi się jako floating button</div>
          </div>
        </div>
        <div className={`${styles["form-grid"]} ${styles.cols2}`}>
          <div className={styles.field}>
            <label>
              Booksy / Calendly URL <span className={styles.opt}>opcjonalnie</span>
            </label>
            <input type="url" value={form.booksy} onChange={(e) => patchForm({ booksy: e.target.value })} placeholder="https://booksy.com/..." />
          </div>
          <div className={styles.field}>
            <label>
              Google Maps URL <span className={styles.opt}>opcjonalnie</span>
            </label>
            <input type="url" value={form.maps} onChange={(e) => patchForm({ maps: e.target.value })} placeholder="https://maps.google.com/..." />
          </div>
        </div>
        <div className={`${styles["form-grid"]} ${styles.cols2}`}>
          <div className={styles.field}>
            <label>
              Google ocena <span className={styles.opt}>opcjonalnie</span>
            </label>
            <input
              type="number"
              min={1}
              max={5}
              step={0.1}
              value={form.googleOcena}
              onChange={(e) => patchForm({ googleOcena: e.target.value })}
              placeholder="np. 4.9"
            />
          </div>
          <div className={styles.field}>
            <label>
              Liczba opinii Google <span className={styles.opt}>opcjonalnie</span>
            </label>
            <input type="number" min={1} value={form.googleOpinie} onChange={(e) => patchForm({ googleOpinie: e.target.value })} placeholder="np. 87" />
          </div>
        </div>
      </div>

      <div className={styles["nav-btns"]}>
        <button className={styles["btn-prev"]} onClick={() => patchGen({ currentStep: 2 })}>
          ← Wróć
        </button>
        <button className={styles["btn-next"]} onClick={() => patchGen({ currentStep: 4 })}>
          Dalej →
        </button>
      </div>
    </div>
  );
}
