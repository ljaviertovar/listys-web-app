## MODIFIED Requirements

### Requirement: Items offer their prices by store

El menú de un artículo SHALL ofrecer siempre al propietario "Prices by Store". La hoja SHALL listar cada tienda donde se
compró el artículo con su último precio de recibo, la fecha y cuántas veces se compró allí ("23 Feb · 2 times"), y la cantidad
y unidad de la línea cuando no es una unidad; una tienda con compras pero sin precio de recibo SHALL aparecer con "No price
yet" y "—". Sin ningún precio de recibo, la hoja SHALL mostrar su estado vacío en lugar de ocultar la acción.

#### Scenario: Item bought at two stores

- **WHEN** "Milk" tiene último precio 5.49 en "No Frills" (4 de marzo) y 6.29 en "Metro" (20 de febrero)
- **THEN** "Prices by Store" muestra "No Frills" 5.49 del 4 de marzo y "Metro" 6.29 del 20 de febrero, cada una con sus veces

#### Scenario: Line with several units

- **WHEN** el último precio de "Yogurt" en "Costco" es 8.00 por una línea de cantidad 2
- **THEN** la vista muestra 8.00 con la indicación de que corresponde a 2 unidades y 4.00 por unidad

#### Scenario: Item without receipt prices

- **WHEN** un artículo se añadió a mano y nunca tuvo precio de recibo
- **THEN** "Prices by Store" muestra "Added by hand", "No prices yet", "Prices come from your receipts. Upload one with this
  item to see what it costs and where." y "Upload a Receipt"

#### Scenario: Store without a price

- **WHEN** "Milk" se compró en "Walmart" en un viaje sin recibo
- **THEN** la fila de "Walmart" dice "No price yet" con "—"

#### Scenario: Collaborator

- **WHEN** un colaborador abre el menú de un artículo de una lista compartida
- **THEN** no ve "Prices by Store" ni precios por tienda del propietario

## ADDED Requirements

### Requirement: The prices sheet shows how the item is bought

La hoja "Prices by Store" SHALL abrir con la tienda habitual del artículo como entidad y si es automática o elegida ("Usual
store · automatic"), tres cifras ("Times bought", "Between trips" con el intervalo medio de la regla de Likely Needed y
"Last bought"), la sección "Last price by store" con "Only prices from your own receipts." y las etiquetas "Cheapest" y
"Usual" en sus filas, y "Change Usual Store" al final.

#### Scenario: Item with history

- **WHEN** "2% Milk 4L" se compró 7 veces, su intervalo medio es de 9 días, se compró por última vez el 19 de febrero y su
  tienda habitual automática es "No Frills"
- **THEN** la hoja muestra "No Frills" con "Usual store · automatic", "7 Times bought", "~9d Between trips", "19 Feb Last
  bought" y "Change Usual Store"

#### Scenario: Cheapest and usual

- **WHEN** "Costco" es la más barata comparable y "No Frills" la habitual
- **THEN** la fila de "Costco" lleva "Cheapest" y la de "No Frills" lleva "Usual"

#### Scenario: Only one store

- **WHEN** el artículo solo se compró con precio en "No Frills"
- **THEN** la hoja muestra esa fila y "Bought at one store so far. Prices from other stores show here once you buy it there."

#### Scenario: Not enough purchases for an interval

- **WHEN** el artículo tiene una sola compra
- **THEN** "Between trips" no muestra cifra inventada
