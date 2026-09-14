"use client";

import { useCallback, useState } from "react";
import type { WgMessage } from "@/lib/dashboard-helpers";

// Port 1:1 z getMessages/saveMessages/countUnread/renderMessages (część "oznacz jako
// przeczytane po 800ms") z dashboard/index.html. localStorage zostaje jedynym źródłem
// prawdy dla wiadomości (jak w oryginale) — brak backendu dla tej listy.
const WG_MESSAGES_KEY = "wg_messages";

function readMessages(): WgMessage[] {
  try {
    return JSON.parse(localStorage.getItem(WG_MESSAGES_KEY) || "[]");
  } catch {
    return [];
  }
}

function writeMessages(msgs: WgMessage[]) {
  localStorage.setItem(WG_MESSAGES_KEY, JSON.stringify(msgs));
}

export function useMessages() {
  // Lazy initializer (nie useEffect) — jednorazowy odczyt localStorage przy montowaniu
  // jest dozwolonym wyjątkiem od reguły czystości renderu (react-hooks/purity), w
  // przeciwieństwie do setState wewnątrz efektu (react-hooks/set-state-in-effect).
  const [messages, setMessages] = useState<WgMessage[]>(() => (typeof window === "undefined" ? [] : readMessages()));

  const unreadCount = messages.filter((m) => !m.read).length;

  const markAllReadDelayed = useCallback(() => {
    setTimeout(() => {
      const current = readMessages().map((m) => ({ ...m, read: true }));
      writeMessages(current);
      setMessages(current);
    }, 800);
  }, []);

  const submitQuestionnaire = useCallback(
    async (idx: number, answers: Record<string, string>, authHeaders: Record<string, string>) => {
      const current = readMessages();
      const msg = current[idx];
      if (msg && msg.type === "questionnaire") {
        current[idx] = { ...msg, answered: true, answers, read: true };
        writeMessages(current);
        setMessages(current);
      }
      try {
        await fetch("/api/questionnaire-answer", {
          method: "POST",
          headers: { "Content-Type": "application/json", ...authHeaders },
          body: JSON.stringify({
            firma: { ...(msg && msg.type === "questionnaire" ? msg.firma : {}), ...answers },
            slug: (msg && msg.type === "questionnaire" && msg.slug) || "",
          }),
        });
      } catch {
        // cichy fallback — jak w oryginale, brak wiadomości o błędzie sieci tutaj
      }
    },
    []
  );

  return { messages, unreadCount, markAllReadDelayed, submitQuestionnaire };
}
