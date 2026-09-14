"use client";

import styles from "./Generator.module.css";

// Port 1:1 z #gen-fullscreen w generator/index.html. Kropki postępu (#gsdot-0/1/2)
// z oryginału pominięte — CSS miał stany .active/.done, ale żaden JS nigdy ich nie
// zmieniał po initial render (potwierdzone martwe, czysto dekoracyjne i statyczne).
export default function GeneratingOverlay({ elapsedSec, progress, message, subMessage }: { elapsedSec: number; progress: number; message: string; subMessage: string }) {
  const mm = Math.floor(elapsedSec / 60);
  const ss = elapsedSec % 60;
  const timeStr = mm + ":" + (ss < 10 ? "0" : "") + ss;

  return (
    <div className={styles["gen-fullscreen"]}>
      <div className={styles["gen-timer"]}>{timeStr}</div>
      <div className={styles["gen-timer-label"]}>czas tworzenia Twojej strony</div>
      <div className={styles["gen-progress-bar"]}>
        <div className={styles["gen-progress-fill"]} style={{ width: progress + "%", transition: progress === 100 ? "width .3s" : undefined }}></div>
      </div>
      <div className={styles["gen-live-msg"]}>{message}</div>
      <div className={styles["gen-live-sub"]}>{subMessage}</div>
      <div className={styles["gen-stay"]}>
        Nie odświeżaj strony — <strong>AI tworzy Twoją stronę</strong>
      </div>
    </div>
  );
}
