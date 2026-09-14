"use client";

import { useMemo, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, lastAssistantMessageIsCompleteWithToolCalls } from "ai";
import { useAuth } from "@clerk/nextjs";
import { useGenerator } from "./GeneratorContext";
import PaletteSection from "./PaletteSection";
import LogoUpload from "./LogoUpload";
import HeroUpload from "./HeroUpload";
import type { FormData as GeneratorFormData } from "@/lib/generator-helpers";
import styles from "./Generator.module.css";

// Zastępuje kroki 1+2 (szablon/lokalizacja + dane firmy) dla Pro/Pro Max rozmową z
// asystentem AI zamiast ręcznym formularzem — patrz plan "Wirtualny asystent
// konfiguracyjny". Model (server route /api/assistant-chat) wywołuje narzędzia BEZ
// execute(), więc stają się tool-ami KLIENCKIMI obsługiwanymi tu w onToolCall —
// zero stanu formularza po stronie serwera, wszystko ląduje wprost w GeneratorContext
// przez patchForm/patchGen, tym samym potokiem co dzisiejszy ręczny formularz.
type UpdateFirmaDataInput = Partial<
  Pick<
    GeneratorFormData,
    "nazwaStrony" | "miasto" | "dzielnica" | "telefon" | "email" | "adres" | "godzPonPt" | "godzSob" | "lata" | "realizacje" | "uslugi" | "opis"
  >
>;

const REQUIRED_FIELDS: { key: keyof GeneratorFormData; label: string }[] = [
  { key: "nazwaStrony", label: "Nazwa strony" },
  { key: "telefon", label: "Telefon" },
  { key: "email", label: "Email" },
  { key: "miasto", label: "Miasto" },
];

export default function AssistantStep() {
  const { form, patchForm, patchGen } = useGenerator();
  const { getToken } = useAuth();
  const [input, setInput] = useState("");

  // Śledzi na bieżąco (synchronicznie, bez opóźnienia re-renderu Reacta) co
  // faktycznie zapisano przez updateFirmaData — potrzebne bo markReady i
  // updateFirmaData mogą przyjść w TEJ SAMEJ odpowiedzi modelu, zanim `form` z
  // kontekstu zdąży się zaktualizować. Bez tego markReady widziałoby stare dane.
  const collectedRef = useRef<Partial<GeneratorFormData>>({});

  // Bez useMemo tu `new DefaultChatTransport(...)` powstaje od nowa przy KAŻDYM
  // renderze — złapane empirycznie jako nieskończona pętla re-renderów (setState w
  // useChat reagujące na "nowy" transport co render, który wywołuje kolejny render).
  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/assistant-chat",
        fetch: async (url, options) => {
          const token = await getToken();
          const headers = new Headers(options?.headers);
          if (token) headers.set("Authorization", "Bearer " + token);
          return fetch(url, { ...options, headers });
        },
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const { messages, sendMessage, status, error, addToolOutput } = useChat({
    transport,
    sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithToolCalls,
    onToolCall: async ({ toolCall }) => {
      if (toolCall.dynamic) return;
      if (toolCall.toolName === "updateFirmaData") {
        const input = toolCall.input as UpdateFirmaDataInput;
        collectedRef.current = { ...collectedRef.current, ...input };
        patchForm(input);
        addToolOutput({ tool: "updateFirmaData", toolCallId: toolCall.toolCallId, output: "zapisano" });
      } else if (toolCall.toolName === "markReady") {
        // Nie ufamy wyłącznie modelowi, że faktycznie wywołał updateFirmaData ze
        // wszystkimi wymaganymi polami przed markReady — złapane empirycznie: model
        // czasem "opisuje" dane tekstem zamiast wywołać narzędzie. Sprawdzamy naprawdę
        // zapisany stan (ref + aktualny form) zanim pozwolimy przejść dalej.
        const missing = REQUIRED_FIELDS.filter((f) => !(collectedRef.current[f.key] || form[f.key]));
        if (missing.length > 0) {
          addToolOutput({
            tool: "markReady",
            toolCallId: toolCall.toolCallId,
            output: "Brakuje jeszcze: " + missing.map((f) => f.label).join(", ") + ". Zapytaj klienta o te dane i wywołaj updateFirmaData, zanim spróbujesz zakończyć ponownie.",
          });
          return;
        }
        patchGen({ currentStep: 3 });
        addToolOutput({ tool: "markReady", toolCallId: toolCall.toolCallId, output: "ok" });
      }
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;
    sendMessage({ text: input });
    setInput("");
  }

  return (
    <div className={`${styles["step-panel"]} ${styles.active}`}>
      <div className={styles["sp-header"]}>
        <div className={styles["sp-eyebrow"]}>{"// Asystent konfiguracyjny"}</div>
        <h1 className={styles["sp-title"]}>Porozmawiajmy o Twojej stronie</h1>
        <p className={styles["sp-sub"]}>Odpowiedz na kilka pytań — resztę uzupełnimy razem.</p>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 18 }}>
        {REQUIRED_FIELDS.map((f) => {
          const filled = !!form[f.key];
          return (
            <span
              key={f.key}
              style={{
                fontFamily: "var(--mono)",
                fontSize: 11,
                padding: "4px 10px",
                borderRadius: 20,
                border: "1px solid " + (filled ? "var(--green)" : "rgba(255,255,255,.16)"),
                color: filled ? "var(--green)" : "var(--muted)",
              }}
            >
              {filled ? "✓" : "○"} {f.label}
            </span>
          );
        })}
      </div>

      <div
        style={{
          background: "rgba(255,255,255,.03)",
          border: "1px solid rgba(255,255,255,.12)",
          borderRadius: 12,
          padding: 18,
          marginBottom: 18,
          minHeight: 240,
          maxHeight: 420,
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        {messages.length === 0 && (
          <div style={{ color: "var(--muted)", fontSize: 14 }}>
            Napisz np. &quot;Cześć, prowadzę firmę hydrauliczną w Krakowie&quot;, żeby zacząć.
          </div>
        )}
        {messages.map((message) => (
          <div
            key={message.id}
            style={{
              alignSelf: message.role === "user" ? "flex-end" : "flex-start",
              maxWidth: "80%",
              background: message.role === "user" ? "var(--green)" : "rgba(255,255,255,.06)",
              color: message.role === "user" ? "#05100d" : "var(--text)",
              borderRadius: 12,
              padding: "10px 14px",
              fontSize: 14,
              lineHeight: 1.5,
              whiteSpace: "pre-wrap",
            }}
          >
            {message.parts.map((part, i) => (part.type === "text" ? <span key={i}>{part.text}</span> : null))}
          </div>
        ))}
        {status === "submitted" && <div style={{ color: "var(--muted)", fontSize: 13 }}>Asystent pisze…</div>}
        {error && (
          <div style={{ color: "var(--danger, #FF6B6B)", fontSize: 13 }}>
            Coś poszło nie tak z asystentem. Możesz spróbować ponownie albo przejść na formularz ręczny.
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} style={{ display: "flex", gap: 10, marginBottom: 24 }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Napisz odpowiedź…"
          disabled={status !== "ready"}
          style={{ flex: 1 }}
        />
        <button type="submit" className={styles["btn-primary"]} disabled={status !== "ready" || !input.trim()}>
          Wyślij
        </button>
      </form>

      <PaletteSection />
      <LogoUpload />
      <HeroUpload />

      <button
        type="button"
        onClick={() => patchGen({ assistantOptOut: true })}
        style={{
          background: "none",
          border: "none",
          color: "var(--muted)",
          fontSize: 13,
          textDecoration: "underline",
          cursor: "pointer",
          marginTop: 20,
        }}
      >
        Wolę wypełnić formularz ręcznie
      </button>
    </div>
  );
}
