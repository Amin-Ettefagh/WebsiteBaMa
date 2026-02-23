export const SITE_NAME = 'Website Bama';
export const SITE_NAME_FA = '\u0648\u0628\u0633\u0627\u06cc\u062a\u0647 \u0628\u0627 \u0645\u0627';
export const SITE_TAGLINE = 'Ecommerce website design and growth solutions.';
export const SITE_DESCRIPTION =
  'Website Bama is a professional ecommerce website builder and growth platform for modern businesses.';
export const SITE_PHONE = '02192007881';
export const SITE_SUPPORT_EMAIL = 'info@websithebama.ir';
export const SITE_LANG = 'en';
export const SITE_DIR = 'ltr';

// Canonical domains used by this project.
export const DOMAINS = {
  primary: 'websithebama.com',
  panel: 'panel.websithebama.com',
  api: 'api.websithebama.com',
  cdn: 'cdn.websithebama.com'
} as const;

// Legacy host aliases from the old brand; kept for backward compatibility.
export const LEGACY_HOST_ALIASES: Record<string, string> = {
  [DOMAINS.primary]: DOMAINS.primary,
  [DOMAINS.panel]: DOMAINS.panel,
  [DOMAINS.api]: DOMAINS.api,
  [DOMAINS.cdn]: DOMAINS.cdn,
  'mihanshop.com': DOMAINS.primary,
  'panel.mihanshop.com': DOMAINS.panel,
  'api.mihanshop.com': DOMAINS.api,
  'cdn.mihanshop.com': DOMAINS.cdn
};

export const LEGACY_PUBLIC_PREFIX = `/legacy/${DOMAINS.primary}`;

const LEGACY_BUILD_STYLES = [
  'app-f420f844.css',
  'app-27f4bc3a.css',
  'app-blog-05db8ef3.css',
  'blog-938c2921.css',
  'home-1e5cc67e.css',
  'faq-3fc42301.css',
  'marketplace-95c948b0.css',
  'package-52b2b5ba.css',
  'restaurant-27b1a8a7.css',
  'theme-sugar-26086724.css',
  'Certificate-5f8be1f2.css',
  'CounselingRequest-8054b46d.css',
  'LoginModal-846ef44f.css',
  'app-setup-84e934e8.css'
];

export const LEGACY_STYLESHEETS = [
  ...LEGACY_BUILD_STYLES.map(
    (fileName) => `${LEGACY_PUBLIC_PREFIX}/build/assets/${fileName}`
  ),
  `${LEGACY_PUBLIC_PREFIX}/static/css/swiper-bundle.min.css`
];

export const LEGACY_FONT_URL = `${LEGACY_PUBLIC_PREFIX}/static/fonts/yekanPlus/YEKANPLUS.woff2`;
