# Canjes de audio moderados para OBS

## Objetivo

Agregar el tipo de evento de producto `audio_submission`. Cada canje habilita
una grabacion de audio que requiere revision antes de ingresar a una cola FIFO
para OBS. El canje permanece como historial aunque el archivo temporal sea
eliminado.

## Flujo del usuario

1. El producto de audio se canjea siempre de a una unidad.
2. El modal muestra una tercera columna con la duracion maxima y el estado.
3. La grabacion se habilita solamente despues de confirmar el canje.
4. El usuario puede grabar, escuchar, descartar y enviar el audio.
5. Si cierra el modal, puede retomar el canje desde Mis canjes.
6. El primer rechazo permite una segunda grabacion.
7. El segundo rechazo cierra el canje sin devolver creditos.
8. El usuario ve el estado, el motivo del rechazo y notificaciones en tiempo
   real.

## Moderacion

Dashboard > Canjes permite escuchar cada audio pendiente, aprobarlo o
rechazarlo. El rechazo exige un motivo. Un audio aprobado ya no puede
reemplazarse ni rechazarse.

## Overlay

La ruta `/stream/audio` reproduce automaticamente los audios aprobados en
orden FIFO. Nunca inicia un audio hasta que termina el anterior. Al recibir el
evento `ended`, confirma la reproduccion al servidor. Si el overlay se cierra
o falla, no confirma y el audio vuelve a estar disponible cuando vence su
bloqueo.

## Estados

- `awaiting_audio`: esperando grabacion.
- `pending_review`: pendiente de revision.
- `retry_allowed`: primer audio rechazado, permite regrabar.
- `rejected`: segundo audio rechazado.
- `approved`: aprobado y en cola.
- `playing`: reclamado temporalmente por OBS.
- `played`: reproducido y limpiado.

## Interfaz

La interfaz reutiliza el modal de tres columnas, los componentes y los tokens
visuales existentes. La grabadora muestra temporizador, limite, vista previa,
intentos restantes, estados de microfono, carga, error y resultado.

## Seguridad

- Ninguna subida es valida sin usuario autenticado y canje propio de audio.
- El servidor controla intentos, estado, MIME, tamano y duracion.
- Cerrar el modal o denegar el microfono no consume intentos.
- El archivo se guarda con una clave impredecible bajo `audios/`.
- Dashboard y OBS obtienen el audio mediante endpoints autorizados.
- OBS usa un token privado y un reclamo temporal para evitar duplicados.
- El archivo se elimina despues de la confirmacion de reproduccion.
- El historial del canje nunca se elimina.

## Configuracion

La duracion maxima se configura por producto entre 5 y 60 segundos, con 15
segundos por defecto. Cada archivo tiene un limite adicional de 5 MB.

## Verificacion

- Canje unitario y descuento atomico.
- Grabacion inicial y reanudacion desde Mis canjes.
- Primer rechazo con segundo intento.
- Segundo rechazo definitivo sin reembolso.
- Aprobacion, cola FIFO y reproduccion secuencial.
- Recuperacion cuando OBS no confirma.
- Eliminacion del archivo despues de reproducir.
- Persistencia del historial en Dashboard y perfil.
- Builds de cliente y servidor.
