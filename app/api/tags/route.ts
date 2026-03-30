import { GoogleGenerativeAIFetchError } from "@google/generative-ai";
import { NextResponse } from "next/server";
import {
  getGeminiDiagnostics,
  getGeminiModel,
} from "@/lib/gemini";
import {
  DEFAULT_TONE,
  getToneOption,
  isToneId,
} from "@/lib/tone-options";

export const runtime = "nodejs";

function formatGeminiError(err: unknown) {
  if (err instanceof GoogleGenerativeAIFetchError) {
    const status = err.status ?? 502;
    const statusText = err.statusText ?? "Upstream error";
    const errorDetails = err.errorDetails ?? [];

    let userMessage = "در ارتباط با سرویس Gemini مشکلی رخ داد.";

    if (status === 403) {
      userMessage =
        "دسترسی به مدل Gemini رد شد. کلید API، محدودیت های پروژه، یا دسترسی این مدل را بررسی کنید.";
    } else if (status === 429) {
      userMessage =
        "تعداد درخواست ها به Gemini بیش از حد مجاز شده است. کمی بعد دوباره تلاش کنید.";
    } else if (status >= 500) {
      userMessage =
        "سرویس Gemini موقتا در دسترس نیست. چند دقیقه بعد دوباره تلاش کنید.";
    }

    return {
      log: {
        type: "GoogleGenerativeAIFetchError",
        message: err.message,
        status,
        statusText,
        errorDetails,
      },
      status,
      userMessage,
    };
  }

  if (err instanceof Error) {
    return {
      log: {
        type: err.name,
        message: err.message,
      },
      status: 500,
      userMessage: "در پردازش درخواست مشکلی پیش آمد.",
    };
  }

  return {
    log: {
      type: "UnknownError",
      value: err,
    },
    status: 500,
    userMessage: "خطای ناشناخته ای رخ داد.",
  };
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const title = String(body?.title ?? "").trim();
    const description = String(body?.description ?? "").trim();
    const tone = isToneId(body?.tone) ? body.tone : DEFAULT_TONE;
    const toneOption = getToneOption(tone);

    if (title.length < 2 || title.length > 120) {
      return NextResponse.json(
        { message: "عنوان ویدیو باید بین ۲ تا ۱۲۰ کاراکتر باشد." },
        { status: 400 },
      );
    }
    if (description.length > 2000) {
      return NextResponse.json(
        { message: "توضیحات ویدیو نباید بیشتر از ۲۰۰۰ کاراکتر باشد." },
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
- Desired tone: ${toneOption.label}.
- Tone guidance: ${toneOption.promptHint}
- Return ONLY a JSON object like:
{"tags":["...","...","...","...","..."]}

Title: ${title}
Description: ${description || "(empty)"}
`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    return NextResponse.json({ raw: text });
  } catch (err) {
    const formattedError = formatGeminiError(err);

    console.error("Gemini tag generation failed", {
      ...formattedError.log,
      route: "/api/tags",
      ...getGeminiDiagnostics(),
    });

    return NextResponse.json(
      { message: formattedError.userMessage },
      { status: formattedError.status },
    );
  }
}
