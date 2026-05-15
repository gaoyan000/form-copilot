"use client";

import { useCallback, useRef, useState } from "react";
import {
  CHECK_LABELS,
  DIMENSION_LABEL,
  evaluateDimensions,
  type CheckKey,
  type CheckStatus,
  type PhotoCheckResult,
} from "@/lib/photo-prompt";
import { STRINGS, SOURCE_URL, type Locale } from "@/lib/i18n";
import { track } from "@/lib/analytics";

const MAX_BYTES = 8 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

interface CheckResult {
  status: CheckStatus;
  note: string;
}

async function measureDimensions(
  file: File,
  locale: Locale,
): Promise<CheckResult> {
  try {
    const bitmap = await createImageBitmap(file);
    const result = evaluateDimensions(bitmap.width, bitmap.height, locale);
    bitmap.close();
    return result;
  } catch {
    return {
      status: "warning",
      note:
        locale === "zh"
          ? "无法读取图片尺寸。"
          : "Could not read image dimensions.",
    };
  }
}

type Phase =
  | { kind: "idle" }
  | { kind: "preview"; previewUrl: string; file: File }
  | { kind: "loading"; previewUrl: string }
  | {
      kind: "result";
      previewUrl: string;
      result: PhotoCheckResult;
      dimensions: CheckResult;
    }
  | { kind: "error"; previewUrl: string | null; message: string };

const STATUS_STYLES: Record<CheckStatus, string> = {
  pass: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  warning: "bg-amber-50 text-amber-700 ring-amber-200",
  fail: "bg-rose-50 text-rose-700 ring-rose-200",
};

const STATUS_DOT: Record<CheckStatus, string> = {
  pass: "bg-emerald-500",
  warning: "bg-amber-500",
  fail: "bg-rose-500",
};

export default function PhotoCheckerPage() {
  const [locale, setLocale] = useState<Locale>("en");
  const [phase, setPhase] = useState<Phase>({ kind: "idle" });
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const t = STRINGS[locale];

  const reset = useCallback(() => {
    setPhase((prev) => {
      if (prev.kind !== "idle" && "previewUrl" in prev && prev.previewUrl) {
        URL.revokeObjectURL(prev.previewUrl);
      }
      return { kind: "idle" };
    });
    if (inputRef.current) inputRef.current.value = "";
  }, []);

  const handleFile = useCallback(
    async (file: File) => {
      if (!ALLOWED_TYPES.has(file.type)) {
        setPhase({ kind: "error", previewUrl: null, message: t.badType });
        return;
      }
      if (file.size > MAX_BYTES) {
        setPhase({ kind: "error", previewUrl: null, message: t.fileTooBig });
        return;
      }
      const previewUrl = URL.createObjectURL(file);
      setPhase({ kind: "loading", previewUrl });
      track("photo_uploaded", { locale });

      const dimensionsPromise = measureDimensions(file, locale);

      const fd = new FormData();
      fd.append("photo", file);
      fd.append("locale", locale);
      try {
        const res = await fetch("/api/check-photo", {
          method: "POST",
          body: fd,
        });
        if (!res.ok) {
          const body = (await res.json().catch(() => ({}))) as {
            error?: string;
            detail?: string;
          };
          const top = body.error ?? `Server error (${res.status})`;
          const message = body.detail ? `${top}: ${body.detail}` : top;
          track("check_error", { stage: "http", status: res.status, locale });
          setPhase({ kind: "error", previewUrl, message });
          return;
        }
        const result = (await res.json()) as PhotoCheckResult;
        const dimensions = await dimensionsPromise;
        track("check_completed", {
          overall: result.overall,
          dimensions: dimensions.status,
          locale,
        });
        setPhase({ kind: "result", previewUrl, result, dimensions });
      } catch (err) {
        const message = err instanceof Error ? err.message : "Network error";
        track("check_error", { stage: "network", locale });
        setPhase({ kind: "error", previewUrl, message });
      }
    },
    [locale, t.badType, t.fileTooBig],
  );

  return (
    <div className="flex flex-col flex-1">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <div>
            <div className="text-sm font-semibold tracking-tight">
              {t.brand}
            </div>
            <div className="text-xs text-zinc-500">{t.navTagline}</div>
          </div>
          <div className="flex items-center gap-1 rounded-full bg-zinc-100 p-1 text-xs font-medium">
            <button
              type="button"
              onClick={() => setLocale("en")}
              className={`rounded-full px-3 py-1 transition ${
                locale === "en" ? "bg-white shadow-sm" : "text-zinc-500"
              }`}
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => setLocale("zh")}
              className={`rounded-full px-3 py-1 transition ${
                locale === "zh" ? "bg-white shadow-sm" : "text-zinc-500"
              }`}
            >
              中文
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-10 px-6 py-12">
        <section className="space-y-3 text-center sm:text-left">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            {t.heroHeading}
          </h1>
          <p className="max-w-2xl text-zinc-600">{t.heroSub}</p>
        </section>

        {phase.kind === "idle" && (
          <div className="space-y-3">
            <UploadZone
              t={t}
              dragOver={dragOver}
              setDragOver={setDragOver}
              inputRef={inputRef}
              onFile={handleFile}
            />
            <p className="text-center text-xs text-zinc-500">
              {t.privacyNote}
            </p>
          </div>
        )}

        {phase.kind === "loading" && (
          <ResultLayout previewUrl={phase.previewUrl}>
            <LoadingPanel label={t.analyzing} />
          </ResultLayout>
        )}

        {phase.kind === "result" && (
          <>
            <ResultLayout previewUrl={phase.previewUrl}>
              <ResultPanel
                locale={locale}
                result={phase.result}
                dimensions={phase.dimensions}
                t={t}
              />
            </ResultLayout>
            <FeedbackWidget overall={phase.result.overall} t={t} />
            <EmailCapture t={t} />
            <div className="text-center">
              <button
                type="button"
                onClick={reset}
                className="rounded-full bg-zinc-900 px-5 py-2 text-sm font-medium text-white hover:bg-zinc-700"
              >
                {t.uploadAgain}
              </button>
            </div>
          </>
        )}

        {phase.kind === "error" && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-6">
            <div className="text-sm font-semibold text-rose-800">
              {t.errorTitle}
            </div>
            <p className="mt-1 text-sm text-rose-700">{phase.message}</p>
            <button
              type="button"
              onClick={reset}
              className="mt-3 rounded-full bg-rose-900 px-4 py-1.5 text-sm font-medium text-white hover:bg-rose-700"
            >
              {t.retry}
            </button>
          </div>
        )}

        <section className="rounded-2xl bg-white p-6 ring-1 ring-zinc-200">
          <h2 className="text-sm font-semibold text-zinc-900">{t.reqsTitle}</h2>
          <ul className="mt-3 space-y-1.5 text-sm text-zinc-600">
            {t.reqs.map((r) => (
              <li key={r} className="flex gap-2">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-400" />
                <span>{r}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 border-t border-zinc-100 pt-3 text-xs text-zinc-500">
            {t.sourceLabel}{" "}
            <a
              href={SOURCE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-zinc-700 underline underline-offset-2 hover:text-zinc-900"
            >
              {t.sourceLinkText}
            </a>
          </p>
        </section>
      </main>

      <footer className="border-t border-zinc-200 bg-white">
        <div className="mx-auto max-w-4xl px-6 py-6 text-xs text-zinc-500">
          {t.disclaimer}
        </div>
      </footer>
    </div>
  );
}

interface UploadZoneProps {
  t: (typeof STRINGS)[Locale];
  dragOver: boolean;
  setDragOver: (v: boolean) => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
  onFile: (file: File) => void;
}

function UploadZone({
  t,
  dragOver,
  setDragOver,
  inputRef,
  onFile,
}: UploadZoneProps) {
  return (
    <label
      htmlFor="photo-input"
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        const f = e.dataTransfer.files?.[0];
        if (f) onFile(f);
      }}
      className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-12 text-center transition cursor-pointer ${
        dragOver
          ? "border-zinc-900 bg-zinc-100"
          : "border-zinc-300 bg-white hover:border-zinc-500"
      }`}
    >
      <div className="rounded-full bg-zinc-900 px-5 py-2 text-sm font-medium text-white">
        {t.uploadCta}
      </div>
      <p className="mt-3 text-sm text-zinc-600">{t.uploadDrop}</p>
      <p className="mt-1 text-xs text-zinc-400">{t.uploadHint}</p>
      <input
        ref={inputRef}
        id="photo-input"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onFile(f);
        }}
      />
    </label>
  );
}

interface ResultLayoutProps {
  previewUrl: string;
  children: React.ReactNode;
}

function ResultLayout({ previewUrl, children }: ResultLayoutProps) {
  return (
    <div className="grid gap-6 sm:grid-cols-[minmax(0,260px)_1fr]">
      <div className="overflow-hidden rounded-2xl bg-white ring-1 ring-zinc-200">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={previewUrl}
          alt="Uploaded photo"
          className="aspect-square w-full object-cover"
        />
      </div>
      <div>{children}</div>
    </div>
  );
}

interface LoadingPanelProps {
  label: string;
}

function LoadingPanel({ label }: LoadingPanelProps) {
  return (
    <div className="flex h-full min-h-[260px] items-center justify-center rounded-2xl bg-white p-6 ring-1 ring-zinc-200">
      <div className="flex items-center gap-3 text-sm text-zinc-600">
        <span className="h-2 w-2 animate-pulse rounded-full bg-zinc-400" />
        {label}
      </div>
    </div>
  );
}

interface ResultPanelProps {
  locale: Locale;
  result: PhotoCheckResult;
  dimensions: CheckResult;
  t: (typeof STRINGS)[Locale];
}

function ResultPanel({ locale, result, dimensions, t }: ResultPanelProps) {
  // A dimensions "fail" (non-square / too small) is a hard CEAC blocker, so
  // escalate the LLM's verdict if it was more lenient.
  const effectiveOverall: PhotoCheckResult["overall"] =
    dimensions.status === "fail" && result.overall === "pass"
      ? "needs_work"
      : result.overall;

  const overallLabel =
    effectiveOverall === "pass"
      ? t.overallPass
      : effectiveOverall === "needs_work"
        ? t.overallNeedsWork
        : t.overallFail;
  const overallStatus: CheckStatus =
    effectiveOverall === "pass"
      ? "pass"
      : effectiveOverall === "needs_work"
        ? "warning"
        : "fail";

  const checkKeys = Object.keys(result.checks) as CheckKey[];
  const allFixes =
    dimensions.status === "pass"
      ? result.fixes
      : [dimensions.note, ...result.fixes];

  return (
    <div className="space-y-5">
      <div
        className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium ring-1 ring-inset ${STATUS_STYLES[overallStatus]}`}
      >
        <span className={`h-2 w-2 rounded-full ${STATUS_DOT[overallStatus]}`} />
        {overallLabel}
      </div>

      <div className="overflow-hidden rounded-2xl bg-white ring-1 ring-zinc-200">
        <ul className="divide-y divide-zinc-100">
          <li className="flex gap-3 px-4 py-3">
            <span
              className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${STATUS_DOT[dimensions.status]}`}
            />
            <div className="flex-1">
              <div className="text-sm font-medium text-zinc-900">
                {DIMENSION_LABEL[locale]}
              </div>
              <div className="mt-0.5 text-sm text-zinc-600">
                {dimensions.note}
              </div>
            </div>
          </li>
          {checkKeys.map((key) => {
            const c = result.checks[key];
            const label = CHECK_LABELS[key][locale];
            return (
              <li key={key} className="flex gap-3 px-4 py-3">
                <span
                  className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${STATUS_DOT[c.status]}`}
                />
                <div className="flex-1">
                  <div className="text-sm font-medium text-zinc-900">
                    {label}
                  </div>
                  <div className="mt-0.5 text-sm text-zinc-600">{c.note}</div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="rounded-2xl bg-white p-4 ring-1 ring-zinc-200">
        <div className="text-sm font-semibold text-zinc-900">
          {t.fixesTitle}
        </div>
        {allFixes.length === 0 ? (
          <p className="mt-2 text-sm text-zinc-600">{t.noFixes}</p>
        ) : (
          <ul className="mt-2 space-y-1.5 text-sm text-zinc-700">
            {allFixes.map((fix) => (
              <li key={fix} className="flex gap-2">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-400" />
                <span>{fix}</span>
              </li>
            ))}
          </ul>
        )}
        <p className="mt-4 border-t border-zinc-100 pt-3 text-xs text-zinc-500">
          {t.sourceLabel}{" "}
          <a
            href={SOURCE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-zinc-700 underline underline-offset-2 hover:text-zinc-900"
          >
            {t.sourceLinkText}
          </a>
        </p>
      </div>
    </div>
  );
}

interface FeedbackWidgetProps {
  overall: PhotoCheckResult["overall"];
  t: (typeof STRINGS)[Locale];
}

function FeedbackWidget({ overall, t }: FeedbackWidgetProps) {
  const [rating, setRating] = useState<"up" | "down" | null>(null);
  const [comment, setComment] = useState("");
  const [sent, setSent] = useState(false);

  if (sent) {
    return (
      <div className="rounded-2xl bg-white p-4 text-sm text-zinc-600 ring-1 ring-zinc-200">
        {t.feedbackThanks}
      </div>
    );
  }

  const submit = (finalRating: "up" | "down") => {
    track("photo_feedback", {
      rating: finalRating,
      comment: comment.trim() || undefined,
      overall,
    });
    setSent(true);
  };

  return (
    <div className="rounded-2xl bg-white p-4 ring-1 ring-zinc-200">
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm font-medium text-zinc-900">
          {t.feedbackPrompt}
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setRating("up")}
            className={`rounded-full px-3 py-1 text-sm ring-1 transition ${
              rating === "up"
                ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                : "text-zinc-600 ring-zinc-200 hover:bg-zinc-50"
            }`}
          >
            {t.feedbackUp}
          </button>
          <button
            type="button"
            onClick={() => setRating("down")}
            className={`rounded-full px-3 py-1 text-sm ring-1 transition ${
              rating === "down"
                ? "bg-rose-50 text-rose-700 ring-rose-200"
                : "text-zinc-600 ring-zinc-200 hover:bg-zinc-50"
            }`}
          >
            {t.feedbackDown}
          </button>
        </div>
      </div>
      {rating !== null && (
        <div className="mt-3 space-y-2">
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder={t.feedbackCommentPlaceholder}
            rows={2}
            maxLength={1000}
            className="w-full rounded-lg border border-zinc-200 p-2 text-sm outline-none focus:border-zinc-400"
          />
          <button
            type="button"
            onClick={() => submit(rating)}
            className="rounded-full bg-zinc-900 px-4 py-1.5 text-sm font-medium text-white hover:bg-zinc-700"
          >
            {t.feedbackSubmit}
          </button>
        </div>
      )}
    </div>
  );
}

interface EmailCaptureProps {
  t: (typeof STRINGS)[Locale];
}

function EmailCapture({ t }: EmailCaptureProps) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<
    "idle" | "submitting" | "done" | "error" | "invalid"
  >("idle");

  if (state === "done") {
    return (
      <div className="rounded-2xl bg-white p-4 text-sm text-zinc-600 ring-1 ring-zinc-200">
        {t.emailThanks}
      </div>
    );
  }

  const submit = async () => {
    const trimmed = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setState("invalid");
      return;
    }
    setState("submitting");
    try {
      const res = await fetch("/api/capture-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed }),
      });
      if (!res.ok) {
        setState("error");
        return;
      }
      track("email_captured");
      setState("done");
    } catch {
      setState("error");
    }
  };

  return (
    <div className="rounded-2xl bg-white p-4 ring-1 ring-zinc-200">
      <p className="text-sm text-zinc-700">{t.emailPrompt}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (state === "invalid" || state === "error") setState("idle");
          }}
          placeholder={t.emailPlaceholder}
          className="min-w-0 flex-1 rounded-lg border border-zinc-200 p-2 text-sm outline-none focus:border-zinc-400"
        />
        <button
          type="button"
          onClick={submit}
          disabled={state === "submitting"}
          className="rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50"
        >
          {t.emailSubmit}
        </button>
      </div>
      {state === "invalid" && (
        <p className="mt-2 text-xs text-rose-600">{t.emailInvalid}</p>
      )}
      {state === "error" && (
        <p className="mt-2 text-xs text-rose-600">{t.emailError}</p>
      )}
    </div>
  );
}
