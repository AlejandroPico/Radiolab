# Arquitectura · v0.2.0

Radiolab es una SPA estática React/TypeScript/Vite sin servidor, claves ni hardware obligatorio. `App` coordina estado y navegación hash; las vistas y modelos están separados.

| Área | Archivos | Responsabilidad |
| --- | --- | --- |
| Dominio | `src/core/types.ts`, `radio.ts` | RadioState, SignalSource, ReceiverSource, TransceiverController, TelemetryProvider y TransmitInterlock |
| Síntesis | `src/adapters/demo.ts`, `audio.ts` | Espectro analítico y audio PCM deterministas; Web Audio solo tras acción explícita |
| Reloj | `src/core/clock.ts` | Tiempo de simulación común y pausa |
| Adaptadores futuros | `src/adapters/remote.ts` | Contratos remote/localBridge que rechazan la conexión hasta implementar un servicio comprobado |
| Instrumentos | `src/components/Instruments.tsx` | Canvas con ResizeObserver y requestAnimationFrame; limpieza en desmontaje |
| Estación | `src/features/Receiver.tsx` | Controles, VFO, escenarios, memorias, filtros y telemetría ausente |
| Registro | `src/core/logbook.ts`, `src/features/Logbook.tsx` | Validación, CSV/JSON, combinación por ID y CRUD |
| Mapa | `src/core/geo.ts`, `src/features/ContactMap.tsx` | Proyección equirectangular esquemática, círculo máximo y separación al cruzar el meridiano 180° |
| Datos | `src/core/storage.ts` | Esquema 1, valores por defecto, recuperación y límites |
| Offline | `scripts/service-worker.mjs`, `vite.config.js` | Precache de recursos compilados, aislamiento Radiolab y actualización explícita |

## Flujo de señal

El escenario fija portadoras en frecuencias absolutas. El VFO y el desplazamiento determinan la ventana del espectro. El filtro dibuja una banda de paso y limita la recepción de los tonos; USB y LSB seleccionan lados distintos. S-meter y squelch utilizan la misma función de nivel simulado. El audio se sintetiza por buffers PCM de 80 ms programados con un margen de 150 ms; el osciloscopio representa la misma función matemática. El reloj común mantiene coherencia temporal del Morse. El mute/pausa cierra inmediatamente una ganancia de salida; otros cambios pueden tardar el margen de audio ya programado.

El espectro de 768 bins es una envolvente analítica, **no una transformada FFT sobre muestras I/Q**. El ruido es pseudoaleatorio determinista, con `Math.sin` y semilla implícita, sin `Math.random`. AM, SSB y CW son ejercicios de tonos y selección de banda. FM/NFM están disponibles como modo de interfaz con tono de prueba; un demodulador real está pendiente y se indica en la UI. El AGC ilustra una limitación de ganancia, sin pretender reproducir un circuito real.

## Fuente y control

`SignalSource` expone metadatos con `kind`, frecuencia central, sampleRate, bandwidth, timestamp en segundos de simulación, etiqueta e `isSynthetic`. `DemoSource` implementa el contrato. `ReceiverSource` agrupa fuente y estado de conexión. Ningún conector pendiente devuelve una fuente falsa.

`MockController` solo sintoniza y tiene `canTransmit: false`. `TransmitInterlock.check()` siempre deniega. No existe método operativo de PTT, transporte TX ni endpoint servidor. `TelemetryProvider` devuelve `null` para SWR, potencia y temperatura. Los guiones de pantalla significan ausencia de dato.

## Decisiones

- Hash para navegación robusta en Pages; sin servidor de rutas.
- `localStorage` para una V1 pequeña; no implica sincronización entre dispositivos. La importación es atómica y no hay datos DEMO de contactos sin elección del usuario.
- Mapas originales esquemáticos para evitar dependencias de teselas, claves, geolocalización o peticiones externas.
- Tema automático por hora local del dispositivo. La extensión solar necesita consentimiento de geolocalización y no está implementada.
- Menú y diálogos añaden una entrada temporal al historial: atrás cierra el panel superior. Los diálogos usan foco modal nativo.
- Frames limitados aproximadamente a 25 fps; reducción de movimiento reduce la tasa del espectro. El procesamiento PCM no depende del render React. Canvas y timers se limpian al desmontar.
- No hay API de analítica ni llamadas a SDR externos. Todos los iconos y sonidos del proyecto son propios.

## Hoja de ruta

1. Puente Windows solo RX con origen local autenticado y permisos de conexión explícitos. Primer candidato: RTL-SDR; validar drivers y muestras I/Q reales.
2. DSP de demodulación real en worker/AudioWorklet, flujos binarios, control de latencia y metadatos medidos.
3. SDRplay según licencia/API; control Hamlib/CAT mediante backend local, sin publicar puertos al Internet abierto.
4. DAB+ con decodificador libre y estudio de sus licencias de distribución.
5. Si procede, diseño independiente de autenticación, roles e interbloqueos para operación de equipo físico. TX no se activa por editar una preferencia del navegador.

