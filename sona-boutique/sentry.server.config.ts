// This file configures the initialization of Sentry on the server.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

const dsn = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    enabled: true, // Force enable even in dev mode for testing
    tracesSampleRate: 0.1,
    // Filter PII before sending to Sentry
    beforeSend(event) {
      // Remove email addresses from event messages/tags
      if (event.message) {
        event.message = event.message.replace(/[\w.-]+@[\w.-]+\.\w+/g, "[EMAIL]");
      }
      if (event.request?.headers) {
        delete event.request.headers["Authorization"];
        delete event.request.headers["Cookie"];
      }
      return event;
    },
  });
}