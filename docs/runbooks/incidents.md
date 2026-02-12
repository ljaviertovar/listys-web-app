# Incidents Runbook

## Purpose

Procedimiento para respuesta a incidentes y restauración rápida de la aplicación.

## Detection

- Monitorización de logs de Edge Functions y Supabase.
- Alertas de errores 5xx, colas de OCR con backlog, o fallos en migraciones.

## Immediate actions

1. Triage: identificar alcance (afecta a todos los usuarios, subset o proceso background).
2. If crash or 5xx: activar modo mantenimiento si es necesario.
3. Recolectar logs relevantes y crear issue en tracker con prioridad.

## Containment

- Rollback reciente deploy si incidente es por deploy.
- Pause procesamiento batch/OCR si consumo desborda cuotas.

## Recovery

1. Aplicar hotfix en branch `hotfix/*` y desplegar a staging.
2. Validar fixes en staging y luego promover a producción.

## Postmortem

- Documentar la causa raíz, timeline y acciones preventivas.
- Crear ADR si la decisión requiere cambios arquitectónicos.
