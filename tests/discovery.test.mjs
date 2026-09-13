import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

test('Public discovery files permit search and AI assistants with a canonical sitemap', () => {
  const robots = readFileSync('assets/robots.txt', 'utf8');
  assert.match(robots, /User-agent: \*\nAllow: \/\n/);
  assert.match(robots, /Sitemap: https:\/\/mati\.ad\/sitemap.xml/);
  for (const bot of ['OAI-SearchBot', 'ChatGPT-User', 'Claude-SearchBot', 'Claude-User', 'PerplexityBot', 'Perplexity-User']) {
    assert.ok(robots.includes(`User-agent: ${bot}\nAllow: /`), bot);
  }
  const sitemap = readFileSync('assets/sitemap.xml', 'utf8');
  assert.match(sitemap, /xmlns="http:\/\/www.sitemaps.org\/schemas\/sitemap\/0.9"/);
  assert.deepEqual([...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(m => m[1]), ['https://mati.ad/']);
  const llms = readFileSync('assets/llms.txt', 'utf8');
  assert.match(llms, /^# Mati — mati.ad/);
  assert.ok(llms.includes('https://wa.me/376367071'));
  assert.ok(llms.includes('English, Spanish, Catalan, French and Portuguese'));
});

test('Page exposes truthful structured data and indexable metadata without executable JS', () => {
  const html = readFileSync('index.html', 'utf8');
  assert.match(html, /name="robots" content="index, follow, max-image-preview:large"/);
  const blocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
  assert.equal(blocks.length, 1);
  const data = JSON.parse(blocks[0][1]);
  assert.equal(data['@context'], 'https://schema.org');
  const person = data['@graph'].find(x => x['@type'] === 'Person');
  const page = data['@graph'].find(x => x['@type'] === 'ContactPage');
  assert.equal(person.name, 'Mati');
  assert.equal(person.url, 'https://mati.ad/');
  assert.equal(page.mainEntity['@id'], person['@id']);
  assert.deepEqual(page.inLanguage, ['en', 'es', 'ca', 'fr', 'pt']);
  assert.doesNotMatch(html.replace(blocks[0][0], ''), /<script\b/);
});
