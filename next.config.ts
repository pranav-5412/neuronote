import type { NextConfig } from "next";
const config: NextConfig = {
  allowedDevOrigins: ["127.0.0.1"],
  serverExternalPackages: ["pdfjs-dist"],
  outputFileTracingIncludes: {
    "/api/documents/*": [
      "./scripts/pdf-extract-worker.mjs",
      "./node_modules/pdfjs-dist/legacy/build/*.mjs",
    ],
  },
};
export default config;
