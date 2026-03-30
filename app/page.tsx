"use client";

import { useState, type ComponentProps } from "react";
import {
  DEFAULT_TONE,
  TONE_OPTIONS,
  type ToneId,
} from "@/lib/tone-options";

type TagApiResponse = {
  raw?: unknown;
  message?: string;
  tags?: unknown;
};

type FormSubmitHandler = NonNullable<ComponentProps<"form">["onSubmit"]>;

function cleanRawJson(value: string) {
  return value.replace(/```json|```/gi, "").trim();
}

function normalizeTags(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return [...new Set(value)]
    .filter((tag): tag is string => typeof tag === "string")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function extractTags(payload: TagApiResponse) {
  const directTags = normalizeTags(payload.tags);
  if (directTags.length > 0) {
    return directTags;
  }

  if (typeof payload.raw !== "string") {
    return [];
  }

  try {
    const parsed = JSON.parse(cleanRawJson(payload.raw)) as { tags?: unknown };
    return normalizeTags(parsed.tags);
  } catch {
    return [];
  }
}

export default function Page() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tone, setTone] = useState<ToneId>(DEFAULT_TONE);
  const [tags, setTags] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit: FormSubmitHandler = async (event) => {
    event.preventDefault();

    const trimmedTitle = title.trim();
    const trimmedDescription = description.trim();

    if (trimmedTitle.length < 2) {
      setError("لطفا عنوان ویدیو را با حداقل ۲ کاراکتر وارد کنید.");
      setTags([]);
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/tags", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: trimmedTitle,
          description: trimmedDescription,
          tone,
        }),
      });

      const data = (await response.json().catch(() => ({}))) as TagApiResponse;

      if (!response.ok) {
        throw new Error(data.message || "در حال حاضر تولید تگ امکان پذیر نیست.");
      }

      const nextTags = extractTags(data);

      if (nextTags.length === 0) {
        throw new Error("پاسخ دریافتی هیچ تگ قابل استفاده ای نداشت.");
      }

      setTags(nextTags);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "مشکلی پیش آمد.";
      setError(message);
      setTags([]);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main
      className="min-h-screen bg-[radial-gradient(circle_at_top,#f7f1e8_0%,#f3ede2_38%,#e8dfcf_100%)] px-4 py-10 text-right text-stone-900"
      dir="rtl"
      lang="fa"
    >
      <div className="mx-auto flex max-w-5xl flex-col gap-8 lg:flex-row">
        <section className="lg:w-2/5">
          <p className="text-sm tracking-[0.2em] text-stone-500">
            برچسب ساز ویدیو با هوش مصنوعی
          </p>
          <h1 className="mt-3 font-serif text-4xl leading-tight sm:text-5xl">
            از عنوان و توضیحات ویدیو، تگ های آماده انتشار بسازید.
          </h1>
          <p className="mt-4 max-w-xl text-base leading-7 text-stone-600">
            اطلاعات ویدیوی خود را وارد کنید، یک مجموعه تگ دقیق دریافت کنید و
            همان لحظه از آن در رابط کاربری یا پلتفرم انتشار استفاده کنید.
          </p>
        </section>

        <section className="lg:w-3/5">
          <div className="rounded-[2rem] border border-stone-200/70 bg-white/80 p-6 shadow-[0_20px_80px_rgba(120,94,56,0.12)] backdrop-blur">
            <form className="space-y-5" onSubmit={handleSubmit}>
              <fieldset className="space-y-3">
                <legend className="text-sm font-medium text-stone-700">
                  لحن محتوا
                </legend>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-stone-500">
                    سبک محتوای مورد نظر را انتخاب کنید
                  </span>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {TONE_OPTIONS.map((option) => {
                    const isSelected = tone === option.id;
                    const radioId = `tone-${option.id}`;

                    return (
                      <label
                        htmlFor={radioId}
                        key={option.id}
                        className={`cursor-pointer rounded-2xl border p-4 transition ${
                          isSelected
                            ? "border-stone-900 bg-stone-900 text-white"
                            : "border-stone-300 bg-stone-50 text-stone-900 hover:border-stone-500 hover:bg-white"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <input
                            checked={isSelected}
                            className="mt-1 h-4 w-4 shrink-0 border-stone-400 text-stone-900 focus:ring-stone-500"
                            id={radioId}
                            name="tone"
                            onChange={() => setTone(option.id)}
                            type="radio"
                            value={option.id}
                          />

                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-3">
                              <p
                                className="text-sm font-semibold"
                              >
                                {option.faLabel}
                              </p>
                              <span
                                className={`text-[11px] tracking-[0.2em] ${
                                  isSelected ? "text-stone-300" : "text-stone-400"
                                }`}
                              >
                                لحن
                              </span>
                            </div>

                            <p
                              className={`mt-3 text-sm leading-6 ${
                                isSelected ? "text-stone-200" : "text-stone-600"
                              }`}
                            >
                              {option.faDescription}
                            </p>
                          </div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </fieldset>

              <div className="space-y-2">
                <label className="text-sm font-medium text-stone-700" htmlFor="title">
                  عنوان ویدیو
                </label>
                <input
                  className="w-full rounded-2xl border border-stone-300 bg-stone-50 px-4 py-3 text-right outline-none transition focus:border-stone-500 focus:bg-white"
                  dir="auto"
                  id="title"
                  placeholder="مثلا: چطور ویدیوهای سفر را سینمایی ادیت می کنم"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label
                    className="text-sm font-medium text-stone-700"
                    htmlFor="description"
                  >
                    توضیحات
                  </label>
                  <span className="text-xs text-stone-500" dir="ltr">
                    {description.length}/2000
                  </span>
                </div>
                <textarea
                  className="min-h-36 w-full rounded-2xl border border-stone-300 bg-stone-50 px-4 py-3 text-right outline-none transition focus:border-stone-500 focus:bg-white"
                  dir="auto"
                  id="description"
                  maxLength={2000}
                  placeholder="توضیح بیشتری درباره ویدیو بنویسید تا تگ های دقیق تری ساخته شود."
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                />
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <button
                  className="rounded-full bg-stone-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-stone-700 disabled:cursor-not-allowed disabled:bg-stone-400"
                  disabled={isSubmitting}
                  type="submit"
                >
                  {isSubmitting ? "در حال تولید..." : "تولید تگ"}
                </button>

                {error ? (
                  <p className="text-sm text-rose-600">{error}</p>
                ) : (
                  <p className="text-sm text-stone-500">
                    {tags.length > 0
                      ? `${tags.length} تگ آماده استفاده است`
                      : "نتیجه در بخش پایین نمایش داده می شود"}
                  </p>
                )}
              </div>
            </form>

            <div className="mt-8 rounded-[1.5rem] bg-stone-950 px-5 py-6 text-stone-50">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-lg font-semibold">تگ های تولید شده</h2>
                <span className="text-xs tracking-[0.2em] text-stone-400">
                  آماده استفاده
                </span>
              </div>

              {tags.length > 0 ? (
                <div className="mt-4 flex flex-wrap gap-3">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-stone-700 bg-stone-900 px-4 py-2 text-sm text-stone-100"
                      dir="auto"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="mt-4 text-sm leading-6 text-stone-400">
                  برای دریافت تگ ها، عنوان و در صورت نیاز توضیحات ویدیو را وارد
                  کنید.
                </p>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
