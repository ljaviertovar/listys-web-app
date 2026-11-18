## MODIFIED Requirements

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

## ADDED Requirements

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
