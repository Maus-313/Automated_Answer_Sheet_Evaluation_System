// app/api/ai/route.ts
import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json({ error: "Missing prompt" }, { status: 400 });
    }

    // Attach private system instruction from env without exposing it client-side
    const systemInstruction = process.env.CUSTOM_PROMPT || "";
    const combinedPrompt = systemInstruction
      ? `${systemInstruction}\n\nUser prompt: ${prompt}`
      : prompt;

    const res = await ai.models.generateContent({
      model: "gemini-2.0-flash-001",
      contents: combinedPrompt,
    });

    // .text contains the plain text answer
    return NextResponse.json({ output: res.text });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { error: err?.message ?? "AI request failed" },
      { status: 500 }
    );
  }
}
