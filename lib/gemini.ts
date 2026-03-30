// src/lib/gemini.ts
import { GoogleGenerativeAI } from "@google/generative-ai";

export const GEMINI_MODEL = "gemini-2.5-flash-lite";

let hasLoggedGeminiConfig = false;

export function getGeminiDiagnostics() {
  return {
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
    model: GEMINI_MODEL,
  };
}

export function getGeminiModel() {
  if (!hasLoggedGeminiConfig) {
    console.info("Gemini configuration", getGeminiDiagnostics());
    hasLoggedGeminiConfig = true;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("Missing GEMINI_API_KEY");

  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel({ model: GEMINI_MODEL });
}
