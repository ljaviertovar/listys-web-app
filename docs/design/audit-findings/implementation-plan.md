# Auditoría del diseño final — Listys

- DS: `docs/design/design-system.html` — v1.8.0.
- Informe visual: `docs/design/audit-findings/report.html`.
- Status: awaiting approval
- Fuente auditada: 2924cb3 + working tree, 2026-11-11. La modificación previa de `e2e/ui/shopping.e2e.spec.ts` no se auditó ni modificó.
- Modo B: actualización incremental del DS + auditoría de 20 HTML finales suministrados por el usuario.
- Alcance confirmado: 22 hallazgos (Critical 1 · High 6 · Medium 13 · Low 2): 19 nuevos de diseño desde la primera auditoría, DS-023 actualizado y 2 hallazgos runtime conservados (DS-061/062). Esta actualización completa añade DS-063–066.
- Registro conservado: 65 IDs abiertos; 43 proceden de la auditoría anterior y requieren reverificación. No se declaran 65 fallos nuevos confirmados. DS-022 sigue retirado; ningún ID se cierra automáticamente.
- Ajustes del usuario: los 20 HTML son el diseño final para las pantallas que cubren; no hay autorización para implementar este plan en código. Último ID usado: DS-066.
- Stack observado: Next.js 16.1.0, React 19.2.3, Tailwind 4, shadcn (Radix/CVA), Hugeicons, Sonner y next-themes. Fuentes: Plus Jakarta Sans, Inter, IBM Plex Mono.

## Instrucciones de implementación

Revisar las comparativas del informe antes de aprobar. Tras autorización, ejecutar primero Batch 0 y después los lotes dependientes. No implementar decisiones abiertas ni aplicar ciegamente los 43 hallazgos heredados: reverificarlos frente al código actual y DS v1.8.0. El DS vigente prevalece sobre textos de la auditoría antigua.

Usar componentes, props y variantes instalados; apariencia en su API compartida, className solo para layout. Tokens en `src/app/globals.css`; evitar CSS paralelo, valores literales y duplicados. Las extensiones deben usar la API de la biblioteca. No alterar lógica ni accesibilidad de terceros por motivos visuales. Respetar permisos, bloqueos de listas y reglas de migraciones no destructivas. Cargar las skills pertinentes para cualquier futura modificación de API, Supabase o UI.

Después de cambios de código: tests correspondientes al comportamiento modificado, lint/typecheck según alcance, inspección visual móvil y escritorio con DOM y medidas, y DS gate. No escribir tests de colores, clases o texto estático. Las pruebas no se ejecutaron durante esta auditoría: la skill no ejecuta el repositorio. No marcar como verificados teclado, lectores o navegación por leer código o ver una referencia.

## Token map y contrato visual

| Rol | Light | Dark / regla | Mapeo actual y acción |
|---|---|---|---|
| Canvas | #F2F4F7 | #0B1120 del DS previo | background: light coincide; dark pendiente DS-010 |
| Surface | #FFFFFF | #111827 | card; conservar como capa compartida |
| Ink | #0F172A | #F8FAFC | foreground actual neutral; DS-005/010 |
| Muted | #5B6B82 | #94A3B8 | normalización accesible del DS; canvas usa #64748B en notas; confirmar propuesta |
| Primary | #2563EB | #60A5FA | primary; conservar |
| Primary hover | #1D4ED8 | #93C5FD | mapear token existente del DS; DS-009/012 |
| Secondary | #E9ECF0 | #1E293B | secondary; hover #DEE2E8 en claro |
| Tienda | #5B21B6 | colores entity/store del DS | EntityLabel sin caja; DS-055 |
| Panel | #F6F7F9 | #172033 | muted; no introducir otra escala |
| Card list | radio 24px; padding 14px | adaptación DS | size de EntityCard; DS-052 |
| Cantidad | chip 22px, número mono 12/600 | tema DS | ItemQuantityChip; DS-054 |
| Fila de lista | min 68px; nombre 14/600, nota 12 | tema DS | no precio en lista; DS-054/055 |
| Categorías | 4px top, 12px sides, 10px bottom | escala/size compartido | Card size=list; DS-057 |
| Inputs y acciones | 16px en entrada móvil, 44px efectivos | foco y safe area | canvas dibuja algunos botones de 40px: no es excepción accesible aprobada |

## Batch 0 — Handover pendiente y limpieza de instrucciones

DS-001–DS-004 heredados siguen pendientes de reverificación; las instrucciones leídas aún presentan los documentos viejos como canónicos y el workflow dice que el DS no existe. Corregir las referencias antes de cambios UI. No eliminar `DESIGN.md` ni el HTML anterior sin decisión expresa del usuario. Esta ejecución solo escribe archivos propiedad de la skill.

## Batch 1 — Datos y composición del dashboard
Dependencias: DS-047 (gasto), DS-048 (elegibilidad) y modelos de DS-050 antes de DS-046; después DS-049/051. Si cambia el contrato HTTP, revisar la API primero y mantener compatibilidad explícita.

### DS-046 · Dashboard: gasto primero y composición según datos · High
- **Tipo:** desalineación frente al diseño final.
- **Dónde:** `src/components/features/dashboard/dashboard-view.tsx:80`
- **DS:** `docs/design/design-system.html#p-section`
- **Observado:** El hero y Up Next aparecen antes del grid Lists, Likely Needed, gasto y tiendas.
- **Esperado:** Pocos datos: saludo → gasto → Likely Needed → Lists. Con datos: saludo → gasto completo → hero → Up Next → Lists → Last Trip per Store.
- **Guía:** Recomponer los componentes existentes. Conservar el flujo activo no cubierto por estas referencias. Escritorio: adaptación de la jerarquía móvil, sin referencia final suministrada.
- **Aceptación:**
  - [ ] Fixtures de 1 y 7 recibos: comprobar orden y secciones; inspeccionar móvil y escritorio.
  - [ ] Inspección visual móvil y escritorio y tests de comportamiento que correspondan; DS gate tras cambiar código.
- **Dependencias:** DS-009.
- **Evidencia:** código estático actual y observación visual de los HTML de referencia; app en ejecución no verificada.
- **Visual:** `report.html#ds-046`
- **Estado:** open

### DS-047 · Gasto mensual respaldado por recibos · High
- **Tipo:** desalineación frente al diseño final.
- **Dónde:** `src/components/features/dashboard/month-spending-card.tsx:30`
- **DS:** `docs/design/design-system.html#p-section`
- **Observado:** El consumidor muestra From N trips and M receipts y suma ambos conteos; faltan comparación mensual, promedio y categorías.
- **Esperado:** La referencia excluye viajes sin recibo. Estado completo: mes, total, delta, tiendas, recibos, promedio y categorías; pocos datos: total y procedencia.
- **Guía:** Revisar primero el contrato de getSpending y la procedencia de total: el consumidor no prueba doble conteo. Obtener agregados respaldados por recibos. Cargar las skills de API y Supabase si cambia ese límite; no inventar cifras ni resolverlo solo con texto.
- **Aceptación:**
  - [ ] Viaje sin recibo no suma; recibo asociado cuenta una vez; no inventar porcentaje sin mes comparable; probar cálculo e integración.
  - [ ] Inspección visual móvil y escritorio y tests de comportamiento que correspondan; DS gate tras cambiar código.
- **Dependencias:** DS-009.
- **Evidencia:** código estático actual y observación visual de los HTML de referencia; app en ejecución no verificada.
- **Visual:** `report.html#ds-047`
- **Estado:** open

### DS-048 · Likely Needed con progreso de historial insuficiente · Medium
- **Tipo:** desalineación frente al diseño final.
- **Dónde:** `src/components/features/dashboard/likely-needed-card.tsx:19`
- **DS:** `docs/design/design-system.html#p-section`
- **Observado:** El vacío habla de unos pocos viajes; el modelo solo expone hasHistory e items, sin conteo ni progreso.
- **Esperado:** Con 1 de 3 recibos: aviso azul, progreso 1/3 y Start Shopping. No simular predicciones antes del umbral mostrado.
- **Guía:** Extender el modelo de vista con conteo fiable y elegibilidad; usar Alert, Progress y StartShoppingDialog. Si no hay lista utilizable, ofrecer añadir items.
- **Aceptación:**
  - [ ] Casos 0,1,2,3 recibos; no equiparar cualquier historial con predicción disponible.
  - [ ] Inspección visual móvil y escritorio y tests de comportamiento que correspondan; DS gate tras cambiar código.
- **Dependencias:** DS-009.
- **Evidencia:** código estático actual y observación visual de los HTML de referencia; app en ejecución no verificada.
- **Visual:** `report.html#ds-048`
- **Estado:** open

### DS-049 · Saludo: icono horario junto al título · Medium
- **Tipo:** desalineación frente al diseño final.
- **Dónde:** `src/components/features/dashboard/dashboard-greeting.tsx:43`
- **DS:** `docs/design/design-system.html#p-screenheader`
- **Observado:** Badge de fecha y sol sobre el H1.
- **Esperado:** Icono del periodo junto al saludo de 24px/700; contexto debajo, sin fecha extra.
- **Guía:** Reutilizar hora local e hidratación estable; elegir glifo por periodo y retirar el badge de fecha.
- **Aceptación:**
  - [ ] Comprobar mañana, tarde y noche; sin fecha duplicada ni salto al hidratar.
  - [ ] Inspección visual móvil y escritorio y tests de comportamiento que correspondan; DS gate tras cambiar código.
- **Dependencias:** DS-009.
- **Evidencia:** código estático actual y observación visual de los HTML de referencia; app en ejecución no verificada.
- **Visual:** `report.html#ds-049`
- **Estado:** open

### DS-050 · Metadatos completos en filas del dashboard · Medium
- **Tipo:** desalineación frente al diseño final.
- **Dónde:** `src/components/features/dashboard/lists-section-card.tsx:51`
- **DS:** `docs/design/design-system.html#p-section`
- **Observado:** Lista: nombre y cantidad en una línea, sin Default/último viaje. store-visits-card muestra fecha sin cantidad de items.
- **Esperado:** Lista: nombre + Default; cantidad y Last trip / No trips yet debajo. Tienda: nombre, fecha + items y total al extremo.
- **Guía:** Extender build-dashboard-model con datos reales; reutilizar DashboardRow, Badge y RowIcon. Verificar origen de last_visit antes de llamar viaje a un recibo independiente.
- **Aceptación:**
  - [ ] Pantry, lista sin viajes y tienda sin total: datos correctos; Start y enlaces siguen operativos.
  - [ ] Inspección visual móvil y escritorio y tests de comportamiento que correspondan; DS gate tras cambiar código.
- **Dependencias:** DS-009.
- **Evidencia:** código estático actual y observación visual de los HTML de referencia; app en ejecución no verificada.
- **Visual:** `report.html#ds-050`
- **Estado:** open

### DS-051 · Hero sin viaje compacto con Quick start · Medium
- **Tipo:** desalineación frente al diseño final.
- **Dónde:** `src/components/features/dashboard/no-session-banner.tsx:40`
- **DS:** `docs/design/design-system.html#p-hero`
- **Observado:** 160px superiores vacíos; otherLists excluye la lista principal; falta No trip in progress.
- **Esperado:** Hero oscuro compacto con la imagen de fondo actual de HeroSurface, sus recortes móvil/escritorio y scrim existente: estado neutral, Ready for your next trip?, Quick start incluyendo la lista principal, CTA y último viaje.
- **Guía:** Conservar HeroSurface y StartShoppingDialog, incluida la imagen actual: public/images/dashboard/mobile-session.webp y public/images/dashboard/desktop-session.webp, object-cover y el scrim vigente de hero-surface.tsx. No sustituirla por fondo plano ni por la imagen ausente del canvas. Retirar el hueco ornamental mediante composición/variantes; no copiar altura fija del canvas.
- **Aceptación:**
  - [ ] 390px y nombres largos: accesos útiles, CTA visible y sin hueco superior de 160px; comprobar que la foto actual y su scrim se mantienen tanto en móvil como en escritorio.
  - [ ] Inspección visual móvil y escritorio y tests de comportamiento que correspondan; DS gate tras cambiar código.
- **Dependencias:** DS-009.
- **Evidencia:** código estático actual y observación visual de los HTML de referencia; app en ejecución no verificada.
- **Visual:** `report.html#ds-051`
- **Estado:** open

## Batch 2 — Listas, items, formularios y estados

Tokens compartidos DS-009 antes del ajuste visual; DS-054 antes de DS-055; DS-053 antes de DS-056/057/059. DS-060 mantiene bloqueado el texto dependiente de D-FINAL-1.

### DS-052 · Tarjeta de lista: nota y tag Default neutro · Medium
- **Tipo:** desalineación frente al diseño final.
- **Dónde:** `src/components/commons/entity-card/entity-card.tsx:80`
- **DS:** `docs/design/design-system.html#p-objcard`
- **Observado:** Padding móvil 12px; nota sin icono; BaseListCard usa list-default ámbar.
- **Esperado:** Padding 14px; identidad → nota con icono → tags neutros Default/Shared → último viaje → footer.
- **Guía:** Extender size/variant de EntityCard y configurar Badge tag existente. Reutilizar nota adecuada; revisar otros consumidores para no cambiar tarjetas de tiendas por accidente.
- **Aceptación:**
  - [ ] Pantry, lista sin nota y nombre largo mantienen anatomía; sin Default ámbar ni overrides de apariencia en el consumidor.
  - [ ] Inspección visual móvil y escritorio y tests de comportamiento que correspondan; DS gate tras cambiar código.
- **Dependencias:** DS-009.
- **Evidencia:** código estático actual y observación visual de los HTML de referencia; app en ejecución no verificada.
- **Visual:** `report.html#ds-052`
- **Estado:** open

### DS-053 · Cabecera y acciones del detalle de lista · High
- **Tipo:** desalineación frente al diseño final.
- **Dónde:** `src/app/(authenticated)/base-lists/[baseListId]/edit/page.tsx:79`
- **DS:** `docs/design/design-system.html#p-screenheader`
- **Observado:** Descripción genérica; faltan nota, Default/Shared y último viaje; acciones separadas por un toolbar de conteo.
- **Esperado:** Volver, nombre, nota, tags, cantidad y último viaje; Start Shopping ancho completo y Share/Add Item en dos columnas. Vacía: cabecera + vacío.
- **Guía:** Componer PageHeader, DataLine, Badge y controles existentes con datos reales; omitir hechos desconocidos y mantener permisos/bloqueos.
- **Aceptación:**
  - [ ] Pantry, normal, compartida, vacía y viaje activo; sin metadatos ficticios.
  - [ ] Inspección visual móvil y escritorio y tests de comportamiento que correspondan; DS gate tras cambiar código.
- **Dependencias:** DS-009.
- **Evidencia:** código estático actual y observación visual de los HTML de referencia; app en ejecución no verificada.
- **Visual:** `report.html#ds-053`
- **Estado:** open

### DS-054 · Producto de lista: cantidad izquierda y sin precio · High
- **Tipo:** desalineación frente al diseño final.
- **Dónde:** `src/components/features/base-lists/items/base-list-item-row.tsx:83`
- **DS:** `docs/design/design-system.html#p-itemrow`
- **Observado:** ItemTrailing derecho contiene AveragePrice y cantidad, además del menú.
- **Esperado:** Cantidad/unidad inline antes del nombre 14/600; nota y tiendas debajo; ⋯ de 44px a la derecha, sin precio.
- **Guía:** Recomponer BaseListItemRow con ItemQuantityChip antes del nombre; retirar AveragePrice solo de la lista base, sin duplicar fila para Pantry.
- **Aceptación:**
  - [ ] Con/sin average_price no aparece precio; nombres largos no ocultan menú; no alterar filas de viaje/recibo.
  - [ ] Inspección visual móvil y escritorio y tests de comportamiento que correspondan; DS gate tras cambiar código.
- **Dependencias:** DS-009.
- **Evidencia:** código estático actual y observación visual de los HTML de referencia; app en ejecución no verificada.
- **Visual:** `report.html#ds-054`
- **Estado:** open

### DS-055 · Tienda habitual como entidad sin chip · Medium
- **Tipo:** desalineación frente al diseño final.
- **Dónde:** `src/components/features/base-lists/items/base-list-item-row.tsx:61`
- **DS:** `docs/design/design-system.html#p-itemrow`
- **Observado:** Badge store/store-manual con borde/relleno y pin; Also at en otra línea.
- **Esperado:** Icono de tienda y nombre violeta sin caja; Also at gris al lado cuando cabe, reflow cuando no.
- **Guía:** Reutilizar EntityLabel; mantener origen manual/automático accesible y Use Automatic Store para propietario. DS-045 cubre capitalización compartida; no duplicarla.
- **Aceptación:**
  - [ ] Tienda automática/manual, alternativas y nombres largos; misma entidad visual y permisos conservados.
  - [ ] Inspección visual móvil y escritorio y tests de comportamiento que correspondan; DS gate tras cambiar código.
- **Dependencias:** DS-009.
- **Evidencia:** código estático actual y observación visual de los HTML de referencia; app en ejecución no verificada.
- **Visual:** `report.html#ds-055`
- **Estado:** open

### DS-056 · Filtro con icono y contador separados · Medium
- **Tipo:** desalineación frente al diseño final.
- **Dónde:** `src/components/features/base-lists/items/usual-store-filter.tsx:40`
- **DS:** `docs/design/design-system.html#c-input`
- **Observado:** Sin icono y contador mezclado con All Stores en el valor.
- **Esperado:** Show Items From; tile violeta 28px, All Stores a izquierda, contador mono 12px a derecha antes del chevron.
- **Guía:** Componer Select existente y su variante documentada con icono; conservar query store y semántica del conteo.
- **Aceptación:**
  - [ ] Filtrar/limpiar conserva URL y filas; nombres largos no ocultan contador o chevron.
  - [ ] Inspección visual móvil y escritorio y tests de comportamiento que correspondan; DS gate tras cambiar código.
- **Dependencias:** DS-009.
- **Evidencia:** código estático actual y observación visual de los HTML de referencia; app en ejecución no verificada.
- **Visual:** `report.html#ds-056`
- **Estado:** open

### DS-057 · Categorías: contador numérico y padding · Low
- **Tipo:** desalineación frente al diseño final.
- **Dónde:** `src/components/features/base-lists/items/base-list-items.tsx:83`
- **DS:** `docs/design/design-system.html#p-category`
- **Observado:** El count añade items; contenedor usa 12px en todos sus lados.
- **Esperado:** Contador solo número; card 4px arriba, 12px laterales, 10px abajo y Collapse All de 44px.
- **Guía:** Reutilizar Card size=list y ajustar su API compartida si falta espaciado. No cambiar conteos de progreso de viajes.
- **Aceptación:**
  - [ ] Abierto/cerrado: número compacto, expansión conservada y espacios según referencia.
  - [ ] Inspección visual móvil y escritorio y tests de comportamiento que correspondan; DS gate tras cambiar código.
- **Dependencias:** DS-009.
- **Evidencia:** código estático actual y observación visual de los HTML de referencia; app en ejecución no verificada.
- **Visual:** `report.html#ds-057`
- **Estado:** open

### DS-058 · Formularios: etiquetas y orden de acciones · Medium
- **Tipo:** desalineación frente al diseño final.
- **Dónde:** `src/components/features/base-lists/create-base-list-dialog.tsx:12`
- **DS:** `docs/design/design-system.html#c-dialog`
- **Observado:** New Base List/Create New Base List; campos Name; ItemEditForm Cancel→Save; AddItemForm usa Done/Cancel.
- **Esperado:** New List, List Name, Item Name; edición lista Cancel→Save; edición item Save Changes→Cancel; alta en sheet: principal antes de Cancel.
- **Guía:** Parametrizar wrappers compartidos con labels y disposición, sin cambiar todos los dominios. Conservar validación, datos en error y bloqueo de envío; 44px efectivos aunque referencia dibuje 40px.
- **Aceptación:**
  - [ ] Normal/error en los cuatro formularios; cancelar no guarda, error conserva campos y no hay envío doble.
  - [ ] Inspección visual móvil y escritorio y tests de comportamiento que correspondan; DS gate tras cambiar código.
- **Dependencias:** DS-009.
- **Evidencia:** código estático actual y observación visual de los HTML de referencia; app en ejecución no verificada.
- **Visual:** `report.html#ds-058`
- **Estado:** open

### DS-059 · Lista vacía: identidad azul y Upload Receipt principal · Medium
- **Tipo:** desalineación frente al diseño final.
- **Dónde:** `src/components/features/base-lists/items/base-list-items.tsx:45`
- **DS:** `docs/design/design-system.html#p-empty`
- **Observado:** TaskAdd ámbar; Add Item primario y UploadReceipt secundario, apilados.
- **Esperado:** Icono de lista azul; Add Items secundario izquierda, Upload Receipt primario derecha; son dos vías del mismo objetivo.
- **Guía:** Componer EmptyStateCard, AddItemSheet y UploadTicketDialog con props. Permitir label contextual en el wrapper; a 320px apilar si hace falta sin invertir prioridad.
- **Aceptación:**
  - [ ] Sin filtro ni Start Shopping en vacío; ambos botones abren su flujo; un error no se muestra como vacío.
  - [ ] Inspección visual móvil y escritorio y tests de comportamiento que correspondan; DS gate tras cambiar código.
- **Dependencias:** DS-009.
- **Evidencia:** código estático actual y observación visual de los HTML de referencia; app en ejecución no verificada.
- **Visual:** `report.html#ds-059`
- **Estado:** open

### DS-060 · Confirmación de borrado con descripción y aviso separados · Medium
- **Tipo:** desalineación frente al diseño final.
- **Dónde:** `src/components/features/base-lists/base-list-card.tsx:208`
- **DS:** `docs/design/design-system.html#c-dialog`
- **Observado:** Título incluye nombre y explicación completa en bloque rojo; no separa historial y acceso compartido.
- **Esperado:** Delete List?; nombre/cantidad en descripción; consecuencias en aviso ámbar. Recuperación bloqueada por D-FINAL-1.
- **Guía:** Reutilizar ConfirmSheet y Alert warning por su API. Verificar conservación de historial antes de prometerla. No cambiar semántica de borrado hasta decidir D-FINAL-1.
- **Aceptación:**
  - [ ] Nombre y consecuencias accesibles; comprobar lista sin/con items y miembros; texto de recuperación coherente con Undo.
  - [ ] Inspección visual móvil y escritorio y tests de comportamiento que correspondan; DS gate tras cambiar código.
- **Dependencias:** D-FINAL-1 (texto de recuperación).
- **Evidencia:** código estático actual y observación visual de los HTML de referencia; app en ejecución no verificada.
- **Visual:** `report.html#ds-060`
- **Estado:** open

## Batch 3 — Toast real, hallazgo previo actualizado

### DS-023 · Toast montado: Sonner arriba frente al toast inverso del DS · Medium
- **Type:** misaligned — proveedor y presentación
- **Where:** `src/app/layout.tsx:110` (Sonner `Toaster position=top-center`); `src/components/features/base-lists/items/hooks/use-base-list-item-actions.ts`; `src/hooks/use-undoable-action.ts`.
- **DS reference:** `docs/design/design-system.html#c-toast`
- **Expected:** superficie inversa, radio 16px, texto 14px, sobre tab bar y safe area; Undo con área efectiva 44px.
- **Observed:** el proveedor realmente montado es Sonner, arriba sin tema DS. El informe anterior apuntaba a un primitive Radix que no corrige este flujo.
- **Fix guidance:** configurar Sonner existente mediante su API y tokens; no duplicar proveedores ni modificar un toast no montado.
- **Acceptance criteria:**
  - [ ] Toast sobre navegación sin tapar CTA, reflow a 320px.
  - [ ] Undo conserva su callback y comunica fallo de restauración.
  - [ ] Foco, lector, duración y safe area comprobados en ejecución.
- **Depends on:** DS-009
- **Evidence:** runtime verificado 2026-11-11 (R07–R11): Undo funciona con teclado, aria-live=polite, 24px de alto, Sonner blanco superior; error de restauración y recuperación tras fallo de DELETE comprobados. Safe area física y lector auditivo pendientes.
- **Visual:** report.html#ds-023
- **Status:** open

## Verificación runtime — 2026-11-11 (modo C)

Pruebas con la sesión iniciada por el usuario, sin cambios de código ni migraciones. La lista y productos `DS runtime QA 2026-11-11` se crearon exclusivamente para estas pruebas y se eliminaron al terminar. Las solicitudes interrumpidas fueron exclusivamente de esa fixture. Evidencia: [checks.json](assets/runtime/checks.json), capturas en el informe #runtime. No se guardaron cookies, tokens, correos, recibos reales ni importes de la cuenta en los artefactos.

### DS-061 · Cancelar edición de producto pierde el foco · High
- **Type:** misaligned — accesibilidad de interacción.
- **Where:** `src/components/features/base-lists/items/base-list-item-row.tsx` (rama editing y onCancel), `src/components/features/list-items/item-edit-form.tsx` (Cancel).
- **DS reference:** `docs/design/design-system.html#c-dialog` y patrones de formularios; restauración de foco al control que abrió la edición.
- **Expected:** Cancel devuelve el foco al RowMenu del mismo producto; el teclado continúa desde ese producto.
- **Observed:** al cancelar la edición inline de la fixture, `document.activeElement` es BODY; sigue así después de 1,5s. En contraste, cancelar EntityEditCard de lista sí restaura el foco.
- **Fix guidance:** restaurar foco en el trigger existente de la fila al desmontar la edición, siguiendo el patrón ya usado en BaseListCard; no añadir wrappers ni alterar internals Radix.
- **Acceptance criteria:**
  - [ ] Abrir Edit Item con teclado, cancelar y comprobar foco en su trigger contextual.
  - [ ] Guardar correctamente también preserva un destino de foco válido; error conserva foco y valores en formulario.
- **Depends on:** none.
- **Evidence:** runtime-verified, R05; inspección DOM con Playwright.
- **Visual:** report.html#ds-061
- **Status:** open

### DS-062 · Start Shopping falla con 500 y bloquea pruebas de historial · Critical
- **Type:** fallo funcional de flujo primario; causa del servidor aún no diagnosticada.
- **Where:** `src/components/features/base-lists/start-shopping-dialog.tsx` (handleConfirm); frontera `POST /api/v1/shopping-sessions`.
- **DS reference:** patrón Start Shopping y feedback de error; iniciar viaje no debe perder el contexto de la lista.
- **Expected:** con lista propia y un producto válido, iniciar crea una sesión y abre su pantalla; el viaje se puede completar y conservar en historial al borrar la lista.
- **Observed:** dos intentos sobre la lista de prueba devuelven 500 `INTERNAL_ERROR`, mensaje público seguro “Something went wrong. Please try again.”; no hay navegación al viaje. Una respuesta tiene request_id `2e257c9d-0729-4a21-8035-8ac13b0f1e43`. No se infiere causa de base de datos.
- **Fix guidance:** diagnosticar la solicitud en el servidor, cargar las reglas API/Supabase pertinentes y corregir la causa concreta. No cambiar el DS para aceptar el fallo ni ejecutar migraciones destructivas.
- **Acceptance criteria:**
  - [ ] Crear viaje desde fixture propia devuelve éxito y permite abrir y completar el viaje.
  - [ ] Después, comprobar en fixture que el viaje permanece al borrar su lista.
  - [ ] Cubrir el fallo diagnosticado con prueba del comportamiento; errores públicos seguros.
- **Depends on:** none; bloquea R16 y fixtures históricas.
- **Evidence:** runtime-verified, R16; dos solicitudes reales del consumidor.
- **Visual:** report.html#ds-062
- **Status:** open


## Batch 4 — Mapeo completo de iconos y patrones omitidos

### DS-063 · Glifos de categoría: Dairy, Produce y Pantry · Medium
- **Tipo:** desalineación frente al diseño final.
- **Dónde:** `src/components/commons/category-section/helpers/category-style.ts:29`
- **DS:** `docs/design/design-system.html#final-icon-map`
- **Observado:** Dairy usa CheeseIcon; Produce Apple01Icon y Pantry JarIcon.
- **Esperado:** Dairy botella de leche, Produce hoja y Pantry líneas según SVG finales, con 18px/1.5 en tile gris 32px.
- **Guía:** Verificar MilkBottleIcon, Leaf01Icon y Menu02Icon en el paquete instalado contra el atlas. Usar la biblioteca cuando expresa el glifo final. Si la geometría no coincide, documentar y resolver esa equivalencia antes de añadir un asset propio. Actualizar cada uso de la categoría, no una copia para Pantry.
- **Aceptación:**
  - [ ] Capturas de Bakery/Dairy/Produce/Pantry contrastadas con las 20 referencias; no cambiar Dairy en Deli si son conceptos separados.
  - [ ] Inspección visual de todos los contextos afectados y DS gate tras implementar.
- **Dependencias:** DS-009; mapa final de iconos.
- **Evidencia:** código estático + SVG/HTML de referencia; runtime no verificado.
- **Visual:** `report.html#ds-063`
- **Estado:** open

### DS-064 · Iconos de acción y auxiliares vinculados al contexto final · Low
- **Tipo:** desalineación frente al diseño final.
- **Dónde:** `src/components/features/base-lists/items/base-list-item-row.tsx:107`
- **DS:** `docs/design/design-system.html#final-icon-map`
- **Observado:** Prices by Store usa ShoppingBasket01Icon, nota Note01Icon y error AlertCircleIcon; no existe un mapa que garantice la geometría final.
- **Esperado:** Prices by Store usa tag de precio; nota con Note01Icon en todos los contextos; error con triángulo. Resto del atlas mapea 37 geometrías y conserva las coincidencias de navegación.
- **Guía:** Configurar los iconos de wrappers mediante sus props y mapeos centrales. No sustituir SVG por emoji ni por caracteres. Verificar Tag01Icon/Alert02Icon y adoptar Note01Icon como icono único de nota y señalar cualquier diferencia geométrica residual. Mantener nombres accesibles; no rehacer la semántica de Radix.
- **Aceptación:**
  - [ ] Menús de lista/item, notas, error y vacío muestran el glifo esperado; Trips sigue con bolsa y Upload con Upload06Icon.
  - [ ] Inspección visual de todos los contextos afectados y DS gate tras implementar.
- **Dependencias:** DS-055, DS-058; mapa final de iconos.
- **Evidencia:** código estático + SVG/HTML de referencia; runtime no verificado.
- **Visual:** `report.html#ds-064`
- **Estado:** open

### DS-065 · Up Next: representar los tres avisos de la referencia completa · High
- **Tipo:** desalineación frente al diseño final.
- **Dónde:** `src/components/features/dashboard/up-next-list.tsx:17`
- **DS:** `docs/design/design-system.html#p-section`
- **Observado:** KINDS solo contempla receipt-waiting/failed, partner-shopping, list-running-low/stale. No hay tipos dedicados a viaje sin recibo y cambios de precio; falta el contador 3 to review.
- **Esperado:** Tres avisos independientes con origen real: revisión de recibo (Invoice), viaje sin recibo (Attachment) y cambios de precio (Tag), cantidad a revisar y texto contextual.
- **Guía:** Añadir modelos de vista solo si sus fuentes de datos permiten determinar esos estados. No fabricar avisos ni representar precio pendiente con un aviso de lista antigua. Cargar las skills de API/Supabase si hace falta exponer datos. Componer las filas con RowIcon y los tokens correctos.
- **Aceptación:**
  - [ ] Con los tres eventos reales se ven las tres filas y contador correcto; sin eventos no aparece el bloque. Cada enlace abre su contexto.
  - [ ] Inspección visual de todos los contextos afectados y DS gate tras implementar.
- **Dependencias:** DS-047 y modelo de dashboard; fuente de avisos verificada.
- **Evidencia:** código estático + SVG/HTML de referencia; runtime no verificado.
- **Visual:** `report.html#ds-065`
- **Estado:** open

### DS-066 · Cabecera de todas las listas: conteo y New List junto al título · Medium
- **Tipo:** desalineación frente al diseño final.
- **Dónde:** `src/app/(authenticated)/shopping-lists/page.tsx:84`
- **DS:** `docs/design/design-system.html#p-objcard`
- **Observado:** PageHeader usa descripción genérica; debajo aparece otro toolbar con cantidad y New Base List.
- **Esperado:** Lists con la descripción “All your lists in one place. Start with the things you always buy.”, contador debajo y New List al extremo. La misma cabecera se conserva en los ocho estados del listado.
- **Guía:** Componer PageHeader y ListToolbar/InlineCounter por su API compartida para reproducir el header final; conservar carga, error y página vacía. DS-058 ya cubre renombrar el botón, no duplicar esa tarea.
- **Aceptación:**
  - [ ] Estados 01–08: título Lists y descripción visibles en cada vista prevista, con conteo correcto y acción New List; el texto explicativo del informe no sustituye la descripción dentro de la pantalla.
  - [ ] Inspección visual de todos los contextos afectados y DS gate tras implementar.
- **Dependencias:** DS-058.
- **Evidencia:** código estático + SVG/HTML de referencia; runtime no verificado.
- **Visual:** `report.html#ds-066`
- **Estado:** open

## Decisión confirmada — imagen del hero

Decisión confirmada del usuario: la tarjeta “Ready for your next trip?” conserva la imagen de fondo actual de HeroSurface: mobile-session.webp en móvil y desktop-session.webp desde 768px, object-cover y el scrim actual. Solo se actualizan composición y contenido; no se sustituye la foto por un fondo plano.

## Decisiones confirmadas — notas y cabecera de Lists

Note01Icon, el bloc/cuaderno con anillas de Hugeicons, es el único glifo de nota. Sustituye la decisión anterior de Message01Icon. Usar el mismo dibujo en tarjetas, cabeceras, productos y viajes: trazo 1.5, 14px compacto o 16px en descripción, decorativo y color muted. ItemNote ya lo usa; retirar el override Message01Icon de ShoppingSessionItemRow y centralizar la pieza compartida en commons si la usan tarjetas/cabeceras. Conservar wrap, testId, texto y accesibilidad; no crear bocadillos alternativos.

Las ocho pantallas del listado V4-listas-01–08 mantienen una cabecera común: título Lists, descripción “All your lists in one place. Start with the things you always buy.”, cantidad y acción New List. El estado de menú, edición, error, confirmación o Undo no elimina el título ni la descripción. V4-listas-09 es el detalle de una lista vacía, no el listado.

DS-066 debe incluir la descripción dentro de PageHeader y de todas las capturas previstas del listado, no solo como texto del informe. Revisar los ocho estados y los anchos móvil/escritorio. DS-064 incluye la homogeneización del glifo de nota; no requiere un asset propio ni una decisión adicional de iconografía.

## Decisiones abiertas

- **D-FINAL-1 — Borrado y Undo:** la confirmación final afirma que no se puede deshacer y la siguiente pantalla permite Undo. Recomendado: conservar la acción diferida existente y explicar la ventana de Undo; después de esa ventana el borrado será definitivo. No aplicar ese texto ni cambiar persistencia sin decisión. Verificar de forma independiente la promesa de conservar viajes históricos.
- **Accesibilidad de referencias:** se propone conservar muted #5B6B82, 44px efectivos y mínimo 12px. Los diseños finales contienen #64748B sobre panel (4.44:1), CTA de 40px y etiqueta de 11px. Mantener diseño y aprobar estas normalizaciones pequeñas es la recomendación; no se ha aprobado una excepción de accesibilidad.
- **Dark y escritorio:** las referencias son de 390px claro. Se conserva el DS previo como base; no afirmar equivalencia visual ni inventar una aprobación.
- **Documentos anteriores:** decidir su retiro en una tarea posterior; no hay autorización de borrado.

## Comparativas por pantalla y fidelidad

El informe contiene 20 comparativas completas con tres imágenes de 390px: código recreado desde fuente, referencia HTML original y propuesta tras el plan. La vista de código NO es una captura de una sesión autenticada ni ejecuta módulos de app; usa fixtures para comparar estados. No había servidor local abierto al iniciar esta revisión. Se conserva por separado la evidencia runtime ya guardada por otra verificación; no se reutiliza como si cubriera las 20 pantallas. El layout se reconstruyó leyendo los componentes, sus variantes y tokens: no es el resultado garantizado de Next.js/Radix ni prueba foco, posición real de un portal o datos del usuario.

Las propuestas conservan la anatomía y los SVG exactos de las referencias, con normalización de muted a #5B6B82 y 44px efectivos. Son cambios sugeridos pendientes de aprobación. La equivalencia geométrica de un SVG con el paquete instalado se distingue de una coincidencia semántica: no autoriza iconos propios sin comprobar la biblioteca. El texto contradictorio de borrado sigue marcado D-FINAL-1 y no se decide por dibujarlo. El HTML original conserva su fallback del asset /_blob ausente solo en la columna Referencia. Por decisión explícita del usuario, la propuesta conserva la imagen actual de HeroSurface con sus recortes y scrim; esta decisión ya está confirmada y no bloquea DS-051.

## Supuestos y alcance

Paleta y tipografía se conservan; las diferencias claras de anatomía se incorporan al DS por instrucción del usuario. Los 20 HTML cubren estados, no 20 rutas diferentes. Los sufijos de archivo no son variantes permanentes de componentes. Las etiquetas del producto siguen en inglés; esta auditoría está en español. Estados de loading, red y permisos no dibujados mantienen reglas existentes. Referencias externas a la carpeta y la landing no forman parte de esta aprobación visual.

## Resultado de las comprobaciones antes no verificadas

| ID | Resultado | Comprobación | Evidencia |
|---|---|---|---|
| R01 | PASS | Crear lista | Teclado: foco inicial en título; 9 Tab dentro del diálogo; Escape y retorno al trigger. Error Name asociado mediante aria-describedby. |
| R02 | PASS | Editar lista | Error de nombre vacío asociado; Cancel devuelve foco al menú de la tarjeta. |
| R03 | PASS | Añadir producto | 13 Tab contenidos; Name vacío y Quantity=0 con aria-invalid y errores asociados. Inputs móviles de 16px. |
| R04 | PASS | Menú y edición de producto | Enter abre RowMenu; ArrowDown selecciona Edit Item; edición enfoca Name; validación conserva formulario. |
| R05 | FAIL | Retorno de foco del producto | Cancel de ItemEditForm deja document.activeElement en BODY, también tras 1,5s. DS-061. |
| R06 | PASS | Sheets secundarios | Set Usual Store, Prices by Store, Share y Upload: nombres/roles en árbol accesible, Escape cierra. Upload: 8 Tab contenidos; no se enviaron invitaciones ni archivos. |
| R07 | PASS | Undo por teclado | Borrado de producto y de lista temporal restaurados con botón Undo mediante foco y Enter. |
| R08 | PASS | Errores de red de Undo/borrado | Interrupción selectiva de solicitudes HTTP de la fixture: restauración muestra Could not undo; fallo de DELETE de lista recupera tarjeta (6,397s). Sin mocks de Supabase. |
| R09 | PASS | Ventana y persistencia de borrado | Sin Undo: DELETE de la lista temporal devuelve 204 a los 6,610s; GET posterior 404; tarjeta ausente tras recarga. Fixture eliminada. |
| R10 | PASS | Reflow | 6 pantallas × 3 anchos (320/375/1280) × 2 temas: 36/36 sin scroll horizontal de página. Además Lists comprobada a 390 y 768px. |
| R11 | FAIL | Toast y dark frente al DS | Sonner real: superficie blanca, arriba (x16/y16/ancho288 a 320px), Undo 47,31×24px, aria-live=polite; no solapa tab bar, pero difiere del DS. Oscuro neutral confirmado frente a navy especificado. DS-023 y DS-010. |
| R12 | PARTIAL | Zoom y viewport corto | Escala de texto raíz 200%: inputs 32px y sin overflow horizontal del diálogo. No es zoom nativo del navegador. Con viewport 390×400, tras estabilizar animación y Tab, Create List queda y338–378 dentro de 400px. |
| R13 | BLOCKED | Safe area y teclado físico móvil | No hay dispositivo iOS/Android conectado. Se comprobó viewport corto; no se equipara a teclado virtual real. Chrome no admite Emulation.setSafeAreaInsets en esta sesión. |
| R14 | PARTIAL | Gasto y moneda | GET spending=200; rango de noviembre Toronto 2026-11-01T04:00Z–2026-12-01T05:00Z; desglose+other coincide con total. Mes vacío=0; rango inválido=422. DTO no incluye moneda; formatCurrency usa USD por defecto. No se demuestra deduplicación ni moneda mixta con estos datos. DS-047. |
| R15 | PARTIAL | Predicciones | GET likely_needed=200, meta.has_history=true e items=[] en la cuenta. Fuente RPC exige purchase_count>=3, no un contador de tres recibos. Fixtures temporales de varios meses/recibos no ejecutadas; umbral final continúa en DS-048. |
| R16 | BLOCKED | Historial tras completar viaje y borrar lista | Dos intentos desde lista temporal: POST shopping-sessions devuelve 500 INTERNAL_ERROR. No se completó viaje; no puede afirmarse preservación histórica con esta prueba. DS-062. |
| R17 | PARTIAL | Lector de pantalla | Se inspeccionaron árboles accesibles, nombres, errores, alertdialog y aria-live. No se escuchó NVDA/Narrator/VoiceOver: anuncios y experiencia auditiva no comprobados. |
| R18 | PASS | Movimiento reducido | prefers-reduced-motion:reduce emulado: dialog con animation-duration=0s y transition-duration=0s. |

Se ejecutaron pruebas interactivas en la app ya iniciada. No se ejecutaron builds, lint, Vitest ni scripts del repositorio. No se declara completado lo que requiere hardware, lector auditivo o fixtures que el error 500 bloqueó. El diseño final oscuro/escritorio sigue sin referencia aprobada: renderizarlo no constituye esa aprobación.

## Validación de los artefactos

Catálogo e informe comprobados a 320, 375 y 1280px sin scroll horizontal de página; 60/60 vistas de las 20 pantallas cargadas, más 4 capturas runtime preservadas. 65 IDs únicos y coincidentes entre informe/plan, sin duplicados ni enlaces DS rotos. 30 instancias de muestras de patrones y 37 geometrías en el DS. Filtros y salto por pantalla comprobados. Esto valida documentos; la sección runtime conserva su propia evidencia y limitaciones.

## Informativo — entradas DS

Actualizadas definiciones existentes de Header, Card – Object, Item row, Category, Select, Dialog, Toast, Empty, Hero y Section card; no se creó un kit nuevo ni se exportaron tokens al código. No se detecta un componente nuevo en código que requiera una definición independiente en este alcance. Registro de fuentes y hashes en DS Examples.

## Backlog heredado — 43 IDs pendientes de reverificación

Se conserva la evidencia de la auditoría 2026-11-09 en su idioma original para no perder tareas. No representa una comprobación actual ni un permiso de implementación. Algunas partes ya cambiaron; confirmar y retirar hallazgos resueltos en una futura verificación, sin recrearlos con otro ID. Las ubicaciones antiguas pueden haberse desplazado. DS-023 está actualizado arriba; DS-022 sigue retirado.

### DS-001 · Point AGENTS.md to the new DS as the only design source · High
**Vigencia:** pendiente de reverificación; evidencia registrada 2026-11-09, no aplicar sin cotejar DS v1.8.0.
- **Type:** reference update
- **Where:** `AGENTS.md:489-491` (section "Documentation Ownership")
- **DS reference:** Overview (docs/design/design-system.html#overview)
- **Current text:** "- [docs/design/listys-design-system.html](docs/design/listys-design-system.html) is the canonical visual reference; [docs/design/DESIGN.md](docs/design/DESIGN.md) owns the written rules, implementation mapping, and documented gaps. `docs/design/audit-findings/` is managed by the `build-app-design-system` skill (see "Design System")."
- **Replace with:** "- [docs/design/design-system.html](docs/design/design-system.html) is the only source of truth for UI: tokens, components and patterns. `docs/design/audit-findings/` is managed by the `build-app-design-system` skill (see "Design System")."
- **Why it matters:** AGENTS.md currently tells every agent that two older files are canonical, competing with the new DS.
- **Acceptance criteria:**
  - [ ] `AGENTS.md` names `docs/design/design-system.html` as the only source of truth
  - [ ] Searching AGENTS.md for `DESIGN.md` and `listys-design-system.html` finds nothing (unless the user chose to keep them, then only as "historical reference")
- **Depends on:** none
- **Evidence:** static source
- **Visual:** report.html#ds-001
- **Status:** open


### DS-002 · Update the DS workflow doc: the DS now exists · High
**Vigencia:** pendiente de reverificación; evidencia registrada 2026-11-09, no aplicar sin cotejar DS v1.8.0.
- **Type:** reference update
- **Where:** `docs/contributing/design-system-workflow.md:10-11` (status line); `:13-21` (section "Older design documents"); `:25-26`, `:31-33`, `:37-38` ("until it exists" clauses); `:48` (table row "The DS does not exist yet (today)")
- **DS reference:** Overview (docs/design/design-system.html#overview)
- **Current text:** Line 10: "**Status: the DS has not been initialized yet.** Until `docs/design/design-system.html` exists, the older design documents below stay authoritative…"
- **Replace with:** Line 10: "**Status: the DS exists** (`docs/design/design-system.html`, v1.1.0) and is the only source of truth." Remove or relabel the "Older design documents" section as "Historical references (not canonical)" (or delete it if the user confirmed deleting both files). Drop every "until it exists / until the DS exists" clause in "Before you write UI" (read the DS; no fallback to `DESIGN.md` or the old HTML; no "the HTML wins" rule). In the table, change the Init row to "Only if the DS file is ever lost: `/appds:init`".
- **Why it matters:** The workflow tells agents to follow `DESIGN.md` and the old HTML "until the DS exists" and to keep `DESIGN.md` in sync, which would keep two sources alive.
- **Acceptance criteria:**
  - [ ] No sentence says the DS is missing or tells agents to follow `DESIGN.md` or the old HTML
  - [ ] The gate, audit, verify and update rows are unchanged
- **Depends on:** none
- **Evidence:** static source
- **Visual:** report.html#ds-002
- **Status:** open


### DS-003 · Repoint remaining docs and agent notes that cite the old sources · Medium
**Vigencia:** pendiente de reverificación; evidencia registrada 2026-11-09, no aplicar sin cotejar DS v1.8.0.
- **Type:** reference update
- **Where:** `docs/contributing/CONTRIBUTING.md:6`; `docs/README.md:21`; `README.md:59`; `PRODUCT.md:81` ("The blue-and-cyan palette recorded in `docs/design/DESIGN.md` is binding"); `docs/reference/implementation-status.md:20`, `:219`, `:274`, `:289` (links to DESIGN.md §11.4 gaps); `.impeccable/surfaces/src-components-marketing-landing-page.md:20`, `:28`
- **DS reference:** Overview (docs/design/design-system.html#overview)
- **Current text:** Each cites `docs/design/DESIGN.md` and/or `docs/design/listys-design-system.html` as the design reference.
- **Replace with:** Link `docs/design/design-system.html` instead (for gap lists: link the DS "Open decisions" on its Overview and the findings of the latest audit). In `PRODUCT.md:81` say "the palette in the Design System (`docs/design/design-system.html`) is binding". Leave `CHANGELOG.md` untouched: it is history.
- **Why it matters:** Humans and agents following these links land on the superseded documents.
- **Acceptance criteria:**
  - [ ] Searching the repo (excluding `CHANGELOG.md`, `openspec/changes/archive/` and the old files themselves) for `DESIGN.md` and `listys-design-system.html` finds nothing that presents them as canonical
- **Depends on:** none
- **Evidence:** static source
- **Visual:** report.html#ds-003
- **Status:** open


### DS-004 · Remove code comments that cite DESIGN.md sections · Low
**Vigencia:** pendiente de reverificación; evidencia registrada 2026-11-09, no aplicar sin cotejar DS v1.8.0.
- **Type:** code comment
- **Where:** `src/components/features/dashboard/dashboard-row.tsx:10` ("…set in mono (DESIGN.md §4.1)"); `src/components/features/dashboard/up-next-list.tsx:11` ("…tones of DESIGN.md §3.3…")
- **DS reference:** Foundations › Typography, Color (docs/design/design-system.html#foundations)
- **Current text:** Comments cite `DESIGN.md` section numbers.
- **Replace with:** Cite "Design System › Typography (Mono)" and "Design System › Color (feedback tokens)". Keep the existing explanation of why.
- **Why it matters:** Section numbers of a superseded file go stale and point agents to it.
- **Acceptance criteria:**
  - [ ] No comment under `src/` references `DESIGN.md`
- **Depends on:** none
- **Evidence:** static source
- **Visual:** report.html#ds-004
- **Status:** open


### DS-005 · Foreground (ink) is neutral grey #333333, not slate ink #0F172A · Medium
**Vigencia:** pendiente de reverificación; evidencia registrada 2026-11-09, no aplicar sin cotejar DS v1.8.0.
- **Type:** misaligned: token
- **Where:** `src/app/globals.css:12` `--foreground`; `:14` `--card-foreground`; `:16` `--popover-foreground`; `:40` `--sidebar-foreground` (all light theme)
- **DS reference:** Foundations › Color › text/primary (docs/design/design-system.html#foundations)
- **Expected:** text/primary #0F172A = `oklch(0.2077 0.0398 265.7549)` (the code already uses this exact value for the dark `--primary-foreground`)
- **Observed:** `oklch(0.3211 0 0)` = #333333, a neutral grey
- **Why it matters:** Headings, item names and values lose the navy ink that defines the palette; every screen reads greyer than designed.
- **Fix guidance:** Set the four light-theme foreground variables to the DS ink value. Do not touch the dark theme here (DS-010).
- **Acceptance criteria:**
  - [ ] `--foreground`, `--card-foreground`, `--popover-foreground`, `--sidebar-foreground` resolve to #0F172A in light mode
  - [ ] Body text on the canvas measures 16.2:1
  - [ ] A visual check of dashboard, lists and a receipt shows no unintended color change
- **Depends on:** none
- **Evidence:** static source
- **Visual:** report.html#ds-005
- **Status:** open


### DS-006 · Muted text fails AA on the canvas (4.39:1) · High
**Vigencia:** pendiente de reverificación; evidencia registrada 2026-11-09, no aplicar sin cotejar DS v1.8.0.
- **Type:** misaligned: token, accessibility
- **Where:** `src/app/globals.css:24` `--muted-foreground`
- **DS reference:** Foundations › Color › text/muted (docs/design/design-system.html#foundations)
- **Expected:** text/muted #5B6B82 = `oklch(0.5233 0.0413 257.4182)`: 4.92:1 on canvas #F2F4F7, 4.58:1 on #E9ECF0, 5.43:1 on white
- **Observed:** `oklch(0.5510 0.0234 264.3637)` = #6B7280 (grey, not slate): 4.39:1 on canvas, below the 4.5:1 AA minimum for normal text
- **Why it matters:** Descriptions, metadata and placeholders use this color at 12–14px on the canvas and fail WCAG 1.4.3 (and 78 `text-slate-500` call sites sit at #64748B, which is 4.32:1: see DS-020).
- **Fix guidance:** Change `--muted-foreground` to the DS value. Placeholders already use it (`input.tsx`), so they improve too.
- **Acceptance criteria:**
  - [ ] `--muted-foreground` resolves to #5B6B82 in light mode
  - [ ] Contrast of `text-muted-foreground` on `bg-background`, `bg-card` and `bg-secondary` is ≥ 4.5:1 (measured: 4.92, 5.43, 4.58)
- **Depends on:** none
- **Evidence:** static source + computed contrast
- **Visual:** report.html#ds-006
- **Status:** open


### DS-007 · Accent surface is sky blue #E0F2FE, DS uses blue #DBEAFE · Medium
**Vigencia:** pendiente de reverificación; evidencia registrada 2026-11-09, no aplicar sin cotejar DS v1.8.0.
- **Type:** misaligned: token
- **Where:** `src/app/globals.css:25` `--accent`; `:43` `--sidebar-accent`
- **DS reference:** Foundations › Color › action/subtle (docs/design/design-system.html#foundations)
- **Expected:** action/subtle #DBEAFE = `oklch(0.9319 0.0316 255.5855)`
- **Observed:** `oklch(0.9514 0.0250 236.8242)` = #E0F2FE (sky-100)
- **Why it matters:** This is the hover and current-item highlight of the sidebar, tab bar, menus and selected rows; it reads cyan-tinted instead of the blue of the action family. `--accent-foreground` (#1E3A8A) already matches.
- **Fix guidance:** Set both variables to the DS value. Keep the dark values (they already equal #1E3A8A).
- **Acceptance criteria:**
  - [ ] `--accent` and `--sidebar-accent` resolve to #DBEAFE in light mode
  - [ ] `#1E3A8A` text on it stays ≥ 4.5:1 (measured 8.5:1)
- **Depends on:** none
- **Evidence:** static source
- **Visual:** report.html#ds-007
- **Status:** open


### DS-008 · Hairline border is grey-200 #E5E7EB, DS border/default is slate #E2E8F0 · Low
**Vigencia:** pendiente de reverificación; evidencia registrada 2026-11-09, no aplicar sin cotejar DS v1.8.0.
- **Type:** misaligned: token
- **Where:** `src/app/globals.css:30` `--border`; `:31` `--input`; `:45` `--sidebar-border`
- **DS reference:** Foundations › Color › border/default (docs/design/design-system.html#foundations)
- **Expected:** border/default #E2E8F0 = `oklch(0.9288 0.0126 255.5078)`
- **Observed:** `oklch(0.9276 0.0058 264.5313)` = #E5E7EB
- **Why it matters:** Same lightness, different hue family: the hairlines are neutral where every other neutral is slate.
- **Fix guidance:** Update the three variables to the DS value.
- **Acceptance criteria:**
  - [ ] The three variables resolve to #E2E8F0 in light mode
- **Depends on:** none
- **Evidence:** static source
- **Visual:** report.html#ds-008
- **Status:** open


### DS-009 · Add the semantic tokens components currently fake with slate/amber/green literals · Medium
**Vigencia:** pendiente de reverificación; evidencia registrada 2026-11-09, no aplicar sin cotejar DS v1.8.0.
- **Type:** missing tokens
- **Where:** `src/app/globals.css` (`:root`, `.dark` and `@theme inline`)
- **DS reference:** Foundations › Color (docs/design/design-system.html#foundations)
- **Expected:** Tokens for text (secondary, body, faint, on-inverse, on-inverse-muted, on-inverse-action), bg/inverse, border/divider and border/outline, action hover, feedback (success, warning, error, info with subtle, tint and strong), entity (list, receipt, trip, store), collaboration and scan. Values are in the token map below; register them in `@theme inline` as `--color-*` so Tailwind exposes them (e.g. `text-body`, `bg-inverse`, `bg-feedback-info-tint`).
- **Observed:** None exist. Components use literals instead: 78 files outside the landing page use `slate-*` utilities (see DS-020), badges use `amber-100/700`, `green-100/700`, `blue-100/700`, `violet-*`, alerts use `blue-500/10`, buttons use `bg-primary/90` for hover (DS-012).
- **Why it matters:** Without tokens the DS values cannot be changed in one place, dark mode needs per-call-site `dark:` classes, and contrast fixes (DS-006) do not reach literal uses.
- **Fix guidance:** Add the tokens with light and dark values from the token map. Keep shadcn-compatible names for the existing ones; add new names only for roles shadcn lacks. Do not add a second color system in `tailwind.config.ts`. No component changes in this issue.
- **Acceptance criteria:**
  - [ ] Every token in the map exists in `:root` and `.dark` and is registered in `@theme inline`
  - [ ] Each resolves to the DS hex (light) and the DS dark hex
  - [ ] No hex literals are introduced in components
- **Depends on:** DS-005, DS-006, DS-007, DS-008
- **Evidence:** static source
- **Visual:** report.html#ds-009
- **Status:** open


### DS-010 · Dark theme is neutral grey; the DS specifies navy · Medium
**Vigencia:** pendiente de reverificación; evidencia registrada 2026-11-09, no aplicar sin cotejar DS v1.8.0.
- **Type:** misaligned: token (dark mode)
- **Where:** `src/app/globals.css:66-115` (`.dark`)
- **DS reference:** Foundations › Color (Dark column) (docs/design/design-system.html#foundations)
- **Expected:** See the dark column of the token map (canvas #0B1120, surface #111827, secondary #1E293B, text #F8FAFC / #94A3B8, border #334155).
- **Observed:** `--background` #171717, `--card` #262626, `--foreground` #E5E5E5, `--muted-foreground` #A3A3A3, `--border` #404040: pure grey. Already equal to the DS: `--primary` #60A5FA, `--primary-foreground` #0F172A, `--accent` #1E3A8A, `--destructive` #EF4444.
- **Why it matters:** The DS defines navy surfaces so dark mode keeps the brand; today it is generic grey. **Pending assumption:** the user chose to specify navy dark mode but it has never been reviewed in the app.
- **Fix guidance:** Replace the neutral values in `.dark` with the DS dark values, then review each core screen in dark (DESIGN.md already requires light and dark review before a component is complete).
- **Acceptance criteria:**
  - [ ] `.dark` variables resolve to the DS dark values in the map
  - [ ] Dashboard, lists, a trip and a receipt reviewed visually in dark with no unreadable text (≥ 4.5:1)
  - [ ] Images and the logo are not color-inverted
- **Depends on:** DS-009
- **Evidence:** static source (dark rendering not verified)
- **Visual:** report.html#ds-010
- **Status:** open


### DS-011 · tailwind.config.ts is a v3 leftover that Tailwind v4 never loads · Low
**Vigencia:** pendiente de reverificación; evidencia registrada 2026-11-09, no aplicar sin cotejar DS v1.8.0.
- **Type:** dead config
- **Where:** `tailwind.config.ts:13-53` (colors wrapped as `hsl(var(--x))`); `components.json:11` (`"config": "tailwind.config.ts"`)
- **DS reference:** Foundations › Color (docs/design/design-system.html#foundations)
- **Expected:** One color system: the tokens in `globals.css`.
- **Observed:** The config maps colors to `hsl(var(--background))` etc. while the variables hold OKLCH values; `globals.css` has no `@config` directive, so v4 ignores the file. The only live content is the `blob` animation (marketing).
- **Why it matters:** A second, broken-looking color system invites wrong edits (DESIGN.md §11.1 forbids it).
- **Fix guidance:** Confirm nothing else loads it, move the `blob` keyframes next to the marketing styles if still used, set `components.json` `tailwind.config` to an empty string (the v4 convention) and delete the file.
- **Acceptance criteria:**
  - [ ] `tailwind.config.ts` is gone and the app builds and renders unchanged
  - [ ] `components.json` no longer points to it
- **Depends on:** none
- **Evidence:** static source
- **Visual:** report.html#ds-011
- **Status:** open


### DS-012 · Primary and danger hover lighten instead of darkening · Medium
**Vigencia:** pendiente de reverificación; evidencia registrada 2026-11-09, no aplicar sin cotejar DS v1.8.0.
- **Type:** misaligned: interaction state
- **Where:** `src/components/ui/button.tsx:21` default; `:26` destructive; `:31` hero; `:33` fab
- **DS reference:** Core Components › Button › Hover (docs/design/design-system.html#c-button)
- **Expected:** Hover primary #1D4ED8 (action/primary-hover, `oklch(0.4882 0.2172 264.3763)`); hover danger #B91C1C (`oklch(0.5054 0.1905 27.5181)`). Dark: #93C5FD.
- **Observed:** `hover:bg-primary/90` and `hover:bg-destructive/90`: a 90% blend toward the page behind, about #3A72EC on the canvas (lighter than the rest color)
- **Why it matters:** Every primary action gives a lighter-on-hover feedback; the DS and the secondary/tertiary buttons darken. Opacity blends also change with the background.
- **Fix guidance:** Use the hover tokens from DS-009 (`--primary-hover`, `--destructive-hover`) instead of opacity.
- **Acceptance criteria:**
  - [ ] Hovering default, hero and fab shows #1D4ED8; destructive shows #B91C1C (light)
  - [ ] White text on the hover fill ≥ 4.5:1 (measured 6.7:1 and 6.5:1)
  - [ ] Dark theme hover is the DS dark value with ink text
- **Depends on:** DS-009
- **Evidence:** static source
- **Visual:** report.html#ds-012
- **Status:** open


### DS-013 · No pressed state · Medium
**Vigencia:** pendiente de reverificación; evidencia registrada 2026-11-09, no aplicar sin cotejar DS v1.8.0.
- **Type:** misaligned: interaction state
- **Where:** `src/components/ui/button.tsx:17` (base classes; no `active:` rule anywhere in the file)
- **DS reference:** Core Components › Button › Pressed (docs/design/design-system.html#c-button)
- **Expected:** Pressed scales to 97% on the hover color; no transform under `prefers-reduced-motion`.
- **Observed:** Nothing happens on `:active`.
- **Why it matters:** Pressing a button on a phone gives no immediate feedback, which is the primary one-handed shopping interaction.
- **Fix guidance:** Add an `active:` style to the base classes (scale 0.97, hover color) with `motion-reduce:active:scale-100`. Respect `disabled`.
- **Acceptance criteria:**
  - [ ] Pressing any enabled button scales it to 97% and shows the hover color
  - [ ] No scaling with reduced motion
  - [ ] Disabled buttons do not react
- **Depends on:** DS-012
- **Evidence:** static source
- **Visual:** report.html#ds-013
- **Status:** open


### DS-014 · Outline variant is a white bordered button with blue icons · Medium
**Vigencia:** pendiente de reverificación; evidencia registrada 2026-11-09, no aplicar sin cotejar DS v1.8.0.
- **Type:** misaligned: variant
- **Where:** `src/components/ui/button.tsx:13-14` `SECONDARY_BUTTON_STYLE` and `:22` `outline`; Used in 10 files, e.g. `features/dashboard/dashboard-greeting.tsx`, `features/list-items/add-item-sheet.tsx`, `features/sharing/share-list-dialog.tsx`, `app/error.tsx`
- **DS reference:** Core Components › Button › Outline (docs/design/design-system.html#c-button)
- **Expected:** Transparent fill, ink text, 1px inset ring #D5DAE1 (border/outline), hover fill #F2F4F7 (bg/canvas); glyph inherits the text color.
- **Observed:** `bg-card` fill, `border-slate-200` border, `hover:border-slate-300 hover:bg-slate-50`, and `[&_svg]:text-primary` (blue glyphs)
- **Why it matters:** Share and Add Item sit on the page ground in every list; they currently look like white buttons with blue icons.
- **Fix guidance:** Rebuild the variant from the DS tokens (inset ring via a shadow/ring utility using the new outline token).
- **Acceptance criteria:**
  - [ ] Outline shows the DS fill, ring, hover and ink glyph in light and dark
  - [ ] Focus ring still shows (the ring and the focus ring must not clash)
- **Depends on:** DS-009
- **Evidence:** static source
- **Visual:** report.html#ds-014
- **Status:** open


### DS-015 · A receipt being read shows amber, the same as Pending · High
**Vigencia:** pendiente de reverificación; evidencia registrada 2026-11-09, no aplicar sin cotejar DS v1.8.0.
- **Type:** misaligned: status color
- **Where:** `src/components/ui/badge.tsx:23` `processing`; `src/components/features/tickets/helpers/ticket-status.ts:14` (`processing: { label: "Reading Receipt", tone: "bg-amber-100 text-amber-700 …" }`); `src/components/features/tickets/receipt/ticket-item-row.tsx:28` (`"No price"` uses `variant: "processing"`)
- **DS reference:** Core Components › Badge › Status (docs/design/design-system.html#c-badge)
- **Expected:** Reading = feedback/info-tint (#DBEAFE) with feedback/info text (#1D4ED8), 6px dot. Pending stays amber. "No price" is an attention **tag** (amber-50 fill, amber-200 ring, icon), not a status pill.
- **Observed:** `processing` is `bg-amber-100 text-amber-700`, identical to `pending` (line 29); the receipt status map copies the same amber tone
- **Why it matters:** Pending and Reading are indistinguishable and blue (in progress) is not used where the DS says it should be. Labels are not part of this issue (the Ready/Processed wording is an open copy decision in the old docs).
- **Fix guidance:** Make `processing` the blue tint (it can share the `shopping` look), update the tone in `ticket-status.ts`, and render "No price" with `tag-attention` plus its icon.
- **Acceptance criteria:**
  - [ ] A receipt in Reading shows blue; Pending shows amber
  - [ ] "No price" renders as the attention tag with an icon
  - [ ] Dark theme tints follow the DS dark values
- **Depends on:** DS-009
- **Evidence:** static source
- **Visual:** report.html#ds-015
- **Status:** open


### DS-016 · Alert base and destructive-soft radii (8/12px) and translucent tones differ from the DS (16px, icon tile, tonal fills) · Medium
**Vigencia:** pendiente de reverificación; evidencia registrada 2026-11-09, no aplicar sin cotejar DS v1.8.0.
- **Type:** misaligned: component
- **Where:** `src/components/ui/alert.tsx:7` base `rounded-lg` (8px); `:14` `destructive-soft` `rounded-xl` (12px); `:15-17` `info` and `warning` (`bg-blue-500/10`, `border-blue-500/60`, whole alert `text-blue-700`); `:18` `receipt-warning` is `rounded-2xl` (16px) and already matches the radius; Used in `features/shopping-sessions/trip-receipts-card.tsx`, `features/tickets/receipt/ticket-items-card.tsx`, `ticket-items-list.tsx`, `app/(authenticated)/invite/[token]/page.tsx`
- **DS reference:** Core Components › Alert and status card (docs/design/design-system.html#c-alert)
- **Expected:** Radius 16px (radius/field, `rounded-2xl`) for every variant; 12px padding and gap; a 32px icon tile (8px radius) in feedback/*-tint with the 700 icon; fill feedback/*-subtle with a 1px inset feedback/*-tint ring; title Inter 600/14 in feedback/*-strong; body Inter 14/21 in text/body; optional actions row of 32px buttons 8px apart.
- **Observed:** Base 8px and destructive-soft 12px against 16px in `receipt-warning`; `info` and `warning` tint the entire alert text and use 10%-opacity fills over the page; no icon tile
- **Why it matters:** One component, three radii; translucent fills change with the background and are harder to keep AA in dark mode. The 16px value is taken from the old HTML reference (the written spec said 22px, off the radius scale).
- **Fix guidance:** Use `rounded-2xl` for all variants and rebuild the tones with the DS-009 feedback tokens (subtle, tint, strong). Keep the variant names callers already use.
- **Acceptance criteria:**
  - [ ] All alert variants render at 16px radius
  - [ ] Icon sits in a 32px tile; title uses the 900 color, body uses text/body
  - [ ] No `/10` or `/60` opacity colors remain in `alert.tsx`
- **Depends on:** DS-009
- **Evidence:** static source
- **Visual:** report.html#ds-016
- **Status:** open


### DS-017 · Default card title is weight 500, DS card title is 600 · Medium
**Vigencia:** pendiente de reverificación; evidencia registrada 2026-11-09, no aplicar sin cotejar DS v1.8.0.
- **Type:** misaligned: typography
- **Where:** `src/components/ui/card.tsx:93` `cardTitleVariants` `default: "text-base font-medium"`
- **DS reference:** Foundations › Typography › H6 (card title) (docs/design/design-system.html#foundations)
- **Expected:** 600 16px/1.5, −.005em, Plus Jakarta Sans
- **Observed:** `text-base font-medium` (500), no display face or tracking
- **Why it matters:** Every `CardTitle` using the default is lighter than the card titles drawn in the DS.
- **Fix guidance:** Set the default variant to semibold with display face and `tracking-tight`-equivalent spacing from the native scale.
- **Acceptance criteria:**
  - [ ] `CardTitle` default renders 600 16px in the display face
  - [ ] No call site overrides it with `className`
- **Depends on:** none
- **Evidence:** static source
- **Visual:** report.html#ds-017
- **Status:** open


### DS-018 · Card variants premium, accent and ghost add borders the DS forbids · Low
**Vigencia:** pendiente de reverificación; evidencia registrada 2026-11-09, no aplicar sin cotejar DS v1.8.0.
- **Type:** unused variants
- **Where:** `src/components/ui/card.tsx:50-53` (`premium`: `border … ring-1`, `accent`: `border border-primary/30 bg-primary/5`, `ghost`: `border-dashed border-2`)
- **DS reference:** Foundations › Elevation and borders (docs/design/design-system.html#foundations)
- **Expected:** Cards have no border; dashed borders only for drop zones and create-new tiles.
- **Observed:** Three variants that draw borders or rings. A search of `<Card` usages found none using them (usage not proven exhaustive).
- **Why it matters:** Dead variants invite a one-off look; `--shadow-premium` exists only for the first.
- **Fix guidance:** Confirm with a repo-wide search; remove the unused variants and `--shadow-premium`, or document a real use in the DS.
- **Acceptance criteria:**
  - [ ] The variants and their shadow token are removed (or the DS lists them with a use)
  - [ ] No visual change on any screen
- **Depends on:** none
- **Evidence:** static source
- **Visual:** report.html#ds-018
- **Status:** open


### DS-019 · Unchecked checkbox boundary is #94A3B8 (2.56:1) and sizes are 16/22px · Medium
**Vigencia:** pendiente de reverificación; evidencia registrada 2026-11-09, no aplicar sin cotejar DS v1.8.0.
- **Type:** misaligned: component, accessibility
- **Where:** `src/components/ui/checkbox.tsx:16` default `h-4 w-4 rounded-sm border-primary`; `:18` lg `size-5.5 rounded-md border-slate-400 bg-white`
- **DS reference:** Core Components › Checkbox, radio and switch (docs/design/design-system.html#c-checkbox)
- **Expected:** 20px box, 6px radius, unchecked boundary text/muted #5B6B82 (5.43:1 on white), 44px hit area; checked = action/primary fill.
- **Observed:** The large (list) box uses slate-400 = 2.56:1 on white, below the 3:1 of WCAG 1.4.11; sizes are 16px and 22px; radius `rounded-sm`/`rounded-md`
- **Why it matters:** The unchecked state of the most-used control on the shopping screen is hard to see. **Pending assumption:** the single 20px size is a DS decision resolving a conflict inside the old spec (§7.2 says 20, §11.5 says 16/22).
- **Fix guidance:** Use one 20px size (keep the 44px target on rows), the muted boundary token and the 6px radius token.
- **Acceptance criteria:**
  - [ ] Unchecked boundary ≥ 3:1 against white and canvas
  - [ ] Box is 20px with 6px radius; row hit area ≥ 44×44px
  - [ ] Checked and indeterminate unchanged
- **Depends on:** DS-009
- **Evidence:** static source + computed contrast
- **Visual:** report.html#ds-019
- **Status:** open


### DS-020 · Replace slate literals with semantic tokens (78 files outside the landing page) · Medium
**Vigencia:** pendiente de reverificación; evidencia registrada 2026-11-09, no aplicar sin cotejar DS v1.8.0.
- **Type:** token not used
- **Where:** 78 files under `src/components/**` and `src/app/**` excluding `components/marketing/` and `app/(marketing)/`: 78 × `text-slate-500`, 21 × `text-slate-600`, 16 × `text-slate-400`, 14 × `bg-slate-900`, 10 × `text-slate-700`, 10 × `bg-slate-100`, 9 × `text-slate-300`, 9 × `border-slate-100`, 5 × `text-slate-900`, 4 × `border-slate-200` (counts are occurrences of each class in those files). Run 2 confirmed this includes `features/base-lists/items/item-store-prices-sheet.tsx` (7 × `text-slate-500`) and `commons/stat-tile/stat-tile.tsx` (labels), where `text-slate-500` sits on the #F6F7F9 panel at 4.44:1 (below AA); Batch 4 rebuilds those lines, so migrate them there. Run 3: the left-out lines of the trip review (`features/tickets/attach/trip-review-line-row.tsx:17-18`) use `text-slate-400` with a strike-through on the panel at 2.39:1; move them to `text/muted` (5.06:1) and keep the strike-through, which carries the meaning.
- **DS reference:** Foundations › Color (docs/design/design-system.html#foundations)
- **Expected:** Components consume semantic tokens: `text-slate-500` → `text-muted-foreground`; `-600` → `text-body`; `-700` → `text-secondary` role (ink-soft); `-900` → `text-foreground`; `-400` → `text-faint` for decoration only, otherwise `text-muted-foreground`; `bg-slate-900` → `bg-inverse`; `text-slate-300` on inverse → `text-on-inverse-muted`; `bg-slate-100` → `bg-secondary` or `bg-muted`; `border-slate-100/200` → `border-border`.
- **Observed:** Literals. Examples: `text-slate-500` is #64748B, 4.32:1 on canvas; `text-slate-400` is #94A3B8, 2.56:1.
- **Why it matters:** Literals bypass the contrast fix (DS-006), do not flip in dark mode and make the palette impossible to change in one place.
- **Fix guidance:** Migrate one feature at a time (receipts, lists, trips, dashboard, shell), checking each visually in light and dark; where `text-slate-400` carries meaning, switch to muted instead of faint.
- **Acceptance criteria:**
  - [ ] No `text-slate-500/600/700/900`, `bg-slate-900` or `border-slate-100/200` remain outside the landing page
  - [ ] Remaining `slate-400` uses are decorative (chevrons, disabled glyphs) and documented in a code comment
  - [ ] No text/background pair below 4.5:1 introduced
- **Depends on:** DS-005, DS-006, DS-009, DS-010
- **Evidence:** static source (counts from a text search)
- **Visual:** report.html#ds-020
- **Status:** open


### DS-021 · Seven files still use Lucide icons; the project standard is Hugeicons · Low
**Vigencia:** pendiente de reverificación; evidencia registrada 2026-11-09, no aplicar sin cotejar DS v1.8.0.
- **Type:** misaligned: icon family
- **Where:** `src/components/ui/dialog.tsx`, `ui/radio-group.tsx`, `ui/toast.tsx`; `src/components/app/sidebar/nav-group.tsx`; `src/components/features/pwa/install-app-button.tsx`; `src/app/error.tsx`, `src/app/(authenticated)/error.tsx`
- **DS reference:** Foundations › Iconography and brand (docs/design/design-system.html#foundations)
- **Expected:** Hugeicons only (`components.json` already sets `"iconLibrary": "hugeicons"`; 105 files use it).
- **Observed:** `lucide-react` imported in the seven files listed
- **Why it matters:** Two icon families differ in stroke and optical size.
- **Fix guidance:** Replace each icon with its Hugeicons equivalent, reviewing optical size and accessible labels, then remove the dependency if nothing else uses it.
- **Acceptance criteria:**
  - [ ] No `lucide-react` import under `src/` (the scan script mention is not code)
  - [ ] Icon-only buttons keep their accessible names
- **Depends on:** none
- **Evidence:** static source
- **Visual:** report.html#ds-021
- **Status:** open


### DS-024 · The empty state is skipped when the item has a usual store, so the sheet shows 0 / — / — tiles, a "0 times" row and a false one-store hint · Medium
**Vigencia:** pendiente de reverificación; evidencia registrada 2026-11-09, no aplicar sin cotejar DS v1.8.0.
- **Type:** misaligned: state
- **Where:** `src/components/features/base-lists/items/item-store-prices-sheet.tsx:31-33` (rows), `:38-43` (tiles and heading, always rendered), `:45` and `:67` (empty state only when `rows.length === 0`), `:68` (hint when `rows.length === 1`); `src/components/features/base-lists/items/helpers/item-store-summary.ts:93-95` (adds a placeholder history row for the usual store); call site `base-list-item-row.tsx:122-132` passes `history={item.store_history}`
- **DS reference:** Patterns › Sheets (docs/design/design-system.html#p-sheets); reference V4·19
- **Expected:** An item with no recorded purchase and no price at any store shows only the empty state (DS-025): no stat tiles, no "Last price by store" heading, no store rows and no one-store hint.
- **Observed:** `buildItemStoreSummary` appends `{ purchase_count: 0, last_price: null }` for the usual store when it has no stats row, so `rows.length` is 1, not 0. The sheet then renders the three tiles ("0", "—", "—"), a row "No price yet · 0 times" and the hint "Bought at one store so far…", which is false because nothing was bought. The existing unit test for the empty state passes `prices` without `history`, so it does not cover this path.
- **Why it matters:** The V4·19 situation (an item added by hand that has a usual store) is exactly the one that renders wrongly, and the copy states something untrue.
- **Fix guidance:** Decide "has history" from the rows: at least one with `purchase_count > 0` or a non-null `last_price`. When none, render the empty state and skip tiles, heading and hint. Show the one-store hint only when exactly one row has history. A store with purchases but no price stays listed ("No price yet · 2 times"). Add Vitest cases in `tests/item-store-prices-sheet.test.ts`: history containing only the usual-store placeholder → empty state and no tiles; one row with `purchase_count: 1` and no price → listed with the hint.
- **Acceptance criteria:**
  - [ ] Item with a usual store and no receipts shows the empty state and none of: tiles, heading, "0 times", "Bought at one store so far"
  - [ ] Item with one store and purchases keeps the row, the tiles and the hint
  - [ ] The two new behaviour tests pass (`pnpm test`)
- **Depends on:** none
- **Evidence:** static source (runtime not verified: confirm with an item that has a manual usual store and no receipts)
- **Visual:** report.html#ds-024
- **Status:** open


### DS-025 · Empty state is a centred grey card with "Upload a Receipt"; the reference is an info callout and a full-width primary button · Medium
**Vigencia:** pendiente de reverificación; evidencia registrada 2026-11-09, no aplicar sin cotejar DS v1.8.0.
- **Type:** misaligned: component
- **Where:** `item-store-prices-sheet.tsx:67` (`Card size='saved' tone='muted' variant='stat'`, `h3`, `p`, `UploadTicketDialog label='Upload a Receipt'`)
- **DS reference:** Core Components › Alert and status card (docs/design/design-system.html#c-alert); reference V4·19
- **Expected:** `Alert` variant `info`: 16px radius, 12px padding and gap, a 32px icon tile (8px radius, `feedback/info-tint`, 700 icon, `InformationCircleIcon`), title "No prices yet" Inter 600/14 in `feedback/info-strong`, body Inter 14/21 in `text/body`: "Prices come from your receipts. Upload one with this item to see what it costs and where." Left-aligned. The upload button sits below it, outside the callout, full width, primary, 44px (DS-026), label "Upload New Receipt".
- **Observed:** a neutral `bg-muted` card with centred text; title `text-base font-semibold`, body `text-sm text-slate-500` ("Upload one after a trip to see what you paid at each store."), and the button inside the card with the label "Upload a Receipt". The app uses five labels for this action (Upload Receipt, Upload a Receipt, Upload New Receipt, Upload a New Receipt, Upload Another Receipt): see Open design decision 15.
- **Why it matters:** The empty state is the one place that tells people what to do; as a grey card it reads as inert, and the callout form already exists in the DS.
- **Fix guidance:** Use `Alert` (`info`) with `AlertTitle` and `AlertDescription`; override its default `role="alert"` with `role="status"`, because the DS says info is polite and this callout is not an error. Pass the label through `UploadTicketDialog`'s `label` prop. Keep the upload glyph the dialog adds (the reference omits it; see design observations). Alert tones are being rebuilt in DS-016: do not restyle the Alert here, only use it.
- **Acceptance criteria:**
  - [ ] The empty state shows an info Alert with icon, title and body, then a full-width primary button below it
  - [ ] The Alert has `role="status"`
  - [ ] No `Card size='saved'` remains in the sheet
- **Depends on:** DS-024, DS-026 (button), DS-016 (visual tones, can land after)
- **Evidence:** static source
- **Visual:** report.html#ds-025
- **Status:** open


### DS-026 · Footer buttons are 40px tall on phones and "Change Usual Store" uses the outline variant; the DS sheet footer is 44px and the reference uses the grey secondary button · Medium
**Vigencia:** pendiente de reverificación; evidencia registrada 2026-11-09, no aplicar sin cotejar DS v1.8.0.
- **Type:** misaligned: variant, touch target
- **Where:** `item-store-prices-sheet.tsx:69` (`variant='outline' size='primary'`); the upload trigger inside `UploadTicketDialog` (`upload-ticket-dialog.tsx:94`, default `size='primary'`); run 3: the same `size='primary'` footers in `features/tickets/attach/attach-to-session-dialog.tsx:72-78` and `change-line-sheet.tsx:56-59`, and the button of `features/shopping-sessions/trip-receipt-summary.tsx:170-178` (all should be `size='xl'`, 44px)
- **DS reference:** Core Components › Button (docs/design/design-system.html#c-button); Patterns › Sheets (`#p-sheets`); reference V4·17
- **Expected:** "Change Usual Store" = secondary (fill #E9ECF0, text #1D4ED8, hover #DEE2E8). Sheet footer buttons are 44px with 24px padding and a 16px label. Both buttons are full width inside the sheet.
- **Observed:** `outline` is a white button with a slate-200 border (see DS-014); `size='primary'` is `h-10` (40px) up to the `md` breakpoint, below the 44px minimum on the phone this sheet is made for. `button.tsx:79` documents `xl` (44px) as the size for "sheet and form footers".
- **Why it matters:** The reference shows a grey button; the code shows a bordered white one, and the touch target is under the 44px rule.
- **Fix guidance:** `Button variant='secondary' size='xl'` with a full-width layout class; pass `size='xl'` to `UploadTicketDialog` (it forwards button props). Do not touch the dialog's default size.
- **Acceptance criteria:**
  - [ ] "Change Usual Store" renders #E9ECF0 / #1D4ED8 and measures 44px high at 390px
  - [ ] The upload button measures 44px high at 390px
  - [ ] Focus ring unchanged
- **Depends on:** none
- **Evidence:** static source (class values; height not measured at runtime)
- **Visual:** report.html#ds-026
- **Status:** open


### DS-027 · Store rows are separate grey cards inside a second scroll area; the reference and the DS use one grouped panel with dividers · Medium
**Vigencia:** pendiente de reverificación; evidencia registrada 2026-11-09, no aplicar sin cotejar DS v1.8.0.
- **Type:** misaligned: pattern, accessibility
- **Where:** `item-store-prices-sheet.tsx:45-66` (container `max-h-[min(60vh,480px)] overflow-y-auto`, one `Card variant='stat' size='stat' tone='muted'` per store); run 3: the same nested scroller in `src/components/commons/searchable-choice-list/searchable-choice-list.tsx:89` (`max-h-72 overflow-y-auto`) inside the Change Line sheet
- **DS reference:** Patterns › Sheets (docs/design/design-system.html#p-sheets); reference V4·17
- **Expected:** One panel (`bg/panel` #F6F7F9, 16px radius) holding all rows. Each row has 10px × 12px padding, a 56px minimum height and a 1px `border/divider` (#EEF0F3) between rows. The group is a list (`ul` / `li`) so a screen reader announces "list, 3 items".
- **Observed:** every store is its own card (padding 16px, 24px from `md`), 8px apart, no dividers, `div`s with no list semantics. The wrapper adds an arbitrary-value height cap and its own `overflow-y-auto` inside `SheetDialog`'s `ScrollArea`, so on a phone a long list has two nested scrollers.
- **Why it matters:** Cards of 56–110px each make a 5-store list long; the grouped panel is shorter and reads as one comparison. Nested scrollers trap touch scrolling.
- **Fix guidance:** Remove the inner scroll container and the arbitrary value (the sheet already scrolls and shows a scroll hint). Use one muted `Card` as the panel (check `size` `flush` or `tight` for the padding, or add a size variant to `Card`; do not use `p-*` at the call site) with the rows as list items and the divider from `border/divider` (DS-009). Keep each row's `data-testid`.
- **Acceptance criteria:**
  - [ ] One panel, rows separated by 1px dividers, no gap between rows
  - [ ] No `max-h-[...]` and no `overflow-y-auto` in the file; a list of 8 stores scrolls once at 390px
  - [ ] The group is exposed as a list with one item per store
- **Depends on:** DS-009 (divider token; can use `border-border` until it exists)
- **Evidence:** static source
- **Visual:** report.html#ds-027
- **Status:** open


### DS-028 · Row content: store name at 12px (reference 14px), tags and quantity on separate lines, no "Last", "0 times" noise · Medium
**Vigencia:** pendiente de reverificación; evidencia registrada 2026-11-09, no aplicar sin cotejar DS v1.8.0.
- **Type:** misaligned: pattern
- **Where:** `src/components/features/base-lists/items/item-store-prices-sheet.tsx:46-65`; `src/components/commons/entity-label/entity-label.tsx:16-32` (used as the row title)
- **DS reference:** Patterns › Sheets (docs/design/design-system.html#p-sheets); Core Components › Badge (`#c-badge`); reference v2
- **Expected (reference v2):** Line 1: the store entity (a 16px violet store icon and the name in Inter 600 **14px**, `entity/store-text` #5B21B6; no box, no tile) with the tags "Cheapest" and "Usual" inline after it, wrapping under the name when there is no room. Line 2: "Last 21 Feb · 2 times" in Inter 12 `text/body` (#475569, 7.0:1 on the panel) with the count in 600. A store with no price: "No price yet" on line 2 (add "· N times" only when purchases exist) and "—" in the price slot. Right column: the price, then the delta (DS-029).
- **Observed:** the title is `EntityLabel`, fixed at a 14px icon and Inter 600 **12px** (no size option); line 2 is "21 Feb · 2 times" (no "Last", count not emphasised) in `text-slate-500` (4.44:1 on the panel, below AA); the tags are a third line; "2 each" is a fourth line; a store without a price shows "No price yet · 0 times".
- **Why it matters:** The store is the row's main content and it is drawn smaller than the tags next to it; the same data takes four lines where the reference uses two, and the grey meta fails AA.
- **Pending assumption:** the first reference (V4·18) drew a tile and an ink name; v2 draws the bare violet label. This issue follows v2 for every state.
- **Fix guidance:** Give `EntityLabel` a size variant (`md` = 16px icon, 14px name; the current size stays the default so its other uses do not change): appearance goes through the component's variant, not `className` at the call site. Tags in a `flex-wrap` line after the name; the name keeps `min-w-0` and truncates (full name stays in the DOM). Meta colour from `text/body` (DS-006 / DS-020 tokens); the count in `font-semibold`. Keep the quantity and per-unit price in the right column under the price, as today, because they explain how the cheapest store was chosen. The 14px store name is not in the DS yet (the store entity is a 12px chip role): part of the DS update (Open design decision 8).
- **Acceptance criteria:**
  - [ ] Row shows the 16px icon and 14px/600 violet name, inline tags, and "Last <date> · N times" with the count in 600
  - [ ] "No price yet" rows do not show "0 times"
  - [ ] A very long store name with two tags truncates the name and keeps the price visible at 360px
  - [ ] Meta text contrast ≥ 4.5:1 on the panel; the existing test for the long name still passes
- **Depends on:** DS-027
- **Evidence:** static source
- **Visual:** report.html#ds-028
- **Status:** open


### DS-029 · The price difference against the cheapest store is not shown · Medium
**Vigencia:** pendiente de reverificación; evidencia registrada 2026-11-09, no aplicar sin cotejar DS v1.8.0.
- **Type:** design improvement (from the reference)
- **Where:** `item-store-prices-sheet.tsx:61-63` (price column); `helpers/compare-store-prices.ts:3-7` (the result only carries `cheapestStoreId`, `comparableCount`, `notComparable`)
- **DS reference:** Core Components › Counters › Delta (docs/design/design-system.html#c-counters); reference v2 ("↑ $0.50" under $6.29)
- **Expected:** The DS Delta: mono 600/12, a 12px up arrow (`ArrowUp01Icon`), no box, red because a higher price is a bad change for this metric; direction is the arrow, never only the colour. Shown under the price of every comparable store that is not the cheapest. Text colour `feedback/error` #B91C1C (6.04:1 on the #F6F7F9 panel). The difference uses the same basis the cheapest was chosen on (per unit when a quantity exists: "↑ $0.25 / each"). The cheapest row and rows that can't be compared show none. The arrow is decorative; the text alternative says "$0.50 more than Costco".
- **Observed:** not built; the helper does not return per-store differences. (The DS defines Delta; its code mapping says "not implemented yet".)
- **Why it matters:** The sheet answers "where is it cheaper?"; the delta says by how much without mental arithmetic.
- **Fix guidance:** Extend `compareStorePrices` to also return, for the stores in the compared group, the difference to the cheapest unit price (rounded to cents, none when 0). Reuse the existing grouping rule. Render it in the right column. Add unit tests for the rule in the helper's test file: same unit and different quantities, a tie, a store in another unit (no delta), a single store (no delta).
- **Acceptance criteria:**
  - [ ] Non-cheapest comparable rows show the difference; cheapest and incomparable rows do not
  - [ ] The difference matches the basis used for "Cheapest" (verified with a 2 × $8.00 vs 1 × $4.49 case)
  - [ ] Text contrast ≥ 4.5:1 on the panel; screen-reader text names the cheaper store
  - [ ] Helper tests cover the four cases above
- **Depends on:** DS-028
- **Evidence:** static source
- **Visual:** report.html#ds-029
- **Status:** open


### DS-030 · Stat tiles use the grey variant without icons or units; the reference is a white tile with an icon, a 24px value and a small unit · Medium
**Vigencia:** pendiente de reverificación; evidencia registrada 2026-11-09, no aplicar sin cotejar DS v1.8.0.
- **Type:** misaligned: component (pending DS update)
- **Where:** `item-store-prices-sheet.tsx:38-42` (three `StatTile` with the default `muted` variant, no icon); `src/components/commons/stat-tile/stat-tile.tsx:19-25`; `src/components/ui/card.tsx:41` (`size === 'stat'`: `gap-3 p-4 md:p-6`). `Card size='stat'` is also used by `features/tickets/attach/change-line-sheet.tsx:38` and by the white `StatTile`s of `attach-to-session-dialog.tsx`: check them after changing the size.; run 3: the white tiles of the review sheet (`features/tickets/attach/attach-to-session-dialog.tsx:49-53`) use the same `Card size='stat'` and take the same 12px padding
- **DS reference:** Core Components › Counters and stat tile (docs/design/design-system.html#c-counters); reference v2
- **Expected (reference v2):** A white tile with a 1px hairline ring (the `white` variant of `StatTile`), **12px padding**. Top row: a 28px icon tile at the start (`RowIcon` size `stat`) and the value at the end in mono 600/24 with a small unit after it ("~9" + "d", "19" + "Feb", unit Inter 12/500 `text/muted`). Label below: Inter 12/600 `text/body` (7.6:1 on white). Icons: bag (`ShoppingBag02Icon`, the app's trip icon) "Times bought", clock (`Clock01Icon`) "Between trips", calendar (`Calendar03Icon`) "Last bought". Hues as drawn: blue, violet, green.
- **Observed:** the sheet uses the grey `muted` variant with no icon: value mono 20, label `text-slate-500` (4.44:1 on the grey panel, below AA), padding 16px (24px from `md`), the unit "d" and the month at the same size as the value. The `white` variant already provides the icon-and-value row, a 24px value and a semibold label, but it is not used here and has no unit option. A previous-year date renders "21 Feb 2025" (11 characters of 24px mono) and will not fit the tile (risk, unverified).
- **Why it matters:** The tiles are the first thing in the sheet and they are visibly different from the reference: no icons, grey instead of white, taller by 8–16px.
- **Fix guidance:** Use `StatTile variant='white'` with `icon` and `iconTone` for the three tiles; add a `unit` prop to `StatTile` (a smaller suffix after the value) as part of the component; set the padding of `Card size='stat'` to the DS 12px. For a date from another year show the day and month only. The label colour comes from DS-006 / DS-020. DS note: the DS stat tile is a grey panel and says "nest grey inside white"; the reference draws white tiles on a white sheet. This issue follows the reference; the DS-aligned alternative (grey tiles, one icon hue) is Open design decision 10.
- **Acceptance criteria:**
  - [ ] Three white tiles with icon, value with unit and label as in v2, padding 12px at 390px and at 1280px
  - [ ] "~9 d" and "19 Feb" render the unit smaller than the value
  - [ ] A previous-year date does not break the tile layout
  - [ ] `change-line-sheet.tsx` and the attach dialog counters checked visually after the padding change
- **Depends on:** DS-006 (label colour), DS-009
- **Evidence:** static source + computed contrast
- **Visual:** report.html#ds-030
- **Status:** open


### DS-031 · The section heading is sentence-case 14px ink; the reference uses the uppercase category caption · Low
**Vigencia:** pendiente de reverificación; evidencia registrada 2026-11-09, no aplicar sin cotejar DS v1.8.0.
- **Type:** misaligned: typography
- **Where:** `item-store-prices-sheet.tsx:43` (`h3 text-sm font-semibold` and a `p text-xs text-slate-500`); `src/components/commons/category-section/category-heading.tsx:47` (the same style, written inline)
- **DS reference:** Foundations › Typography › Category caption (docs/design/design-system.html#foundations); reference v2 ("LAST PRICE BY STORE")
- **Expected:** "LAST PRICE BY STORE" in the DS Category caption: Inter 600 12/1.25, +0.04em, uppercase, `text/secondary` (#334155; the reference looks a shade lighter, `text/body` #475569 also passes). "Only prices from your own receipts." below in Inter 12 `text/muted`. Keep it an `h3`. (The mono Overline of the DS is for real process stages; the reference does not use it.)
- **Observed:** Plus Jakarta 14px semibold in ink, sentence case. The category-caption style exists only inline in `category-heading.tsx`; other files hand-write uppercase labels (`nav-session-card.tsx:27`, `no-session-banner.tsx:64`, `change-line-sheet.tsx:40`, `card-footer-content.tsx:20`).
- **Why it matters:** A second place now needs the same label, which is the AGENTS threshold for extracting it.
- **Fix guidance:** Extract the style from `category-heading.tsx` into a shared section-label component in `components/commons/` (with a `testId` prop and a barrel update), use it in `CategoryHeading` and here. Migrating the four hand-written labels is outside this batch.
- **Acceptance criteria:**
  - [ ] The heading renders as the category caption and is still an `h3`
  - [ ] `CategoryHeading` renders unchanged using the shared component
  - [ ] The component has a `data-testid` via `testId`
- **Depends on:** none
- **Evidence:** static source
- **Visual:** report.html#ds-031
- **Status:** open


### DS-032 · The one-store hint is plain grey text; the reference is an info callout with a different instruction · Low
**Vigencia:** pendiente de reverificación; evidencia registrada 2026-11-09, no aplicar sin cotejar DS v1.8.0.
- **Type:** misaligned: component
- **Where:** `item-store-prices-sheet.tsx:68`
- **DS reference:** Core Components › Alert and status card (docs/design/design-system.html#c-alert); reference V4·18
- **Expected:** `Alert` `info` (16px radius, 32px icon tile, body only): "Buy it at another store and attach that receipt to compare prices." Shown after the list when exactly one store has history (DS-024).
- **Observed:** `p text-xs text-slate-500`: "Bought at one store so far. Prices from other stores show here once you buy it there." It describes the state; the reference tells the person what to do.
- **Fix guidance:** Same Alert usage as DS-025 (`role="status"`); copy from the reference.
- **Acceptance criteria:**
  - [ ] One-store state shows the info callout with the reference copy
  - [ ] The old paragraph is gone
- **Depends on:** DS-024, DS-025
- **Evidence:** static source
- **Visual:** report.html#ds-032
- **Status:** open


### DS-033 · Tag icons: "Cheapest" uses a circled check and "Usual" a pin; the reference uses a price tag and a repeat glyph · Low
**Vigencia:** pendiente de reverificación; evidencia registrada 2026-11-09, no aplicar sin cotejar DS v1.8.0.
- **Type:** misaligned: icon (pending DS update)
- **Where:** `item-store-prices-sheet.tsx:56` (`CheckmarkCircle02Icon`), `:57` (`Pin02Icon`)
- **DS reference:** Patterns › Sheets (docs/design/design-system.html#p-sheets: the DS specimen uses `Tick02Icon`); Foundations › Iconography (`#f-icons`: the pin means "manual store"); reference v2
- **Expected (reference v2):** "Cheapest" with a price-tag glyph (`Tag01Icon`) and "Usual" with the looping-arrows glyph (`RepeatIcon`), 13px, same tag. Both icons exist in `@hugeicons/core-free-icons`; confirm the exact glyphs against the design file.
- **Observed:** a circled check and a pin. The pin also contradicts the DS (it marks a store chosen by hand, but this tag is shown for automatic stores too).
- **Why it matters:** The same fact ("this is the usual store") should not use a pin here and a store icon in the list row; the reference settles the sheet's glyphs.
- **Fix guidance:** Swap the two icons. The usual-store chip of the list row (`base-list-item-row.tsx:60-71`, store or pin by source) is a different element (it names the store) and stays. Record the two glyphs in the DS iconography with the DS update (Open design decision 8).
- **Acceptance criteria:**
  - [ ] "Cheapest" shows the price-tag glyph and "Usual" the repeat glyph; the existing test still finds the text "Cheapest"
- **Depends on:** none
- **Evidence:** static source
- **Visual:** report.html#ds-033
- **Status:** open


### DS-034 · Stores are listed alphabetically; the DS lists them cheapest first · Low
**Vigencia:** pendiente de reverificación; evidencia registrada 2026-11-09, no aplicar sin cotejar DS v1.8.0.
- **Type:** design improvement
- **Where:** `helpers/item-store-summary.ts:96` (`store_history` sorted by name; its only consumer is this sheet, `base-list-item-row.tsx:127`)
- **DS reference:** Patterns › Sheets (docs/design/design-system.html#p-sheets: stores ordered by price, a store without a price last)
- **Expected:** Stores with a comparable price first by ascending price (unit price when units match), then stores with a price in another unit by name, then stores without a price by name. V4·17 happens to match alphabetical order.
- **Observed:** alphabetical by name, so the cheapest store is wherever its name falls.
- **Why it matters:** The sheet exists to compare; with five stores the cheapest should not be in the middle.
- **Fix guidance:** Sort for display in the sheet (or in the helper, since nothing else reads it) after `compareStorePrices`. Add a Vitest case for the order rule.
- **Acceptance criteria:**
  - [ ] Cheapest comparable store is first; stores without a price are last
  - [ ] Order is stable for equal prices (by name)
  - [ ] Unit test covers the rule
- **Depends on:** DS-029 (same comparison basis)
- **Evidence:** static source
- **Visual:** report.html#ds-034
- **Status:** open


### DS-035 · Review tiles use a double tick, a plus and a bare minus; the reference draws a circled check, a plus and a circled minus · Low
**Vigencia:** pendiente de reverificación; evidencia registrada 2026-11-09, no aplicar sin cotejar DS v1.8.0.
- **Type:** misaligned: icon (pending DS update)
- **Where:** `src/components/features/tickets/attach/attach-to-session-dialog.tsx:50` (`TickDouble02Icon`), `:52` (`MinusSignIcon`)
- **DS reference:** Patterns › State – Trip and receipt (docs/design/design-system.html#p-tripflow: Review summary uses `TickDouble02Icon`, `Add01Icon`, `MinusSignIcon`); references V4·11 and V4·13
- **Expected (references):** "Matched" `CheckmarkCircle02Icon` (green tile), "New to Pantry" `Add01Icon` (blue tile, unchanged), "Left out" `MinusSignCircleIcon` (grey tile).
- **Observed:** a double tick and a bare minus. The DS draws the same, so the DS is the older source here.
- **Why it matters:** The circled forms match the status glyphs used in the section headers and the callout (`CheckmarkCircle02Icon` already marks success elsewhere in the same sheet).
- **Fix guidance:** Swap the two icons; the tile hues stay. Tile padding is DS-030.
- **Acceptance criteria:**
  - [ ] The three tiles show circled check, plus and circled minus with the same tones as today
- **Depends on:** none
- **Evidence:** static source
- **Visual:** report.html#ds-035
- **Status:** open


### DS-036 · Several review sections share the same icon and tone; the reference gives each its own · Medium
**Vigencia:** pendiente de reverificación; evidencia registrada 2026-11-09, no aplicar sin cotejar DS v1.8.0.
- **Type:** misaligned: icon and tone (pending DS update)
- **Where:** `src/components/features/tickets/attach/trip-review-section.tsx:38-45` (`icon` and `tone` by section id)
- **DS reference:** Patterns › List – Category section (docs/design/design-system.html#p-category); references V4·11 and V4·13
- **Expected (references):**

  | Section | Icon | Tile tone |
  |---|---|---|
  | New to <list> | `Add01Icon` | blue |
  | Will be checked off | `Tick02Icon` | blue |
  | Already checked | `TickDouble02Icon` | blue |
  | Left out | `MinusSignCircleIcon` | grey |
  | Checked, not on the receipt | `InformationCircleIcon` | grey |
  | Not checked, not on the receipt | `CircleIcon` | grey |
- **Observed:** "Will be checked off" and "Already checked" both use `TickDouble02Icon`; "Already checked" is the **green** tone (the reference is blue); "Left out" and both "not on the receipt" sections use the same bare `MinusSignIcon`.
- **Why it matters:** The six sections are told apart by caption only; three share one glyph and two share another, so a scanned list reads as repeats. Green here also competes with the success callout above it.
- **Fix guidance:** Map the glyph and tone per section as in the table (`tone` already accepts `primary` and `muted`). No new variant is needed.
- **Acceptance criteria:**
  - [ ] Each of the six sections shows the glyph and tone of the table
  - [ ] "Already checked" is no longer green
- **Depends on:** none
- **Evidence:** static source
- **Visual:** report.html#ds-036
- **Status:** open


### DS-037 · "No price" and "No name" use the same warning triangle; the reference uses a coin and a question mark · Low
**Vigencia:** pendiente de reverificación; evidencia registrada 2026-11-09, no aplicar sin cotejar DS v1.8.0.
- **Type:** misaligned: icon (pending DS update)
- **Where:** `src/components/features/tickets/attach/trip-review-line-row.tsx:21` (`Alert02Icon` for both)
- **DS reference:** Core Components › Badge › Attention tag (docs/design/design-system.html#c-badge); references V4·11
- **Expected (references):** "No price" `DollarCircleIcon`, "No name" `HelpCircleIcon`; "Remembered" and "Linked by you" keep their clock and link glyphs. Same amber attention tag.
- **Observed:** a triangle for both attention tags. (The DS draws "No price" with the triangle: also older.)
- **Fix guidance:** Choose the glyph from the tag text; confirm the exact glyphs against the design file.
- **Acceptance criteria:**
  - [ ] "No price" shows the coin glyph and "No name" the question mark; both stay amber
- **Depends on:** none
- **Evidence:** static source
- **Visual:** report.html#ds-037
- **Status:** open


### DS-038 · "Checked, not on the receipt" rows have no price slot; the reference shows a dash · Low
**Vigencia:** pendiente de reverificación; evidencia registrada 2026-11-09, no aplicar sin cotejar DS v1.8.0.
- **Type:** misaligned: pattern
- **Where:** `trip-review-section.tsx:59-71` (rows built from `items`: quantity chip and name only)
- **DS reference:** Patterns › List – Item row › Finished trip (docs/design/design-system.html#p-itemrow: "No price yet"); reference V4·11 ("Paper Towels 6 Rolls … —")
- **Expected:** The row keeps the right-hand price column: "—" in mono (`text/muted`) because these items stay as bought, without a price.
- **Observed:** no price column, so the name can run under where the other sections show a price.
- **Fix guidance:** Add the dash in the same column and type as the line rows; keep `min-h-14`.
- **Acceptance criteria:**
  - [ ] Rows of this section show "—" aligned with the prices of the sections above
- **Depends on:** DS-006 (dash colour)
- **Evidence:** static source
- **Visual:** report.html#ds-038
- **Status:** open


### DS-039 · The review intro says "this trip"; the reference says "the trip" · Low
**Vigencia:** pendiente de reverificación; evidencia registrada 2026-11-09, no aplicar sin cotejar DS v1.8.0.
- **Type:** copy
- **Where:** `src/components/features/tickets/attach/trip-review-copy.ts:2` (`intro`)
- **DS reference:** references V4·11 and V4·13: "Each receipt line updates the trip and your Pantry list. Nothing changes until you attach."
- **Expected:** "Each receipt line updates the trip and your <list> list. Nothing changes until you attach."
- **Observed:** "Each receipt line updates this trip and your <list> list. …"
- **Fix guidance:** Change the sentence and any test that asserts it (the copy is application-owned behaviour of the review: `tests/` of the attach module).
- **Acceptance criteria:**
  - [ ] The intro reads as in the references; tests updated
- **Depends on:** none
- **Evidence:** static source
- **Visual:** report.html#ds-039
- **Status:** open


### DS-040 · Notices inside the review sheet are 24px status cards; the DS uses the 16px alert inside sheets · Medium
**Vigencia:** pendiente de reverificación; evidencia registrada 2026-11-09, no aplicar sin cotejar DS v1.8.0.
- **Type:** misaligned: component
- **Where:** `attach-to-session-dialog.tsx:54-56` (`StatusCard` for "The trip is still shopping" and "Everything you checked is on the receipt"), `:38-45` (load and submit errors); `src/components/commons/status-card.tsx:22` (`Card size='receipt'`: 24px radius, `p-4 md:p-6`)
- **DS reference:** Core Components › Alert and status card (docs/design/design-system.html#c-alert: "an alert reports something inside a card or a sheet; the status card is the same message at page level and takes the card radius"); references V4·11 and V4·13 (the callout reads at the 16px radius of the tiles; confirm in the design file)
- **Expected:** Inside a sheet: the info or success **Alert** (16px radius, 12px padding and gap, 32px icon tile in the tint, title 600/14 in the strong level, body 14/21 `text/body`). The status card stays for page-level states (trip receipt card).
- **Observed:** `StatusCard` in the sheet: 24px radius and 16px (24px from `md`) padding.
- **Why it matters:** The callout is the largest block of the all-match screen and reads heavier than the tiles it sits between.
- **Fix guidance:** Use `Alert` (`info` / `success` tones) with `AlertTitle` and `AlertDescription` and `role="status"`, as in DS-025. Alert tones are rebuilt in DS-016 (the `success` tone does not exist yet there: the plan DS-016 covers info, warning and error; add success with the same anatomy). Keep the error cards' actions.
- **Acceptance criteria:**
  - [ ] The two notices render as 16px alerts with icon tile, title and body
  - [ ] `StatusCard` is no longer used inside `SheetDialog`
- **Depends on:** DS-009, DS-016
- **Evidence:** static source
- **Visual:** report.html#ds-040
- **Status:** open


### DS-041 · Change Line shows the receipt text in Title Case; the DS and the reference show it as printed · Low
**Vigencia:** pendiente de reverificación; evidencia registrada 2026-11-09, no aplicar sin cotejar DS v1.8.0.
- **Type:** misaligned: content
- **Where:** `src/components/features/tickets/attach/change-line-sheet.tsx:42` (`formatItemName(line.name)`)
- **DS reference:** Patterns › Sheet – Change Line (docs/design/design-system.html#p-sheets: "SK SOUR PEG"); reference V4·12 ("SK SOUR PEG")
- **Expected:** The receipt-line card shows the text exactly as read from the receipt, in mono, so the person can compare it with the trip items below. (Title Case stays for item names everywhere else.)
- **Observed:** "Sk Sour Peg".
- **Fix guidance:** Render `line.name` unchanged in this card only. The size looks larger in the reference (about 16px against 14px); confirm in the design file before changing it.
- **Acceptance criteria:**
  - [ ] The card shows the raw receipt name; the review rows still show the Title Case name
- **Depends on:** none
- **Evidence:** static source
- **Visual:** report.html#ds-041
- **Status:** open


### DS-042 · The trip header tag says "2 Receipt attached"; the reference says "2 receipts" with a receipt glyph · Medium
**Vigencia:** pendiente de reverificación; evidencia registrada 2026-11-09, no aplicar sin cotejar DS v1.8.0.
- **Type:** misaligned: copy and icon
- **Where:** `src/app/(authenticated)/shopping/[runId]/page.tsx:91` (`${receipts.length} Receipt attached`, `Attachment01Icon`)
- **DS reference:** Patterns › Header – Detail (docs/design/design-system.html#p-screenheader: "Receipt attached"); references V4·15 ("Receipt attached") and V4·16 ("2 receipts")
- **Expected:** One receipt: "Receipt attached"; several: "2 receipts" (count first, plural noun). Glyph: the receipt (`Invoice01Icon`) in both. No receipt: "No receipt" (DS) in the attention tag.
- **Observed:** "2 Receipt attached" (ungrammatical), a paperclip, and "No Receipt attached" for none.
- **Why it matters:** It is the first line of context on a finished trip and it reads as a bug.
- **Fix guidance:** Derive the label from the count; the empty case follows the DS wording "No receipt". Add or update a test for the three labels (behaviour of what is shown).
- **Acceptance criteria:**
  - [ ] 0, 1 and 2 receipts show "No receipt", "Receipt attached" and "2 receipts" with the receipt glyph
- **Depends on:** none
- **Evidence:** static source
- **Visual:** report.html#ds-042
- **Status:** open


### DS-043 · Trip receipts card: a folding "Receipts" section with tags; the reference is one grey row per receipt with a thumbnail · Medium
**Vigencia:** pendiente de reverificación; evidencia registrada 2026-11-09, no aplicar sin cotejar DS v1.8.0.
- **Type:** misaligned: pattern (pending DS update)
- **Where:** `src/components/features/shopping-sessions/trip-receipt-summary.tsx:158-168` (`CategorySection` "Receipts", ocr tile, "N receipts" count), `:86-120` (rows: store, tag "Attached to trip", items and total, link), `:165` (`divide-y`)
- **DS reference:** Patterns › State – Trip and receipt (docs/design/design-system.html#p-tripflow: rows with `Invoice01Icon`, name, "Attached to trip" tag and amount); references V4·15 and V4·16
- **Expected (references):** Under the "Paid" header, no section header. Each receipt is its own grey panel (16px radius, 8px between panels, no dividers) with a 56px receipt tile at the start (white, 16px radius), the store name 600, "13 items · $86.40" with the count in 600, and "View Receipt ›" in the primary colour aligned to the end. The "Attached to trip" tag is gone (the header tag of DS-042 says it). The "Add Another Receipt" button follows (DS-044).
- **Observed:** a folding "Receipts 1 receipt" section with the cyan tile and caption, one panel with `divide-y`, the store name and the tag on the first line, the link on the second.
- **Why it matters:** The section header repeats what the card header ("13 items · 1 store") and the trip tag already say, and pushes the receipts down one row.
- **Fix guidance:** Remove the `CategorySection` wrapper in the completed mode and render one grey panel per receipt (a `Card` tone `muted`; no `p-*` at the call site). The 56px tile uses a static receipt glyph for now; photo thumbnails are Open design decision 21. Keep the status chip for receipts that are not attached yet (the active mode and the reading / failed states).
- **Acceptance criteria:**
  - [ ] A completed trip with one or two receipts shows one panel per receipt with the tile, store, items and total, and "View Receipt"
  - [ ] No "Receipts" caption and no "Attached to trip" tag on attached receipts; pending receipts keep their status chip
  - [ ] The existing tests of the receipt list pass or are updated for the new structure
- **Depends on:** DS-042, DS-044
- **Evidence:** static source
- **Visual:** report.html#ds-043
- **Status:** open


### DS-044 · The button under the receipts says "Attach Receipt"; the DS and the reference say "Add Another Receipt" · Low
**Vigencia:** pendiente de reverificación; evidencia registrada 2026-11-09, no aplicar sin cotejar DS v1.8.0.
- **Type:** copy
- **Where:** `trip-receipt-summary.tsx:170-178` (`UploadTicketDialog label='Attach Receipt'`, `Attachment01Icon`)
- **DS reference:** Patterns › State – Trip and receipt (docs/design/design-system.html#p-tripflow: "Add Another Receipt"); references V4·15 and V4·16
- **Expected:** "Add Another Receipt", secondary, full width, 44px (DS-026).
- **Observed:** "Attach Receipt" with a paperclip. The app now has seven labels for adding a receipt (see Open design decision 15).
- **Fix guidance:** Pass the label; keep the icon unless the design file says otherwise.
- **Acceptance criteria:**
  - [ ] The completed trip card shows "Add Another Receipt"
- **Depends on:** DS-026
- **Evidence:** static source
- **Visual:** report.html#ds-044
- **Status:** open


### DS-045 · "also at Costco" is lowercase in trip item rows; the reference capitalises it · Low
**Vigencia:** pendiente de reverificación; evidencia registrada 2026-11-09, no aplicar sin cotejar DS v1.8.0.
- **Type:** copy
- **Where:** `shopping-session-item-row.tsx:44` (`formatAlsoAt` output rendered as is); `helpers/item-store-summary.ts:104-110` (`formatAlsoAt`, shared with the list rows)
- **DS reference:** references V4·15 and V4·16 ("No Frills  Also at Costco"); Patterns › List – Item row (docs/design/design-system.html#p-itemrow: lists keep "· also at Costco" lowercase after the dot)
- **Expected:** In a trip row the store entity and "Also at Costco" are two elements separated by space (no dot), so the second starts with a capital. List rows keep the lowercase form after the dot.
- **Observed:** "also at Costco" in the trip row.
- **Fix guidance:** Capitalise at the trip row (not inside `formatAlsoAt`, which the list rows use). Test the string where the helper is tested.
- **Acceptance criteria:**
  - [ ] Trip rows show "Also at Costco"; list rows are unchanged
- **Depends on:** none
- **Evidence:** static source
- **Visual:** report.html#ds-045
- **Status:** open

## Matriz exhaustiva de pantallas y patrones

| HTML | Patrones DS | IDs |
|---|---|---|
| `V3-F6-pulido-04.html` | p-screenheader, p-section, p-hero, p-nav | DS-046, DS-047, DS-049, DS-050, DS-051, DS-065 |
| `V3-F6-pulido-06.html` | p-screenheader, p-section, p-nav | DS-046, DS-047, DS-048, DS-049 |
| `V4-lista-items-01.html` | p-screenheader, p-itemrow, p-category, p-nav | DS-053, DS-054, DS-055, DS-056, DS-057, DS-063 |
| `V4-lista-items-02.html` | p-screenheader, p-itemrow, p-category, c-menu | DS-054, DS-055, DS-064 |
| `V4-lista-items-03.html` | p-screenheader, p-itemrow, p-category, p-form | DS-058, DS-064 |
| `V4-lista-items-04.html` | p-screenheader, p-itemrow, p-category, p-form | DS-058, DS-064 |
| `V4-lista-items-05.html` | p-screenheader, p-itemrow, p-category, p-form | DS-058, DS-064 |
| `V4-lista-items-06.html` | p-screenheader, p-itemrow, p-category, c-toast | DS-023, DS-054 |
| `V4-listas-01.html` | p-objcard, p-nav | DS-052, DS-058, DS-066 |
| `V4-listas-02.html` | p-objcard, c-menu | DS-052, DS-064, DS-066 |
| `V4-listas-03.html` | p-objcard, p-form | DS-052, DS-058, DS-066 |
| `V4-listas-04.html` | p-objcard, p-form | DS-058, DS-064, DS-066 |
| `V4-listas-05.html` | p-objcard, p-form | DS-060, DS-066 |
| `V4-listas-06.html` | p-objcard, c-toast | DS-023, DS-066 |
| `V4-listas-07.html` | p-objcard, p-form | DS-058, DS-066 |
| `V4-listas-08.html` | p-objcard, p-form | DS-058, DS-064, DS-066 |
| `V4-listas-09.html` | p-objcard, p-empty | DS-053, DS-059 |
| `V4-pantry-06.html` | p-screenheader, p-itemrow, p-category, p-nav | DS-053, DS-054, DS-055, DS-056, DS-057, DS-063 |
| `V4-pantry-07.html` | p-itemrow, p-category, p-nav, c-menu | DS-053, DS-054, DS-055, DS-056, DS-063, DS-064 |
| `V4-tienda-habitual-01.html` | p-screenheader, p-itemrow, p-category, p-nav | DS-053, DS-054, DS-055, DS-056, DS-063 |


### Consolidación del catálogo — 1.8.0 (2026-11-11)

Actualización documental: se sustituyeron muestras/reglas contradictorias en Components y Product Patterns. Card: listas 14px, categorías 4/12/10px; inputs elevados también dentro de formularios blancos; filtro 52px; StatTile blanco 24px; menús sin cesta ni atajos ficticios; selección móvil azul; primarios 44px. Hero activo usa los mismos assets/scrim reales de HeroSurface y progreso 16%. Note01Icon y Lists con título/descripción conservados. Ningún hallazgo de código se cierra por este ajuste; runtime DS-061/062 y resto de evidencia permanecen vigentes.

Verificación documental 1.8.0: catálogo y reporte renderizados a 320, 375 y 1280px. Sin scroll horizontal de página ni de las 33 muestras incrustadas del catálogo; 64 imágenes del reporte cargadas, 20 pantallas con sus tres vistas. Enlaces e IDs sin duplicados o destinos rotos; 65 IDs del plan/reporte coinciden y los 65 assets están utilizados. Esto no ejecuta ni valida la aplicación.
