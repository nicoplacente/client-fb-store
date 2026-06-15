# Watchtime y responsive del perfil

## Objetivo

Mejorar la lectura del watchtime y corregir la presentacion movil de las
pestanas del perfil y de la seccion `Mis subs`, sin modificar el resto de la
pagina.

## Watchtime

El valor recibido en minutos se mostrara siempre como dias, horas y minutos.
Las tres unidades permaneceran visibles aunque alguna tenga valor cero.

## Pestanas

En pantallas pequenas, los iconos y textos se apilaran para evitar cortes y
desbordamientos. Desde `sm`, conservaran la composicion horizontal actual.

## Mis subs

Las estadisticas se apilaran en movil. Cada premio organizara el identificador
y el contenido en dos columnas, mientras que la accion ocupara todo el ancho.
En pantallas mayores se conservara la disposicion horizontal.

La linea de hitos mantendra desplazamiento horizontal dentro de su contenedor,
sin ampliar el ancho de la pagina.

## Validacion

- Comprobar watchtime con unidades en cero.
- Revisar las tres pestanas en ancho movil.
- Revisar estadisticas, premios, acciones y linea de hitos de `Mis subs`.
- Compilar la aplicacion.
