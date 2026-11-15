import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    if (process.env.VERCEL_ENV !== "production") return [];
    return ["/nfc/:path*", "/api/nfc/:path*"].map(source => ({source, missing:[{type:"host" as const,value:"www.diggylessard.com"}], destination:`https://www.diggylessard.com${source}`,permanent:false}));
  },
  // Keep the isolated local PostgreSQL test runtime out of the server bundle.
  serverExternalPackages: ["@electric-sql/pglite", "kysely-pglite", "pg"],
};

export default nextConfig;
