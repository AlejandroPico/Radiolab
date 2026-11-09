# Radiolab · Estación de radio experimental

**v0.1.0** · Español de España · Por Alejandro Pico

[Abrir Radiolab](https://alejandropico.github.io/Radiolab/) · [Portfolio](https://alejandropico.github.io/Portfolio/) · [Arquitectura](docs/architecture.md)

Una estación de radio para explorar las señales sin necesitar una antena. Interfaz original de receptor clásico, instrumentación sintética y un libro de guardia local. Aplicación estática React + TypeScript + Vite, instalable como PWA y publicada en GitHub Pages mediante Actions.

## Qué funciona

- **Estación clásica y laboratorio:** VFO A/B, copia del VFO activo, representación split con TX bloqueado, frecuencia editable en Hz/kHz/MHz, pasos de 1 Hz a 100 kHz, bandas de ejemplo, dial por arrastre, rueda o teclado, exploración ±12 kHz y memorias con nombre.
- **Cinco escenarios originales:** portadora AM, banda lateral inferior, dos emisoras AM separadas 4 kHz, Morse CQ y ruido determinista. Las señales permanecen en frecuencias absolutas; alejarse de ellas reduce la señal recibida.
- **Instrumentos:** espectro analítico sintético de 768 bins, waterfall, cursor de frecuencia, ventana de filtro, zoom 12–96 kHz, desplazamiento, escala, S-meter simulado y osciloscopio del audio generado. No se calculan mediciones de RF real ni se inventa telemetría de hardware.
- **Audio:** tonos PCM originales con Web Audio, activación explícita, volumen, ganancia AF, mute, squelch, pausa y AGC ilustrativo. El reloj de simulación es común al Morse, al espectro y al audio. La síntesis sonora es didáctica; FM/NFM usan tonos de prueba y no un demodulador FM de RF.
- **Libro de guardia:** alta, edición, borrado con confirmación, búsqueda, UTC, indicativo, frecuencia, banda derivada, modo, reporte, notas, origen DEMO/manual, confirmación y coordenadas opcionales. Importación/exportación JSON y CSV, validación atómica y protección de fórmulas CSV.
- **Mapa esquemático:** ubicaciones introducidas manualmente, zoom, desplazamiento, selección y rutas de círculo máximo cuando hay origen y destino válidos. El origen se usa solo en la sesión; no se infiere ninguna ubicación por indicativo. Los ejemplos ficticios se cargan por elección del usuario.
- **Directorio externo:** WebSDR, KiwiSDR y Receiverbook/OpenWebRX. Abren su propia web; no se integra ni se presenta su audio como audio de Radiolab.
- **PWA:** iconos originales PNG/SVG, favicon en `public/favicon.svg` (publicado en `/Radiolab/favicon.svg`), instalación en navegadores compatibles, caché de la aplicación y DEMO offline tras una primera carga completa. Actualizaciones con aviso y limpieza de cachés anteriores de Radiolab.
- **Persistencia local:** esquema versionado, recuperación ante datos dañados, preferencias, historial, memorias y contactos. Sin cuentas, analítica, cookies de seguimiento ni backend.
- **Accesibilidad y móvil:** controles etiquetados, navegación por teclado, foco visible, diálogo nativo, cierre de paneles con atrás, diseño para móvil/tablet/4K, reducción de movimiento y temas oscuro/claro/automático por sistema.

## Primeros pasos

1. Abre la web y elige «Portadora AM».
2. Pulsa **Activar audio**; empieza con volumen bajo.
3. Arrastra el dial o pulsa la frecuencia para introducirla. Prueba los pasos y el filtro.
4. Elige «Emisoras cercanas» y sintoniza 14,200 o 14,204 MHz. Para la SSB utiliza LSB y compara USB; para Morse selecciona su escenario.
5. Guarda una memoria o añade una anotación. El libro empieza vacío; puedes cargar ejemplos etiquetados DEMO para probar el mapa.

Atajos fuera de campos y botones: **↑/↓** sintonizan, **Espacio** pausa y **M** silencia. En el dial: flechas, Page Up/Down, rueda y arrastre. En el espectro: clic para sintonizar y flechas izquierda/derecha.

## Desarrollo

Requisitos: Node.js **24 LTS** (mínimo 22.18) y npm.

```sh
npm ci
npm run dev
npm run lint
npm test
npm run build
node scripts/check-build.mjs
npm run preview
```

La base es **`/Radiolab/`**: utiliza la URL completa que imprime Vite. No abras `index.html` mediante `file://`. `lint` ejecuta TypeScript estricto, comprobación sintáctica de scripts y coherencia de versión/codificación. Las pruebas usan el ejecutor nativo de Node y no requieren hardware ni red. `check-build` verifica los recursos del worker, el fallback offline y el aislamiento de cachés en un entorno simulado; no sustituye una prueba del modo avión en un móvil real.

`node scripts/icons.mjs` regenera los iconos originales. Los binarios PNG están incluidos; no hace falta ejecutar el generador para compilar.

## Publicación

Se trabaja en **`main`**. `.github/workflows/deploy.yml` ejecuta `npm ci`, comprobaciones, pruebas, compilación y verificación PWA antes de publicar el artefacto `dist` con las acciones oficiales de Pages. Los pull requests verifican pero no despliegan.

En este repositorio, **Settings → Pages → Source: GitHub Actions** ya estaba seleccionado al iniciar el proyecto. En un fork, el propietario debe seleccionar esa opción y comprobar que Actions está permitido. `vite.config.js` configura `/Radiolab/`; cambia `base` si renombras el repositorio. La navegación usa hash, sin reescrituras del servidor.

## Instalar y actualizar

En Chrome/Edge compatibles: menú → **Instalar Radiolab**, o el botón de instalación de la aplicación si el navegador ofrece el evento de instalación. En Android, usa «Instalar aplicación» desde el menú. En iOS, Compartir → Añadir a pantalla de inicio. Hace falta HTTPS y una primera carga completa.

Una nueva compilación genera un identificador de caché por contenido. El worker nuevo espera y muestra «Nueva versión disponible»; pulsa **Actualizar** para activarlo. Los directorios externos siguen necesitando conexión. Las preferencias y contactos no se borran al actualizar la app, pero sí al borrar los datos del navegador. Exporta copias del libro periódicamente.

## Modos y limitaciones

| Origen/capacidad | Estado v0.1.0 |
| --- | --- |
| DEMO sintética y audio original | Operativa |
| RX real en páginas externas | Enlaces, sujeto al operador |
| Integración directa de SDR remoto | Contrato preparado; sin conexión |
| SDR USB mediante puente local | Fase posterior |
| Control CAT de transceptor | Fase posterior |
| DAB+ | No disponible; necesita SDR y decodificador |
| Transmisión RF / PTT | Bloqueada; sin endpoint ni adaptador TX |
| SWR, potencia y temperatura reales | No disponibles; valores ausentes |

No es un SDR profesional ni un simulador electromagnético completo. La pantalla de espectro es una síntesis analítica didáctica, no una FFT de muestras I/Q de hardware. AM/SSB/CW muestran selección simplificada de tonos; no hay recuperación de voz real, receptor FM completo, servidor ni puente instalado. No se simulan oyentes ni contactos en directo. Los escenarios usan frecuencias de ejemplo y no confieren autorización para transmitir.

## Privacidad y datos

Toda la información de estación queda en `localStorage` bajo `radiolab.state`, con `schema: 1`. Los ejemplos llevan origen DEMO. El mapa solo dibuja lo que el usuario incorpora y no pide geolocalización. Los archivos importados se validan antes de cambiar el libro; los ID coincidentes se actualizan y el máximo es 5000 anotaciones/5 MB. No se comparten con servicios externos. Al abrir enlaces de terceros se aplican sus propias políticas; GitHub Pages proporciona el alojamiento y su infraestructura tiene sus propios registros.

## Documentación y siguientes fases

- [Arquitectura, contratos y decisiones](docs/architecture.md)
- [Hardware opcional y Puxing](docs/hardware.md)
- [Integraciones externas](docs/integrations.md)
- [Alcance RX/DEMO y futuras condiciones de TX](docs/legal.md)
- [Pruebas y criterios de aceptación](docs/validation.md)
- [Cambios](CHANGELOG.md) · [Dependencias y licencias](THIRD_PARTY_NOTICES.md)

Siguiente fase: puente Windows de solo recepción con RTL-SDR, validación con muestras I/Q reales y decodificador adecuado; después CAT/Hamlib y DAB+. TX queda fuera de esta versión y requiere un diseño, permisos y comprobaciones independientes.
