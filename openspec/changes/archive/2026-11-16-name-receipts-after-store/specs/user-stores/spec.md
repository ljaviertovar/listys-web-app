## MODIFIED Requirements

### Requirement: Receipt review proposes the matching store

La pantalla de un recibo leído SHALL mostrar su tienda en uno de cuatro estados: confirmada (nombre de la tienda),
coincidente (el nombre crudo resuelve a una tienda y se confirma con un toque), sin coincidencia (el nombre crudo puede
guardarse como tienda nueva) o sin nombre (se avisa de que la tienda no está puesta). En todos SHALL poder elegirse otra
tienda; en el estado sin nombre SHALL poder además escribirse el nombre de una tienda nueva.

#### Scenario: One-tap confirmation

- **WHEN** un recibo con nombre crudo "NOFRILLS" se abre y el usuario tiene "No Frills"
- **THEN** la pantalla propone "No Frills" y un solo toque en "Confirm" asocia el recibo a esa tienda

#### Scenario: Save as a new store

- **WHEN** un recibo con nombre crudo "Fresh Co #12" no coincide con ninguna tienda y el usuario pulsa "Save as New Store"
- **THEN** se crea la tienda con un nombre editable propuesto a partir del texto crudo y el recibo queda asociado a ella

#### Scenario: Unrecognized store

- **WHEN** un recibo sin nombre crudo se abre
- **THEN** la pantalla avisa de que la tienda no está puesta y permite elegir una tienda existente o crear una escribiendo su nombre

#### Scenario: Typing the store of an unrecognized receipt

- **WHEN** el usuario abre un recibo sin nombre crudo, escribe "Metro" en el campo de nombre y guarda
- **THEN** se crea (o se reutiliza, si ya existía) la tienda "Metro", el recibo queda asociado a ella y pasa a llamarse "Metro Receipt"

#### Scenario: Older receipt with a typed name

- **WHEN** se abre un recibo subido antes de este cambio con el nombre escrito a mano "Grocery Store"
- **THEN** ese texto se trata como nombre crudo y se propone, confirma o guarda igual que uno extraído

### Requirement: Receipt surfaces show the store name

Un recibo SHALL llamarse "<tienda> Receipt" en la lista de recibos, en su pantalla y en el dashboard, donde "<tienda>" es
el nombre de la tienda confirmada; sin tienda confirmada, el nombre leído del recibo sin número de sucursal; sin ninguno,
el recibo se llama "Unnamed Receipt". La palabra "Receipt" SHALL ser solo un añadido visual: no forma parte del nombre de
la tienda ni de ningún filtro. Renombrar una tienda SHALL reflejarse en todos sus recibos.

#### Scenario: Confirmed store title

- **WHEN** un recibo con nombre crudo "NOFRILLS #3127" está asociado a "No Frills"
- **THEN** la lista de recibos, su pantalla y el dashboard lo titulan "No Frills Receipt"

#### Scenario: Store read from the receipt

- **WHEN** un recibo sin tienda confirmada tiene el nombre leído "WALMART #1042"
- **THEN** la lista de recibos y su pantalla lo titulan "Walmart Receipt"

#### Scenario: No store known

- **WHEN** un recibo no tiene tienda confirmada ni nombre leído
- **THEN** la lista de recibos y su pantalla lo titulan "Unnamed Receipt"

#### Scenario: Same name in every state

- **WHEN** un recibo de "Metro" está pendiente de revisión, o ya se añadió a una lista o a un viaje
- **THEN** su pantalla lo titula "Metro Receipt" en los tres casos, igual que su tarjeta en la lista

#### Scenario: Renamed store

- **WHEN** el usuario renombra "No Frills" a "No Frills Bloor"
- **THEN** todos los recibos asociados se titulan "No Frills Bloor Receipt"

## ADDED Requirements

### Requirement: Receipt cards do not repeat the store

La tarjeta de un recibo en la lista SHALL mostrar su título, estado, total, número de fotos y, como dato, el día y la
hora de subida ("Uploaded 12 Nov · 10:42"), y MUST NOT mostrar una etiqueta con la tienda, porque el título ya la nombra.
Un recibo leído sin tienda confirmada SHALL seguir mostrando el aviso de que le falta la tienda. El filtro de la lista
SHALL seguir filtrando por tienda, sin incluir la palabra "Receipt".

#### Scenario: Card of a store receipt

- **WHEN** la lista muestra un recibo de "Metro" subido el 12 de noviembre a las 10:42
- **THEN** su tarjeta se titula "Metro Receipt", muestra "Uploaded 12 Nov · 10:42" como dato y no muestra una etiqueta aparte "Metro"

#### Scenario: Several receipts of one store

- **WHEN** la lista muestra dos recibos de "Metro", uno subido el 12 de noviembre y otro el 3 de noviembre
- **THEN** ambas tarjetas se titulan "Metro Receipt" y se distinguen por el día y la hora de subida, el total y el número de fotos, con el más reciente primero

#### Scenario: Upload date from another year

- **WHEN** la lista muestra un recibo de "Metro" subido en un año anterior al actual
- **THEN** su dato de subida incluye el año ("Uploaded 12 Nov 2025 · 10:42")

#### Scenario: Unknown upload date

- **WHEN** un recibo no tiene fecha de subida
- **THEN** su tarjeta dice "Upload time unknown"

#### Scenario: Card of a receipt without confirmed store

- **WHEN** la lista muestra un recibo leído que tiene nombre leído pero ninguna tienda confirmada
- **THEN** su tarjeta usa el nombre leído en el título y muestra el aviso de que falta la tienda

#### Scenario: Filter by store

- **WHEN** el usuario elige "Metro" en el filtro de tiendas de la lista de recibos
- **THEN** solo quedan los recibos de "Metro" y la opción del filtro se llama "Metro", no "Metro Receipt"
