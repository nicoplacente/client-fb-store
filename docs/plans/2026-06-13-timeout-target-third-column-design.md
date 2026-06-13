# Selector de timeout en tercera columna

## Objetivo

Separar la selección del usuario objetivo del resumen de compra para que el
producto de timeout use la misma distribución de tres columnas que la ruleta.

## Diseño

En escritorio, el diálogo mostrará el resumen del canje, el detalle del
producto y el selector de usuarios en tres columnas. En pantallas menores, las
tres secciones se apilarán conservando ese orden.

El selector reutilizará `secondaryAside`, que ya controla la tercera columna
del diálogo para los premios de la ruleta. El diálogo permitirá personalizar
la superficie de esa columna para mantener el tono fucsia de la ruleta y usar
un tono rojo sutil en el timeout.

La búsqueda, la selección aleatoria, la selección específica y los estados de
carga, vacío y error conservarán su comportamiento actual.

## Validación

- Compilar el cliente.
- Verificar el diálogo de un producto de timeout en escritorio y móvil.
- Verificar que la ruleta conserve su tercera columna y su apariencia.
- Verificar selección aleatoria, selección específica, búsqueda y reintento.
