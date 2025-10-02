"use client";

import { useEffect, useState } from "react";

type PromptRunnerProps = {
  targetModel?: 'QuestionPaper' | 'MarkingScheme' | 'AnswerSheet';
};

const getDefaultPrompt = (targetModel: string, ocrText: string) => {
  const basePrompt = ocrText ? `Extract from this OCR text:\n\n${ocrText}\n\n` : '';

  switch (targetModel) {
    case 'QuestionPaper':
      return `${basePrompt}Extract ONLY the questions from this text. Ignore any answers, solutions, or student responses. Create a QuestionPaper entry with appropriate course code, subject, slot, and exam type (CAT/FAT/ASSESSMENT).`;
    case 'AnswerSheet':
      return `${basePrompt}Extract ONLY the student answers from this text. Ignore questions, marking schemes, or criteria. Create an AnswerSheet entry with roll number, name, slot, exam type (CAT/FAT/ASSESSMENT), and answers.`;
    case 'MarkingScheme':
      return `${basePrompt}Extract ONLY the marking criteria and marks from this text. Ignore student answers or solutions. Create a MarkingScheme entry with course code, slot, exam type (CAT/FAT/ASSESSMENT), marks, and criteria.`;
    default:
      return basePrompt;
  }
};

export default function PromptRunner({ targetModel = 'QuestionPaper' }: PromptRunnerProps) {
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
        body: JSON.stringify({ prompt: inputValue, targetModel }),
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
      <textarea
        aria-label="Output"
        value={loading ? "Loading..." : text || "Output will appear here"}
        onChange={(e) => setText(e.target.value)}
        readOnly={loading}
        className="w-full sm:max-w-2xl mx-auto max-h-[calc(100vh-240px)] overflow-auto rounded-md border border-black/10 dark:border-white/20 bg-transparent px-3 py-2 text-sm whitespace-pre-wrap resize-none"
        rows={10}
      />

      <label className="text-sm font-medium text-gray-700 dark:text-gray-300 text-center">Prompt</label>
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder={`Describe what to extract for ${targetModel}...`}
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
        onClick={async () => {
          try {
            setError(null);
            const codeMatch = text.match(/```[a-zA-Z]*\n([\s\S]*?)```/);
            const code = codeMatch ? codeMatch[1] : text;
            if (!code || !code.trim()) {
              setError("No code found to execute");
              return;
            }
            setLoading(true);
            const res = await fetch("/ai/run-prisma", {
              method: "POST",
              headers: { "content-type": "application/json" },
              body: JSON.stringify({ code }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data?.error || "Failed to apply update");
            setText((prev) => `${prev}\n\n---\nResult: ${JSON.stringify(data, null, 2)}`);
          } catch (e: any) {
            setError(e?.message || "Failed to apply update");
          } finally {
            setLoading(false);
          }
        }}
        disabled={loading || !text}
        className="w-fit mx-auto rounded-md bg-purple-600 disabled:bg-purple-300 text-white px-4 py-2 text-sm font-medium hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
      >
        Run DB Update
      </button>

      <button
        type="button"
        onClick={() => setInputValue(getDefaultPrompt(targetModel, ocrText))}
        disabled={!ocrText || loading}
        className="w-fit mx-auto rounded-md bg-emerald-600 disabled:bg-emerald-300 text-white px-4 py-2 text-sm font-medium hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
      >
        Generate Smart Prompt
      </button>

      <button
        type="button"
        onClick={() => setInputValue((prev) => (prev ? prev + "\n\n" + ocrText : ocrText))}
        disabled={!ocrText || loading}
        className="w-fit mx-auto rounded-md bg-blue-600 disabled:bg-blue-300 text-white px-4 py-2 text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        Insert Raw OCR
      </button>

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400 text-center">{error}</p>
      )}
    </section>
  );
}
