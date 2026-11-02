## ADDED Requirements

### Requirement: The trip chooser tells trips apart

El selector de viaje SHALL mostrar por viaje su nombre, la fecha y hora en que se completó o empezó, y su tienda, y SHALL
poner primero los viajes de la tienda del recibo o sin tienda, conservando el orden de llegada dentro de cada grupo.

#### Scenario: Several trips at different stores
- **WHEN** un recibo de Fortinos tiene viajes sin tienda y viajes en Metro
- **THEN** los viajes sin tienda van antes y cada fila muestra fecha, hora y tienda