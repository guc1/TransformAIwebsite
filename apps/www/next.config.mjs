import { withContentCollections } from "@content-collections/next";
import withBundleAnalyzer from "@next/bundle-analyzer";

const securityHeaders = [
  {
    key: "X-Frame-Options",
    value: "SAMEORIGIN",
  },
];

const withAnalyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

/** @type {import('next').NextConfig} */
const baseConfig = {
  pageExtensions: ["tsx", "mdx", "ts", "js"],
  reactStrictMode: true,
  swcMinify: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: "/changelog/:slug",
        destination: "/changelog#:slug",
      },
      {
        source: "/docs",
        destination: "https://unkey.mintlify.dev/docs",
      },
      {
        source: "/docs/:match*",
        destination: "https://unkey.mintlify.dev/docs/:match*",
      },
      {
        source: "/terms",
        destination: "/policies/terms",
      },
      {
        source: "/api/c15t/:path*",
        destination: `${process.env.NEXT_PUBLIC_C15T_URL ?? ""}/:path*`,
      },
    ];
  },
  async redirects() {
    return [
      {
        source: "/discord",
        destination: "https://discord.gg/fDbezjbJbD",
        permanent: false,
      },
      {
        source: "/github",
        destination: "https://github.com/unkeyed/unkey",
        permanent: false,
      },
      {
        source: "/meet",
        destination: "https://cal.com/team/unkey",
        permanent: false,
      },
    ];
  },
};

const analyzedConfig = withAnalyzer(baseConfig);

export default withContentCollections(analyzedConfig);
