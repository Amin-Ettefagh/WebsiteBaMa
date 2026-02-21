import fs from 'fs';
import path from 'path';
import { cache } from 'react';
import * as cheerio from 'cheerio';
import { SITE_NAME } from './site';

const MIHAN_ROOT = path.join(process.cwd(), 'mihanshop.com');
const PANEL_ROOT = path.join(process.cwd(), 'panel.mihanshop.com');

const PERSIAN_NAME_VARIANTS = [
  '\u0645\u06cc\u0647\u0646 \u0634\u0627\u067e',
  '\u0645\u06cc\u0647\u0646\u200c\u0634\u0627\u067e',
  '\u0645\u06cc\u0647\u0646\u0634\u0627\u067e'
];

const LOGO_KEYWORDS = ['logo', 'brand', 'favicon', 'site-icon', 'site_logo'];

export type LegacyPage = {
  html: string;
  title: string;
  description: string;
  routeKey: string;
};

type LegacyFile = {
  filePath: string;
  siteKey: 'mihanshop' | 'panel';
  pageDir: string;
  routeKey: string;
};

const normalizeSlashes = (value: string) => value.replace(/\\/g, '/');
const normalizeUrl = (value: string) => {
  try {
    return encodeURI(value);
  } catch {
    return value;
  }
};

const stripHtmlExtension = (value: string) =>
  value.replace(/\/index\.html$/i, '/').replace(/\.html$/i, '');

const sanitizeRouteKey = (value: string) =>
  value
    .replace(/^\//, '')
    .replace(/\/$/, '')
    .replace(/\s+/g, '-');

const resolveLegacyFile = (segments?: string[]): LegacyFile | null => {
  const safeSegments = segments ?? [];
  if (safeSegments.length === 0) {
    return {
      filePath: path.join(MIHAN_ROOT, 'index.html'),
      siteKey: 'mihanshop',
      pageDir: '',
      routeKey: 'home'
    };
  }

  let siteRoot = MIHAN_ROOT;
  let siteKey: LegacyFile['siteKey'] = 'mihanshop';
  let relativeSegments = safeSegments;

  if (safeSegments[0] === 'panel') {
    siteRoot = PANEL_ROOT;
    siteKey = 'panel';
    relativeSegments = safeSegments.slice(1);
  }

  if (relativeSegments.length === 0) {
    const indexPath = path.join(siteRoot, 'index.html');
    if (fs.existsSync(indexPath)) {
      return {
        filePath: indexPath,
        siteKey,
        pageDir: '',
        routeKey: 'panel'
      };
    }
  }

  const candidatePath = path.join(siteRoot, ...relativeSegments);

  if (fs.existsSync(candidatePath) && fs.statSync(candidatePath).isFile()) {
    return {
      filePath: candidatePath,
      siteKey,
      pageDir: normalizeSlashes(path.relative(siteRoot, path.dirname(candidatePath))),
      routeKey: sanitizeRouteKey(relativeSegments.join('/'))
    };
  }

  const htmlPath = `${candidatePath}.html`;
  if (fs.existsSync(htmlPath)) {
    return {
      filePath: htmlPath,
      siteKey,
      pageDir: normalizeSlashes(path.relative(siteRoot, path.dirname(htmlPath))),
      routeKey: sanitizeRouteKey(relativeSegments.join('/'))
    };
  }

  const indexHtmlPath = path.join(candidatePath, 'index.html');
  if (fs.existsSync(indexHtmlPath)) {
    return {
      filePath: indexHtmlPath,
      siteKey,
      pageDir: normalizeSlashes(path.relative(siteRoot, path.dirname(indexHtmlPath))),
      routeKey: sanitizeRouteKey(relativeSegments.join('/'))
    };
  }

  if (relativeSegments.length === 1) {
    const rootHtml = path.join(siteRoot, `${relativeSegments[0]}.html`);
    if (fs.existsSync(rootHtml)) {
      return {
        filePath: rootHtml,
        siteKey,
        pageDir: normalizeSlashes(path.relative(siteRoot, path.dirname(rootHtml))),
        routeKey: sanitizeRouteKey(relativeSegments[0])
      };
    }
  }

  return null;
};

const isExternal = (value: string) => /^https?:\/\//i.test(value);

const splitHash = (value: string) => {
  const [pathPart, hash] = value.split('#');
  return { pathPart, hash: hash ? `#${hash}` : '' };
};

const splitQuery = (value: string) => {
  const [pathPart, query] = value.split('?');
  return { pathPart, query: query ? `?${query}` : '' };
};

const toLocalRoute = (rawUrl: string, pageDir: string) => {
  if (!rawUrl) return rawUrl;
  const trimmed = rawUrl.trim();
  if (
    trimmed.startsWith('#') ||
    trimmed.startsWith('mailto:') ||
    trimmed.startsWith('tel:') ||
    trimmed.startsWith('javascript:')
  ) {
    return trimmed;
  }

  if (isExternal(trimmed)) {
    try {
      const url = new URL(trimmed);
      if (url.hostname.endsWith('mihanshop.com')) {
        const cleanPath = stripHtmlExtension(url.pathname);
        return `/${cleanPath.replace(/^\//, '')}${url.search}${url.hash}`;
      }
      return trimmed;
    } catch {
      return trimmed;
    }
  }

  const { pathPart, hash } = splitHash(trimmed);
  const { pathPart: purePath, query } = splitQuery(pathPart);
  const normalized = normalizeSlashes(
    path.posix.normalize(path.posix.join(pageDir || '', purePath))
  )
    .replace(/^\.\//, '')
    .replace(/^(\.\.\/)+/, '');
  const cleanPath = stripHtmlExtension(normalized).replace(/^\//, '');
  const trimmedPath = cleanPath.replace(/\/$/, '');
  const route = trimmedPath.length === 0 ? '/' : `/${trimmedPath}`;
  return `${route}${query}${hash}`;
};

const ensureLocalAsset = (url: string, fallback?: string) => {
  if (!url.startsWith('/legacy/')) return url;
  const filePath = path.join(process.cwd(), 'public', url.replace(/^\//, ''));
  if (fs.existsSync(filePath)) return url;
  return fallback ?? '/Logo.png';
};

const ensureRemoteAsset = (host: string, pathname: string, fallback: string) => {
  const localUrl = `/remote/${host}${pathname}`;
  const filePath = path.join(
    process.cwd(),
    'public',
    'remote',
    host,
    pathname.replace(/^\/+/, '')
  );
  if (fs.existsSync(filePath)) return localUrl;
  return fallback;
};

const toLocalAsset = (rawUrl: string, pageDir: string, siteKey: LegacyFile['siteKey']) => {
  if (!rawUrl) return rawUrl;
  let trimmed = rawUrl.trim();
  if (
    trimmed.startsWith('data:') ||
    trimmed.startsWith('blob:') ||
    trimmed.startsWith('#') ||
    trimmed.startsWith('mailto:') ||
    trimmed.startsWith('tel:')
  ) {
    return trimmed;
  }

  if (trimmed.startsWith('//')) {
    trimmed = `https:${trimmed}`;
  }

  if (isExternal(trimmed)) {
    try {
      const url = new URL(trimmed);
      if (url.hostname === 'api.mihanshop.com') {
        return ensureLocalAsset(
          `/legacy/api.mihanshop.com${url.pathname}`,
          normalizeUrl(trimmed)
        );
      }
      if (url.hostname === 'panel.mihanshop.com') {
        return ensureLocalAsset(
          `/legacy/panel.mihanshop.com${url.pathname}`,
          normalizeUrl(trimmed)
        );
      }
      if (url.hostname.endsWith('mihanshop.com')) {
        const localCandidate = ensureLocalAsset(
          `/legacy/mihanshop.com${url.pathname}`,
          ''
        );
        if (localCandidate) return localCandidate;
        return ensureRemoteAsset(url.hostname, url.pathname, normalizeUrl(trimmed));
      }
      if (url.hostname.endsWith('cdn.mihanshop.com')) {
        return ensureRemoteAsset(url.hostname, url.pathname, normalizeUrl(trimmed));
      }
      return normalizeUrl(trimmed);
    } catch {
      return normalizeUrl(trimmed);
    }
  }

  if (trimmed.startsWith('/')) {
    const base = siteKey === 'panel' ? 'panel.mihanshop.com' : 'mihanshop.com';
    return ensureLocalAsset(`/legacy/${base}${trimmed}`);
  }

  const normalized = normalizeSlashes(
    path.posix.normalize(path.posix.join(pageDir || '', trimmed))
  )
    .replace(/^\.\//, '')
    .replace(/^(\.\.\/)+/, '');

  if (normalized.startsWith('api.mihanshop.com/')) {
    return ensureLocalAsset(`/legacy/${normalized}`);
  }
  if (normalized.startsWith('panel.mihanshop.com/')) {
    return ensureLocalAsset(`/legacy/${normalized}`);
  }
  if (normalized.startsWith('mihanshop.com/')) {
    return ensureLocalAsset(`/legacy/${normalized}`);
  }

  const base = siteKey === 'panel' ? 'panel.mihanshop.com' : 'mihanshop.com';
  return ensureLocalAsset(`/legacy/${base}/${normalized}`);
};

const replaceSiteName = (value: string) => {
  if (!value) return value;
  let updated = value;
  PERSIAN_NAME_VARIANTS.forEach((variant) => {
    updated = updated.split(variant).join(SITE_NAME);
  });
  updated = updated.replace(/mihan\s*shop/gi, SITE_NAME);
  updated = updated.replace(/mihan-shop/gi, SITE_NAME);
  updated = updated.replace(/mihanshop/gi, SITE_NAME);
  return updated;
};

const updateTextNodes = ($: cheerio.CheerioAPI) => {
  const root = $.root();
  const walk = (node: any) => {
    if (node?.type === 'text' && typeof node.data === 'string') {
      node.data = replaceSiteName(node.data);
    }
    if (Array.isArray(node?.children)) {
      node.children.forEach(walk);
    }
  };
  root.contents().each((_, node) => walk(node));

  const attrTargets = ['title', 'alt', 'aria-label', 'placeholder', 'content'];
  attrTargets.forEach((attr) => {
    root.find(`[${attr}]`).each((_, el) => {
      const current = $(el).attr(attr);
      if (current) {
        $(el).attr(attr, replaceSiteName(current));
      }
    });
  });
};

const looksLikeLogoText = (value?: string) => {
  const text = (value ?? '').toLowerCase();
  if (!text) return false;
  if (text.includes('\u0644\u0648\u06af\u0648')) return true;
  return LOGO_KEYWORDS.some((keyword) => text.includes(keyword));
};

const isLogoAsset = (src?: string, alt?: string, title?: string, className?: string) => {
  const srcText = (src ?? '').toLowerCase();
  const altText = (alt ?? '').toLowerCase();
  const titleText = (title ?? '').toLowerCase();
  const classText = (className ?? '').toLowerCase();

  const srcLooksLikeLogo =
    looksLikeLogoText(srcText) ||
    (srcText.includes('mihanshop-') && srcText.endsWith('.svg'));
  const classLooksLikeLogo =
    looksLikeLogoText(classText) ||
    classText.includes('header_top-logo') ||
    (classText.includes('footer') && classText.includes('logo'));

  const labelLooksLikeLogo =
    looksLikeLogoText(altText) || looksLikeLogoText(titleText);

  return srcLooksLikeLogo || classLooksLikeLogo || labelLooksLikeLogo;
};

const isLogoUrl = (value?: string) => {
  const text = (value ?? '').toLowerCase();
  return (
    looksLikeLogoText(text) ||
    (text.includes('mihanshop-') && text.endsWith('.svg'))
  );
};

const hasLogoAncestor = ($: cheerio.CheerioAPI, $el: cheerio.Cheerio<any>) => {
  const ancestors = $el.parents();
  for (let i = 0; i < ancestors.length; i += 1) {
    const node = ancestors[i];
    const className = $(node).attr('class');
    const id = $(node).attr('id');
    if (looksLikeLogoText(className) || looksLikeLogoText(id)) {
      return true;
    }
  }
  return false;
};

const applyThemeColors = (value: string) => {
  if (!value) return value;
  return value
    .replace(/#ffbf40/gi, '#2d6fda')
    .replace(/#fbbf24/gi, '#2d6fda')
    .replace(/#f59e0b/gi, '#1d56b8')
    .replace(/#fde68a/gi, '#9fc6ff')
    .replace(/#3daa89/gi, '#2d6fda')
    .replace(/#2e866b/gi, '#1d56b8')
    .replace(/#2a8066/gi, '#1d56b8')
    .replace(/#359374/gi, '#2d6fda')
    .replace(/#31b88a/gi, '#2d6fda')
    .replace(/#48c39d/gi, '#2d6fda')
    .replace(/#17a77d/gi, '#2d6fda')
    .replace(/#0e8f6b/gi, '#1d56b8')
    .replace(/#1dc37f/gi, '#2d6fda')
    .replace(/#22c55e/gi, '#2d6fda')
    .replace(/#10b981/gi, '#2d6fda')
    .replace(/#059669/gi, '#1d56b8')
    .replace(/#16a34a/gi, '#1d56b8')
    .replace(/#34d399/gi, '#9fc6ff')
    .replace(/#5bd5a9/gi, '#9fc6ff')
    .replace(/#65d6ad/gi, '#9fc6ff')
    .replace(/#d39a35/gi, '#1d56b8');
};

const applyBackgroundTokens = (value: string) =>
  value.replace(
    /(background(?:-color)?\s*:\s*)([^;]*?)(#fff|#ffffff|white)([^;]*);?/gi,
    (_match, prefix, before, _color, after) =>
      `${prefix}${before}var(--surface)${after};`
  );

const fixStyleUrls = (styleValue: string, pageDir: string, siteKey: LegacyFile['siteKey']) =>
  styleValue.replace(/url\(([^)]+)\)/g, (match, raw) => {
    const cleaned = raw.replace(/['"]/g, '').trim();
    if (isLogoUrl(cleaned)) {
      return `url(/Logo.png)`;
    }
    const fixed = toLocalAsset(cleaned, pageDir, siteKey);
    return `url(${fixed})`;
  });

const updateColorAttributes = ($: cheerio.CheerioAPI, root: cheerio.Cheerio<any>) => {
  const applyToElement = ($el: cheerio.Cheerio<any>) => {
    ['fill', 'stroke', 'stop-color'].forEach((attr) => {
      const value = $el.attr(attr);
      if (!value || !value.includes('#')) return;
      $el.attr(attr, applyThemeColors(value));
    });
  };

  root.each((_, el) => applyToElement($(el)));
  root.find('[fill], [stroke], [stop-color]').each((_, el) => {
    applyToElement($(el));
  });
};

const transformLegacyHtml = (
  html: string,
  pageDir: string,
  siteKey: LegacyFile['siteKey']
) => {
  const $ = cheerio.load(html, { decodeEntities: false });
  const title = replaceSiteName($('title').first().text().trim()) || SITE_NAME;
  const description = replaceSiteName(
    $('meta[name="description"]').attr('content') ?? ''
  );

  const svgDefsNodes = $('html > svg');
  updateColorAttributes($, svgDefsNodes);
  const svgDefs = svgDefsNodes
    .toArray()
    .map((el) => $.html(el))
    .join('');

  const body = $('body');

  body.find('img').each((_, img) => {
    const $img = $(img);
    const dataSrc =
      $img.attr('data-src') ||
      $img.attr('data-original') ||
      $img.attr('data-lazy') ||
      $img.attr('data-image') ||
      $img.attr('data-bg') ||
      $img.attr('data-background');
    const src = $img.attr('src');

    if (dataSrc && (!src || src === '' || src.endsWith('.html'))) {
      $img.attr('src', dataSrc);
    }

    [
      'data-src',
      'data-original',
      'data-lazy',
      'data-image',
      'data-bg',
      'data-background'
    ].forEach((attr) => $img.removeAttr(attr));

    const srcset = $img.attr('srcset') || $img.attr('data-srcset');
    if (srcset) {
      const parts = srcset
        .split(',')
        .map((entry) => {
          const [url, size] = entry.trim().split(/\s+/, 2);
          const fixed = toLocalAsset(url, pageDir, siteKey);
          return size ? `${fixed} ${size}` : fixed;
        })
        .join(', ');
      $img.attr('srcset', parts);
    }
    $img.removeAttr('data-srcset');

    const nextSrc = $img.attr('src');
    if (nextSrc) {
      const fixedSrc = toLocalAsset(nextSrc, pageDir, siteKey);
      $img.attr('src', fixedSrc);
    }

    if (nextSrc && nextSrc.endsWith('.html')) {
      $img.attr('src', '/Logo.png');
    }

    if (isLogoAsset($img.attr('src'), $img.attr('alt'), $img.attr('title'), $img.attr('class'))) {
      $img.attr('src', '/Logo.png');
    }
    if (hasLogoAncestor($, $img)) {
      $img.attr('src', '/Logo.png');
    }

    if (!$img.attr('loading')) {
      $img.attr('loading', 'lazy');
    }
    $img.attr('decoding', 'async');

    if (!$img.attr('onerror')) {
      $img.attr('onerror', "this.onerror=null;this.src='/Logo.png';");
    }
  });

  body.find('svg').each((_, svg) => {
    const $svg = $(svg);
    const className = $svg.attr('class');
    const id = $svg.attr('id');
    const ariaLabel = $svg.attr('aria-label');
    const title = $svg.attr('title');

    if (
      looksLikeLogoText(className) ||
      looksLikeLogoText(id) ||
      looksLikeLogoText(ariaLabel) ||
      looksLikeLogoText(title) ||
      hasLogoAncestor($, $svg)
    ) {
      $svg.replaceWith(
        `<img src="/Logo.png" alt="${SITE_NAME}" loading="lazy" decoding="async" />`
      );
    }
  });

  body.find('source').each((_, source) => {
    const $source = $(source);
    const srcset = $source.attr('srcset');
    if (srcset) {
      const parts = srcset
        .split(',')
        .map((entry) => {
          const [url, size] = entry.trim().split(/\s+/, 2);
          const fixed = toLocalAsset(url, pageDir, siteKey);
          return size ? `${fixed} ${size}` : fixed;
        })
        .join(', ');
      $source.attr('srcset', parts);
    }
  });

  body.find('[style]').each((_, el) => {
    const $el = $(el);
    const style = $el.attr('style');
    if (style) {
      let nextStyle = applyThemeColors(style);
      nextStyle = applyBackgroundTokens(nextStyle);
      if (nextStyle.includes('url(')) {
        nextStyle = fixStyleUrls(nextStyle, pageDir, siteKey);
      }
      $el.attr('style', nextStyle);
    }
  });

  body.find('style').each((_, el) => {
    const $el = $(el);
    const css = $el.html();
    if (css) {
      let nextCss = applyThemeColors(css);
      nextCss = applyBackgroundTokens(nextCss);
      if (nextCss.includes('url(')) {
        nextCss = fixStyleUrls(nextCss, pageDir, siteKey);
      }
      $el.html(nextCss);
    }
  });

  body.find('a').each((_, anchor) => {
    const $anchor = $(anchor);
    const href = $anchor.attr('href');
    if (href) {
      $anchor.attr('href', toLocalRoute(href, pageDir));
    }
  });

  body.find('form').each((_, form) => {
    const $form = $(form);
    const action = $form.attr('action');
    if (action) {
      $form.attr('action', toLocalRoute(action, pageDir));
    }
  });

  updateTextNodes($);
  updateColorAttributes($, body);

  const bodyHtml = body.length ? body.html() ?? '' : html;
  return { html: `${svgDefs}${bodyHtml}`, title, description };
};

export const getLegacyPage = cache(async (segments?: string[]): Promise<LegacyPage> => {
  const legacyFile = resolveLegacyFile(segments);
  if (!legacyFile) {
    return {
      html:
        '<div>\u0635\u0641\u062d\u0647 \u0645\u0648\u0631\u062f \u0646\u0638\u0631 \u067e\u06cc\u062f\u0627 \u0646\u0634\u062f.</div>',
      title: SITE_NAME,
      description: '',
      routeKey: 'not-found'
    };
  }

  const rawHtml = fs.readFileSync(legacyFile.filePath, 'utf8');
  const { html, title, description } = transformLegacyHtml(
    rawHtml,
    legacyFile.pageDir,
    legacyFile.siteKey
  );

  return {
    html,
    title,
    description,
    routeKey: legacyFile.routeKey
  };
});
