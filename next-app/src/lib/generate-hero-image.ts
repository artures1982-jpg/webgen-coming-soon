// AI-generowane zdjęcie hero — WYŁĄCZNIE Pro Max (patrz isProMaxEmail w
// lib/entitlement.ts). Google nie ma dedykowanego modelu obrazkowego na Vercel AI
// Gateway (sprawdzone na żywo: GET https://ai-gateway.vercel.sh/v1/models — zero
// wpisów Google z "type":"image") — obraz wychodzi z multimodalnego modelu
// JĘZYKOWEGO przez generateText()'s `result.files`, nie przez generateImage().
// Patrz node_modules/ai/docs/03-ai-sdk-core/35-image-generation.mdx, sekcja
// "Generating Images with Language Models".
//
// STAN (2026-09-14): kod przeszedł tsc/eslint/build i mechanizm tokenu {{HERO_IMG}}
// jest zweryfikowany (node-owy test fillTemplate()), ale NIE ma jeszcze ani jednego
// realnie wygenerowanego zdjęcia — oba dostępne konta (Vercel AI Gateway free tier,
// bezpośredni klucz Google AI Studio) zwracały błąd limitu/kredytów przy próbie
// (odpowiednio: "Free tier users do not have access to this model" i "Your
// prepayment credits are depleted"). Artur ma doładować jedno z kont — wtedy
// dokończyć pilota na 3 plikach (patrz plan) PRZED rolloutem na resztę 53 szablonów.
import { generateText } from "ai";

const MODEL = "google/gemini-3.1-flash-image";

export type GenerateHeroImageInput = {
  branza?: string;
  miasto?: string;
  uslugiLista?: string[];
};

export async function generateHeroImage(input: GenerateHeroImageInput): Promise<string | null> {
  const fakty: string[] = [];
  if (input.branza) fakty.push("Branża: " + input.branza);
  if (input.miasto) fakty.push("Miasto: " + input.miasto);
  if (input.uslugiLista && input.uslugiLista.length) fakty.push("Usługi: " + input.uslugiLista.join(", "));

  if (fakty.length === 0) return null;

  const prompt =
    "Professional, realistic photograph for the hero section of a small local business website. " +
    fakty.join(". ") +
    ". Photorealistic, natural lighting, no text, no logos, no watermarks, no illustration or " +
    "cartoon style — a real photographic scene showing this kind of work or workplace.";

  try {
    const { files } = await generateText({
      model: MODEL,
      prompt,
    });
    const image = files.find((f) => f.mediaType.startsWith("image/"));
    if (!image) return null;
    return "data:" + image.mediaType + ";base64," + image.base64;
  } catch (err) {
    console.error("generateHeroImage: AI error, falling back to template default:", err);
    return null;
  }
}
