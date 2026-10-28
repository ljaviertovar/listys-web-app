# Spec Delta

## Purpose

Mostrar, para cada artículo de la lista base, cuánto costó la última vez en cada tienda donde se compró según sus
recibos, y cuál es la tienda más barata conocida, usando solo precios registrados y diciendo de cuándo son.

## ADDED Requirements

### Requirement: Items offer their prices by store

El menú de un artículo SHALL ofrecer al propietario "Prices by Store" cuando el artículo tiene al menos un precio de
recibo registrado en alguna tienda. La vista SHALL listar cada tienda con precio registrado con su último precio, la
fecha en que se registró y la cantidad y unidad de la línea cuando no es una unidad. Sin precios MUST NOT ofrecerse.

#### Scenario: Item bought at two stores

- **WHEN** "Milk" tiene último precio 5.49 en "No Frills" (4 de marzo) y 6.29 en "Metro" (20 de febrero)
- **THEN** "Prices by Store" muestra "No Frills" 5.49 del 4 de marzo y "Metro" 6.29 del 20 de febrero

#### Scenario: Line with several units

- **WHEN** el último precio de "Yogurt" en "Costco" es 8.00 por una línea de cantidad 2
- **THEN** la vista muestra 8.00 con la indicación de que corresponde a 2 unidades y 4.00 por unidad

#### Scenario: Item without receipt prices

- **WHEN** un artículo solo se compró en sesiones sin recibo o nunca se compró con tienda
- **THEN** su menú no ofrece "Prices by Store"

#### Scenario: Collaborator

- **WHEN** un colaborador abre el menú de un artículo de una lista compartida
- **THEN** no ve "Prices by Store" ni precios por tienda del propietario

### Requirement: The cheapest known store is highlighted only among comparable prices

Cuando al menos dos tiendas tienen precios comparables, la tienda con menor precio por unidad SHALL destacarse como la
más barata conocida. Son comparables los precios con la misma unidad (sin unidad cuenta como "each") y cantidad mayor
que cero. Ante empate SHALL destacarse la de precio más reciente. Sin dos comparables MUST NOT destacarse ninguna.

#### Scenario: Cheapest store

- **WHEN** "Milk" tiene 5.49 en "No Frills" y 6.29 en "Metro", ambos por una unidad
- **THEN** "No Frills" aparece destacada como la más barata conocida

#### Scenario: Different units

- **WHEN** "Apples" tiene 3.20 por 1 kg en "No Frills" y 2.99 sin unidad en "Metro"
- **THEN** ninguna tienda se destaca y la vista indica que los precios no son comparables

#### Scenario: Per-unit comparison

- **WHEN** "Yogurt" tiene 8.00 por 2 unidades en "Costco" y 4.49 por 1 unidad en "Metro"
- **THEN** "Costco" aparece destacada porque su precio por unidad es 4.00

#### Scenario: Only one store

- **WHEN** un artículo tiene precio registrado en una sola tienda
- **THEN** la vista muestra ese precio sin destacar ninguna tienda

### Requirement: Prices by store show recorded receipt prices only

La vista SHALL derivarse solo de los últimos precios por tienda registrados desde recibos y MUST NOT inferir, promediar,
convertir unidades ni mostrar precios de sesiones sin recibo. Abrirla MUST NOT escribir ningún dato. El texto MUST NOT
afirmar que una tienda es más barata hoy; SHALL decir que es la más barata según el último recibo de cada tienda.

#### Scenario: Viewing does not write

- **WHEN** el propietario abre "Prices by Store"
- **THEN** no se crea ni modifica ningún precio, estadística ni etiqueta

#### Scenario: Wording

- **WHEN** la vista destaca una tienda
- **THEN** el texto la presenta como la más barata según los últimos recibos, con la fecha de cada precio, sin prometer el precio actual

#### Scenario: Renamed store

- **WHEN** el propietario renombra "No Frills" a "No Frills Bloor"
- **THEN** la vista muestra "No Frills Bloor" con sus precios registrados

### Requirement: The prices view works one-handed on a phone

La vista SHALL abrirse como hoja inferior en teléfonos y diálogo en pantallas anchas, con filas legibles a 320 CSS px,
sin desplazamiento horizontal, y nombres de tienda largos truncados con el texto completo accesible.

#### Scenario: Narrow phone

- **WHEN** "Prices by Store" muestra cuatro tiendas con nombres largos a 320 CSS px
- **THEN** cada fila muestra tienda, precio y fecha sin desplazamiento horizontal y el nombre completo sigue accesible
