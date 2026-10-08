const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const ROOT = path.resolve(__dirname);
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8'
};
// Only these folders (plus top-level .html pages) are public. Everything else, including
// server.js, README.md, .git and dotfiles, is never served.
const PUBLIC_DIRS = ['css', 'js', 'products', 'assets'];
const PUBLIC_ROOT_FILES = ['robots.txt', 'sitemap.xml'];

const SECURITY_HEADERS = {
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self'",
    "style-src 'self' https://fonts.googleapis.com",
    "font-src https://fonts.gstatic.com",
    "img-src 'self' https://images.unsplash.com data:",
    "connect-src 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "object-src 'none'"
  ].join('; '),
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=(), usb=()',
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains'
};

const send = (res, status, body, headers = {}) => {
  res.writeHead(status, { ...SECURITY_HEADERS, 'Content-Type': 'text/plain; charset=utf-8', ...headers });
  res.end(body);
};

const resolvePublicFile = (url) => {
  let reqPath;
  try {
    reqPath = decodeURIComponent(new URL(url, 'http://localhost').pathname);
  } catch {
    return null;
  }
  if (reqPath.includes('\0')) return null;
  if (reqPath === '/') reqPath = '/index.html';

  const filePath = path.resolve(ROOT, '.' + path.posix.normalize(reqPath));
  if (!filePath.startsWith(ROOT + path.sep)) return null;

  const parts = path.relative(ROOT, filePath).split(path.sep);
  if (parts.some((part) => part.startsWith('.'))) return null;
  const isTopLevelPage = parts.length === 1 && (path.extname(parts[0]) === '.html' || PUBLIC_ROOT_FILES.includes(parts[0]));
  if (!isTopLevelPage && !PUBLIC_DIRS.includes(parts[0])) return null;
  if (!MIME[path.extname(filePath).toLowerCase()]) return null;
  return filePath;
};

const server = http.createServer((req, res) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    send(res, 405, 'Method Not Allowed', { Allow: 'GET, HEAD' });
    return;
  }

  const filePath = resolvePublicFile(req.url);
  if (!filePath) {
    send(res, 404, '404 Not Found');
    return;
  }

  fs.realpath(filePath, (realErr, realPath) => {
    if (realErr || !realPath.startsWith(ROOT + path.sep)) {
      send(res, 404, '404 Not Found');
      return;
    }
    fs.readFile(realPath, (err, data) => {
      if (err) {
        send(res, 404, '404 Not Found');
        return;
      }
      const ext = path.extname(realPath).toLowerCase();
      res.writeHead(200, { ...SECURITY_HEADERS, 'Content-Type': MIME[ext] });
      res.end(req.method === 'HEAD' ? undefined : data);
    });
  });
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
