# BrandKit — diseño

**Dominio:** brandkit.controlapps.ar
**Fecha:** 23/09/2026

## Propósito

Web pública y gratuita, sin login. El usuario sube un logo (cualquier formato de imagen) más, opcionalmente, imágenes de referencia de su marca. La web genera y entrega un kit de marca completo listo para programar/diseñar: favicons en todos los tamaños, SVG en variantes de color, PNGs en distintos fondos y tamaños, wordmark tipográfico, y una guía de marca con la paleta. Sin cuentas ni persistencia en esta primera versión (posible v2 con cuentas).

## Flujo de usuario

1. Usuario sube su logo (imagen, cualquier formato) + opcionalmente imágenes de referencia (estilo/paleta de marca).
2. Preprocesamiento: quitar fondo si tiene, mejorar contraste/nitidez.
3. Análisis: extracción de paleta de colores (del logo + referencias si las hay) y cálculo heurístico de "personalidad de marca" (calidez/saturación de la paleta + densidad de detalle del trazado), usado para elegir la combinación tipográfica del wordmark y el color de la variante monocromática.
4. Vectorizado: se intenta trazar a SVG y se mide la complejidad del resultado (cantidad de nodos/paths).
   - Resultado limpio → sigue con el kit completo.
   - Resultado ruidoso → se generan 3 variantes simplificadas (posterizado a distintos niveles de agresividad) para que el usuario elija una, o se le sugiere subir una versión más simple del logo.
5. Con el SVG aprobado, se generan automáticamente todos los entregables (ver estructura abajo).
6. Descarga: .zip completo organizado en carpetas, y cada asset también descargable individualmente desde la página.
7. No se guarda nada del usuario en ningún servidor — todo el ciclo vive y muere en la sesión del navegador.

## Entregables (estructura del .zip)

```
mi-logo-kit.zip
├── favicon/
│   ├── favicon.ico          (16, 32, 48 combinados)
│   ├── favicon-16.png
│   ├── favicon-32.png
│   ├── apple-touch-icon.png (180x180)
│   ├── android-chrome-192.png
│   └── android-chrome-512.png
├── svg/
│   ├── logo-full-color.svg
│   ├── logo-black.svg
│   ├── logo-white.svg
│   ├── logo-grayscale.svg
│   └── logo-monochrome.svg
├── png/
│   ├── full-color/   (fondos: transparente, blanco, negro — tamaños: 128/256/512/1024)
│   ├── black/        (idem)
│   ├── white/        (idem)
│   ├── grayscale/    (idem)
│   └── monochrome/   (idem)
├── wordmark/
│   ├── wordmark.svg
│   └── wordmark.png  (transparente, blanco, negro)
└── guia-de-marca.png  (paleta + tipografía + logo en los 3 fondos, en una sola lámina)
```

**Variantes de color del logo (5):** full color, negro 100%, blanco, escala de grises, monocromático en el color principal de la paleta.

**Fondos (3):** transparente, blanco, negro.

**Wordmark:** siempre se genera como tipografía nueva (el usuario escribe el nombre de marca), eligiendo la combinación tipográfica según la personalidad detectada — no depende de que el logo tenga texto extraíble.

## Arquitectura

**100% client-side.** Next.js desplegado en Vercel como app estática — sin backend, sin función serverless procesando imágenes, sin base de datos. Todo el procesamiento pesado corre en el navegador del usuario.

Librerías/técnicas por paso:
- **Quitar fondo:** `@imgly/background-removal` (WASM/ONNX, corre en browser).
- **Vectorizado:** `imagetracerjs` (JS puro, browser).
- **Heurística de complejidad:** conteo de paths/nodos del SVG resultante contra un umbral; si lo supera, posterizar la imagen a menos colores y re-trazar en 3 niveles de agresividad.
- **Paleta:** cuantización de color directo sobre la imagen/SVG, sin librería pesada.
- **Personalidad de marca:** reglas simples (saturación/calidez de la paleta + densidad de detalle) → mapeo a un set de 4-5 combinaciones tipográficas predefinidas (geométrica moderna, clásica serif, redondeada amigable, técnica industrial, etc.). Sin LLM ni API de pago — costo marginal cero por uso.
- **Renderizado de tamaños/fondos/ico:** canvas del navegador.
- **Empaquetado:** `JSZip`, client-side.

**Trade-off aceptado:** en celulares de gama baja el procesamiento (sobre todo quitar fondo) puede tardar más que en desktop; se compensa con indicador de progreso por paso.

## Manejo de errores y casos límite

- Archivo no es imagen o está corrupto → mensaje claro, sin crash.
- Imagen es una foto (no un logo, demasiado detalle) → cae en el camino de "muy complejo"; si ni las simplificadas sirven, se pide subir algo más simple.
- Navegador sin soporte WASM/muy viejo → detección temprana + aviso de actualizar navegador.
- Archivo demasiado pesado → límite de tamaño en el input con aviso, para no colgar el navegador.
- Mobile lento → indicador de progreso por paso (quitando fondo… vectorizando… generando kit…).
- Sin conexión luego de cargada la página → funcionalmente podría andar offline (bonus, no requisito).

## Testing

Sin backend que testear con integración. Plan: prueba manual con muestra variada de logos (2 colores planos, con gradiente, con texto integrado, ya transparente, foto real) en Chrome/Firefox/Safari desktop y mobile. Funciones puras aisladas (heurística de complejidad, extracción de paleta, mapeo de personalidad→tipografía) llevan tests unitarios simples.

## Fuera de alcance (v1)

- Cuentas de usuario, login, historial de kits generados.
- Vectorización asistida por IA (vectorizer.ai) o recreación generativa — quedaron descartadas en brainstorming por costo variable en una herramienta pública gratuita.
- Persistencia de archivos subidos en servidor.
