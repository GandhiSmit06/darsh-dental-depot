import path from "node:path";
import type { NextConfig } from "next";

// Monorepo root (npm workspaces: Frontend + Backend).
const workspaceRoot = path.join(__dirname, "..");

const nextConfig: NextConfig = {
  // Backend/ ships TypeScript source; Next.js compiles it as part of the app.
  transpilePackages: ["@darsh/backend"],
  turbopack: { root: workspaceRoot },
  outputFileTracingRoot: workspaceRoot,
  images: {
    remotePatterns: [{ protocol: "https", hostname: "*.supabase.co" }],
  },
};

export default nextConfig;
