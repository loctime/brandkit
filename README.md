# BrandKit

Generador público y gratuito de brand kits (favicon, SVG, PNG, wordmark, paleta) a partir de un logo.
100% client-side — sin backend, sin base de datos, sin cuentas (v1).

Repo público: https://github.com/loctime/brandkit

## Licencia

Este repo depende de `@imgly/background-removal`, licenciado AGPL-3.0. Por eso el código
de BrandKit es público (este repo) y la app enlaza a él desde el footer — cumple el
requisito del AGPL de que quien interactúa con la app por red pueda conseguir el código
fuente correspondiente. Si en algún momento se cambia por una librería con licencia
permisiva, este requisito deja de aplicar.

## Deploy

Desplegado en Vercel (proyecto `brandkit`, linkeado al repo de GitHub, deploy automático en
push a `main`) + dominio `brandkit.controlapps.ar` (CNAME en Cloudflare a `cname.vercel-dns.com`,
sin proxy). Vercel detecta el framework Next.js solo y sirve el export estático (`output: 'export'`
en `next.config.ts`) — no hace falta `outputDirectory`/`buildCommand` custom en la config del
proyecto, entran en conflicto con el preset de Next.js.

## Desarrollo

```bash
npm install
npm run dev
npm test
```
