# Giro, resultado y efecto sincronizados de la ruleta

## Objetivo

- Mantener sin cambios funcionales ni visuales la ruta `/stream/wheel`.
- Mostrar la misma ruleta dentro del modal del producto al confirmar el canje.
- Ocultar el premio hasta que termine el giro.
- Ejecutar el timeout de Kick cuando la ruleta se detenga.

## Cliente

La implementación visual actual de la rueda se extraerá a un componente
reutilizable. La ruta `/stream/wheel` seguirá controlando su socket, cola,
confeti, resultado y salida exactamente como hasta ahora.

El modal del market utilizará ese mismo componente visual con los premios y el
ganador autoritativo devueltos por el servidor. Durante el giro no mostrará el
nombre ganador ni permitirá cerrar el diálogo. Al detenerse, reemplazará la
rueda por el resultado existente y solicitará la ejecución del efecto pendiente.

## Servidor

El canje continuará seleccionando y persistiendo el ganador dentro de la
transacción actual. El evento `wheel:spin` se seguirá emitiendo inmediatamente
para que `/stream/wheel` comience su animación sin cambios.

Los timeouts de ruleta dejarán de ejecutarse inmediatamente después de emitir
el evento. Un endpoint autenticado e idempotente permitirá que el comprador
solicite la ejecución al terminar su animación. El servidor conservará una
ejecución diferida de respaldo para evitar que el efecto quede pendiente si el
cliente se desconecta.

La ejecución reclamará atómicamente el efecto pendiente antes de llamar a Kick,
evitando que el cliente y el respaldo apliquen el mismo timeout dos veces.

## Compatibilidad

- No cambian las probabilidades ni la selección del ganador.
- No cambian el socket ni el contrato de `wheel:spin`.
- No cambian el diseño, la duración ni las fases de `/stream/wheel`.
- Los efectos de créditos conservan su comportamiento transaccional actual.
- Los productos que no son ruletas conservan su flujo actual.

## Verificación

- Compilar cliente y servidor.
- Confirmar que `/stream/wheel` sigue recibiendo, encolando y mostrando giros.
- Confirmar que el modal muestra la rueda antes del resultado.
- Confirmar que el timeout se solicita al detenerse la rueda.
- Confirmar que dos solicitudes simultáneas no ejecutan el timeout dos veces.
