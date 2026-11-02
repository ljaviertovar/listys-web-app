## ADDED Requirements

### Requirement: The usual-store sheet explains how the store is decided

La hoja para fijar la tienda habitual SHALL abrir con el nombre del artículo y decir si la tienda es automática (con cuántas de
sus compras registradas ocurrieron allí), manual ("It stays there until you change it.") o aún no existe (cuántas compras hacen
falta). SHALL mostrar por tienda el último precio y su fecha cuando hay, o el número de compras, o "Not bought there yet", y
SHALL cerrar con que una tienda elegida se queda hasta que el usuario la cambie y que los recibos no la mueven.

#### Scenario: Automatic store
- **WHEN** "Milk" tiene 5 de 7 compras en "No Frills" y la tienda es automática
- **THEN** la hoja dice "Automatic · No Frills" y "Bought there 5 of 7 times"

#### Scenario: Price per store
- **WHEN** el artículo tiene un precio registrado de $1.68 en Walmart el 28 Oct 2026
- **THEN** la fila de Walmart dice "Last $1.68 · 28 Oct 2026"

#### Scenario: Hidden store embeds
- **WHEN** un colaborador no puede leer las tiendas de las estadísticas
- **THEN** `purchase_total` no cuenta esas filas

### Requirement: A list can be narrowed to the items of one store

Una lista con al menos un artículo con tienda habitual SHALL ofrecer "Show items from" con All Stores, cada tienda con su
recuento y "No Usual Store". La elección SHALL guardarse en `?store=`, actualizar el recuento de la pantalla y MUST NOT cambiar
los ítems con los que se empieza un viaje. Un valor sin ítems en esa lista SHALL ignorarse.

#### Scenario: Narrow to a store
- **WHEN** el usuario elige "Walmart"
- **THEN** la pantalla muestra solo los ítems cuya tienda habitual es Walmart y el recuento los cuenta

#### Scenario: Stale link
- **WHEN** la URL trae `?store=` de una tienda sin ítems en la lista
- **THEN** la pantalla muestra todos los ítems