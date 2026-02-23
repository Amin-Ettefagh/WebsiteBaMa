const fs = require('fs');
const path = require('path');

const root = process.cwd();
const legacyRoot = path.join(root, 'legacy');
const publicLegacy = path.join(root, 'public', 'legacy');

const DOMAIN_CANDIDATES = {
  primary: ['websithebama.com', 'mihanshop.com'],
  panel: ['panel.websithebama.com', 'panel.mihanshop.com'],
  api: ['api.websithebama.com', 'api.mihanshop.com'],
  cdn: ['cdn.websithebama.com', 'cdn.mihanshop.com']
};

const CANONICAL_DOMAINS = {
  primary: 'websithebama.com',
  panel: 'panel.websithebama.com',
  api: 'api.websithebama.com',
  cdn: 'cdn.websithebama.com'
};

// Copy a directory recursively and keep destination in sync.
const copyDir = (src, dest) => {
  if (!fs.existsSync(src)) {
    console.warn(`Missing: ${src}`);
    return;
  }
  fs.mkdirSync(dest, { recursive: true });
  fs.cpSync(src, dest, { recursive: true, force: true });
  console.log(`Copied ${src} -> ${dest}`);
};

const resolveSourceDir = (candidateHosts, subPath) => {
  for (const host of candidateHosts) {
    const candidate = path.join(legacyRoot, host, subPath);
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }
  return null;
};

const copyLegacySubdir = (domainKey, subPath, required = true) => {
  const src = resolveSourceDir(DOMAIN_CANDIDATES[domainKey], subPath);
  const dest = path.join(publicLegacy, CANONICAL_DOMAINS[domainKey], subPath);
  if (!src) {
    const prefix = required ? 'Missing required source' : 'Skipping optional source';
    console.log(
      `${prefix} for ${domainKey}/${subPath}. Checked: ${DOMAIN_CANDIDATES[
        domainKey
      ].join(', ')}`
    );
    return;
  }
  copyDir(src, dest);
};

copyLegacySubdir('primary', 'build');
copyLegacySubdir('primary', 'static');
copyLegacySubdir('primary', 'storage');
copyLegacySubdir('api', 'storage');
copyLegacySubdir('panel', 'build', false);
copyLegacySubdir('panel', 'static', false);
copyLegacySubdir('panel', 'storage', false);
copyLegacySubdir('cdn', 'storage', false);

// Ensure the primary logo is available under public/.
const logoSrc = path.join(root, 'Logo.png');
const logoDest = path.join(root, 'public', 'Logo.png');
if (fs.existsSync(logoSrc)) {
  fs.mkdirSync(path.dirname(logoDest), { recursive: true });
  fs.copyFileSync(logoSrc, logoDest);
  console.log(`Copied ${logoSrc} -> ${logoDest}`);
}
