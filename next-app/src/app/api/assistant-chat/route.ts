// Backend rozmowy z wirtualnym asystentem konfiguracyjnym (Pro/Pro Max) — zastępuje
// kroki 1+2 formularza generatora (lokalizacja + dane firmy) czatem. Model wywołuje
// narzędzia BEZ execute() — to celowo robi je narzędziami KLIENCKIMI (patrz
// node_modules/ai/docs/04-ai-sdk-ui/03-chatbot-tool-usage.mdx): AssistantStep.tsx
// obsługuje je w onToolCall i zapisuje dane wprost do GeneratorContext (patchForm),
// więc tu na serwerze nie ma żadnego stanu formularza — tylko routing rozmowy.
import { streamText, convertToModelMessages, createUIMessageStreamResponse, toUIMessageStream, tool, type UIMessage } from "ai";
import { groq } from "@ai-sdk/groq";
import { z } from "zod";
import { verifyRequest } from "@/lib/clerk-verify";
import { isProEmail } from "@/lib/entitlement";

export const maxDuration = 60;

// Te same pola co next-app/src/lib/generator-helpers.ts FormData (podzbiór kroków 1+2) —
// zero mapowania nazw między modelem a form state po stronie klienta.
const updateFirmaData = tool({
  description:
    "Zapisz częściowe lub pełne dane firmy klienta zebrane z rozmowy. Wywołuj przy KAŻDEJ " +
    "pojedynczej pewnej informacji — nie czekaj, aż zbierzesz wszystko naraz. Możesz wywołać " +
    "wielokrotnie, kolejne wywołania nadpisują tylko podane pola.",
  inputSchema: z.object({
    nazwaStrony: z.string().optional().describe("Nazwa wyświetlana na stronie (marka), np. 'HydroFix Kraków'"),
    miasto: z.string().optional().describe("Miasto działalności, w mianowniku, np. 'Kraków'"),
    dzielnica: z.string().optional().describe("Dzielnica, jeśli klient ją poda — opcjonalne"),
    telefon: z.string().optional().describe("Numer telefonu kontaktowego"),
    email: z.string().optional().describe("Adres email kontaktowy"),
    adres: z.string().optional().describe("Adres siedziby/działalności — opcjonalne"),
    godzPonPt: z.string().optional().describe("Godziny otwarcia pon-pt, np. '8:00-18:00' — opcjonalne"),
    godzSob: z.string().optional().describe("Godziny otwarcia w sobotę — opcjonalne"),
    lata: z.string().optional().describe("Lata doświadczenia firmy — opcjonalne, samo słowo/liczba"),
    realizacje: z.string().optional().describe("Liczba zrealizowanych zleceń — opcjonalne"),
    uslugi: z.string().optional().describe("Lista usług firmy, oddzielona przecinkami"),
    opis: z.string().optional().describe("Krótki, konkretny opis działalności firmy (2-3 zdania) na podstawie tego, co powiedział klient"),
  }),
});

const markReady = tool({
  description:
    "Wywołaj DOKŁADNIE RAZ, gdy masz już komplet wymaganych danych: nazwaStrony, telefon, " +
    "email, miasto. To kończy rozmowę i przenosi klienta do kolejnego kroku formularza.",
  inputSchema: z.object({}),
});

const ASSISTANT_SYSTEM_PROMPT =
  "Jesteś asystentem konfiguracyjnym Webgen — pomagasz klientowi (właścicielowi małej firmy " +
  "usługowej) skonfigurować jego nową stronę internetową przez krótką, naturalną rozmowę po " +
  "polsku, zamiast każąc mu wypełniać formularz.\n\n" +
  "Zbierz kolejno (jedno-dwa pytania naraz, nie zarzucaj klienta listą): nazwę strony/marki, " +
  "miasto działalności, telefon, email kontaktowy, a potem — jeśli klient chce podać — " +
  "dzielnicę, adres, godziny otwarcia, lata doświadczenia, liczbę realizacji i listę usług. Na " +
  "podstawie tego co powie, ułóż też krótki (2-3 zdania), konkretny, rzeczowy opis działalności " +
  "(pole opis) — pisz jakby to sama firma mówiła o sobie, NIE wymyślaj faktów, których klient nie " +
  "podał (imion, nagród). Bezwzględnie unikaj oklepanych fraz-kalek w stylu 'Sprawdzone " +
  "rzemiosło od X lat w mieście...' czy 'z siedzibą w mieście... i klientami z całej Polski'.\n\n" +
  "KRYTYCZNIE WAŻNE: jedyny sposób zapisania danych to wywołanie narzędzia updateFirmaData. " +
  "NIGDY nie pisz zebranych danych jako tekst w wiadomości (żadnego JSON-a, żadnej listy pól w " +
  "treści) — to NIE zapisuje niczego, klient straci swoje dane. Jeśli klient w JEDNEJ " +
  "wiadomości poda kilka informacji naraz (np. nazwę, miasto, telefon i email razem), wywołaj " +
  "updateFirmaData RAZ z wszystkimi tymi polami naraz, zanim odpowiesz tekstem — nie opisuj tego " +
  "słowami zamiast tego. Gdy masz już nazwę strony, telefon, email i miasto (minimum wymagane), " +
  "zapytaj czy klient chce dodać coś jeszcze, a jeśli nie — wywołaj markReady. Nigdy nie wywołuj " +
  "markReady bez wcześniejszego, faktycznego wywołania updateFirmaData z tymi danymi.\n\n" +
  "NIE pytaj o kolor/paletę strony — to osobny, wizualny wybór klienta obok tej rozmowy. NIE " +
  "pytaj o logo ani zdjęcia — te klient dodaje osobno przez upload.";

export async function POST(req: Request) {
  const authSession = await verifyRequest(req);
  if (!authSession) return Response.json({ error: "Brak autoryzacji" }, { status: 401 });

  const isPro = await isProEmail(authSession.email);
  if (!isPro) {
    return Response.json(
      { error: "Asystent konfiguracyjny wymaga aktywnego planu Pro", code: "PRO_REQUIRED" },
      { status: 402 }
    );
  }

  const body = await req.json().catch(() => ({}));
  const messages: UIMessage[] = body.messages || [];

  const result = streamText({
    model: groq("openai/gpt-oss-120b"),
    system: ASSISTANT_SYSTEM_PROMPT,
    messages: await convertToModelMessages(messages),
    tools: { updateFirmaData, markReady },
  });

  return createUIMessageStreamResponse({
    stream: toUIMessageStream({ stream: result.stream }),
  });
}
