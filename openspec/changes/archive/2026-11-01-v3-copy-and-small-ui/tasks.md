## 1. Hidratación

- [x] 1.1 `InstallAppButton` calcula `mobileDevice` en un efecto, no durante el render.

## 2. Textos y estructura

- [x] 2.1 Hoja de subida, botón, progreso y mensajes de rechazo; `MAX_TICKET_IMAGE_MB` en las validaciones del servidor.
- [x] 2.2 "Lists" en la pantalla, el menú, el breadcrumb y el dashboard; sin "Back to Dashboard".
- [x] 2.3 Texto de borrar lista; lista vacía con "Add Item" y "Upload Receipt"; Start Shopping habilitado en lista vacía.
- [x] 2.4 Total estimado y "One trip at a time per list." en la hoja de Start Shopping.
- [x] 2.5 Aviso de tienda habitual con "Undo"; precio medio a la derecha.
- [x] 2.6 Recibo: título, tarjeta de tienda arriba, "Read as", "Change Store" y aviso de total.
- [x] 2.7 Selector de viaje con fecha, hora y tienda; orden por tienda.
- [x] 2.8 Eco propio: `markLocalMutation` en el cliente API y `isOwnRecentActivity` en los listeners.

## 3. Pruebas y documentación

- [x] 3.1 Pruebas: `attach-candidates`, `local-activity`, aviso de tienda habitual, Start Shopping y lista vacía.
- [x] 3.2 `CHANGELOG.md`.
- [x] 3.3 Comprobación visual a 390 px (recibo, Start Shopping, selector de viaje, lista vacía) y consola sin error de hidratación.