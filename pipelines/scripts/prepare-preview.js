#!/usr/bin/env node
/**
 * Prepare a self-contained preview HTML:
 *  - inline css/style.css (including url() assets)
 *  - inline js/script.js
 *  - inline <img> sources found in the HTML
 * 
 * Usage: node prepare-preview.js <targetHtml> <outDir> <publicRoot> <themeFontDir>
 */

const fs = require('fs');
const path = require('path');

const [, , target, outDir, publicRoot, themeFontDir = ''] = process.argv;

if (!target || !outDir || !publicRoot) {
  console.error('Usage: node prepare-preview.js <targetHtml> <outDir> <publicRoot> <themeFontDir>');
  process.exit(1);
}

const mime = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject',
  '.otf': 'font/otf'
};

const relTarget = path.relative(publicRoot, target);
const relDir = path.dirname(relTarget);
const slug = path.basename(target, path.extname(target));
const slugDir = path.join(publicRoot, relDir, slug);
const targetDir = path.dirname(target);

let html = fs.readFileSync(target, 'utf8');

function inlineCss(htmlContent) {
  const cssPath = path.join(publicRoot, 'css/style.css');
  if (!fs.existsSync(cssPath)) return htmlContent;

  const cssDir = path.join(publicRoot, 'css');
  let css = fs.readFileSync(cssPath, 'utf8');

  css = css.replace(/url\(([^)]+)\)/g, (m, rawPath) => {
    let p = rawPath.trim().replace(/^["']|["']$/g, '');
    if (/^data:/i.test(p) || /^https?:/i.test(p)) return m;
    const clean = p.split(/[?#]/)[0];
    const candidates = [
      path.resolve(cssDir, clean),
      path.resolve(publicRoot, clean.replace(/^\.\//, '')),
      path.resolve(publicRoot, 'css/fonts', path.basename(clean)),
      path.resolve(publicRoot, 'fonts', path.basename(clean)),
      themeFontDir ? path.resolve(themeFontDir, path.basename(clean)) : null
    ].filter(Boolean);

    let filePath;
    for (const c of candidates) {
      if (fs.existsSync(c)) { filePath = c; break; }
    }
    if (!filePath) return m;

    const ext = path.extname(filePath).toLowerCase();
    const ct = mime[ext] || 'application/octet-stream';
    const b64 = fs.readFileSync(filePath).toString('base64');
    return `url("data:${ct};base64,${b64}")`;
  });

  return htmlContent.replace(
    /<link[^>]+href="[^"]*css\/style\.css"[^>]*>/i,
    `<style>\n${css}\n</style>`
  );
}

function inlineJs(htmlContent) {
  const jsPath = path.join(publicRoot, 'js/script.js');
  if (!fs.existsSync(jsPath)) return htmlContent;
  const js = fs.readFileSync(jsPath, 'utf8');
  return htmlContent.replace(
    /<script[^>]+src="[^"]*js\/script\.js"[^>]*><\/script>/i,
    `<script>\n${js}\n</script>`
  );
}

function inlineImages(htmlContent) {
  let inlined = 0;
  const missing = [];

  const replaced = htmlContent.replace(/<img\s+([^>]*?)src="([^"]+)"([^>]*)>/gi, (m, pre, src, post) => {
    if (/^data:/i.test(src) || /^https?:/i.test(src)) return m;

    let cleaned = src.replace(/^\/?blog\//, '').replace(/^\/+/, '').replace(/^\.\//, '');

    const candidates = [
      path.join(publicRoot, cleaned),
      path.join(slugDir, path.basename(cleaned)),
      path.join(targetDir, cleaned),
    ];

    let filePath;
    for (const c of candidates) {
      if (fs.existsSync(c)) { filePath = c; break; }
    }
    if (!filePath) { missing.push(src); return m; }

    const ext = path.extname(filePath).toLowerCase();
    const ct = mime[ext] || 'application/octet-stream';
    const b64 = fs.readFileSync(filePath).toString('base64');
    inlined++;

    const preAttrs = pre.trim();
    const postAttrs = post.trim();
    const before = preAttrs ? `${preAttrs} ` : '';
    const after = postAttrs ? ` ${postAttrs}` : '';
    return `<img ${before}src="data:${ct};base64,${b64}"${after}>`;
  });

  console.log(`Images inlined: ${inlined}`);
  if (missing.length) {
    console.log('Images not found (left as-is):', missing.join(', '));
  }
  return replaced;
}

// Apply transformations
html = inlineCss(html);
html = inlineJs(html);
html = inlineImages(html);
html = html.replace(/href="\/blog\//g, 'href="./').replace(/src="\/blog\//g, 'src="./');

fs.writeFileSync(path.join(outDir, 'index.html'), html, 'utf8');
console.log(`Preview written: ${path.join(outDir, 'index.html')}`);
