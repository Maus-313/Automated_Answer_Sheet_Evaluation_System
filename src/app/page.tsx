"use client";

import Image from "next/image";
import { useState } from "react";

export default function Home() {
  const [text, setText] = useState(""); // AI output shown in Output Box
  const [inputValue, setInputValue] = useState(""); // prompt entered by user
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
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <div className="mt-6 w-full max-w-md flex flex-col gap-4">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Output Box</label>
          <textarea
            value={loading ? "Loading..." : text}
            readOnly
            placeholder="Output will appear here"
            className="w-full h-32 resize-none rounded-md border border-black/10 dark:border-white/20 bg-transparent px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
          />

          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Prompt</label>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type something..."
            className="w-full h-9 rounded-md border border-black/10 dark:border-white/20 bg-transparent px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
          />

          <button
            type="button"
            onClick={handleRunPrompt}
            disabled={loading}
            className="rounded-md bg-blue-600 disabled:bg-blue-300 text-white px-4 py-2 text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {loading ? "Running..." : "Run Prompt"}
          </button>

          {error && (
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          )}
        </div>
      </main>
    </div>
  );
}