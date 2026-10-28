# Spec Delta

## ADDED Requirements

### Requirement: Similar items are suggested, never applied

Una línea sin coincidencia por nombre ni por vínculo recordado SHALL poder traer como sugerencia el artículo de la lista
elegida cuyo nombre normalizado más se le parece, si el parecido alcanza un umbral fijo; con empate gana el artículo
con más compras y después el nombre. La sugerencia MUST NOT cambiar qué hace la línea al añadirse si el usuario no la
elige.

#### Scenario: Abbreviated name

- **WHEN** la línea "ORG BANANAS" no tiene coincidencia y la lista tiene "Organic Bananas"
- **THEN** la vista previa de coincidencias la muestra sin coincidencia y con la sugerencia "Organic Bananas"

#### Scenario: Nothing similar

- **WHEN** ningún artículo de la lista alcanza el umbral de parecido con la línea
- **THEN** la línea no trae sugerencia

#### Scenario: Matched lines get no suggestion

- **WHEN** una línea coincide por nombre o por vínculo recordado
- **THEN** no trae sugerencia

#### Scenario: Suggestion ignored on add

- **WHEN** el usuario añade la línea "ORG BANANAS" sin vincularla
- **THEN** se crea el artículo "ORG BANANAS" y no se recuerda ningún vínculo

### Requirement: Review Matches offers suggestions in one tap

Cuando alguna línea seleccionada trae sugerencia, la revisión de coincidencias SHALL mostrarse y presentar esas líneas
en una sección "Possible matches", antes de "New items", con "Link to “<item>”" para vincularla en un toque, el
buscador de vínculos y añadirla como nueva. Vincular una sugerencia SHALL tratarse como cualquier vínculo explícito:
actualiza el artículo y recuerda el vínculo.

#### Scenario: Accept a suggestion

- **WHEN** el usuario pulsa "Link to “Organic Bananas”" en la línea "ORG BANANAS" y añade
- **THEN** "Organic Bananas" suma una compra y su precio, y el siguiente recibo con "ORG BANANAS" la muestra como coincidencia recordada

#### Scenario: Link elsewhere

- **WHEN** el usuario usa el buscador para vincular "ORG BANANAS" a "Bananas"
- **THEN** se actualiza "Bananas" y la sugerencia se ignora

#### Scenario: Only suggestions to review

- **WHEN** las líneas seleccionadas coinciden todas por nombre salvo una que trae sugerencia
- **THEN** el diálogo muestra la revisión con esa línea en "Possible matches" en vez de añadir directamente
