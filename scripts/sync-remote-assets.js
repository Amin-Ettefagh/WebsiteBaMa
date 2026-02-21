const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const root = process.cwd();
const sources = [
  path.join(root, 'mihanshop.com'),
  path.join(root, 'panel.mihanshop.com')
];

const allowedHosts = new Set([
  'mihanshop.com',
  'cdn.mihanshop.com',
  'api.mihanshop.com',
  'panel.mihanshop.com'
]);

const imageExt = /\.(png|jpg|jpeg|webp|svg)(\?.*)?$/i;

const urlRegex = /https?:\/\/[^\s"'<>]+/g;

const collectUrls = () => {
  const urls = new Set();
  for (const base of sources) {
    if (!fs.existsSync(base)) continue;
    const files = fs.readdirSync(base, { recursive: true });
    for (const entry of files) {
      const full = path.join(base, entry);
      if (!fs.statSync(full).isFile()) continue;
      const text = fs.readFileSync(full, 'utf8');
      const matches = text.match(urlRegex);
      if (!matches) continue;
      for (const url of matches) {
        urls.add(url);
      }
    }
  }
  return Array.from(urls);
};

const toLocalPath = (urlObj) => {
  const safePath = urlObj.pathname.replace(/^\/+/, '');
  let localPath = path.join(root, 'public', 'remote', urlObj.hostname, safePath);
  if (urlObj.search) {
    const hash = crypto.createHash('md5').update(urlObj.search).digest('hex');
    localPath = `${localPath}__${hash}`;
  }
  return localPath;
};

const download = async (url) => {
  const urlObj = new URL(url);
  if (!allowedHosts.has(urlObj.hostname)) return;
  if (!imageExt.test(urlObj.pathname)) return;

  const localPath = toLocalPath(urlObj);
  if (fs.existsSync(localPath)) return;

  await fs.promises.mkdir(path.dirname(localPath), { recursive: true });

  const res = await fetch(url);
  if (!res.ok) {
    console.warn(`Skip ${url} -> ${res.status}`);
    return;
  }
  const arrayBuffer = await res.arrayBuffer();
  await fs.promises.writeFile(localPath, Buffer.from(arrayBuffer));
  console.log(`Downloaded ${url}`);
};

const run = async () => {
  const urls = collectUrls();
  const targets = urls.filter((url) => {
    try {
      const u = new URL(url);
      return allowedHosts.has(u.hostname) && imageExt.test(u.pathname);
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
