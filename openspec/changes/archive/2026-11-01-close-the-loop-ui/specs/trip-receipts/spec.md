# trip-receipts Specification

## Purpose

Que un viaje completado pida y recuerde sus recibos: el recibo cierra el viaje con los precios y el total reales.

## ADDED Requirements

### Requirement: Completing a trip asks for its receipts

Al completar un viaje, la app SHALL abrir su página con "Trip saved", el número de ítems actualizados y la lista, e invitar
a subir recibos ("Upload a Receipt", uno por tienda visitada) o a dejarlos aparte ("Keep It Separate"), con la nota de que
puede adjuntarse un recibo en 48 horas.

#### Scenario: Complete a trip
- **WHEN** el usuario completa un viaje con 3 ítems marcados
- **THEN** ve "Trip saved", "3 items updated in <lista>", "Upload a Receipt" y "Keep It Separate"

### Requirement: A completed trip without a receipt says so

Una visita posterior a un viaje completado sin recibo SHALL decir "No receipts attached" y ofrecer "Add Receipt". Un viaje con
recibo adjunto MUST NOT mostrar esa tarjeta, y un viaje en curso tampoco.

#### Scenario: Later visit
- **WHEN** el usuario abre desde el historial un viaje completado sin recibo
- **THEN** ve "No receipts attached" y "Add Receipt", sin "Keep It Separate"