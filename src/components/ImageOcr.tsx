"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";



type Preview = {
  file: File;
  url: string;
};

type OcrResult = {
  index: number;
  text: string;
  warnings?: string[];
};

export default function ImageOcr() {
  const [previews, setPreviews] = useState<Preview[]>([]);
  const [results, setResults] = useState<OcrResult[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Cleanup object URLs when previews change
  const revokeAll = useCallback((items: Preview[]) => {
    items.forEach((p) => URL.revokeObjectURL(p.url));
  }, []);

  const onFilesSelected = useCallback<React.ChangeEventHandler<HTMLInputElement>>(
    (e) => {
      const files = Array.from(e.target.files ?? []);
      if (files.length === 0) return;
      setResults(null);
      setError(null);
      setPreviews((prev) => [
        ...prev,
        ...files.map((file) => ({ file, url: URL.createObjectURL(file) })),
      ]);
    },
    []
  );

  const clear = useCallback(() => {
    setResults(null);
    setError(null);
    setPreviews((prev) => {
      revokeAll(prev);
      return [];
    });
    if (inputRef.current) inputRef.current.value = "";
  }, [revokeAll]);

  const hasImages = previews.length > 0;

  const handleExtract = useCallback(async () => {
    if (!hasImages || loading) return;
    setLoading(true);
    setError(null);
    setResults(null);
    try {
      // Read files as base64 (no data: prefix)
      const toBase64 = (file: File) =>
        new Promise<{ filename: string; mimeType: string; contentBase64: string }>((resolve, reject) => {
          const reader = new FileReader();
          reader.onerror = () => reject(new Error("Failed to read file"));
          reader.onload = () => {
            const result = String(reader.result || "");
            const idx = result.indexOf("base64,");
            const base64 = idx >= 0 ? result.slice(idx + "base64,".length) : result;
            resolve({ filename: file.name, mimeType: file.type, contentBase64: base64 });
          };
          reader.readAsDataURL(file);
        });

      const payload = {
        images: await Promise.all(previews.map((p) => toBase64(p.file))),
        mode: "DOCUMENT_TEXT_DETECTION" as const,
      };

      const res = await fetch("/api/vision-ocr", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg);
      }
      const json = (await res.json()) as { results: OcrResult[] };
      setResults(json.results);
    } catch (e: any) {
      setError(e?.message ?? "Unexpected error");
    } finally {
      setLoading(false);
    }
  }, [hasImages, loading, previews]);

  const combinedText = useMemo(() => {
    if (!results) return "";
    return results.map((r, i) => `# Image ${i + 1}\n${r.text}`.trim()).join("\n\n---\n\n");
  }, [results]);

  return (
    <div className="grid gap-4">
      {/* Output box (TOP) */}
      <div className="grid gap-2">
        <label className="font-semibold">Text Output</label>
        {error ? (
          <pre className="text-red-700 whitespace-pre-wrap">{String(error)}</pre>
        ) : (
          <textarea
            value={combinedText}
            readOnly
            className="min-h-56 p-2.5 border border-border rounded-md font-mono text-sm whitespace-pre-wrap"
            placeholder="Run extraction to see text here"
          />
        )}
      </div>

      {/* Preview box (MIDDLE) */}
      <div className="border border-border rounded-lg p-3 min-h-36 grid gap-2" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))" }}>
        {!hasImages && <div className="text-muted-foreground">No images selected</div>}
        {previews.map((p, idx) => (
          <div key={idx} className="relative border border-border rounded-md overflow-hidden bg-secondary/30">
            <img src={p.url} alt={`preview-${idx}`} className="w-full h-30 object-cover" />
            <div className="absolute bottom-1 left-1 right-1 text-xs text-foreground/90 truncate bg-background/40 backdrop-blur-sm px-1 rounded">
              {p.file.name}
            </div>
          </div>
        ))}
      </div>

      {/* Controls (BOTTOM) */}
      <div className="flex flex-wrap items-center gap-3">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={onFilesSelected}
          className="hidden"
        />
        <Button
          type="button"
          variant="secondary"
          onClick={() => inputRef.current?.click()}
        >
          Choose images
        </Button>
        <span className="text-sm text-muted-foreground">
          {hasImages ? `${previews.length} file${previews.length > 1 ? "s" : ""} selected` : "No files chosen"}
        </span>
        <div className="ml-auto flex items-center gap-2">
          <Button onClick={handleExtract} disabled={!hasImages || loading}>
            {loading ? "Extracting…" : "Extract Text"}
          </Button>
          <Button variant="outline" onClick={clear} disabled={!hasImages || loading}>
            Clear
          </Button>
        </div>
      </div>
    </div>
  );
}
