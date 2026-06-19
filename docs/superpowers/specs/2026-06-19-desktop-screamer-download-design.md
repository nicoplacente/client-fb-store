# Descarga de FB Store Screamer

## Objetivo

Permitir que los usuarios autorizados descarguen el instalador de escritorio desde el botón "Descargar StreamScream" existente en el encabezado del dashboard.

## Diseño

- Copiar `app-desktop-screamer/dist/FB Store Screamer.exe` a `client-fb-store/public/downloads/FB-Store-Screamer.exe`.
- Reemplazar el botón visual existente por un enlace de descarga que conserve exactamente sus estilos e icono.
- Usar `/downloads/FB-Store-Screamer.exe` como URL pública y el atributo `download` para indicar al navegador que debe guardar el archivo.
- Mantener el acceso dentro del dashboard existente, sin agregar lógica de negocio, estado de cliente ni dependencias.

## Manejo de errores

El archivo será servido directamente por Next.js como recurso estático. Si el instalador no está incluido en el despliegue, el servidor responderá con el estado HTTP correspondiente sin introducir estados adicionales en la interfaz.

## Verificación

- Confirmar que el archivo público coincide en tamaño y hash con el ejecutable generado.
- Ejecutar el build de producción del cliente.
- Verificar que el enlace renderizado apunta al archivo público y conserva accesibilidad por teclado.
