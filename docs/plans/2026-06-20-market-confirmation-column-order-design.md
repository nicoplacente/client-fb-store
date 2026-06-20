# Orden de columnas de los modales de canje

## Objetivo

Reordenar el contenido de los modales de canje sin modificar su lógica, componentes, estilos ni comportamiento.

## Diseño

- En modales de tres columnas: información adicional o interacción, descripción y canje.
- En modales de dos columnas: descripción y canje.
- El mismo orden se aplica cuando las columnas se apilan en mobile.
- Cada sección conserva la proporción que tenía antes del cambio de orden: el contenido interactivo mantiene `0.85fr`, la descripción mantiene `1fr` y el canje mantiene `0.72fr` en modales de tres columnas.
- En modales de dos columnas, la descripción mantiene `1.18fr` y el canje mantiene `0.82fr`.
- Los bordes divisores se trasladan junto con el nuevo orden para mantener la separación visual actual.

## Verificación

- Revisar modales de ruleta, timeout, audio y screamer.
- Revisar productos con modal de dos columnas.
- Confirmar el orden en desktop y mobile.
- Ejecutar el build de producción.
