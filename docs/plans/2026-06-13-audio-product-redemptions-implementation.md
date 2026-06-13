# Plan de implementacion de canjes de audio

1. Extender normalizacion, formularios y payloads de productos con
   `audio_submission` y `audioMaxDurationSeconds`.
2. Agregar el grabador reutilizable y conectarlo al modal de compra despues del
   canje.
3. Permitir retomar grabaciones y consultar estados desde Mis canjes.
4. Extender Dashboard > Canjes con reproduccion, aprobacion y rechazo con
   motivo.
5. Agregar notificaciones Socket.IO para cambios de estado.
6. Crear `/stream/audio` con reclamo, reproduccion secuencial y confirmacion.
7. Verificar accesibilidad, errores, estados vacios y build de Next.js.
