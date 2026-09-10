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
  for (const [, href] of links) {
    const url = new URL(href);
    assert.equal(url.origin + url.pathname, 'https://wa.me/376367071');
    assert.equal(url.searchParams.get('text'), 'hola, te contacto desde mati.ad');
  }
  assert.doesNotMatch(html, /<script\b/);
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
