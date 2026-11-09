# Integraciones y fuentes externas

La única fuente implementada es `DemoSource`. No se pide ninguna API key.

| Servicio | Acceso v0.1.2 | Condición |
| --- | --- | --- |
| [WebSDR](https://www.websdr.org/) | Enlace a directorio | Uso en la interfaz del operador |
| [KiwiSDR](https://rx.kiwisdr.com/) | Enlace a directorio | Disponibilidad y permisos de cada receptor |
| [Receiverbook](https://www.receiverbook.de/) | Enlace a directorio, incluido OpenWebRX | Consulta de su web; sin extracción automática |
| SDR remoto embebido | No implementado | Hace falta endpoint autorizado, protocolo, CORS y condiciones compatibles |
| SDR local | No implementado | Requiere puente local y hardware real |
| CAT / Hamlib | No implementado | Backend local, perfiles de equipo y validación física |
| DAB+ / welle.io | Investigación posterior | Hardware, motor decodificador y licencias a verificar |
| PSK Reporter, WSPR y DXMaps | Sin conexión ni scraping | Revisar API, límites, licencias y consentimiento antes de integrar |

Los enlaces externos necesitan red. No se hace iframe ni se intenta eludir restricciones de acceso, CORS o cupos. Radiolab no presenta audio externo como propio ni inventa un número de oyentes.

## Futura aplicación puente

El contrato `ReceiverConnector` tiene `kind`, `available` y `connect(URL)`. En V1 `remoteConnector` y `localBridgeConnector` tienen disponibilidad falsa y rechazan cualquier conexión con una explicación. No abren sockets. Una implementación futura deberá comprobar operador y permiso, definir formato I/Q/audio/FFT, reloj, calibración y límites; cerrar recursos al desconectar y conservar `isSynthetic` de forma inequívoca.

