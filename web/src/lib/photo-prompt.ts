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
  obstructions: { en: "Glasses, hats & devices", zh: "眼镜、帽子与设备" },
  image_quality: { en: "Image quality", zh: "图像质量" },
};

export const DIMENSION_LABEL = { en: "Size & pixels", zh: "尺寸与像素" };

// Deterministic — the LLM cannot measure pixels. CEAC requires a square
// image between 600x600 and 1200x1200.
export function evaluateDimensions(
  width: number,
  height: number,
  locale: "en" | "zh",
): { status: CheckStatus; note: string } {
  const dim = `${width}×${height}px`;
  if (width !== height) {
    return {
      status: "fail",
      note:
        locale === "zh"
          ? `图片为 ${dim}，不是正方形。请裁剪为 1:1 正方形，边长 600–1200 像素。`
          : `Image is ${dim} — not square. Crop to a 1:1 square between 600×600 and 1200×1200 pixels.`,
    };
  }
  if (width < 600) {
    return {
      status: "fail",
      note:
        locale === "zh"
          ? `图片为 ${dim}，太小。最小要求 600×600 像素。`
          : `Image is ${dim} — too small. Minimum is 600×600 pixels.`,
    };
  }
  if (width > 1200) {
    return {
      status: "warning",
      note:
        locale === "zh"
          ? `图片为 ${dim}，超过 1200×1200 上限。上传 CEAC 前请缩小到 600–1200 像素。`
          : `Image is ${dim} — above the 1200×1200 maximum. Resize to 600–1200px before uploading to CEAC.`,
    };
  }
  return {
    status: "pass",
    note:
      locale === "zh"
        ? `图片为 ${dim}，正方形且在 600–1200 像素范围内。`
        : `Image is ${dim} — square and within the 600–1200px range.`,
  };
}

export const PHOTO_PROMPT = `You are evaluating a photo for a U.S. visa application (DS-160 / passport-style).

Official U.S. Department of State photo requirements (travel.state.gov). Each maps to one of the six checks:

BACKGROUND
- Plain white or off-white background only. No patterns, objects, or other people. No shadows cast on the background.

HEAD_SIZE_POSITION
- Square image (height = width). Full head visible from top of hair to bottom of chin, centered.
- Head height 50%–69% of total image height. Eyes 56%–69% of image height measured from the bottom.
- Full-face view, directly facing the camera; head not tilted or turned.

EXPRESSION_EYES
- Neutral facial expression (no smile showing teeth), both eyes open and clearly visible, looking directly at the camera.

LIGHTING
- Even lighting on the face. No harsh shadows on the face. No shadow cast on the background.

OBSTRUCTIONS
- No eyeglasses (prohibited since Nov 1, 2016; only a rare signed-medical exception, and even then frames must not cover the eyes and there must be no glare/shadow/refraction obscuring the eyes).
- No hat or head covering that obscures hair or hairline — UNLESS worn daily for religious purposes, in which case the full face must still be visible and the covering must cast no shadow on the face.
- No headphones, wireless hands-free devices, or similar items. (Hearing devices ARE allowed.)
- Everyday clothing only; no uniforms (daily religious clothing is allowed).

IMAGE_QUALITY
- Color photo, sharp focus, no pixelation, taken within the last 6 months reflecting current appearance.

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

- Use "fail" ONLY for clear, definite violations: eyeglasses worn, hat/non-religious head covering obscuring hair, headphones or hands-free device visible, visible smile showing teeth, eyes closed or not visible, multiple people in frame, colored/patterned background, black-and-white photo, head cropped (top of hair or chin cut off), harsh shadow across the face, severely blurry/pixelated, or head clearly turned/tilted away from camera.
- Use "warning" for real but borderline issues (background slightly cream rather than pure white, lighting a little uneven, head appears somewhat small/large in frame, mild head tilt). Do NOT use "warning" for trivial cosmetic notes.
- Use "pass" liberally — if a consular officer would accept it, mark it pass even if not studio-perfect.
- HEAD SIZE/POSITION: you cannot measure pixels exactly. Only "fail" if the head is clearly cropped or grossly out of range (fills the whole frame, or is a tiny portion of it). If it looks roughly within the 50–69% range, "pass". Borderline → "warning".

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
