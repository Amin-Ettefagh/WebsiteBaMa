const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const root = process.cwd();
const legacyRoot = path.join(root, 'legacy');
const DOMAIN_ALIASES = {
  'websithebama.com': 'websithebama.com',
  'panel.websithebama.com': 'panel.websithebama.com',
  'api.websithebama.com': 'api.websithebama.com',
  'cdn.websithebama.com': 'cdn.websithebama.com',
  'mihanshop.com': 'websithebama.com',
  'panel.mihanshop.com': 'panel.websithebama.com',
  'api.mihanshop.com': 'api.websithebama.com',
  'cdn.mihanshop.com': 'cdn.websithebama.com'
};

const CANONICAL_HOSTS = new Set([
  'websithebama.com',
  'panel.websithebama.com',
  'api.websithebama.com',
  'cdn.websithebama.com'
]);

const sourceRoots = [
  path.join(legacyRoot, 'websithebama.com'),
  path.join(legacyRoot, 'panel.websithebama.com'),
  path.join(legacyRoot, 'mihanshop.com'),
  path.join(legacyRoot, 'panel.mihanshop.com')
];

const TEXT_EXTENSIONS = new Set([
  '.html',
  '.htm',
  '.css',
  '.js',
  '.json',
  '.txt',
  '.xml',
  '.svg'
]);

const imageExt = /\.(png|jpg|jpeg|webp|svg|gif|avif)(\?.*)?$/i;
const urlRegex = /https?:\/\/[^\s"'<>]+/g;

const normalizeHost = (host) => DOMAIN_ALIASES[host] || host;
const isAllowedHost = (host) => CANONICAL_HOSTS.has(normalizeHost(host));

const walkFiles = (startDir) => {
  const stack = [startDir];
  const files = [];

  while (stack.length > 0) {
    const current = stack.pop();
    const entries = fs.readdirSync(current, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(current, entry.name);
      if (entry.isDirectory()) {
        stack.push(fullPath);
        continue;
      }
      if (entry.isFile()) {
        files.push(fullPath);
      }
    }
  }

  return files;
};

const collectUrls = () => {
  const urls = new Set();

  for (const base of sourceRoots) {
    if (!fs.existsSync(base)) continue;

    const files = walkFiles(base);
    for (const filePath of files) {
      const ext = path.extname(filePath).toLowerCase();
      if (!TEXT_EXTENSIONS.has(ext)) continue;

      let text = '';
      try {
        text = fs.readFileSync(filePath, 'utf8');
      } catch {
        continue;
      }

      const matches = text.match(urlRegex);
      if (!matches) continue;
      for (const value of matches) {
        urls.add(value);
      }
    }
  }

  return Array.from(urls);
};

const toLocalPath = (host, pathname, search) => {
  const safePath = pathname.replace(/^\/+/, '');
  let localPath = path.join(root, 'public', 'remote', host, safePath);
  if (search) {
    const hash = crypto.createHash('md5').update(search).digest('hex');
    localPath = `${localPath}__${hash}`;
  }
  return localPath;
};

const getCandidateUrls = (urlObj, normalizedHost) => {
  const candidates = [urlObj.toString()];
  if (urlObj.hostname !== normalizedHost) {
    const normalizedUrl = new URL(urlObj.toString());
    normalizedUrl.hostname = normalizedHost;
    candidates.push(normalizedUrl.toString());
  }
  return candidates;
};

const download = async (url) => {
  const urlObj = new URL(url);
  const normalizedHost = normalizeHost(urlObj.hostname);

  if (!isAllowedHost(urlObj.hostname)) return;
  if (!imageExt.test(urlObj.pathname)) return;

  const localPath = toLocalPath(normalizedHost, urlObj.pathname, urlObj.search);
  if (fs.existsSync(localPath)) return;

  await fs.promises.mkdir(path.dirname(localPath), { recursive: true });

  const candidates = getCandidateUrls(urlObj, normalizedHost);
  let response = null;
  let downloadedFrom = '';

  for (const candidate of candidates) {
    try {
      const current = await fetch(candidate);
      if (current.ok) {
        response = current;
        downloadedFrom = candidate;
        break;
      }
      console.warn(`Skip ${candidate} -> ${current.status}`);
    } catch {
      // Keep trying remaining candidates.
    }
  }

  if (!response) {
    console.warn(`Failed to download ${url}`);
    return;
  }

  const arrayBuffer = await response.arrayBuffer();
  await fs.promises.writeFile(localPath, Buffer.from(arrayBuffer));
  console.log(`Downloaded ${downloadedFrom} -> ${localPath}`);
};

const run = async () => {
  const urls = collectUrls();
  const targets = urls.filter((url) => {
    try {
      const u = new URL(url);
      return isAllowedHost(u.hostname) && imageExt.test(u.pathname);
    } catch {
      return false;
    }
  });

  const concurrency = 6;
  let index = 0;
  const workers = new Array(concurrency).fill(null).map(async () => {
    while (index < targets.length) {
      const current = targets[index++];
      try {
        await download(current);
      } catch (err) {
        console.warn(`Failed ${current}`);
      }
    }
  });

  await Promise.all(workers);
  console.log(`Done. Total: ${targets.length}`);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
