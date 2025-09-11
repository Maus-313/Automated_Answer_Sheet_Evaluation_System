"use client";

import { useEffect, useState } from "react";

export default function PromptRunner() {
  const [text, setText] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ocrText, setOcrText] = useState("");

  // Listen to OCR text broadcast from ImageOcr component
  useEffect(() => {
    function onOcrChanged(e: any) {
      const t = e?.detail?.text ?? "";
      setOcrText(typeof t === "string" ? t : "");
    }
    if (typeof window !== "undefined") {
      window.addEventListener("ocr-text-changed", onOcrChanged as EventListener);
    }
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("ocr-text-changed", onOcrChanged as EventListener);
      }
    };
  }, []);

  async function handleRunPrompt() {
    if (!inputValue.trim()) {
      setError("Please enter a prompt.");
      return;
    }
    setError(null);
    setLoading(true);
    setText("");
    try {
      const res = await fetch("/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: inputValue }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || "Request failed");
      }
      setText(typeof data?.output === "string" ? data.output : String(data?.output ?? ""));
    } catch (e: any) {
      setError(e?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mt-6 w-full flex flex-col gap-4 items-center">
      <label className="text-sm font-medium text-gray-700 dark:text-gray-300 text-center">Output Box</label>
      <div
        aria-label="Output"
        role="region"
        className="w-full sm:max-w-2xl mx-auto max-h-[calc(100vh-240px)] overflow-auto rounded-md border border-black/10 dark:border-white/20 bg-transparent px-3 py-2 text-sm whitespace-pre-wrap"
      >
        {loading ? "Loading..." : text || "Output will appear here"}
      </div>

      <label className="text-sm font-medium text-gray-700 dark:text-gray-300 text-center">Prompt</label>
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder="Type something..."
        className="w-full sm:max-w-md mx-auto h-9 rounded-md border border-black/10 dark:border-white/20 bg-transparent px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
      />

      <button
        type="button"
        onClick={handleRunPrompt}
        disabled={loading}
        className="w-fit mx-auto rounded-md bg-blue-600 disabled:bg-blue-300 text-white px-4 py-2 text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {loading ? "Running..." : "Run Prompt"}
      </button>

      <button
        type="button"
        onClick={() => setInputValue((prev) => (prev ? prev + "\n\n" + ocrText : ocrText))}
        disabled={!ocrText || loading}
        className="w-fit mx-auto rounded-md bg-emerald-600 disabled:bg-emerald-300 text-white px-4 py-2 text-sm font-medium hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
      >
        Insert OCR Output
      </button>

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400 text-center">{error}</p>
      )}
    </section>
  );
}
