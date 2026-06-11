# Diseño de SEO y accesibilidad

## Alcance

Mejorar la metadata, indexación, semántica y navegación por teclado sin cambiar
la identidad visual ni eliminar animaciones.

## Indexación

- Indexar las rutas públicas, incluida `/stream`.
- Excluir `/dashboard`, `/profile`, `/stream/alerts` y `/stream/wheel`.
- Mantener `/api` fuera del rastreo.
- Unificar canonical, Open Graph, Twitter, robots y sitemap con el mismo dominio.

## Implementación

- Centralizar la creación de metadata en una utilidad reutilizable.
- Usar layouts de App Router para aportar metadata a páginas cliente.
- Añadir un enlace para saltar al contenido principal y estilos de foco globales.
- Mejorar roles, estados ARIA, etiquetas y gestión inicial del foco en controles
  interactivos existentes.
- Corregir textos visibles y metadata con errores ortográficos.
- Respetar `prefers-reduced-motion` sin modificar las animaciones habituales.

## Verificación

- Ejecutar el build de producción.
- Comprobar metadata, navegación por teclado y páginas principales en navegador.
