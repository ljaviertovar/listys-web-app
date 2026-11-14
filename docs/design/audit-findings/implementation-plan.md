# Alinear la documentación con shadcn

- DS: `docs/design/design-system.html` — v1.8.0, actualización incremental propuesta.
- Estado: awaiting approval.
- Alcance: Button, Input, Select y patrones de formulario.
- Este plan sustituye al anterior por instrucción expresa del usuario.

## Decisión de diseño

El Design System debe reflejar las variantes, propiedades, geometría y estados que ofrecen los componentes shadcn correspondientes. No debe crear una escala común, alturas propias ni equivalencias inventadas entre Button, Input y Select. Las extensiones del proyecto se identificarán claramente como extensiones, no como tamaños shadcn.

La guía oficial consultada presenta para Button las variantes `default`, `xs`, `sm`, `lg`, `icon`, `icon-xs`, `icon-sm` e `icon-lg`; sus medidas se toman de la implementación shadcn que el proyecto instala, sin fijarlas aquí como una escala transversal. Input y Select se documentan según sus respectivas APIs y fuentes, que pueden diferir entre sí y entre los paquetes base de shadcn. Form se documenta como composición de campos y mensajes, sin escala adicional.

## DS-001 · Documentar tamaños desde los componentes shadcn, sin escala propia · Medium

- **Ubicación:** `docs/design/design-system.html`, componentes Button e Input/Select y patrón Form.
- **Observado:** el catálogo conserva muestras geométricas y lenguaje de tamaños que no distinguen claramente las variantes nativas de shadcn de las extensiones locales.
- **Esperado:** una entrada por componente con los nombres de variantes y dimensiones extraídas de la implementación oficial correspondiente; diferencias locales rotuladas como extensiones. Sin una tabla compartida de alturas.
- **Guía:** tomar Button, Input, Select y Field/Form de las fuentes oficiales shadcn y confirmar la base compatible con el proyecto antes de documentar medidas. No inferir alturas por los nombres (`sm`, `default`, `lg`) ni extender tamaños de Button a inputs. Representar ejemplos a partir de la API del componente.
- **Aceptación:**
  - [ ] Button, Input y Select se documentan como componentes separados y con sus propias variantes nativas.
  - [ ] No se prescribe una escala común de píxeles ni tamaños no ofrecidos por cada componente.
  - [ ] Extensiones locales (por ejemplo, el filtro Trips) se identifican como tales.
  - [ ] Form refleja la composición shadcn y no introduce tamaños de control propios.
- **Estado:** abierto; esta skill no modifica el código de la app.

## Evidencia y límites

- Se consultó la documentación oficial de shadcn para Button, Input y Select. La documentación ofrece bases de UI diferentes; no es correcto deducir una escala compartida.
- La geometría exacta debe cotejarse con el código shadcn instalado/generado en este repositorio antes de fijar los ejemplos del catálogo.
- Runtime, dimensiones DOM, hit targets, teclado y lector de pantalla: no verificados.
