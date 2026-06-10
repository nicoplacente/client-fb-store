# Premio de ruleta en perfil y etiquetas radiales

## Objetivo

- Mostrar en `Mis canjes` el premio obtenido al canjear un producto de tipo
  ruleta.
- Dibujar cada nombre de premio en una única línea radial dentro de su segmento.

## Diseño

El historial conservará `wheelPrizeName` desde la respuesta del servidor, el
canje local y el respaldo basado en tickets. La tarjeta del canje mostrará el
texto `Premio ganado: <premio>` únicamente cuando ese dato exista.

La ruleta mantendrá sus estilos actuales. Solo cambiará la distribución del
texto: no se dividirá en varias líneas, se alineará desde el centro hacia el
borde y reducirá automáticamente el tamaño de fuente para ajustarse al ancho
radial y al ángulo disponible.

## Validación

- Compilar el cliente.
- Verificar que los canjes normales no muestren un premio.
- Verificar que un canje de ruleta muestre `wheelPrizeName`.
- Verificar que los nombres se dibujen en una sola línea radial.
