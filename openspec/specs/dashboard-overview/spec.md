# Dashboard Overview Specification

## Purpose

Que el dashboard enseñe lo que la aplicación ya sabe y sirve para decidir la siguiente compra —qué hace falta, cuánto
se ha gastado este mes y cuándo se fue a cada tienda— en lugar de recuentos de actividad.

## Requirements

### Requirement: The dashboard shows memory, not activity

Debajo del hero y de "Up Next", el dashboard SHALL mostrar las tarjetas "Shopping Lists", "Likely Needed", "This Month"
y "Last Trip by Store". MUST NOT mostrar las tarjetas de últimos recibos ni de historial de compras. Los recibos y el
historial SHALL seguir accesibles desde la navegación, y "Up Next" SHALL seguir avisando de recibos leídos pendientes
de añadir y de recibos fallidos. Mientras se muestra "Get Started", las tarjetas "Shopping Lists", "Likely Needed" y
"This Month" SHALL aparecer solo cuando tienen algo que enseñar: "Shopping Lists" con al menos una lista, "This Month" con
al menos un recibo subido y "Likely Needed" con al menos tres recibos o algún artículo probablemente necesario.

#### Scenario: Dashboard sections

- **WHEN** el usuario abre el dashboard
- **THEN** ve "Shopping Lists", "Likely Needed", "This Month" y "Last Trip by Store", y no ve "Receipts" ni "Shopping History"

#### Scenario: Waiting receipt

- **WHEN** hay un recibo leído que no se añadió a ninguna lista
- **THEN** "Up Next" sigue mostrando el aviso que lleva a ese recibo

#### Scenario: New account shows no empty sections

- **WHEN** una cuenta sin listas ni recibos abre el dashboard, donde se muestra "Get Started"
- **THEN** no ve "Shopping Lists", "This Month" ni "Likely Needed" vacías

#### Scenario: A section returns with its data

- **WHEN** esa cuenta crea su primera lista, o sube su primer recibo
- **THEN** "Shopping Lists" aparece con esa lista, o "This Month" aparece con ese recibo, sin esperar a que se cumplan los tres pasos

### Requirement: Likely Needed card

La tarjeta "Likely Needed" SHALL mostrar los artículos probablemente necesarios del usuario, hasta 5. Sin ninguno,
SHALL distinguir dos vacíos: ningún artículo tiene historial suficiente ("After a few trips, items you buy regularly
show up here.") o hay historial pero nada toca todavía ("Nothing looks due yet.").

#### Scenario: Items due

- **WHEN** "Milk" y "Eggs" son probablemente necesarios
- **THEN** la tarjeta los muestra con su explicación, el más atrasado primero

#### Scenario: New account

- **WHEN** ningún artículo del usuario tiene 3 compras
- **THEN** la tarjeta explica que los artículos aparecerán tras algunas compras

#### Scenario: Nothing due

- **WHEN** hay artículos con historial suficiente pero ninguno alcanza su intervalo
- **THEN** la tarjeta dice "Nothing looks due yet."

### Requirement: This Month sums only known totals

"This Month" SHALL mostrar el gasto del mes natural en curso, en la zona horaria del visitante, como la suma de los
totales de las compras completadas del usuario en el mes y de los totales de sus recibos subidos en el mes que no están
adjuntos a una compra. MUST NOT sumar precios de líneas, promedios ni estimaciones.

#### Scenario: Trips and receipts

- **WHEN** en el mes hay dos compras con total de $40 y $25, un recibo no adjunto con total de $30 y un recibo adjunto a una de esas compras
- **THEN** la tarjeta muestra $95 y "From 2 trips and 1 receipt"

#### Scenario: Trip without total

- **WHEN** además hay una compra completada en el mes sin total
- **THEN** la tarjeta añade "1 trip this month has no total" y no cambia la suma

#### Scenario: Month boundary in the visitor's timezone

- **WHEN** una compra se completó a las 23:30 del 31 de octubre en la zona horaria del visitante, que ya es 1 de noviembre en UTC
- **THEN** cuenta en octubre para ese visitante

#### Scenario: Nothing known

- **WHEN** no hay ningún total conocido en el mes
- **THEN** la tarjeta dice que no hay gasto registrado este mes y cómo registrarlo (el total al completar una compra o un recibo), sin mostrar "$0"

#### Scenario: Shared trips

- **WHEN** el usuario participó en una compra de una lista ajena
- **THEN** esa compra no suma en su "This Month"

### Requirement: This Month loads on its own

"This Month" SHALL mostrar un estado de carga mientras obtiene el gasto y, si falla, un aviso en la propia tarjeta con
"Try Again", sin impedir que el resto del dashboard se muestre.

#### Scenario: Spending request fails

- **WHEN** la lectura del gasto falla
- **THEN** solo la tarjeta "This Month" muestra el error y su reintento

### Requirement: Last Trip by Store

"Last Trip by Store" SHALL mostrar, por cada tienda del usuario con alguna visita, la más reciente: una compra
completada con esa tienda o un recibo con esa tienda confirmada, contando una sola vez un recibo adjunto a su compra.
Cada fila SHALL mostrar la tienda, la fecha y el total cuando se conoce, ordenadas de la más reciente a la más antigua,
hasta 4, y llevar a esa compra o a ese recibo.

#### Scenario: Two stores

- **WHEN** el usuario compró en "No Frills" el 20 de octubre con total $84,20 y subió un recibo de "Costco" el 12 de octubre sin total
- **THEN** la tarjeta muestra "No Frills · 20 Oct · $84.20" y debajo "Costco · 12 Oct" sin importe

#### Scenario: Attached receipt

- **WHEN** la última visita a "No Frills" es una compra con su recibo adjunto
- **THEN** aparece una sola fila para esa visita

#### Scenario: Store renamed

- **WHEN** el usuario renombra "No Frills" a "No Frills Bloor"
- **THEN** la fila muestra el nombre nuevo

#### Scenario: No store visits

- **WHEN** ninguna compra ni recibo del usuario tiene tienda
- **THEN** la tarjeta explica que aparecerá al confirmar la tienda de un recibo o al elegir una tienda al empezar una compra

### Requirement: Dashboard failure stays explicit

Si falla cualquiera de las lecturas que el dashboard hace en el servidor, incluidas las de artículos probablemente
necesarios y de tiendas, el dashboard SHALL mostrar su pantalla de error con "Try again" en lugar de tarjetas vacías.

#### Scenario: Likely-needed read fails

- **WHEN** falla la lectura de artículos probablemente necesarios
- **THEN** el dashboard muestra el error con "Try again" y no una tarjeta vacía

### Requirement: Spend This Month breaks the total down by store

La tarjeta "Spend This Month" SHALL listar hasta cinco tiendas con lo gastado en ellas en el mes (viajes completados más
recibos no adjuntos a un viaje), de mayor a menor, y una fila "Other" con lo que el total tiene y esas tiendas no (recibos sin
tienda confirmada, tiendas más allá de las cinco). Si el desglose no puede leerse, el total SHALL mostrarse igual.

#### Scenario: Receipt without a store
- **WHEN** el total del mes es $1,275.71 y las tiendas listadas suman $994.26
- **THEN** "Other" muestra $281.45

#### Scenario: Breakdown unavailable
- **WHEN** falla la lectura del desglose
- **THEN** se ve el total sin tiendas

### Requirement: Up Next names a list running low and a trip to join

"Up Next" SHALL incluir "<lista> is running low" con cuántos ítems se necesitarán, para la lista con más ítems cuyo intervalo
habitual ya pasó, y "Someone is shopping “<lista>”" con su progreso y "Join the trip" cuando otra persona tiene un viaje activo
en una lista compartida. Los viajes del propio usuario MUST NOT generar el segundo aviso. Up Next SHALL mostrar como máximo
cuatro entradas.

#### Scenario: Partner trip
- **WHEN** otra persona tiene un viaje activo con 1 de 3 ítems marcados en "Weekly Groceries"
- **THEN** Up Next dice "Someone is shopping “Weekly Groceries”" y "1 of 3 items · Join the trip"

#### Scenario: Own trip
- **WHEN** el único viaje activo es del propio usuario
- **THEN** no aparece el aviso de viaje de otra persona

### Requirement: This Month tells an empty month from an empty account

Cuando el periodo elegido es el mes en curso y no tiene gasto pero la cuenta tiene recibos de otros meses, "This Month" SHALL
decir que no hay recibos en ese mes, indicar la fecha del recibo más reciente y ofrecer "See All Time", que cambia el periodo
a todos los tiempos. MUST NOT mostrar "$0" ni el aviso de cuenta nueva.

#### Scenario: Older receipts only

- **WHEN** es noviembre, no hay gasto en noviembre y el último recibo de la cuenta es del 28 de octubre
- **THEN** la tarjeta dice "No receipts in November yet", "Your last receipt was on Oct 28" y ofrece "See All Time"

#### Scenario: See All Time

- **WHEN** el usuario pulsa "See All Time"
- **THEN** el selector de periodo pasa a "Spend All Time" y la tarjeta muestra el gasto de todos los tiempos

#### Scenario: No receipt at all

- **WHEN** la cuenta no tiene ningún recibo y la tarjeta llega a mostrarse
- **THEN** sigue diciendo que no hay gasto registrado y cómo registrarlo, sin "See All Time" ni "$0"
