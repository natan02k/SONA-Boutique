"use client";

import { usePathname, useSearchParams } from "next/navigation";
import posthog from "posthog-js";
import { PostHogProvider as PHProvider } from "posthog-js/react";
import { useEffect, useRef, Suspense } from "react";
import { hasAnalyticsConsent } from "@/lib/consent";

const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://eu.posthog.com";

// Use the reverse proxy (/ingest) to bypass adblockers in production.
// Falls back to direct PostHog host if APP_URL is not set (e.g. localhost).
function getApiHost() {
  if (typeof window === "undefined") return POSTHOG_HOST;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "";
  // Only use reverse proxy when deployed (not localhost)
  if (appUrl && !appUrl.includes("localhost") && !appUrl.includes("127.0.0.1")) {
    return `${appUrl}/ingest`;
  }
  return POSTHOG_HOST;
}

function PostHogPageView() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const prevPath = useRef(pathname);

  useEffect(() => {
    if (!POSTHOG_KEY) return;
    if (!hasAnalyticsConsent()) return;
    if (prevPath.current === pathname) return;

    prevPath.current = pathname;
    const url = searchParams?.toString()
      ? `${pathname}?${searchParams.toString()}`
      : pathname;

    posthog.capture("$pageview", { $current_url: url });
  }, [pathname, searchParams]);

  return null;
}

function PostHogPageViewWrapper() {
  return (
    <Suspense fallback={null}>
      <PostHogPageView />
    </Suspense>
  );
}

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  const initialized = useRef(false);

  useEffect(() => {
    if (!POSTHOG_KEY) return;
    if (initialized.current) return;

    // Listen for consent changes
    const handleConsentUpdate = () => {
      if (hasAnalyticsConsent()) {
        if (!initialized.current) {
          posthog.init(POSTHOG_KEY, {
            api_host: getApiHost(),
            capture_pageview: false, // We handle pageviews manually
            capture_pageleave: true,
            persistence: "localStorage+cookie",
            loaded: () => {
              initialized.current = true;
              posthog.opt_in_capturing();

              // If user is logged in & consent given, identify
              const userId =
                document.cookie.includes("session") || undefined;
              // (Session identification happens in auth store)
            },
          });
        }
      } else {
        // Consent withdrawn – opt out
        if (initialized.current) {
          posthog.opt_out_capturing();
        }
      }
    };

    handleConsentUpdate();
    window.addEventListener("consent-updated", handleConsentUpdate);
    return () => window.removeEventListener("consent-updated", handleConsentUpdate);
  }, []);

  if (!POSTHOG_KEY) return <>{children}</>;

  return (
    <PHProvider client={posthog}>
      <PostHogPageViewWrapper />
      {children}
    </PHProvider>
  );
}

/**
 * Get the PostHog distinctId – call this after login to identify the user.
 */
export function getPostHogDistinctId(): string | undefined {
  if (!POSTHOG_KEY) return undefined;
  try {
    return posthog.get_distinct_id();
  } catch {
    return undefined;
  }
}

/**
 * Identify a PostHog user with their customer ID.
 */
export function identifyPostHogUser(
  userId: string,
  traits?: Record<string, unknown>
) {
  if (!POSTHOG_KEY) return;
  if (!posthog.__loaded) return;
  posthog.identify(userId, traits);
}

/**
 * Reset PostHog identity – call this on logout.
 */
export function resetPostHogIdentity() {
  if (!POSTHOG_KEY) return;
  if (!posthog.__loaded) return;
  posthog.reset();
}

/**
 * Track a client-side PostHog event.
 */
export function trackClientEvent(
  event: string,
  properties?: Record<string, unknown>
) {
  if (!POSTHOG_KEY) return;
  if (!posthog.__loaded) return;
  if (!hasAnalyticsConsent()) return;
  posthog.capture(event, properties);
}