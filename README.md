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

1. `npm run build` genera el sitio estático en `out/`.
2. Desplegar en Vercel (proyecto nuevo o `vercel --prod`).
3. **Conectar el dominio `brandkit.controlapps.ar` es un paso manual**: agregar el dominio
   en la configuración del proyecto en Vercel y crear el registro CNAME correspondiente
   en Cloudflare para `brandkit`. No lo hace este repo ni ningún script — requiere acceso
   a las cuentas de Vercel/Cloudflare.

## Desarrollo

```bash
npm install
npm run dev
npm test
```
