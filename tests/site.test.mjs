import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

test('Worker serves the exact index and five WhatsApp contact links', async () => {
  assert.ok(existsSync('scripts/build.mjs'), 'HTML-to-Worker builder must exist');
  execFileSync(process.execPath, ['scripts/build.mjs']);
  const { default: worker } = await import('../.build/worker.js');
  const response = await worker.fetch(new Request('https://mati.ad/'));
  assert.equal(response.status, 200);
  assert.match(response.headers.get('content-type'), /text\/html/);
  const html = await response.text();
  assert.equal(html, readFileSync('index.html', 'utf8'));
  const langs = [...html.matchAll(/<li lang="([^"]+)"/g)].map(m => m[1]);
  assert.deepEqual(langs, ['en', 'es-AR', 'ca', 'fr', 'pt']);
  const links = [...html.matchAll(/<a href="([^"]+)"/g)];
  assert.equal(links.length, 5);
  const messages = {
    en: 'Hi, I’m contacting you from mati.ad',
    'es-AR': 'hola, te contacto desde mati.ad',
    ca: 'Hola, et contacto des de mati.ad',
    fr: 'Bonjour, je vous contacte depuis mati.ad',
    pt: 'Olá, estou a contactar-te através de mati.ad',
  };
  const localizedLinks = [...html.matchAll(/<li lang="([^"]+)"><a href="([^"]+)"/g)];
  assert.equal(localizedLinks.length, 5);
  for (const [, lang, href] of localizedLinks) {
    const url = new URL(href);
    assert.equal(url.origin + url.pathname, 'https://wa.me/376367071');
    assert.equal(url.searchParams.get('text'), messages[lang], lang);
  }
  assert.doesNotMatch(html.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/g, ''), /<script\b/);
});

test('Portrait is a local asset and is permitted by the page CSP', async () => {
  const html = readFileSync('index.html', 'utf8');
  assert.match(html, /<img[^>]+src="\/images\/mati\.png"/);
  assert.ok(existsSync('assets/images/mati.png'));
  const config = JSON.parse(readFileSync('wrangler.jsonc', 'utf8'));
  assert.equal(config.assets.directory, './assets');
  execFileSync(process.execPath, ['scripts/build.mjs']);
  const { default: worker } = await import('../.build/worker.js');
  const response = await worker.fetch(new Request('https://mati.ad/'));
  assert.match(response.headers.get('content-security-policy'), /img-src 'self' data:/);
});

test('Worker supports HEAD, rejects writes and does not expose repo files', async () => {
  execFileSync(process.execPath, ['scripts/build.mjs']);
  const { default: worker } = await import('../.build/worker.js');
  const head = await worker.fetch(new Request('https://mati.ad/', { method: 'HEAD' }));
  assert.equal(await head.text(), '');
  assert.equal(head.status, 200);
  const missing = await worker.fetch(new Request('https://mati.ad/.git/config'));
  assert.equal(missing.status, 404);
  const post = await worker.fetch(new Request('https://mati.ad/', { method: 'POST' }));
  assert.equal(post.status, 405);
  assert.equal(post.headers.get('allow'), 'GET, HEAD');
});
