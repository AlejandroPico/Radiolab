# Hardware opcional

La versión 0.2.0 no necesita ni controla hardware. No hay que comprar nada para utilizarla.

## Próxima integración de recepción

Un RTL-SDR conectado a Windows es un candidato para validar el primer puente local de solo RX. SDRplay es otra familia a estudiar. Drivers, ancho de banda, frecuencia mínima/máxima, licencia de API y antenas se comprobarán para el modelo real. No se prometen compatibilidad ni instalaciones ya ejecutadas.

## Transceptor futuro

En la conversación de diseño se plantearon Yaesu FT-710 Field, FT-991A, FT-891 y Xiegu G90 como candidatos para una estación más completa. No se hace una recomendación de compra ni se fijan precios aquí: haría falta verificar modelo, CAT, audio, fuentes, antenas, conectores y condiciones de uso antes de elegir. HF no equivale a recepción DAB+.

Hamlib (`rigctld`) sería un componente de control local, nunca un puerto expuesto directamente en Internet. Su integración y pruebas físicas están pendientes.

## Puxing PX-888 del propietario

Antes de cualquier modificación hay que identificar PX-888/PX-888K, variante VHF/UHF, batería y estado. El cable de programación específico debe comprobarse contra el pinout del modelo, sin asumir que cualquier cable sirve. Un cable de memorias no convierte el walkie en SDR ni garantiza control CAT en directo.

Las memorias «Dragón 1–6» se conservarán: primero leer y guardar una copia, sin sobrescribir ajustes. Radiolab no las lee, programa ni utiliza para transmitir. Tampoco debe deducirse que sus frecuencias tengan autorización de uso. La conexión de audio requiere adaptación de niveles y aislamiento; no hay un circuito de conexión de audio implementado en este proyecto.

