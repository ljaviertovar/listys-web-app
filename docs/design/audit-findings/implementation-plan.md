# Plan de auditoría del Design System — Listys

- DS: [docs/design/design-system.html](../design-system.html) — versión vigente indicada en metadata/footer: v2.1.2
- Reporte visual: docs/design/audit-findings/report.html
- Comparativa ahora/después: docs/design/audit-findings/jerarquia-comparativa.html
- Alcance: títulos, descripciones, texto de apoyo y metadatos de páginas, secciones, cards y estados de la app
- Fuente auditada: `C:\Users\luisj\Documents\DEV\listys-web-app` @ `1e39e43` + working tree, 2026-11-15
- Estado: awaiting approval
- Ajustes del usuario: ninguno
- Abiertos: 3 hallazgos (Critical 0 · High 0 · Medium 2 · Low 1)
- Desde la última auditoría: no hay plan anterior en `audit-findings/`; no se puede determinar resueltos/regresiones
- Stack: Next.js App Router + TypeScript, Tailwind, shadcn/ui sobre Radix; tokens en `src/app/globals.css`, variantes compartidas en `src/components/ui/`

## Instrucciones para quien implemente

- Revisar primero los previews comparativos de `report.html` y obtener aprobación para el plan.
- Aplicar los cambios en orden y conservar las excepciones de jerarquía documentadas como intencionales.
- No cambiar la identidad tipográfica de marketing: sus títulos de exhibición son un sistema de marca separado.
- La app no se ejecutó durante esta auditoría; las conclusiones provienen de fuentes estáticas y de las definiciones actuales del DS.

## Mapa de referencia

| Rol | Objetivo DS | Aplicación / ejemplos | Tratamiento recomendado |
|---|---|---|---|
| Título de página de producto | Inter 24/32, 700 | `PageHeader` y páginas de Lists, Trips, Receipts, Stores y detalle | Conservar |
| Descripción de página | 16/24, regular, muted | `PageHeader` | Conservar; los saludos del dashboard siguen su patrón específico |
| Título de sección de dashboard | 16/24, 600 | `DashboardSectionCard`, `UpNextList` | Mantener también en desktop; no escalar solo por breakpoint |
| Fila de dashboard | título 14/20 semibold; metadata 12/16 regular | Lists, Likely Needed, Last Trip by Store | Usar un solo orden de contraste en todos los rows |
| Título de objeto en card | 16/24, 600 | Lists, Trips, Receipts, Stores | Conservar según patrón de entidad |
| Texto descriptivo de entidad | 14/20 | Nota/description de EntityCard | Conservar |
| Metadatos secundarios | 12/16, muted; mono solo para datos numéricos/técnicos | fecha, conteo, estado secundario | Conservar y no competir con el nombre o la cifra principal |
| Hero de marketing / autenticación | Display responsivo según su sección | landing, auth y banners destacados | Excepción intencional; no convertir a H1 de producto |

## Contrato de orden documentado en el reporte

El reporte incluye ejemplos anotados de PageHeader reales (Lists y Receipts), una sheet de Upload Receipt, cards reales con badges/iconos de Hugeicons y matrices de estilos y presencia para todos los headers, sheets y familias de cards inspeccionadas. Los ejemplos llenan los niveles posibles; las tablas distinguen datos siempre visibles, condicionales y fallbacks/omisiones para no sugerir que el dato ausente se añade a la interfaz. Este resumen fija los principios que debe conservar cualquier corrección:

1. **Page header:** back link (si existe) → icono de sección + H1 → descripción → datos/tags → filtros o controles. H1 24/32 700 `foreground`; descripción 16/24 regular `muted-foreground`.
2. **Sheet header:** título → descripción opcional → contenido; el cierre queda arriba a la derecha. Título 24/32 600 `foreground`; descripción 16/24 regular `muted-foreground`; separación inferior 16px.
3. **Object cards:** identidad → estado → clasificación → datos → pie. Nota y acciones son opcionales y no alteran el orden base. Título 16/24 600; nota 14/20; metadata 12/16 muted; cifra principal 18px mono 600; acciones/link 14px semibold.
4. **Otros tipos de card:** siguen el orden de su flujo (métrica, hero, empty, status, receipt detail, category); el reporte detalla jerarquía, tipografía y tokens por familia. No convertir sus títulos en títulos de objeto.
5. Los colores consumen tokens semánticos del tema (`foreground`, `muted-foreground`, `primary`, `feedback-*`); no introducir hex ni estilos locales por instancia.

## Batch 1 — Jerarquía y documentación

### DS-085 · Los títulos de sección del dashboard crecen solo en desktop · Medium

- **Tipo:** misaligned
- **Dónde:** `src/components/features/dashboard/dashboard-section-card.tsx:29-35` y `src/components/features/dashboard/up-next-list.tsx:37-41`; Lists, Likely Needed, Last Trip by Store, Spend This Month y Up Next.
- **Referencia DS:** Product Patterns → Dashboard – Section card (`design-system.html#p-section`); título 16/600.
- **Esperado:** título 16px, 600, line-height normal/24px tanto en mobile como en desktop.
- **Observado:** ambos headings son 16px/24 en mobile y 20px/28 desde `md` (`md:text-xl md:leading-[1.39]`).
- **Por qué importa:** la misma sección sube al nivel de énfasis de un título de página al cambiar el viewport; rompe el orden entre H1, sección y contenido de card.
- **Guía de corrección:** retirar el escalado tipográfico de breakpoint y conservar el nivel 16/600 definido por el patrón. Mantener el ajuste de layout del encabezado si hace falta.
- **Criterios de aceptación:**
  - [ ] Los encabezados de `DashboardSectionCard` y `UpNextList` permanecen en 16/24, 600 en mobile y desktop.
  - [ ] El título sigue legible, sin recorte, junto al enlace “View all”.
  - [ ] No se introducen valores Tailwind arbitrarios ni estilos locales nuevos.
- **Depende de:** ninguno.
- **Evidencia:** fuente estática; runtime sin verificar.
- **Visual:** `report.html#ds-085`
- **Estado:** open

### DS-087 · Las filas del dashboard no separan igual título y metadata · Medium

- **Tipo:** misaligned
- **Dónde:** `src/components/features/dashboard/dashboard-row.tsx`; estilos base en `src/components/ui/item.tsx` (ItemTitle/ItemDescription); patrón comparativo en `src/components/features/dashboard/lists-section-card.tsx`.
- **Referencia DS:** Product Patterns → Dashboard – Section card (`design-system.html#p-section`); la jerarquía separa título de fila y metadata secundaria.
- **Esperado:** nombre 14/20, 600, `foreground`; detalle/metadata 12/16 regular, `muted-foreground`. La metadata conserva mono solo para valores de fuente, como fechas/cifras.
- **Observado:** `ListsSectionCard` muestra nombre 14px semibold y metadata 12px; `DashboardRow` usa el `ItemTitle` nativo 14px medium y `ItemDescription` 14px regular. El detalle visualmente compite con el nombre.
- **Por qué importa:** dos filas equivalentes dentro del dashboard no comparten el mismo orden de lectura; fecha, cadence y nombre de tienda quedan al nivel del título.
- **Guía de corrección:** proponer una variante/prop con nombre en el primitive compartido `ItemTitle`/`ItemDescription` y consumirla en DashboardRow. No pasar clases tipográficas locales ni tocar otros usos de `Item`.
- **Criterios de aceptación:**
  - [ ] Lists, Likely Needed y Last Trip by Store muestran título 14/20 600 y metadata 12/16 regular.
  - [ ] Las fechas/datos fuente mantienen mono cuando aplica; el texto narrativo permanece sans.
  - [ ] El estilo se expone mediante API compartida del componente, sin override de apariencia en el call site.
  - [ ] La fila conserva el truncado, el trailing amount y los nombres accesibles.
- **Depende de:** decisión de extender la API tipográfica del primitive `Item` (recomendación: aprobar variante nombrada compartida).
- **Evidencia:** fuente estática; runtime sin verificar.
- **Visual:** `report.html#ds-087`
- **Estado:** open

### DS-086 · Metadata de versión contradictoria dentro del DS · Low

- **Tipo:** reference update / mantenimiento del Design System
- **Dónde:** `docs/design/design-system.html:5,271,2298`.
- **Referencia DS:** Overview y footer del propio catálogo.
- **Esperado:** una única versión vigente en metadata HTML, distintivo del header, Overview y footer.
- **Observado:** metadata y footer indican v2.1.2; el distintivo del header muestra v2.0.9; el texto histórico del Overview conserva v2.0.2 y revisiones/cierres anteriores.
- **Guía de corrección:** separar explícitamente “versión actual” de las entradas históricas del Overview; actualizar el distintivo del header a la versión actual y revisar el bloque de Overview para que su estado de auditoría no parezca vigente si es histórico.
- **Criterios de aceptación:**
  - [ ] La metadata, distintivo y footer presentan la misma versión vigente.
  - [ ] Las versiones previas aparecen solo con fecha/etiqueta histórica clara.
  - [ ] No se altera el contenido histórico del changelog.
- **Depende de:** ninguno.
- **Evidencia:** fuente estática.
- **Visual:** `report.html#ds-086`
- **Estado:** open

## Observaciones de diseño (no bloqueantes)

- El DS cubre por separado varios patrones de tipografía, pero no reúne en una sola tabla los roles H1 de producto, título de sección, título de card, texto de apoyo y metadata. Recomiendo consolidar esa tabla cuando se apruebe el plan, manteniendo como excepciones explícitas los estados de atención (p. ej. título compacto 14px), los estados destacados de viaje (18px) y los héroes de marketing/auth.
- La landing usa una escala display fluida de 32–76px y estilos de marca propios; su jerarquía es internamente consistente y conviene tratarla como sistema de marketing, no como deriva del H1 de producto.
- `CardHeaderContent` utiliza el `CardTitle` strong de 16px con una descripción media truncada; `EntityCard` usa título 16px, descripción de entidad y metadata 12/16. Esta diferencia corresponde a roles distintos según el DS y no se marca como fallo.

## Sin verificar

- Render de la app en ejecución, tamaños computed, clipping real, modo oscuro y viewport mobile/desktop.
- Navegación por teclado y anuncio de la jerarquía por lector de pantalla.

## Decisiones abiertas

- DS-087 requiere añadir una API/variante de tipografía nombrada al primitive shadcn `ItemTitle`/`ItemDescription`, porque hoy solo exponen `className` para apariencia. Recomendación: aprobar el rol compartido de título 14/20 semibold + metadata 12/16 regular y no modificar otros usos de Item.
- Para DS-086, conservar las versiones de Overview como historial y etiquetar su vigencia con claridad (recomendado).
