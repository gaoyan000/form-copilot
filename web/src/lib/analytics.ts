import posthog from "posthog-js";

let ready = false;

export function initAnalytics(): void {
  if (ready) return;
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (!key) return;
  posthog.init(key, {
    api_host:
      process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com",
    capture_pageview: true,
    capture_pageleave: true,
    person_profiles: "identified_only",
  });
  ready = true;
}

type EventName =
  | "photo_uploaded"
  | "check_completed"
  | "check_error"
  | "photo_feedback"
  | "email_captured";

export function track(
  event: EventName,
  props?: Record<string, unknown>,
): void {
  if (!ready) return;
  posthog.capture(event, props);
}
