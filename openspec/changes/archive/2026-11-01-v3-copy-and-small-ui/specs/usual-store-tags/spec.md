## ADDED Requirements

### Requirement: Setting a usual store can be undone

Fijar la tienda habitual de un artículo SHALL avisar "Usual store set to <tienda>" con "It won’t change on its own." y un
"Undo" que devuelve el artículo a su tienda manual anterior o, si no tenía, a automático.

#### Scenario: Undo
- **WHEN** el usuario fija "Walmart" en un artículo sin tienda y pulsa "Undo"
- **THEN** el artículo vuelve a no tener tienda habitual manual