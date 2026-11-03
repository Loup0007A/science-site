#!/usr/bin/env node
// Génère /_headers (en-têtes HTTP Netlify) avec une CSP stricte basée sur les empreintes
// SHA-256 des scripts inline des pages HTML.
//
//   node scripts/build-headers.mjs          → réécrit _headers
//   node scripts/build-headers.mjs --check  → échoue si _headers n'est pas à jour
//
// Netlify lance ce script à chaque déploiement (voir netlify.toml) : la CSP reste donc
// toujours synchronisée avec le contenu réel des scripts inline.
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const JS_TYPES = new Set(['', 'text/javascript', 'application/javascript', 'module']);

const hashes = new Set();
for (const file of readdirSync(ROOT).filter(f => f.endsWith('.html')).sort()) {
  const html = readFileSync(join(ROOT, file), 'utf8');
  for (const m of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
    const attrs = m[1];
    if (/(?:^|\s)src\s*=/i.test(attrs)) continue; // script externe : couvert par 'strict-dynamic'
    const type = (attrs.match(/(?:^|\s)type\s*=\s*["']?([^"'\s>]+)/i) || [, ''])[1].toLowerCase();
    if (!JS_TYPES.has(type)) continue; // JSON-LD & co. : blocs de données, non exécutés
    hashes.add(`'sha256-${createHash('sha256').update(m[2], 'utf8').digest('base64')}'`);
  }
}
if (!hashes.size) throw new Error('Aucun script inline trouvé : la CSP serait vide.');

const csp = [
  "default-src 'self'",
  // Navigateurs récents : seuls les scripts dont l'empreinte est listée (et ceux qu'ils chargent,
  // grâce à 'strict-dynamic') s'exécutent. 'unsafe-inline' et https: ne servent qu'aux très vieux
  // navigateurs, qui ignorent les empreintes ; les navigateurs modernes les ignorent à leur tour.
  `script-src ${[...hashes].join(' ')} 'strict-dynamic' 'unsafe-inline' https:`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self'",
  "connect-src 'self'",
  "manifest-src 'self'",
  "worker-src 'self'",
  "object-src 'none'",
  "base-uri 'none'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "require-trusted-types-for 'script'",
  'trusted-types nexploria nexploria-loader',
].join('; ');

const out = `# Fichier généré par scripts/build-headers.mjs — ne pas modifier à la main.
# Pour le régénérer après avoir modifié un script inline : node scripts/build-headers.mjs

/*
  Content-Security-Policy: ${csp}
  Cross-Origin-Opener-Policy: same-origin
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(), usb=()

/fonts/*
  Cache-Control: public, max-age=31536000, immutable
`;

const target = join(ROOT, '_headers');
if (process.argv.includes('--check')) {
  let current = '';
  try { current = readFileSync(target, 'utf8'); } catch {}
  if (current !== out) { console.error('_headers n\'est pas à jour : lancez node scripts/build-headers.mjs'); process.exit(1); }
  console.log('_headers est à jour.');
} else {
  writeFileSync(target, out);
  console.log(`_headers écrit (${hashes.size} empreinte(s) de script).`);
}
