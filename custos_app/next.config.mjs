import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Only for local monorepos (parent lockfiles). On Vercel it can duplicate path
// segments and break the deployer's lookup of `.next/*manifest*.json`.
const outputFileTracingRoot =
  process.env.VERCEL !== "1" ? path.join(__dirname, "..") : undefined;

/** @type {import('next').NextConfig} */
const securityHeaders = [
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      // Vercel Preview injects feedback from vercel.live; without this, the toolbar logs CSP violations only.
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://vercel.live",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com data:",
      "img-src 'self' data: blob:",
      "connect-src 'self' https://vercel.live https://*.vercel.live wss://*.vercel.live",
      "frame-ancestors 'self'",
    ].join("; "),
  },
];

const nextConfig = {
  ...(outputFileTracingRoot ? { outputFileTracingRoot } : {}),
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
