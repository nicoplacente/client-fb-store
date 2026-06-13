# Filtros de productos del dashboard

## Objetivo

Facilitar que administradores y moderadores encuentren rápidamente un producto
para editarlo, incluso cuando el catálogo tenga muchos elementos.

## Diseño

La sección Productos incorporará una barra de filtros encima de la grilla. La
búsqueda coincidirá con nombre, descripción y categoría. Los filtros permitirán
acotar por categoría, estado, disponibilidad de stock y condición de destacado.

La barra mostrará la cantidad de resultados visibles y ofrecerá una acción para
limpiar todos los filtros. Cuando no existan coincidencias, la grilla mostrará
un mensaje específico sin confundirlo con un catálogo vacío.

## Arquitectura y datos

El estado de los filtros permanecerá dentro de `ProductsPanel`, ya que solo
afecta la presentación del catálogo administrativo. Las categorías y los
productos visibles serán valores derivados de `items`; no se duplicarán en
estado ni se realizarán solicitudes adicionales al servidor.

La búsqueda usará un valor diferido para mantener fluida la escritura. El
filtrado se implementará en una utilidad pura y reutilizable dentro del dominio
del catálogo.

## Accesibilidad y estados

Cada control tendrá una etiqueta accesible. El botón para limpiar filtros solo
se mostrará cuando haya algún filtro activo. La interfaz conservará los estados
de foco, hover y vacío del sistema visual existente.

## Verificación

Se verificará la combinación de todos los filtros, la limpieza del formulario,
el mensaje sin resultados y la compilación de producción.
