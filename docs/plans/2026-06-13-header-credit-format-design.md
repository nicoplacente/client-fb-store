# Diseño del formato de créditos del header

## Alcance

Mostrar créditos y puntos compactos con un decimal truncado, sin redondear, y
ocultar el decimal cuando sea cero.

## Formato

- `49.977.000` se muestra como `49.9M`.
- `50.000.000` se muestra como `50M`.
- `1.999.000` se muestra como `1.9M`.
- El atributo `title` conserva la cantidad exacta localizada.

## Implementación

Mantener el formateador existente del header y reemplazar el redondeo de
`toFixed(1)` por un truncado matemático a un decimal. El mismo comportamiento
se aplica a miles, millones y miles de millones.

## Verificación

- Comprobar valores compactos exactos y con decimales.
- Ejecutar el build de producción.
