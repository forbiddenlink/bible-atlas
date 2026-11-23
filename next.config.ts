import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs/config";
import path from "node:path";

const nextConfig: NextConfig = {
  turbopack: { root: path.resolve(import.meta.dirname) },
};

export default withSentryConfig(nextConfig, {
  org: "imkindageeky",
  project: "bible-atlas",
  silent: !process.env.CI,
  widenClientFileUpload: true,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  // Same-origin tunnel so ad blockers do not drop reports.
  tunnelRoute: "/monitoring",
  // Source maps upload only when a token exists; the build passes without one.
  sourcemaps: {
    disable: !process.env.SENTRY_AUTH_TOKEN,
    deleteSourcemapsAfterUpload: true,
  },
});
