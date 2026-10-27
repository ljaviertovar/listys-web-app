# Spec Delta

## Purpose

Evitar que la despensa se fragmente cuando tiendas distintas imprimen el mismo producto con nombres distintos:
el usuario vincula una línea del recibo con un artículo existente durante la revisión y la lista recuerda ese vínculo
para los recibos siguientes, sin fusionar nunca nada que el usuario no haya visto.

## ADDED Requirements

### Requirement: Adding to a list previews how each line will match

Antes de añadir líneas de un recibo a una lista existente, la interfaz SHALL mostrar para cada línea seleccionada si
actualizará un artículo por nombre igual, si actualizará un artículo por un vínculo recordado o si se añadirá como
artículo nuevo. Si ninguna línea es nueva ni recordada, el diálogo SHALL permitir añadir sin paso adicional.

#### Scenario: Mixed selection

- **WHEN** el usuario elige su lista "Pantry" para cinco líneas, de las que dos tienen el nombre de un artículo existente, una tiene un vínculo recordado y dos no coinciden
- **THEN** la revisión muestra dos líneas que actualizan por nombre, una que actualiza el artículo recordado y dos que se añadirán como nuevas

#### Scenario: Everything matches by name

- **WHEN** todas las líneas seleccionadas tienen el nombre de un artículo existente de la lista elegida
- **THEN** el usuario puede añadirlas directamente, sin un paso de vínculos

#### Scenario: Preview cannot load

- **WHEN** la vista previa de coincidencias falla
- **THEN** el diálogo explica que no pudo comprobar la lista, ofrece reintentar y no añade nada

### Requirement: A new line can be linked to an existing item

En la revisión, cada línea que se añadiría como nueva SHALL poder vincularse a un artículo existente de la lista
elegida mediante un buscador por nombre de los artículos de esa lista. Una línea vinculada SHALL actualizar ese
artículo (compra, cantidad y precio) en lugar de crear uno nuevo. Las líneas con nombre igual a un artículo MUST NOT
poder vincularse a otro.

#### Scenario: Link a line

- **WHEN** el usuario vincula la línea "LECHE 2% 4L" al artículo "2% Milk 4L" y añade
- **THEN** "2% Milk 4L" suma una compra y su precio, y la lista no gana un artículo "Leche 2% 4L"

#### Scenario: Search the list

- **WHEN** el usuario escribe "milk" en el buscador de una línea
- **THEN** ve solo los artículos de la lista elegida cuyo nombre contiene "milk"

#### Scenario: Link to an item of another list

- **WHEN** una petición vincula una línea a un artículo que no pertenece a la lista elegida, o una línea que no pertenece al recibo
- **THEN** se rechaza con un error y no se añade ni actualiza nada

### Requirement: Links are remembered per list

Al añadir una línea vinculada, el nombre normalizado de esa línea SHALL recordarse como alias del artículo dentro de
esa lista. En recibos siguientes, una línea sin artículo de nombre igual cuyo nombre coincide con un alias SHALL
coincidir con ese artículo. Un alias MUST resolver a un único artículo por lista y la última elección explícita
prevalece.

#### Scenario: Remembered on the next receipt

- **WHEN** el usuario vinculó "LECHE 2% 4L" a "2% Milk 4L" en "Pantry" y otro recibo trae "Leche 2% 4L"
- **THEN** la revisión de ese recibo muestra la línea como coincidente con "2% Milk 4L" por un vínculo recordado

#### Scenario: Other lists are not affected

- **WHEN** el mismo usuario añade "LECHE 2% 4L" a otra lista que tiene un artículo "2% Milk 4L"
- **THEN** la línea aparece como nueva en esa lista, porque el vínculo pertenece a "Pantry"

#### Scenario: Name match wins over an alias

- **WHEN** una línea tiene el mismo nombre normalizado que un artículo de la lista y también coincide con un alias de otro artículo
- **THEN** la línea actualiza el artículo de nombre igual

#### Scenario: Deleted item

- **WHEN** el usuario elimina un artículo que tenía alias
- **THEN** sus alias dejan de existir y las líneas que coincidían vuelven a mostrarse como nuevas

### Requirement: Remembered matches always go through review

Una coincidencia por alias SHALL mostrarse en la revisión, identificada como recordada, antes de aplicarse, y el
usuario SHALL poder cambiarla: añadir la línea como artículo nuevo (y el alias se olvida) o vincularla a otro artículo
(y el alias pasa a ese artículo). La interfaz MUST NOT aplicar alias sin mostrar la revisión.

#### Scenario: Undo a remembered match

- **WHEN** la revisión muestra "LECHE 2% 4L" como recordada con "2% Milk 4L" y el usuario elige añadirla como nueva
- **THEN** se crea el artículo "LECHE 2% 4L", "2% Milk 4L" no cambia y el siguiente recibo con ese nombre la muestra como nueva

#### Scenario: Re-link a remembered match

- **WHEN** el usuario cambia una coincidencia recordada a otro artículo y añade
- **THEN** se actualiza el artículo elegido y el siguiente recibo con ese nombre propone el artículo elegido

### Requirement: Adding linked lines is atomic and honest about counts

Añadir líneas con vínculos SHALL ejecutarse en una sola transacción: artículos actualizados, artículos nuevos y alias
cambian todos o ninguno. El límite de artículos por lista SHALL contar solo las líneas que crean artículos. El resultado
SHALL informar cuántas líneas se añadieron, actualizaron y omitieron.

#### Scenario: Linking avoids the limit

- **WHEN** la lista tiene 249 artículos y el usuario añade tres líneas de las que dos están vinculadas
- **THEN** la operación se completa con 1 añadido y 2 actualizados

#### Scenario: Failure leaves nothing half done

- **WHEN** la operación falla después de actualizar algún artículo
- **THEN** ningún artículo ni alias queda modificado y el usuario ve un error con la opción de reintentar

### Requirement: Creating a list from a receipt has no matching step

Crear una lista nueva a partir de líneas de un recibo SHALL añadir todas las líneas como artículos nuevos, sin paso de
vínculos ni alias, porque la lista no tiene artículos con los que coincidir.

#### Scenario: New list from receipt

- **WHEN** el usuario elige "Create new list" con cuatro líneas
- **THEN** la lista se crea con cuatro artículos y el diálogo no muestra un paso de vínculos
