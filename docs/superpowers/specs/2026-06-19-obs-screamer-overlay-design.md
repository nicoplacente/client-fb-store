# Overlay de screamer para OBS

## Objetivo

Crear una fuente de navegador de OBS en `/stream/screamer` que reproduzca juntos el GIF y el audio configurados en un canje de tipo `desktop_screamer`, sin depender de la aplicación de escritorio.

## Alcance

- Agregar la ruta App Router `app/stream/screamer` al cliente.
- Emitir `screamer:trigger` públicamente desde el servidor, igual que los eventos de alertas y ruleta.
- Reutilizar el payload existente: `id`, `gifUrl`, `audioUrl`, `durationMs` y `volume`.
- No modificar `app-desktop-screamer`.
- No agregar dependencias.

## Arquitectura

El servidor construye el evento con los medios elegidos al canjear el producto y lo emite a todos los clientes Socket.IO. La página de OBS mantiene una cola local, valida cada payload y reproduce un elemento `img` y un elemento `audio` sincronizados. Solo existe una reproducción activa.

La ruta tendrá un `layout.jsx` con metadata no indexable y un `page.jsx` cliente, siguiendo las rutas `/stream/alerts` y `/stream/wheel`.

## Flujo de reproducción

1. La overlay se conecta a `envConfig.SOCKET_URL`.
2. Al recibir `screamer:trigger`, normaliza y valida el evento.
3. Descarta identificadores duplicados y limita la cola para evitar crecimiento sin control.
4. Precarga el GIF y el audio antes de iniciar.
5. Reinicia el GIF y comienza el audio en el mismo ciclo de reproducción.
6. Mantiene el GIF visible durante `durationMs` y aplica `volume` al audio.
7. Al terminar, detiene y limpia ambos medios y procesa el siguiente evento.

## Presentación

La página será transparente y ocupará todo el viewport de OBS. El GIF usará `object-fit: contain` para conservar su proporción y cubrir el área disponible sin recortarse. No se mostrarán controles, textos ni elementos decorativos.

## Validación y errores

- Se aceptan únicamente payloads con identificador y URLs HTTP o HTTPS válidas.
- La duración se limita entre 2 y 30 segundos y el volumen entre 0 y 1.
- Un error al precargar un recurso cancela ese evento y permite continuar con el siguiente.
- La desconexión de Socket.IO usa su reconexión automática.
- Al desmontar la página se desconectará el socket, se cancelarán temporizadores y se detendrá el audio.

## Verificación

- Construcción de producción del cliente.
- Pruebas del servidor existentes.
- Revisión del flujo con eventos válidos, duplicados, inválidos y múltiples eventos consecutivos.
