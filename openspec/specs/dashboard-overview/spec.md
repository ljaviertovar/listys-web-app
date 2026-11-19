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

"This Month" SHALL sumar los importes conocidos de recibos adjuntos o subidos desde trips activos o completados del usuario y de recibos sueltos habilitados por su propietario. SHALL usar la fecha de compra o, cuando falte, la fecha de carga en la zona horaria del visitante. "All time" SHALL incluir todo el historial elegible. Ambos periodos SHALL excluir los totales propios del trip.

#### Scenario: Trips and receipts

- **WHEN** el mes contiene un recibo válido de $40 adjunto a un trip activo y otro de $25 adjunto a un trip completado
- **THEN** la tarjeta muestra $65 y cuenta ambos recibos una vez

#### Scenario: Trip without total

- **WHEN** un trip elegible no tiene un recibo válido adjunto
- **THEN** su total propio no contribuye al gasto

#### Scenario: Month boundary in the visitor's timezone

- **WHEN** un recibo adjunto válido sin fecha impresa se cargó a las 23:30 del último día del mes en la zona horaria del visitante, aunque ya sea el mes siguiente en UTC
- **THEN** cuenta en octubre para ese visitante

#### Scenario: Purchase date differs from the upload date

- **WHEN** un recibo elegible del 28 de octubre se carga el 3 de noviembre
- **THEN** el importe, el conteo y los desgloses del recibo cuentan en octubre y en All Time
- **AND** si la fecha impresa no está disponible, el recibo cuenta en el mes de carga, en la zona horaria del visitante

#### Scenario: Nothing known

- **WHEN** no hay recibos con importe conocido que contribuyan al gasto del mes
- **THEN** la tarjeta indica que no hay gasto registrado y no muestra "$0"

#### Scenario: Shared trips

- **WHEN** un trip de una lista ajena no pertenece al usuario
- **THEN** sus recibos adjuntos no se incluyen en el gasto del usuario

#### Scenario: Standalone receipt is excluded

- **WHEN** el mes también contiene un recibo suelto con total válido cuya preferencia sigue apagada
- **THEN** su importe y conteo no contribuyen al gasto de la tarjeta

#### Scenario: Receipts awaiting review

- **WHEN** un trip completado tiene un recibo confirmado por $60 y dos recibos subidos desde el trip pendientes de revisión por $15 y $25
- **THEN** la tarjeta suma $100 y cuenta los tres recibos en los periodos que los contienen
- **AND** al confirmar uno de los pendientes, su importe confirmado sustituye al anterior sin contar el recibo dos veces

#### Scenario: Receipt lines do not cover the total

- **WHEN** un recibo del trip tiene importe conocido y sus líneas están incompletas
- **THEN** su importe registrado sigue contando en el gasto

### Requirement: A standalone receipt can be included in spending

An individually uploaded receipt SHALL start excluded. Its owner SHALL be able to use the Count in spending switch in the receipt detail to include or remove its recorded amount in This Month and All Time. The detail SHALL describe whether the receipt counts. The receipt list SHALL show In spending beside the amount only while that standalone receipt contributes.

#### Scenario: Standalone receipt starts excluded

- **WHEN** a receipt is uploaded individually and its owner has not enabled the preference
- **THEN** it does not contribute and the list shows no spending indicator

#### Scenario: Owner enables a standalone receipt

- **WHEN** the owner enables spending for a standalone receipt with a known amount
- **THEN** it contributes in periods containing its purchase date, or its upload date when no printed date is available
- **AND** its detail shows that it counts and its list card shows In spending

#### Scenario: Owner disables a standalone receipt

- **WHEN** the owner switches the preference off
- **THEN** its amount is excluded, the detail shows that it is left out, and the list indicator is removed

#### Scenario: Receipt has no recorded amount

- **WHEN** a standalone receipt has no known amount
- **THEN** the owner cannot enable the preference and can disable a previously enabled preference

#### Scenario: Receipt later joins a trip

- **WHEN** an opted-in receipt is attached to a trip
- **THEN** the trip rules apply and its amount is counted only once

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

La tarjeta Spending SHALL desglosar el gasto elegible por tienda en ambos periodos. SHALL mostrar las tiendas principales de mayor a menor, "Other" para las demás tiendas confirmadas y "Unknown Store" para los recibos sin tienda confirmada. Si el desglose no puede leerse, el total SHALL mostrarse igual.

#### Scenario: Receipt without a store

- **WHEN** recibos adjuntos elegibles sin tienda confirmada forman parte del total
- **THEN** su importe se incluye en el total y se muestra como "Unknown Store" tanto en el mes como en "All time"
- **AND** el gráfico muestra ese segmento aunque no haya gasto en tiendas confirmadas

#### Scenario: Breakdown unavailable

- **WHEN** falla la lectura del desglose
- **THEN** se ve el total calculado con recibos adjuntos elegibles aunque no se muestren tiendas

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
