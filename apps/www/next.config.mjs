import { withContentCollections } from "@content-collections/next";
import withBundleAnalyzer from "@next/bundle-analyzer";
import createNextIntlPlugin from "next-intl/plugin";

const securityHeaders = [
  {
    key: "X-Frame-Options",
    value: "SAMEORIGIN",
  },
];

const withAnalyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});
const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

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
        source: "/:path*",
        has: [
          { type: "host", value: "transformai.nl" },
          { type: "header", key: "x-forwarded-proto", value: "http" },
        ],
        destination: "https://transformai.nl/:path*",
        permanent: true,
      },
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.transformai.nl" }],
        destination: "https://transformai.nl/:path*",
        permanent: true,
      },
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
const contentConfig = withContentCollections(analyzedConfig);

export default withNextIntl(contentConfig);
