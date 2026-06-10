# Distribucion adaptativa de etiquetas

## Alcance

Modificar solamente la distribucion de los nombres de premios dentro del disco.
No se alteran colores, aro, puntero, animacion, resultado ni confeti.

## Comportamiento

- Dividir nombres en hasta tres lineas equilibradas.
- Calcular el espacio disponible a partir del angulo de cada segmento.
- Reducir progresivamente la tipografia en segmentos estrechos.
- Ubicar el texto mas cerca del borde cuando el segmento necesita mayor ancho.
- Limitar cada linea al ancho real disponible y aplicar una reduccion final si
  el texto aun no entra.
- Mantener el contorno oscuro para legibilidad durante el giro.

## Verificacion

- Compilar el cliente.
- Probar segmentos de distintos porcentajes.
- Probar nombres de una, dos y varias palabras.
- Confirmar que las etiquetas no se superponen con el centro ni con el aro.
