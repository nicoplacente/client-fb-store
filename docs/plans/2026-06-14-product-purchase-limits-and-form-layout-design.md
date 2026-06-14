# Limites de compra y layout del formulario de producto

## Objetivo

Mejorar la alineacion de la configuracion de cantidad por canje y evitar que el
usuario seleccione mas unidades de las que puede pagar o de las disponibles.

## Dashboard

La opcion `Una unidad por canje` se mostrara debajo de la fila formada por
`Precio` y `Stock`, ocupando todo el ancho del formulario. Mantendra el patron
visual de configuraciones del dashboard sin alterar el campo de stock ni el
selector de stock ilimitado.

## Market

La cantidad maxima de un canje sera el menor valor entre:

- el stock disponible, cuando sea limitado;
- la cantidad de unidades que permiten los creditos actuales del usuario.

Para stock ilimitado, el limite dependera solamente de los creditos. El input,
los botones de cantidad y la cantidad normalizada respetaran ese maximo.

Si el usuario no puede pagar una unidad, el modal podra abrirse, mostrara
`Creditos insuficientes` y deshabilitara el boton de canje.

## Servidor

El rechazo por saldo insuficiente devolvera el codigo publico
`INSUFFICIENT_CREDITS`. El cliente lo mostrara como `Créditos insuficientes`,
protegiendo tambien solicitudes manipuladas o saldos desactualizados.

## Validacion

- Revisar la alineacion del formulario en escritorio y movil.
- Limitar productos de stock ilimitado segun creditos.
- Limitar productos de stock finito segun stock y creditos.
- Deshabilitar el canje cuando no alcanza para una unidad.
- Verificar el toast publico del servidor.
- Compilar cliente y servidor.
