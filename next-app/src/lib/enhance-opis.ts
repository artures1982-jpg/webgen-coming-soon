// Wspólna logika AI-dociosania {{OPIS}} — używana przez /api/enhance-opis (żywy
// podgląd w kroku 2, tylko dla klientów z JUŻ aktywnym Pro/Pro Max) ORAZ przez
// /api/personalize (finalne generowanie strony, PO udanym checkout). Dla nowego
// klienta kupującego Pro po raz pierwszy checkout jest dopiero w kroku 5 — krok 2
// nie może jeszcze wołać AI (isProEmail zwraca false), więc /api/personalize samo
// dociosuje opis na końcu, żeby każdy płacący klient i tak dostał AI-tekst na
// gotowej stronie, niezależnie czy krok 2 zdążył to zrobić wcześniej.
import { generateText } from "ai";
import { groq } from "@ai-sdk/groq";

export type EnhanceOpisInput = {
  branza?: string;
  miasto?: string;
  opisDraft?: string;
  lata?: string;
  realizacje?: string;
  uslugiLista?: string[];
};

export async function enhanceOpis(input: EnhanceOpisInput): Promise<string> {
  const opisDraft = input.opisDraft || "";

  const fakty: string[] = [];
  if (input.branza) fakty.push("Branża: " + input.branza);
  if (input.miasto) fakty.push("Miasto: " + input.miasto);
  if (input.lata) fakty.push("Lata doświadczenia: " + input.lata);
  if (input.realizacje) fakty.push("Liczba zrealizowanych zleceń: " + input.realizacje);
  if (input.uslugiLista && input.uslugiLista.length) fakty.push("Usługi: " + input.uslugiLista.join(", "));
  if (opisDraft) fakty.push("Szkic opisu od klienta: " + opisDraft);

  if (fakty.length === 0) return opisDraft;

  const prompt =
    "Napisz krótki (2-3 zdania), unikalny opis działalności firmy usługowej po polsku, " +
    "na podstawie WYŁĄCZNIE poniższych faktów. Pisz konkretnie i rzeczowo, jakby to sama firma " +
    "mówiła o sobie. Nie wymyślaj faktów, których tu nie ma (imion właściciela, nagród, adresu).\n\n" +
    "Fakty:\n" +
    fakty.map((f) => "- " + f).join("\n") +
    "\n\n" +
    "Bezwzględnie unikaj tych oklepanych fraz-kalek (i im podobnych): " +
    '"Sprawdzone rzemiosło od X lat w mieście...", ' +
    '"z siedzibą w mieście ... i klientami z całej Polski". ' +
    "Zwróć WYŁĄCZNIE sam tekst opisu, bez cudzysłowów, bez nagłówka, bez wyjaśnień.";

  try {
    const { text } = await generateText({
      model: groq("openai/gpt-oss-120b"),
      prompt,
    });
    const opis = text.trim().replace(/^["']|["']$/g, "");
    return opis || opisDraft;
  } catch (err) {
    console.error("enhanceOpis: AI error, falling back to draft:", err);
    return opisDraft;
  }
}
