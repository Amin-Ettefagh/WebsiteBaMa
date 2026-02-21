const fs = require('fs');
const path = require('path');

const root = process.cwd();
const publicLegacy = path.join(root, 'public', 'legacy');

const copyDir = (src, dest) => {
  if (!fs.existsSync(src)) {
    console.warn(`Missing: ${src}`);
    return;
  }
  fs.mkdirSync(dest, { recursive: true });
  fs.cpSync(src, dest, { recursive: true, force: true });
  console.log(`Copied ${src} -> ${dest}`);
};

copyDir(
  path.join(root, 'mihanshop.com', 'build'),
  path.join(publicLegacy, 'mihanshop.com', 'build')
);
copyDir(
  path.join(root, 'mihanshop.com', 'static'),
  path.join(publicLegacy, 'mihanshop.com', 'static')
);
copyDir(
  path.join(root, 'mihanshop.com', 'storage'),
  path.join(publicLegacy, 'mihanshop.com', 'storage')
);
copyDir(
  path.join(root, 'api.mihanshop.com', 'storage'),
  path.join(publicLegacy, 'api.mihanshop.com', 'storage')
);

const logoSrc = path.join(root, 'Logo.png');
const logoDest = path.join(root, 'public', 'Logo.png');
if (fs.existsSync(logoSrc)) {
  fs.mkdirSync(path.dirname(logoDest), { recursive: true });
  fs.copyFileSync(logoSrc, logoDest);
  console.log(`Copied ${logoSrc} -> ${logoDest}`);
}
