"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { QUESTIONNAIRE_FIELDS } from "@/lib/dashboard-helpers";
import type { WgMessage } from "@/lib/dashboard-helpers";
import styles from "./Dashboard.module.css";

// Port 1:1 z renderMessages/submitQuestionnaire w dashboard/index.html.
function QuestionnaireForm({
  msg,
  idx,
  onSubmit,
}: {
  msg: Extract<WgMessage, { type: "questionnaire" }>;
  idx: number;
  onSubmit: (idx: number, answers: Record<string, string>) => void;
}) {
  const initial: Record<string, string> = {};
  QUESTIONNAIRE_FIELDS.forEach((f) => {
    initial[f.key] = (msg.answers && msg.answers[f.key]) || "";
  });
  const [values, setValues] = useState(initial);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed: Record<string, string> = {};
    Object.keys(values).forEach((k) => (trimmed[k] = values[k].trim()));
    onSubmit(idx, trimmed);
  }

  return (
    <form className={styles["q-form"]} onSubmit={handleSubmit}>
      {QUESTIONNAIRE_FIELDS.map((f) => (
        <div className={styles["q-field"]} key={f.key}>
          <label className={styles["q-label"]}>
            <span className={styles["q-icon"]}>{f.icon}</span>
            {f.label}
          </label>
          <input
            className={styles["q-input"]}
            type="text"
            placeholder={f.placeholder}
            value={values[f.key]}
            onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
          />
        </div>
      ))}
      <button className={styles["q-submit"]} type="submit">
        Wyślij uzupełnienie →
      </button>
    </form>
  );
}

function MessageCard({
  msg,
  idx,
  onSubmit,
}: {
  msg: WgMessage;
  idx: number;
  onSubmit: (idx: number, answers: Record<string, string>) => void;
}) {
  const dateStr = msg.date
    ? new Date(msg.date).toLocaleDateString("pl-PL", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })
    : "";
  const isUnread = !msg.read;

  if (msg.type === "questionnaire") {
    const firmaNazwa = msg.firma?.nazwa || "Twoja firma";
    const firmaBranza = msg.firma?.branza || "";
    const firmaCity = msg.firma?.miasto || "";
    return (
      <div className={`${styles["msg-card"]} ${isUnread ? styles.unread : ""}`}>
        <div className={styles["msg-date"]}>{dateStr}</div>
        <div className={styles["msg-type"]}>Uzupełnienie strony</div>
        <div className={styles["msg-title"]}>
          Uzupełnij dane dla <strong>{firmaNazwa}</strong>
        </div>
        <div className={styles["msg-sub"]}>
          Twoja strona {firmaBranza} w {firmaCity} jest gotowa. Podaj brakujące szczegóły.
        </div>
        {msg.answered ? (
          <div className={styles["msg-done"]}>✓ Odpowiedź wysłana — zaktualizujemy stronę w ciągu 24h</div>
        ) : (
          <QuestionnaireForm msg={msg} idx={idx} onSubmit={onSubmit} />
        )}
      </div>
    );
  }

  return (
    <div className={`${styles["msg-card"]} ${isUnread ? styles.unread : ""}`}>
      <div className={styles["msg-date"]}>{dateStr}</div>
      <div className={styles["msg-type"]}>Wiadomość od webgen</div>
      <div className={styles["msg-title"]}>{msg.title || "Wiadomość"}</div>
      <div className={styles["msg-sub"]}>{msg.body || ""}</div>
    </div>
  );
}

export default function MessagesPage({
  active,
  messages,
  unreadCount,
  onSubmitQuestionnaire,
}: {
  active: boolean;
  messages: WgMessage[];
  unreadCount: number;
  onSubmitQuestionnaire: (idx: number, answers: Record<string, string>) => void;
}) {
  return (
    <div className={`${styles.page} ${active ? styles.active : ""}`}>
      <div className={styles["section-header"]}>
        <h1>
          Wiadomości{" "}
          <span style={{ fontSize: 16, fontWeight: 500, color: "var(--muted)" }}>{unreadCount > 0 ? `(${unreadCount} nowych)` : ""}</span>
        </h1>
        <p>Pytania i uzupełnienia dotyczące Twojej strony</p>
      </div>
      <div className={styles["msg-list"]}>
        {messages.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--muted)" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>💬</div>
            <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>Brak wiadomości</div>
            <div style={{ fontSize: 13 }}>Gdy wygenerujesz stronę, pojawią się tu pytania o uzupełnienie.</div>
          </div>
        ) : (
          messages
            .slice()
            .reverse()
            .map((msg, revIdx) => {
              const realIdx = messages.length - 1 - revIdx;
              return <MessageCard msg={msg} idx={realIdx} onSubmit={onSubmitQuestionnaire} key={realIdx} />;
            })
        )}
      </div>
    </div>
  );
}
