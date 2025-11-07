const path = require('node:path');
const fs = require('node:fs');
const { execSync } = require('node:child_process');

/** @type {import('next-sitemap').IConfig} */
const siteUrl = 'https://transformai.nl';

const repoRoot = path.join(__dirname, '..', '..');
const siteRoot = path.join(__dirname, 'app', '[locale]', '(site)');
const supportedLocales = ['en', 'nl'];

function normalizePathname(pathname) {
  if (!pathname || pathname === '/') {
    return '/';
  }

  const trimmed = pathname.endsWith('/') && pathname !== '/' ? pathname.slice(0, -1) : pathname;
  return trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
}

function stripLocalePrefix(pathname) {
  const normalized = normalizePathname(pathname);
  const segments = normalized.split('/').filter(Boolean);

  if (segments.length === 0) {
    return '/';
  }

  if (supportedLocales.includes(segments[0])) {
    segments.shift();
  }

  if (segments.length === 0) {
    return '/';
  }

  return `/${segments.join('/')}`;
}

function resolveRouteDirectory(baseDir, segments) {
  if (segments.length === 0) {
    return baseDir;
  }

  const [head, ...tail] = segments;
  const staticCandidate = path.join(baseDir, head);

  if (fs.existsSync(staticCandidate) && fs.lstatSync(staticCandidate).isDirectory()) {
    return resolveRouteDirectory(staticCandidate, tail);
  }

  if (!fs.existsSync(baseDir)) {
    return baseDir;
  }

  const dynamicDirectories = fs
    .readdirSync(baseDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && entry.name.startsWith('['));

  for (const entry of dynamicDirectories) {
    const resolved = resolveRouteDirectory(path.join(baseDir, entry.name), tail);
    if (resolved) {
      return resolved;
    }
  }

  return baseDir;
}

function resolveRouteModule(pathname) {
  if (pathname === '/') {
    return path.join(siteRoot, 'page.tsx');
  }

  const segments = pathname.split('/').filter(Boolean);
  const routeDir = resolveRouteDirectory(siteRoot, segments);
  const candidates = [
    path.join(routeDir, 'page.tsx'),
    path.join(routeDir, 'page.ts'),
    path.join(routeDir, 'page.jsx'),
    path.join(routeDir, 'page.js'),
    path.join(routeDir, 'route.tsx'),
    path.join(routeDir, 'route.ts'),
    path.join(routeDir, 'layout.tsx'),
    path.join(routeDir, 'layout.ts'),
    routeDir,
  ];

  return candidates.find((candidate) => fs.existsSync(candidate)) ?? routeDir;
}

function getLastModifiedISO(pathname) {
  try {
    const target = resolveRouteModule(pathname);
    const relativeTarget = path.relative(repoRoot, target) || '.';
    const lastCommit = execSync(`git log -1 --format=%cI -- "${relativeTarget}"`, {
      cwd: repoRoot,
      stdio: ['ignore', 'pipe', 'ignore'],
    })
      .toString()
      .trim();

    if (lastCommit) {
      return lastCommit;
    }
  } catch (error) {
    // fall through to default ISO timestamp
  }

  return new Date().toISOString();
}

function buildAlternateRefs(localeLessPathname) {
  const canonicalPath = localeLessPathname === '/' ? '' : localeLessPathname;
  const englishPath = `/en${localeLessPathname === '/' ? '' : localeLessPathname}`;

  return [
    { href: `${siteUrl}${canonicalPath}`, hreflang: 'nl' },
    { href: `${siteUrl}${englishPath}`, hreflang: 'en' },
    { href: `${siteUrl}${canonicalPath}`, hreflang: 'x-default' },
  ];
}

module.exports = {
  siteUrl,
  generateRobotsTxt: true,
  sitemapSize: 5000,
  changefreq: 'weekly',
  priority: 0.7,
  transform: async (config, pathValue) => {
    const url = new URL(pathValue, config.siteUrl);
    const normalizedPath = normalizePathname(url.pathname);
    const localeLessPath = stripLocalePrefix(normalizedPath);
    const priority = localeLessPath === '/' ? 0.9 : 0.7;

    return {
      loc: `${config.siteUrl}${normalizedPath === '/' ? '' : normalizedPath}`,
      changefreq: 'weekly',
      priority,
      lastmod: getLastModifiedISO(localeLessPath),
      alternateRefs: buildAlternateRefs(localeLessPath),
    };
  },
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
      },
    ],
    additionalSitemaps: [`${siteUrl}/sitemap.xml`],
  },
};
