# Detalle de productos y resultado de ruleta

## Objetivo

- Ampliar el modal de canje existente con el detalle del producto.
- Mostrar los premios y sus probabilidades en productos de tipo ruleta.
- Mostrar al usuario el premio obtenido sin depender de la vista del stream.

## Diseño

El modal de confirmación conservará su comportamiento actual para paquetes y
productos normales. Cuando se abra desde una tarjeta de producto, usará una
distribución responsive de dos columnas: el resumen y la acción de canje a la
izquierda, y el detalle del producto a la derecha.

Los productos con `rewardEffectType: "reward_wheel"` mostrarán los premios
configurados y su probabilidad. Durante su canje, el modal permanecerá abierto
y reemplazará el resumen por el resultado devuelto por la API. El stream y su
socket seguirán funcionando sin cambios.

## Validación

- Compilar el cliente.
- Verificar productos normales, productos sin stock y paquetes de créditos.
- Verificar el detalle responsive en escritorio y móvil.
- Verificar premios y probabilidades de una ruleta.
- Verificar el estado de procesamiento, el premio ganador y el cierre final.
