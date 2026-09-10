import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

test('Social preview has absolute metadata and a valid 1200×630 PNG', () => {
  const html = readFileSync('index.html', 'utf8');
  const tags = Object.fromEntries([...html.matchAll(/<meta (?:property|name)="([^"]+)" content="([^"]*)"/g)].map(m => [m[1], m[2]]));
  assert.equal(tags['og:image'], 'https://mati.ad/images/og-mati-v1.png');
  assert.equal(tags['og:url'], 'https://mati.ad/');
  assert.equal(tags['og:type'], 'website');
  assert.equal(tags['og:title'], 'Mati — Contact');
  assert.ok(tags['og:description']);
  assert.ok(tags['og:image:alt']);
  assert.equal(tags['og:image:type'], 'image/png');
  assert.equal(tags['twitter:card'], 'summary_large_image');
  assert.equal(tags['twitter:image'], tags['og:image']);
  const png = readFileSync('assets/images/og-mati-v1.png');
  assert.equal(png.subarray(0, 8).toString('hex'), '89504e470d0a1a0a');
  assert.equal(png.readUInt32BE(16), 1200);
  assert.equal(png.readUInt32BE(20), 630);
  assert.equal(tags['og:image:width'], '1200');
  assert.equal(tags['og:image:height'], '630');
  assert.ok(png.length < 1000000, 'Share image should remain under 1 MB');
});
