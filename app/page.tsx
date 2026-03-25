"use client";

import { useState, type ComponentProps } from "react";

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
  const [tags, setTags] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit: FormSubmitHandler = async (event) => {
    event.preventDefault();

    const trimmedTitle = title.trim();
    const trimmedDescription = description.trim();

    if (trimmedTitle.length < 2) {
      setError("Please enter a title with at least 2 characters.");
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
        }),
      });

      const data = (await response.json().catch(() => ({}))) as TagApiResponse;

      if (!response.ok) {
        throw new Error(data.message || "Unable to generate tags right now.");
      }

      const nextTags = extractTags(data);

      if (nextTags.length === 0) {
        throw new Error("The response did not include any usable tags.");
      }

      setTags(nextTags);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong.";
      setError(message);
      setTags([]);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#f7f1e8_0%,#f3ede2_38%,#e8dfcf_100%)] px-4 py-10 text-stone-900">
      <div className="mx-auto flex max-w-5xl flex-col gap-8 lg:flex-row">
        <section className="lg:w-2/5">
          <p className="text-sm uppercase tracking-[0.3em] text-stone-500">
            AI Video Tags
          </p>
          <h1 className="mt-3 font-serif text-4xl leading-tight sm:text-5xl">
            Turn a title and description into publish-ready tags.
          </h1>
          <p className="mt-4 max-w-xl text-base leading-7 text-stone-600">
            Paste your video details, generate a focused set of tags, and use
            them directly in your UI.
          </p>
        </section>

        <section className="lg:w-3/5">
          <div className="rounded-[2rem] border border-stone-200/70 bg-white/80 p-6 shadow-[0_20px_80px_rgba(120,94,56,0.12)] backdrop-blur">
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label className="text-sm font-medium text-stone-700" htmlFor="title">
                  Video title
                </label>
                <input
                  className="w-full rounded-2xl border border-stone-300 bg-stone-50 px-4 py-3 outline-none transition focus:border-stone-500 focus:bg-white"
                  id="title"
                  placeholder="How I edit cinematic travel videos"
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
                    Description
                  </label>
                  <span className="text-xs text-stone-500">
                    {description.length}/2000
                  </span>
                </div>
                <textarea
                  className="min-h-36 w-full rounded-2xl border border-stone-300 bg-stone-50 px-4 py-3 outline-none transition focus:border-stone-500 focus:bg-white"
                  id="description"
                  maxLength={2000}
                  placeholder="Add context about the video so the generated tags are more specific."
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
                  {isSubmitting ? "Generating..." : "Generate tags"}
                </button>

                {error ? (
                  <p className="text-sm text-rose-600">{error}</p>
                ) : (
                  <p className="text-sm text-stone-500">
                    {tags.length > 0
                      ? `${tags.length} tags ready to use`
                      : "Results will appear below"}
                  </p>
                )}
              </div>
            </form>

            <div className="mt-8 rounded-[1.5rem] bg-stone-950 px-5 py-6 text-stone-50">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-lg font-semibold">Generated tags</h2>
                <span className="text-xs uppercase tracking-[0.2em] text-stone-400">
                  DOM ready
                </span>
              </div>

              {tags.length > 0 ? (
                <div className="mt-4 flex flex-wrap gap-3">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-stone-700 bg-stone-900 px-4 py-2 text-sm text-stone-100"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="mt-4 text-sm leading-6 text-stone-400">
                  Submit a title and optional description to generate a clean
                  set of tags.
                </p>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
