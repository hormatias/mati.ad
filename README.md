# mati.ad

Página mínima de contacto: `index.html`, sin JavaScript de cliente, frameworks, fuentes externas ni analítica. Inglés, español rioplatense, catalán, francés y portugués visibles simultáneamente.

Los cinco enlaces abren `https://wa.me/376367071` con el texto `hola, te contacto desde mati.ad`. El visitante revisa y envía el mensaje; la página no lo envía automáticamente.

## Uso

Abrí `index.html` directamente, o ejecutá con Node.js 22+ y pnpm 11.13.1:

```sh
pnpm install --frozen-lockfile
pnpm test
pnpm dev
pnpm exec wrangler deploy --dry-run
pnpm run deploy
```

El último comando publica y requiere autenticación de Cloudflare. Wrangler define el Worker `mati-ad` y el dominio exacto `mati.ad`, sin comodines. No modifica correo ni otros subdominios.

`scripts/build.mjs` empaqueta el HTML dentro de un Worker mínimo; no publica la raíz del repositorio. Editá `index.html`, nunca `.build/worker.js`. GET/HEAD en `/` y `/index.html`; otros paths devuelven 404 y escrituras, 405.

Para Workers Builds: repositorio `hormatias/mati.ad`, rama `main`, deploy command `pnpm run deploy`. El build está incluido en Wrangler. Solo esbuild y workerd tienen aprobados sus scripts de instalación.
