import { PostHog } from "posthog-node";

export const posthogServerClient = new PostHog(
  process.env.NEXT_PUBLIC_POSTHOG_KEY!,
  {
    host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://eu.posthog.com",
  }
);

/**
 * Track a server-side event (API routes, webhooks, server components).
 * Falls back to "anonymous" if no distinctId is provided.
 */
export async function trackServerEvent(
  event: string,
  properties: Record<string, unknown> = {},
  distinctId?: string
) {
  if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) return;

  posthogServerClient.capture({
    distinctId: distinctId || "anonymous",
    event,
    properties,
  });
}

/**
 * Identify a user on the server side.
 * Call this when a user logs in or registers.
 */
export async function identifyServerUser(
  distinctId: string,
  traits: Record<string, unknown> = {}
) {
  if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) return;

  posthogServerClient.identify({
    distinctId,
    properties: traits,
  });
}

/**
 * Flush all pending PostHog events.
 * Call this before the serverless function returns if you need guaranteed delivery.
 */
export async function flushPostHog() {
  if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) return;
  await posthogServerClient.flush();
}