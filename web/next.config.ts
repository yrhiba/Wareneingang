import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /*
   * The two Montserrat files the PDF writer embeds are read off disk at request
   * time and nothing imports them, so tracing cannot see them: a deployed build
   * would ship the route without its fonts and 500 on the first download.
   *
   * The brackets are escaped because the key is matched as a glob against the
   * route path, and `[doc]` would otherwise read as a character class.
   */
  outputFileTracingIncludes: {
    "/documents/\\[doc\\]": ["src/lib/pdf/fonts/*.ttf"],
  },
};

export default nextConfig;
