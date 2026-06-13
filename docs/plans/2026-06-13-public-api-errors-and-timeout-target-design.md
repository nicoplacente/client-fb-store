# Errores públicos y usuario objetivo del timeout

## Objetivo

Evitar que mensajes internos del servidor aparezcan en la interfaz y mostrar el
usuario afectado por un timeout en los historiales de canjes.

## Diseño

`getErrorMessage` dejará de devolver `error.message` y usará exclusivamente el
mensaje público definido por cada flujo. Los fallos al canjear un producto
mostrarán “Ocurrió un error al canjear el producto.”.

Los errores internos de efectos de productos y ruletas no se mostrarán en
toasts ni atributos `title`. La interfaz conservará únicamente estados
públicos como aplicado, pendiente o fallido.

Al guardar un canje local de timeout se completará el usuario objetivo con la
respuesta estructurada de la API. Para una selección específica, el nombre
seleccionado en el cliente será un respaldo. En una selección aleatoria, la API
deberá devolver el usuario finalmente elegido.

“Mis canjes” mostrará el usuario desde
`productEffectTargetUsername`. El panel administrativo priorizará campos
estructurados del ticket y mantendrá compatibilidad con mensajes históricos
que incluyan el usuario objetivo.

## Validación

- Compilar el cliente.
- Verificar que ningún toast muestre mensajes de `ApiError`.
- Verificar fallos de timeout y efectos fallidos.
- Verificar el usuario objetivo en “Mis canjes”.
- Verificar el usuario objetivo en “Canjes” del panel administrativo.
