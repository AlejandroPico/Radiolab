# Validación v0.1.2

## Comprobación reproducible

```sh
npm ci
npm run lint
npm test
npm run build
node scripts/check-build.mjs
```

Las diez pruebas de dominio cubren unidades/límites de frecuencia, determinismo y metadatos, sintonía absoluta, mute/pausa/squelch/volumen, bandas laterales/filtro, Morse, bloqueo TX/ausencia de telemetría, persistencia corrupta, CSV multilineal y fórmulas, importación atómica/tipos/coordenadas/duplicados y rutas de círculo máximo.

La comprobación del build valida todos los recursos precacheados, ruta de subdirectorio, manifest, limpieza limitada a cachés de Radiolab, activación explícita y navegación offline mediante un entorno simulado del service worker. No afirma haber probado un teléfono real.

## Criterios

| Criterio | Implementación / forma de verificar |
| --- | --- |
| Compilación y comprobaciones | Comandos anteriores y workflow de Actions |
| URL y Pages | Publicación desde main mediante artefacto dist |
| Estación, bandas y dial | Vista clásica; ratón, teclado y táctil |
| Instrumentos animados y fuente | Marca DEMO en cada instrumento; cinco escenarios |
| Sintonía/filtro y persistencia | Funciones de dominio probadas; preferencias locales |
| Laboratorio y móvil | Canvas ampliado, layouts por breakpoint y controles táctiles |
| Libro y mapa | Formularios, validación, import/export y coordenadas opcionales |
| Directorio remoto | Enlaces identificados; conectores directos no disponibles |
| TX imposible | Interlock probado; sin endpoint o adaptador TX |
| Offline | Worker y precache comprobados; completar prueba de instalación en navegador compatible |
| Accesibilidad | Labels, foco, dialog nativo, teclado y reducción de movimiento |
| Documentación y versión | README, CHANGELOG, documentos y versión coherente |

## Pruebas manuales de recepción física pendientes

Ninguna compatibilidad SDR, CAT, audio físico, medida de potencia o DAB+ se considera probada. La instalación Android/iOS real, los gestos del sistema en el dispositivo y la calibración de hardware requieren pruebas posteriores en esos medios. Las validaciones de viewport en escritorio no equivalen a un teléfono físico.

## Comprobación de la web publicada — 9 de noviembre de 2026

La primera publicación y la corrección móvil completaron `npm ci`, lint, diez pruebas, build, comprobación PWA y despliegue en GitHub Actions. En navegador se comprobó sintonía manual de 14,200 a 14,204 MHz, activación/desactivación del audio sin errores de consola, escenario de emisoras cercanas, apertura de memorias, cierre de diálogo con atrás, alta/edición/borrado de una anotación temporal y su ruta en el mapa. Se eliminó la anotación de prueba al terminar. Se revisó el frontal a 1920 × 855 y 390 × 844, y el diálogo a 844 × 390; la revisión detectó y corrigió el solapamiento móvil de frecuencia/S-meter. También se comprobó el cierre con atrás del menú móvil. No se instalaron aplicaciones en el dispositivo del propietario.

