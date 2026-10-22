import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Multi-Zone: evita conflito de chunks (/_next/static) com o projeto legado.
  // Os assets passam a ser servidos em /fleeting-static/_next/static/...
  // Apenas em produção, para não afetar o `next dev` local.
  assetPrefix:
    process.env.NODE_ENV === "production" ? "/fleeting-static" : undefined,
};

export default nextConfig;
