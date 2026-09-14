// Port 1:1 z toWebP() w generator/index.html — konwertuje PNG/JPG/WEBP → WebP
// bezstratny przez Canvas API (quality=1.0 + image/webp = lossless w Chrome/Edge/
// Firefox). Fallback do oryginalnego formatu, jeśli przeglądarka nie eksportuje WebP
// (stare Safari) albo Canvas rzuci błąd.
export function toWebP(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Błąd odczytu pliku"));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error("Błąd ładowania obrazu"));
      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          canvas.width = img.naturalWidth;
          canvas.height = img.naturalHeight;
          const ctx = canvas.getContext("2d");
          if (!ctx) throw new Error("Brak kontekstu canvas");
          ctx.drawImage(img, 0, 0);
          const webp = canvas.toDataURL("image/webp", 1.0);
          const isWebP = webp.startsWith("data:image/webp");
          resolve(isWebP ? webp : (e.target?.result as string));
        } catch {
          resolve(e.target?.result as string);
        }
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}
