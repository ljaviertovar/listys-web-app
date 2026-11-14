# Proposal

## Why

La revisión encontró componentes genéricos custom que duplican patrones disponibles en shadcn, junto con composiciones de dominio que sí deben seguir siendo propias de Listys. Acordar y aplicar las equivalencias reducirá duplicación y mejorará la consistencia sin cambiar el comportamiento visible de la app.

## What Changes

- Adoptar primitives shadcn existentes como base de los patrones genéricos señalados en la auditoría: estados vacíos y avisos, campos de formulario, confirmaciones, breadcrumbs, badges, filas, tarjetas, filtros y navegación lateral.
- Conservar wrappers de Listys cuando aportan semántica, accesibilidad, diseño del sistema o comportamiento compartido; usar shadcn dentro de ellos en vez de sustituirlos por primitives sin contexto.
- Clasificar explícitamente los wrappers que ya componen shadcn —por ejemplo `RowMenu`, `ActionLink` y `SheetDialog`— como reutilizables, evitando migraciones redundantes.
- Mantener los flujos de dominio de autenticación, listas, tiendas, sesiones, tickets, recibos, sharing, dashboard y landing como composiciones app-owned.
- Usar solo componentes del catálogo shadcn que encajen con el `radix-maia` configurado; cualquier primitive que falte debe añadirse por el flujo documentado de shadcn y revisarse antes de integrarlo.
- Tratar este trabajo como refactor de presentación: no cambiar contratos de API, reglas de negocio, textos, rutas ni interacciones observables salvo ajustes necesarios para conservar accesibilidad del primitive.
- Verificar cada lote con los checks de Design System y las pruebas correspondientes a componentes/feature, además de las comprobaciones visuales requeridas por el proyecto cuando cambie la apariencia.

## Capabilities

### New Capabilities

Ninguna. Este cambio reorganiza la implementación de UI sin introducir un comportamiento de producto nuevo.

### Modified Capabilities

Ninguna. No se modifican requisitos de comportamiento existentes.

## Impact

- UI: `src/components/commons/**`, `src/components/app/**` y componentes de dominio concretos en `src/components/features/**` donde la auditoría detectó primitives genéricos.
- Primitives shadcn existentes en `src/components/ui/**`; posible incorporación puntual de un primitive oficial solo si el diseño actual lo requiere.
- Validación: gate del Design System, pruebas de las features modificadas y revisión visual de pantallas afectadas.
- No se prevén cambios de API, base de datos, dependencias de runtime ni datos persistidos.
