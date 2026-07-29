// This file configures the initialization of Sentry for edge features (middleware).
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

const dsn = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    enabled: true, // Force enable even in dev mode for testing
    tracesSampleRate: 0.1,
  });
}