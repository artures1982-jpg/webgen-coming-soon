"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useTemplatesManifest } from "@/hooks/useTemplatesManifest";
import { useGeneration } from "@/hooks/useGeneration";
import { GeneratorProvider, useGenerator } from "./GeneratorContext";
import Sidebar from "./Sidebar";
import RegistrationStep from "./RegistrationStep";
import TemplateLocationStep from "./TemplateLocationStep";
import BrandDetailsStep from "./BrandDetailsStep";
import AssistantStep from "./AssistantStep";
import SocialStep from "./SocialStep";
import AddonsStep from "./AddonsStep";
import SummaryStep from "./SummaryStep";
import GeneratingOverlay from "./GeneratingOverlay";
import PreviewPanel from "./PreviewPanel";
import CheckoutModal from "./CheckoutModal";
import PexelsModal from "./PexelsModal";
import styles from "./Generator.module.css";

// Port 1:1 z generator/index.html. `templateId` jest wymagany i już zweryfikowany
// przez src/app/generator/page.tsx (Server Component, redirect na /galeria/ gdy
// brak ?template= — PRZED jakimkolwiek renderem, więc lepiej niż oryginalny
// klient-side window.location.href sprawdzany dopiero po sparsowaniu skryptu).
export default function GeneratorShell({ templateId }: { templateId: string }) {
  return (
    <GeneratorProvider>
      <Inner templateId={templateId} />
    </GeneratorProvider>
  );
}

function Inner({ templateId }: { templateId: string }) {
  const { isLoaded, isSignedIn, user } = useUser();
  const router = useRouter();
  const { gen, form, patchGen, selectTemplate } = useGenerator();
  const { manifest, loaded: manifestLoaded } = useTemplatesManifest();
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  // Port 1:1 z applyPendingTemplateSelection() — dociąga branża/industry/tier
  // wybranego w /galeria/ szablonu. Raz na sesję komponentu (nie przy każdym
  // renderze) — odpowiednik `PENDING_TEMPLATE_ID = null` po pierwszym użyciu.
  useEffect(() => {
    if (!isSignedIn || !manifestLoaded || gen.templateId) return;
    const entry = manifest.find((t) => t.id === templateId);
    if (!entry) {
      router.replace("/galeria/");
      return;
    }
    selectTemplate(entry);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSignedIn, manifestLoaded, gen.templateId]);

  // Port 1:1 z onAuthenticated() — zapisz typ konta / dane firmowe zebrane w
  // panel-0 PRZY PIERWSZEJ rejestracji. user.update({unsafeMetadata}) z oryginału
  // jest deprecated w Clerk Core 3 (jak w dashboardzie) — updateMetadata() robi
  // deep-merge, nie trzeba już ręcznie składać istniejących metadanych.
  useEffect(() => {
    if (!isSignedIn || !user || gen.metadataSaved) return;
    const meta = (user.unsafeMetadata || {}) as { accountType?: string };
    if (meta.accountType) {
      patchGen({ metadataSaved: true });
      return;
    }
    const newMeta: Record<string, unknown> = { accountType: gen.accountType };
    if (gen.pendingProfileFirma) newMeta.profileFirma = gen.pendingProfileFirma;
    user
      .updateMetadata({ unsafeMetadata: newMeta })
      .catch(() => {})
      .finally(() => patchGen({ metadataSaved: true }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSignedIn, user, gen.metadataSaved]);

  const generation = useGeneration({
    templateId: gen.templateId,
    templateTier: gen.templateTier,
    branza: gen.branza,
    plan: gen.plan,
    form,
    onSuccess: (html, slug) => {
      patchGen({ generatedHTML: html, slug, phase: "preview" });
    },
    onError: (message) => {
      alert(message);
      patchGen({ phase: "form" });
    },
    onProRequired: () => {
      patchGen({ phase: "form" });
      setCheckoutOpen(true);
    },
  });

  function handleGenerate() {
    patchGen({ phase: "generating" });
    generation.start();
  }

  if (!isLoaded) return null;

  const showRegistration = !isSignedIn;
  const isPro = gen.plan === "pro" || gen.plan === "promax";
  const useAssistant = isPro && !gen.assistantOptOut;

  return (
    <div className={styles.root}>
      <div className={styles.app}>
        <Sidebar visible={!showRegistration} />
        <main className={styles.main}>
          {showRegistration && <RegistrationStep templateId={templateId} />}
          {!showRegistration && gen.phase === "form" && (
            <>
              {useAssistant && gen.currentStep <= 2 && <AssistantStep />}
              {!useAssistant && <TemplateLocationStep active={gen.currentStep === 1} />}
              {!useAssistant && <BrandDetailsStep active={gen.currentStep === 2} />}
              <SocialStep active={gen.currentStep === 3} />
              <AddonsStep active={gen.currentStep === 4} />
              <SummaryStep active={gen.currentStep === 5} onGenerate={handleGenerate} />
            </>
          )}
          {!showRegistration && gen.phase === "preview" && <PreviewPanel onActivate={() => setCheckoutOpen(true)} />}
        </main>
      </div>

      {gen.phase === "generating" && (
        <GeneratingOverlay elapsedSec={generation.elapsedSec} progress={generation.progress} message={generation.message} subMessage={generation.subMessage} />
      )}

      {checkoutOpen && <CheckoutModal onClose={() => setCheckoutOpen(false)} />}
      <PexelsModal />
    </div>
  );
}
