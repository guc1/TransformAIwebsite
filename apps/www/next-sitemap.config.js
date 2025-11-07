/** @type {import('next-sitemap').IConfig} */
const siteUrl = 'https://transformai.nl';

function normalizeBasePath(pathname) {
  if (pathname === '/' || pathname === '') {
    return '/';
  }

  if (pathname === '/en') {
    return '/';
  }

  if (pathname.startsWith('/en/')) {
    const stripped = pathname.slice(3);
    return stripped.startsWith('/') ? stripped : `/${stripped}`;
  }

  return pathname.startsWith('/') ? pathname : `/${pathname}`;
}

function buildAlternateRefs(pathname) {
  const basePath = normalizeBasePath(pathname);
  const nlPath = basePath;
  const enPath = basePath === '/' ? '/en' : `/en${basePath}`;

  return [
    { href: `${siteUrl}${nlPath === '/' ? '' : nlPath}`, hreflang: 'nl' },
    { href: `${siteUrl}${enPath}`, hreflang: 'en' },
    { href: `${siteUrl}${nlPath === '/' ? '' : nlPath}`, hreflang: 'x-default' },
  ];
}

module.exports = {
  siteUrl,
  generateRobotsTxt: true,
  sitemapSize: 5000,
  changefreq: 'weekly',
  priority: 0.7,
  transform: async (config, path) => {
    const url = new URL(path, config.siteUrl);
    const pathname = url.pathname === '' ? '/' : url.pathname;
    const priority = pathname === '/' || pathname === '/en' ? 0.9 : 0.7;

    return {
      loc: `${config.siteUrl}${pathname === '/' ? '' : pathname}`,
      changefreq: 'weekly',
      priority,
      alternateRefs: buildAlternateRefs(pathname),
    };
  },
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
      },
    ],
  },
};
