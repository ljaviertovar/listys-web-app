## 1. Base de datos

- [x] 1.1 Migración `20261101000000_default_list_marker` y script de verificación con rollback.
- [x] 1.2 Aplicada al proyecto de desarrollo aprobado; versión registrada; recuentos antes y después idénticos.
- [x] 1.3 `is_default` en `database.types.ts` a mano (opcional) hasta regenerar los tipos.

## 2. Interfaz

- [x] 2.1 `EntityCard` con `badge` y `meta`; `buildListCardMeta`.
- [x] 2.2 `BaseListCard`: chip, línea de último viaje, "View Items", menú con Share y Delete List.
- [x] 2.3 `ShareListDialog` controlable desde fuera.
- [x] 2.4 Página de listas: último viaje, colaboradores y lista por defecto.

## 3. Deshacer

- [x] 3.1 `startUndoable` y `useUndoableAction` con pruebas.
- [x] 3.2 Borrado diferido de la lista con "Undo".

## 4. Pruebas y documentación

- [x] 4.1 Pruebas de tarjeta, de `buildListCardMeta` y de `startUndoable`.
- [x] 4.2 `CHANGELOG.md`.
- [x] 4.3 Comprobación a 390 px: menú, Share y borrar con y sin Undo.
- [ ] 4.4 Ver el chip "Default" en pantalla (ninguna lista de prueba está marcada).