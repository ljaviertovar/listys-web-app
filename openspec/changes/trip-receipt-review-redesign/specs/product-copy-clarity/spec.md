## ADDED Requirements

### Requirement: The trip review says what attaching adds and leaves out

La revisión de un recibo contra un viaje SHALL decir, antes de confirmar, que las líneas sin coincidencia se añaden al viaje
y a la lista y que nada cambia hasta adjuntar, y SHALL distinguir dejar una línea fuera de vincularla a un ítem. MUST
explicar por qué una línea de nombre ilegible no puede añadirse y MUST NOT afirmar que el recibo se emparejó solo.

#### Scenario: Intro before confirming

- **WHEN** la revisión está lista
- **THEN** dice que cada línea actualiza el viaje y la lista "<list>" y que nada cambia hasta adjuntar

#### Scenario: Default adds are stated

- **WHEN** hay líneas en "New to <list>"
- **THEN** la ayuda de la sección dice que se añadirán al viaje y a la lista, y que "Change" permite dejarlas fuera

#### Scenario: Leave out versus match

- **WHEN** el usuario abre "Change Line"
- **THEN** "Leave out" dice que no se guarda en el viaje ni en la lista, y "Match a trip item" dice que marca ese ítem y que
  el nombre se recuerda la próxima vez

#### Scenario: Unreadable name

- **WHEN** una línea no tiene nombre legible
- **THEN** su resultado dice que el nombre no pudo leerse y por eso no se puede añadir, sin ofrecer "Change"

#### Scenario: Remembered match is not presented as automatic

- **WHEN** una línea lleva la etiqueta "Remembered"
- **THEN** su texto dice que viene de un recibo anterior y "Change" permite cambiarla, sin hablar de detección segura
