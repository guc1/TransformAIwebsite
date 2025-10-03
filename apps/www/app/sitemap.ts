import { filterProjectPosts } from "@/lib/blog-posts";
import { env } from "@/lib/env";
import { allChangelogs, allGlossaries, allPolicies, allPosts } from "content-collections";
import type { Changelog, Glossary, Policy, Post } from "content-collections";
import type { MetadataRoute } from "next";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = new URL(env().NEXT_PUBLIC_BASE_URL);
  const origin = baseUrl.origin;

  const posts: MetadataRoute.Sitemap = filterProjectPosts(allPosts).map((post: Post) => ({
    url: `${origin}/blog/${post.slug}`,
    lastModified: post.date,
  }));

  const policies: MetadataRoute.Sitemap = allPolicies.map((policy: Policy) => ({
    url: `${origin}/policies/${policy.slug}`,
  }));

  const changelogs: MetadataRoute.Sitemap = allChangelogs.map((changelog: Changelog) => ({
    url: `${origin}/changelog#${changelog.slug}`,
    lastModified: changelog.date,
  }));

  const glossaries: MetadataRoute.Sitemap = allGlossaries.map((glossary: Glossary) => ({
    url: `${origin}/glossary/${glossary.slug}`,
    lastModified: glossary.updatedAt,
  }));

  return [
    {
      url: origin,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `${origin}/about`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.6,
    },
    {
      url: `${origin}/blog`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${origin}/changelog`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `${origin}/glossary`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    ...posts,
    ...policies,
    ...changelogs,
    ...glossaries,
  ];
}
