# Design

## Context

`tickets.purchase_date` (tipo `date`) se rellena desde el OCR y el resumen de gasto lo usa para decidir el mes de los recibos fuera de un viaje; sin fecha cae a la de carga. La pantalla del recibo ya tiene `PATCH /api/v1/tickets/{id}` con una unión estricta de esquemas (`include_in_spending`, `store_id`/`group_id`). Canvas R3 aprobó la opción A: el campo vive en la tarjeta de la tienda.

## Goals / Non-Goals

**Goals:**
- Corregir o completar la fecha desde la tarjeta de la tienda en un gesto.
- Que una nueva lectura no deshaga la corrección.

**Non-Goals:**
- Borrar la fecha (volver a "no encontrada").
- Editar la fecha en recibos aún sin leer o en la hoja de detalle de un viaje.

## Decisions

- **PATCH existente, no ruta nueva.** `purchase_date` es un miembro más de la unión estricta de `updateTicketSchema`; los demás miembros lo declaran `never` para que un payload mezclado se rechace en vez de ignorar un campo.
- **Validación en el servidor.** Día real en formato `YYYY-MM-DD`, desde 1900, y no posterior a hoy con un día de margen (el teléfono puede ir un día por delante de la fecha UTC del servidor). El cliente aplica el mismo límite con la fecha local de la persona.
- **Marca `purchase_date_by_user boolean NOT NULL DEFAULT false`.** Migración aditiva: no cambia ni borra filas. La escribe el PATCH junto con la fecha.
- **Las funciones OCR respetan la marca.** `purchaseDateToStore` (compartida) devuelve `null` si la fijó la persona, así que las tres escrituras de `purchase_date` de cada función se omiten. Alternativa descartada: un trigger que revierta la columna, porque oculta la regla en la base de datos.
- **Guardar al elegir.** El campo es un `input type=date` nativo; el hook guarda tras 700 ms sin cambios (teclear una fecha dispara un cambio por cada valor intermedio) y al salir del campo.
- **El campo conserva lo elegido.** Mientras guarda y si falla, el campo muestra el día elegido para que "Try Again" envíe el mismo.
- **Sin icono propio.** El navegador dibuja el botón de calendario del campo; añadir otro lo duplicaba.

## Risks / Trade-offs

- La migración y el despliegue de las funciones OCR son pasos aparte: sin la columna, el PATCH de fecha devuelve error y las funciones no leen la marca.
- El campo muestra la fecha en el formato del navegador y el día de la semana va en la línea de ayuda; el valor no usa tipografía mono porque `Input` no tiene esa variante alineada a la izquierda.
