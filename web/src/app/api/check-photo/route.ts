import OpenAI from "openai";
import {
  PHOTO_PROMPT,
  languageDirective,
  parsePhotoCheckResult,
} from "@/lib/photo-prompt";

const MAX_BYTES = 8 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export async function POST(request: Request) {
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return Response.json(
      { error: "Expected multipart/form-data" },
      { status: 400 },
    );
  }

  const photo = formData.get("photo");
  if (!(photo instanceof File)) {
    return Response.json({ error: "Missing photo field" }, { status: 400 });
  }
  const locale = formData.get("locale") === "zh" ? "zh" : "en";
  if (!ALLOWED_TYPES.has(photo.type)) {
    return Response.json(
      { error: `Unsupported type: ${photo.type}. Use JPEG, PNG, or WebP.` },
      { status: 400 },
    );
  }
  if (photo.size > MAX_BYTES) {
    return Response.json(
      { error: `File too large (${photo.size} bytes). Max ${MAX_BYTES}.` },
      { status: 400 },
    );
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return Response.json(
      { error: "Server not configured (missing OPENAI_API_KEY)" },
      { status: 500 },
    );
  }

  const arrayBuffer = await photo.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString("base64");
  const dataUrl = `data:${photo.type};base64,${base64}`;

  const client = new OpenAI({ apiKey });

  let completion;
  try {
    completion = await client.chat.completions.create({
      model: "gpt-5.4-mini",
      max_completion_tokens: 2048,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: PHOTO_PROMPT + languageDirective(locale),
            },
            { type: "image_url", image_url: { url: dataUrl } },
          ],
        },
      ],
    });
  } catch (err) {
    const detail = err instanceof Error ? err.message : "unknown";
    return Response.json(
      { error: "Vision API error", detail },
      { status: 502 },
    );
  }

  const raw = completion.choices[0]?.message?.content;
  if (!raw) {
    return Response.json(
      { error: "Empty response from vision API" },
      { status: 502 },
    );
  }

  try {
    const result = parsePhotoCheckResult(raw);
    return Response.json(result);
  } catch (err) {
    const detail = err instanceof Error ? err.message : "unknown";
    return Response.json(
      { error: "Could not parse vision output", detail, raw },
      { status: 502 },
    );
  }
}
