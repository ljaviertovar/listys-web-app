# dashboard-get-started Specification

## Purpose
Dar a una cuenta nueva un solo camino, en orden y derivado de sus datos, hasta que la aplicación tiene con qué trabajar: una
lista, una compra hecha y recibos suficientes para sugerir qué hace falta.

## Requirements

### Requirement: Get Started guides a new account in three steps

El dashboard SHALL mostrar la tarjeta "Get Started" mientras la cuenta no cumpla los tres pasos: (1) tiene al menos una lista,
(2) tiene al menos una compra completada, (3) tiene al menos tres recibos subidos. La tarjeta SHALL mostrar el avance ("N of
3") y una barra de tres segmentos, y MUST desaparecer sola cuando se cumplen los tres pasos.

#### Scenario: Brand-new account

- **WHEN** una cuenta sin listas, compras ni recibos abre el dashboard
- **THEN** ve "Get Started" con "0 of 3" y los pasos "Set up your Pantry", "Take a list shopping" y "Scan 3 receipts"

#### Scenario: Steps are met out of order

- **WHEN** la cuenta tiene una compra completada pero ninguna lista
- **THEN** el paso 2 aparece cumplido, el avance dice "1 of 3" y el paso actual sigue siendo el 1

#### Scenario: All three steps met

- **WHEN** la cuenta tiene una lista, una compra completada y tres recibos
- **THEN** "Get Started" no aparece

#### Scenario: A step is undone

- **WHEN** el usuario borra su única lista y no tiene compras ni recibos
- **THEN** "Get Started" vuelve a aparecer con el paso 1 pendiente, porque el estado se deriva de los datos y no se guarda

### Requirement: Only the current step shows its action

La tarjeta SHALL abrir solo el paso actual, el primero sin cumplir, con su descripción y una única acción primaria. Los pasos
cumplidos SHALL mostrarse con una marca de hecho y los siguientes solo con su título. MUST NOT ofrecer un botón para
descartar la tarjeta.

#### Scenario: Step 1 is current

- **WHEN** la cuenta no tiene ninguna lista
- **THEN** el paso 1 muestra "Set up Pantry" y los pasos 2 y 3 solo su título

#### Scenario: Step 2 is current with a list ready to shop

- **WHEN** la cuenta tiene una lista con artículos y ninguna compra completada
- **THEN** el paso 1 aparece cumplido y el paso 2 muestra "Start Shopping", que abre la misma confirmación de inicio de compra que el resto de la interfaz

#### Scenario: Step 2 is current with an empty list

- **WHEN** la única lista de la cuenta no tiene artículos
- **THEN** el paso 2 ofrece añadir artículos a esa lista en lugar de "Start Shopping"

#### Scenario: Step 3 is current

- **WHEN** la cuenta tiene una lista y una compra completada pero menos de tres recibos
- **THEN** el paso 3 muestra "Upload Receipt" y el recuento de recibos subidos ("1 of 3")

### Requirement: The Pantry step reuses the existing setup action

La acción del paso 1 SHALL ser la misma que ofrece el aviso "Set up your Pantry": idempotente, con el mismo estado de espera
y los mismos avisos de éxito y fallo. Cuando el paso 1 está cumplido, la tarjeta MUST NOT ofrecer crear otra Pantry.

#### Scenario: Setting up the Pantry from Get Started

- **WHEN** el usuario pulsa "Set up Pantry" en el paso 1
- **THEN** se crea o adopta su lista por defecto, el paso 1 pasa a cumplido y el paso 2 se abre

#### Scenario: Setup fails

- **WHEN** la creación de la Pantry falla
- **THEN** el usuario ve el mismo aviso de error que en el resto de la interfaz y el paso 1 sigue abierto con su botón disponible

### Requirement: Get Started replaces the new-account hero

Mientras "Get Started" se muestra, el dashboard MUST NOT mostrar el héroe de "no trip in progress" (sea "Start with a receipt",
"Ready for your next trip?" u otro), porque el paso actual ya ofrece la acción. El aviso de compra activa y "Up Next" SHALL
seguir mostrándose cuando existan.

#### Scenario: New account

- **WHEN** una cuenta nueva abre el dashboard
- **THEN** la única acción primaria visible sobre el pliegue es la del paso actual, no hay héroe "Start with a receipt"

#### Scenario: Trip in progress while steps are pending

- **WHEN** la cuenta tiene una compra activa y le falta algún paso
- **THEN** el dashboard muestra el aviso de la compra activa y, debajo, "Get Started"
- **AND** si el paso actual es el del viaje, no ofrece otra forma de empezar una compra (el aviso ya lleva "Continue")

#### Scenario: Up Next while steps are pending

- **WHEN** la cuenta no tiene compra activa, le falta algún paso y "Up Next" tiene avisos (por ejemplo un recibo leído sin lista)
- **THEN** "Up Next" se muestra solo, sin el héroe "no trip in progress", y encima de "Get Started"
- **AND** "Store Visits" no se muestra mientras no tenga ninguna visita

### Requirement: Get Started is accessible and readable without color

La tarjeta SHALL exponer sus pasos como una lista ordenada, marcar el paso actual con `aria-current="step"` y decir el estado de
cada paso con texto o icono además del color (cumplido, actual, pendiente). La barra de segmentos SHALL ser decorativa: el
avance lo anuncia el texto "N of 3".

#### Scenario: Screen reader

- **WHEN** un lector de pantalla recorre la tarjeta con un paso cumplido y uno actual
- **THEN** anuncia una lista de tres pasos, el primero como hecho, el segundo como actual y el avance "1 of 3"
