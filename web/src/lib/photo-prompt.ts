export type CheckStatus = "pass" | "warning" | "fail";
export type OverallStatus = "pass" | "needs_work" | "fail";

export type CheckKey =
  | "background"
  | "head_size_position"
  | "expression_eyes"
  | "lighting"
  | "obstructions"
  | "image_quality";

export interface PhotoCheckResult {
  overall: OverallStatus;
  checks: Record<CheckKey, { status: CheckStatus; note: string }>;
  fixes: string[];
}

export const CHECK_LABELS: Record<CheckKey, { en: string; zh: string }> = {
  background: { en: "Background", zh: "背景" },
  head_size_position: { en: "Head size & position", zh: "头部大小与位置" },
  expression_eyes: { en: "Expression & eyes", zh: "表情与眼睛" },
  lighting: { en: "Lighting", zh: "光线" },
  obstructions: { en: "Obstructions (glasses, hat, hair)", zh: "遮挡(眼镜、帽子、头发)" },
  image_quality: { en: "Image quality", zh: "图像质量" },
};

export const PHOTO_PROMPT = `You are evaluating a photo for a U.S. visa application (DS-160 / passport-style).

U.S. State Department requirements:
1. Plain white or off-white background, no patterns or shadows.
2. Head height 50%–69% of frame; eyes 56%–69% from bottom edge.
3. Eyes open, looking directly at camera, neutral expression (no smile showing teeth).
4. Even lighting on face, no harsh shadows on face or background.
5. No glasses (banned since 2016). No hats or head coverings (religious exceptions allowed).
6. Sharp focus, no pixelation, color photo, taken within last 6 months.
7. Full face visible, head straight (not tilted), looking forward.

Evaluate the uploaded photo against each of the six checks below. Output STRICT JSON only.

Schema:
{
  "overall": "pass" | "needs_work" | "fail",
  "checks": {
    "background":         { "status": "pass"|"warning"|"fail", "note": "<specific observation>" },
    "head_size_position": { "status": "pass"|"warning"|"fail", "note": "<specific observation>" },
    "expression_eyes":    { "status": "pass"|"warning"|"fail", "note": "<specific observation>" },
    "lighting":           { "status": "pass"|"warning"|"fail", "note": "<specific observation>" },
    "obstructions":       { "status": "pass"|"warning"|"fail", "note": "<specific observation>" },
    "image_quality":      { "status": "pass"|"warning"|"fail", "note": "<specific observation>" }
  },
  "fixes": ["<actionable fix>", "..."]
}

Calibration — VERY IMPORTANT:
You are simulating a U.S. consular officer who reviews thousands of photos. Most real selfies have small imperfections; consulates accept a wide range. Only flag what a real officer would actually reject for.

- Use "fail" ONLY for clear, definite violations: visible smile showing teeth, eyes closed, glasses worn, hat or non-religious head covering, multiple people in frame, colored or patterned background, head cropped, harsh shadow across face, severely blurry/pixelated, head turned more than slightly off-center.
- Use "warning" ONLY when there is a real but borderline issue worth mentioning (e.g. background is a slightly cream wall instead of pure white, lighting is a bit uneven, head a bit small in frame). Do NOT use "warning" for trivial cosmetic notes.
- Use "pass" liberally — if a consulate officer would accept it, mark it pass even if it's not studio-perfect.

Overall scoring:
- "pass": zero fails. Warnings are OK.
- "needs_work": exactly one fail, OR three or more warnings.
- "fail": two or more fails.

Other rules:
- "fixes" empty array when overall is "pass". Otherwise list specific actions ("retake against a plain white wall, ~3 feet away").
- Notes must be specific: "background has visible shadow on the left" — not "background has issues".
- If you genuinely can't judge a criterion, use "warning" and explain what you can't see.
- DO NOT invent details you can't see in the image.
- Output JSON only. No markdown fences, no commentary.`;

export function languageDirective(locale: "en" | "zh"): string {
  if (locale === "zh") {
    return `

LANGUAGE — IMPORTANT:
Write every "note" value and every item in the "fixes" array in Simplified Chinese (简体中文), phrased naturally for a Chinese visa applicant.
Keep ALL JSON keys and ALL enum values ("pass", "warning", "fail", "needs_work") in English exactly as specified. Do NOT translate keys or enum values.`;
  }
  return "";
}

const VALID_STATUS = new Set<CheckStatus>(["pass", "warning", "fail"]);
const VALID_OVERALL = new Set<OverallStatus>(["pass", "needs_work", "fail"]);
const REQUIRED_KEYS: CheckKey[] = [
  "background",
  "head_size_position",
  "expression_eyes",
  "lighting",
  "obstructions",
  "image_quality",
];

export function parsePhotoCheckResult(raw: string): PhotoCheckResult {
  const trimmed = raw.trim();
  const jsonStart = trimmed.indexOf("{");
  const jsonEnd = trimmed.lastIndexOf("}");
  if (jsonStart === -1 || jsonEnd === -1) {
    throw new Error("Model returned no JSON object");
  }
  const parsed = JSON.parse(trimmed.slice(jsonStart, jsonEnd + 1));

  if (!VALID_OVERALL.has(parsed.overall)) {
    throw new Error(`Invalid overall: ${parsed.overall}`);
  }
  if (!parsed.checks || typeof parsed.checks !== "object") {
    throw new Error("Missing checks object");
  }
  for (const key of REQUIRED_KEYS) {
    const c = parsed.checks[key];
    if (!c || !VALID_STATUS.has(c.status) || typeof c.note !== "string") {
      throw new Error(`Invalid or missing check: ${key}`);
    }
  }
  if (!Array.isArray(parsed.fixes)) {
    throw new Error("fixes must be an array");
  }
  return parsed as PhotoCheckResult;
}
