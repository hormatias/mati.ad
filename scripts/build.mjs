import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const worker = `// Generated from index.html. Do not edit.
const html = ${JSON.stringify(html)};
export default {
  fetch(request) {
    const headers = {
      'Content-Type': 'text/html; charset=utf-8',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'no-referrer',
      'Content-Security-Policy': "default-src 'none'; style-src 'unsafe-inline'; img-src data:; base-uri 'none'; frame-ancestors 'none'; form-action 'none'"
    };
    if (!['GET', 'HEAD'].includes(request.method)) {
      return new Response(null, { status: 405, headers: { ...headers, Allow: 'GET, HEAD' } });
    }
    const path = new URL(request.url).pathname;
    if (path !== '/' && path !== '/index.html') {
      return new Response(null, { status: 404, headers });
    }
    return new Response(request.method === 'HEAD' ? null : html, { headers });
  }
};
`;
mkdirSync(new URL('../.build/', import.meta.url), { recursive: true });
writeFileSync(new URL('../.build/worker.js', import.meta.url), worker);
console.log('Built .build/worker.js from index.html');
