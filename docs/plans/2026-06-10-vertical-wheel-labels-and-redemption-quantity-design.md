# Etiquetas verticales y cantidad de canjes

## Objetivo

- Rotar 90 grados el nombre completo de cada premio dentro de la ruleta.
- Mostrar siempre la cantidad comprada en `Mi perfil > Mis canjes`.

## Diseño

La etiqueta de cada segmento conservará su posición, tipografía, tamaño,
contorno y color. Solo se añadirá una rotación fija de 90 grados después de
ubicarla dentro del segmento.

La tarjeta de cada canje mostrará `Cantidad: X` junto al costo y la fecha,
utilizando el campo `quantity` ya presente en el historial.

## Validación

- Compilar el cliente.
- Confirmar que la etiqueta completa queda rotada 90 grados.
- Confirmar que todos los canjes muestran una cantidad mínima de una unidad.
