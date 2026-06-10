# Correccion del overlay y editor de la ruleta

## Problemas

- La transparencia y el ocultamiento del layout solo existen mientras hay una
  ruleta activa. Al finalizar, OBS vuelve a mostrar la pagina completa.
- La rueda depende de CSS dinamico y no anima de forma confiable en el
  navegador embebido de OBS.
- El formulario usa identificadores temporales debiles y la recarga automatica
  del dashboard puede reemplazar premios sin guardar.

## Solucion

- La ruta `/stream/wheel` conserva siempre un marcador en el DOM. Los estilos
  globales usan ese marcador para eliminar fondo, espaciado, header, sidebar y
  navegacion desde el primer render, incluso cuando no hay una animacion activa.
- La rueda se dibuja en `canvas` y gira con Web Animations. El resultado sigue
  siendo el ganador recibido desde el servidor.
- Al terminar el giro se muestra confeti y un resultado grande. Luego el
  overlay sale y vuelve a quedar completamente transparente.
- Las animaciones recibidas durante otra ejecucion quedan en cola.
- Los premios nuevos usan identificadores temporales unicos.
- El borrador se marca como modificado y no puede ser reemplazado por la
  actualizacion automatica del dashboard. Al guardar correctamente se
  reemplaza por la configuracion persistida.

## Verificacion

- Compilar el cliente con Next.js.
- Confirmar que `/stream/wheel` responde sin contenido visible cuando esta
  inactiva.
- Verificar que la rueda gira, termina en el ganador, muestra confeti y
  desaparece.
- Agregar al menos tres premios, editar sus valores y comprobar que ninguna
  fila se reemplaza o desaparece.
