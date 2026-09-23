# BrandKit

Generador público y gratuito de brand kits (favicon, SVG, PNG, wordmark, paleta) a partir de un logo.
100% client-side — sin backend, sin base de datos, sin cuentas (v1).

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
