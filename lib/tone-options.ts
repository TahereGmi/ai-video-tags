export const TONE_OPTIONS = [
  {
    id: "educational",
    label: "Educational",
    faLabel: "آموزشی",
    description: "Clear, searchable tags for tutorials and explainers.",
    faDescription: "تگ های واضح و قابل جست وجو برای آموزش ها و ویدیوهای توضیحی.",
    promptHint:
      "Favor clear, specific, search-friendly tags for tutorial and explainer content.",
  },
  {
    id: "viral",
    label: "Viral",
    faLabel: "وایرال",
    description: "Catchy tags built for curiosity and social reach.",
    faDescription: "تگ های جذاب برای برانگیختن کنجکاوی و افزایش دیده شدن در شبکه های اجتماعی.",
    promptHint:
      "Favor catchy, curiosity-driven tags that still stay relevant to the topic.",
  },
  {
    id: "professional",
    label: "Professional",
    faLabel: "حرفه ای",
    description: "Polished tags for business, portfolio, or brand content.",
    faDescription: "تگ های حرفه ای و دقیق برای محتوای تجاری، برند یا نمونه کار.",
    promptHint:
      "Favor polished, credible tags suitable for business, portfolio, or brand-focused content.",
  },
  {
    id: "entertainment",
    label: "Entertainment",
    faLabel: "سرگرمی",
    description: "Fun, energetic tags for personality-driven content.",
    faDescription: "تگ های پرانرژی و سرگرم کننده برای محتوای فان و شخصیت محور.",
    promptHint:
      "Favor lively, audience-friendly tags suited for fun, casual, or personality-led videos.",
  },
  {
    id: "technical",
    label: "Technical",
    faLabel: "فنی",
    description: "Precise tags for tools, workflows, and deeper expertise.",
    faDescription: "تگ های دقیق برای ابزارها، فرایندها و محتوای تخصصی تر.",
    promptHint:
      "Favor precise, domain-specific tags that reflect tools, workflows, and technical depth.",
  },
] as const;

export type ToneId = (typeof TONE_OPTIONS)[number]["id"];

export const DEFAULT_TONE: ToneId = "educational";

export function isToneId(value: unknown): value is ToneId {
  return TONE_OPTIONS.some((option) => option.id === value);
}

export function getToneOption(tone: ToneId) {
  return TONE_OPTIONS.find((option) => option.id === tone) ?? TONE_OPTIONS[0];
}
