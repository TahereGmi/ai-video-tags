import { NextResponse } from "next/server";
import { getGeminiModel } from "@/lib/gemini";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const title = String(body?.title ?? "").trim();
    const description = String(body?.description ?? "").trim();

    if (title.length < 2 || title.length > 120) {
      return NextResponse.json(
        { message: "title must be 2..120 chars" },
        { status: 400 },
      );
    }
    if (description.length > 2000) {
      return NextResponse.json(
        { message: "description max is 2000 chars" },
        { status: 400 },
      );
    }

    const model = getGeminiModel();

    const prompt = `
You are a tagging assistant.
Generate exactly 5 relevant tags from the provided video title and description.

Rules:
- Same language as input (do not translate).
- Each tag must be 1–4 words.
- No hashtags (#), no emojis, no quotes.
- Avoid generic words like: video, clip, content.
- Return ONLY a JSON object like:
{"tags":["...","...","...","...","..."]}

Title: ${title}
Description: ${description || "(empty)"}
`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    return NextResponse.json({ raw: text });
  } catch (err: any) {
    return NextResponse.json(
      { message: err?.message ?? "Unknown error" },
      { status: 500 },
    );
  }
}
