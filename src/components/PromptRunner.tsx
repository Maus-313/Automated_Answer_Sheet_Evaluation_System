"use client";

import { useState } from "react";

export default function PromptRunner() {
  const [text, setText] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    <section className="mt-6 w-full flex flex-col gap-4">
      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Output Box</label>
      <div
        aria-label="Output"
        role="region"
        className="w-full max-w-full max-h-[calc(100vh-240px)] overflow-auto rounded-md border border-black/10 dark:border-white/20 bg-transparent px-3 py-2 text-sm whitespace-pre-wrap"
      >
        {loading ? "Loading..." : text || "Output will appear here"}
      </div>

      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Prompt</label>
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder="Type something..."
        className="w-full sm:max-w-md h-9 rounded-md border border-black/10 dark:border-white/20 bg-transparent px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
      />

      <button
        type="button"
        onClick={handleRunPrompt}
        disabled={loading}
        className="w-fit rounded-md bg-blue-600 disabled:bg-blue-300 text-white px-4 py-2 text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {loading ? "Running..." : "Run Prompt"}
      </button>

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </section>
  );
}

