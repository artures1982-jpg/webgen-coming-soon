"use client";

import { useState } from "react";
import styles from "./AddonCheckout.module.css";

export type Addon = {
  id: string;
  icon: string;
  name: string;
  desc: string;
  price: string;
  priceLabel: string;
};

// Port UI 1:1 z cennik/index.html (buyAddon/goToAddonCheckout). Logika auth (Clerk) i
// wywołanie /api/create-checkout świadomie NIE są tu odtworzone — to zależy od Fazy 2
// (Route Handlers) i Fazy 3 (@clerk/nextjs), których jeszcze nie ma na tym branchu.
// Modal się otwiera i pokazuje UI identycznie jak dziś; realne wysłanie czeka na te fazy.
export default function AddonCheckout({ addons }: { addons: Addon[] }) {
  const [selected, setSelected] = useState<Addon | null>(null);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<string | null>(null);

  function openFor(addon: Addon) {
    setSelected(addon);
    setStatus(null);
  }

  function close() {
    setSelected(null);
  }

  function submit() {
    // TODO(Faza 2/3): fetch('/api/create-checkout', ...) z tokenem Clerk, jak w
    // oryginalnym goToAddonCheckout(). Wymaga portu API routes + @clerk/nextjs.
    setStatus("Płatności będą dostępne po migracji API (Faza 2) i auth (Faza 3).");
  }

  return (
    <>
      <div className={styles.grid}>
        {addons.map((addon) => (
          <div key={addon.id} className={styles.addon}>
            <div className={styles.left}>
              <div className={styles.icon}>{addon.icon}</div>
              <div>
                <div className={styles.name}>{addon.name}</div>
                <div className={styles.desc}>{addon.desc}</div>
              </div>
            </div>
            <div className={styles.right}>
              <div className={styles.price}>{addon.priceLabel}</div>
              <span className={styles.buy} onClick={() => openFor(addon)}>
                Kup →
              </span>
            </div>
          </div>
        ))}
      </div>

      {selected && (
        <div className={styles.overlay}>
          <div className={styles.modal}>
            <button className={styles.close} onClick={close} aria-label="Zamknij">
              ✕
            </button>
            <h3 className={styles.title}>Dokup dodatek</h3>
            <p className={styles.hint}>
              Dodatki działają w ramach planu Pro. Jeśli nie masz jeszcze aktywnego Pro, ten
              checkout doda go razem z dodatkiem.
            </p>
            <div className={styles.summary}>
              <span className={styles.summaryName}>{selected.name}</span>
              <span className={styles.summaryPrice}>{selected.priceLabel}</span>
            </div>
            <input
              type="email"
              placeholder="twoj@email.pl"
              className={styles.input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button className={styles.submit} onClick={submit}>
              Przejdź do płatności →
            </button>
            {status && <p className={styles.status}>{status}</p>}
          </div>
        </div>
      )}
    </>
  );
}
