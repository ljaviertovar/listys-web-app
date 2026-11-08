## MODIFIED Requirements

### Requirement: History shows every completed trip on one screen

La pantalla "Trips", en `/trips`, SHALL mostrar todas las sesiones completadas del usuario, de la más reciente a la más antigua, sin agruparlas por grupo ni exigir elegir un contenedor antes. Cada viaje MUST indicar su nombre, su fecha de cierre (día de la semana, día y mes abreviados, como "Thu 19 Feb", y el año solo cuando no es el actual), el importe cuando existe y el número de ítems comprados, y llevar al detalle de la sesión; la hora de cierre aparece en el detalle, no en la tarjeta. El texto de la pantalla MUST NOT mencionar grupos ni llamar "History" a la sección.

#### Scenario: Account with trips in several lists

- **WHEN** el usuario tiene viajes completados de dos listas
- **THEN** los ve todos en "Trips" en una sola lista ordenada por fecha de cierre descendente

#### Scenario: Date of a trip

- **WHEN** un viaje se completó el jueves 19 de febrero del año en curso con un total de $62.40
- **THEN** su tarjeta muestra "Thu 19 Feb · $62.40", sin la hora y sin el texto "Completed on"

#### Scenario: Trip from another year

- **WHEN** un viaje se completó en un año anterior
- **THEN** su fecha incluye el año

#### Scenario: No trips yet

- **WHEN** el usuario no ha completado ninguna compra
- **THEN** la pantalla explica que sus viajes aparecerán al completar la primera compra, sin mencionar grupos

#### Scenario: History fails to load

- **WHEN** la carga de los viajes falla
- **THEN** la pantalla comunica el fallo y ofrece reintentar, sin afirmar que no hay viajes

### Requirement: Each trip shows its receipt status apart from its own status

Cada viaje de "Trips" SHALL mostrar su estado de viaje ("Completed") como único pill con punto, a la derecha de su título, y, por separado, el estado de sus recibos como etiqueta con icono en la fila de clasificación bajo el título, tras las tiendas del viaje (la suya primero): "Receipt attached" con uno, "<N> receipts" con varios, o "No receipt" en tono de atención sin ninguno. Bajo la clasificación SHALL ir la línea de datos, con el total pagado (suma de recibos) al final, y al final el número de ítems comprados con "View Details". El icono del viaje SHALL usar el color de los viajes (verde). No tener recibo MUST NOT cambiar ni matizar el estado del viaje.

#### Scenario: Trip with a receipt

- **WHEN** un viaje completado tiene un recibo adjunto
- **THEN** su tarjeta muestra el pill "Completed" junto al título y la etiqueta "Receipt attached" debajo

#### Scenario: Trip without a receipt

- **WHEN** un viaje completado no tiene recibo
- **THEN** su tarjeta muestra "Completed" y la etiqueta "No receipt", sin ningún texto que diga que el viaje está incompleto

#### Scenario: Trip with a store

- **WHEN** un viaje completado tiene la tienda "Costco"
- **THEN** su fila de clasificación muestra "Costco" como entidad antes de la etiqueta del recibo

#### Scenario: Trip with receipts from two stores

- **WHEN** un viaje iniciado en "No Frills" tiene recibos de "No Frills" ($86.40) y "Costco" ($41.12)
- **THEN** su tarjeta muestra "No Frills" y "Costco" como entidades, la etiqueta "2 receipts" y "$127.52" al final de su
  línea de datos

### Requirement: A trip without a receipt highlights Add Receipt

La tarjeta de un viaje sin recibo SHALL ofrecer "Add Receipt" como acción destacada bajo "View Details", que abre el detalle del viaje donde las opciones de subir un recibo nuevo o elegir uno ya subido ya están visibles. Un viaje con recibo MUST NOT ofrecerla.

#### Scenario: Add a receipt from the list

- **WHEN** el usuario pulsa "Add Receipt" en un viaje sin recibo
- **THEN** llega al detalle del viaje, donde ve "Upload New Receipt" sin abrir ninguna hoja

#### Scenario: Trip with a receipt

- **WHEN** un viaje ya tiene recibo
- **THEN** su tarjeta no ofrece "Add Receipt"
