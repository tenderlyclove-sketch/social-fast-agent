import type { NextConfig } from "next";

// In the Base44 sandbox the app is served through a preview proxy on a
// different public origin, and Next.js blocks cross-origin dev asset/HMR
// requests by default. Allow that one origin only while previewing.
// BASE44_PREVIEW_MODE is "1" exclusively in the Base44 sandbox; when it is
// unset or any other value the original behavior is preserved.
const previewHostSuffix = process.env.BASE44_PUBLIC_HOST_SUFFIX;
const isBase44Preview =
  process.env.BASE44_PREVIEW_MODE === "1" && Boolean(previewHostSuffix);

const nextConfig: NextConfig = {
  ...(isBase44Preview
    ? { allowedDevOrigins: [`3000-${previewHostSuffix}`] }
    : {}),
};

export default nextConfig;
