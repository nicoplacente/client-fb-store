# Corrección del salto del modal al seleccionar un screamer en mobile

## Problema

El radio oculto de cada opción de screamer usa posicionamiento absoluto sin un contexto local. Al recibir foco en navegadores mobile, su posición puede calcularse respecto de un ancestro del modal y provocar un desplazamiento incorrecto del contenedor.

## Diseño

Cada tarjeta será el contexto de posicionamiento del radio y el control quedará anclado dentro de sus límites. Se mantienen la estructura visual, los scrolls existentes, la selección mediante radio y la navegación por teclado.

## Verificación

- Seleccionar opciones ubicadas al inicio y al final de la lista en un viewport mobile.
- Confirmar que el modal no cambia de posición ni queda cortado.
- Confirmar que la opción seleccionada conserva su indicador visual y que el control sigue siendo accesible mediante teclado.
