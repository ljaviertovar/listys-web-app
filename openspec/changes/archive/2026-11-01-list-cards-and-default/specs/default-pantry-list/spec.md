## ADDED Requirements

### Requirement: The default list is marked in the database

`base_lists.is_default` SHALL marcar como máximo una lista por usuario, con un índice único parcial. `ensure_default_pantry`
SHALL crear la Pantry de una cuenta nueva ya marcada, y la migración SHALL marcar la Pantry existente de las cuentas que la
tienen (la más antigua del grupo por defecto con ese nombre) sin borrar ni reescribir otra cosa.

#### Scenario: New account
- **WHEN** una cuenta sin listas llama a `ensure_default_pantry`
- **THEN** su lista "Pantry" tiene `is_default` y repetir la llamada no crea otra

#### Scenario: Second default list
- **WHEN** se intenta marcar una segunda lista del mismo usuario
- **THEN** la base de datos lo rechaza con `unique_violation`