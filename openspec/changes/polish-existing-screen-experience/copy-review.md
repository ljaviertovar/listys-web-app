# Revisión de copy

Propuestas para la primera iteración; no se han aplicado. Inglés de producto, explicación en español. Los ejemplos de cantidad se pluralizan con los datos actuales; no son valores fijos. El catálogo cubre tanto mensajes visibles como textos hallados en código, con procedencia en `audit.md`.

| ID | Contexto y texto actual | Texto propuesto | Motivo / condición |
| --- | --- | --- | --- |
| C01 | Autenticación: “By clicking continue, you agree to our” | “By signing in, you agree to our Terms of Service and Privacy Policy.” | No existe un botón Continue. La publicación depende de destinos legales reales; no fabricar contenido jurídico. |
| C02 | Auth: “Forgot Password?” apunta a una ruta inexistente | Retirar temporalmente el enlace de recuperación del flujo mientras no exista, conservando las opciones de acceso disponibles. | No presentar una salida falsa; implementar recuperación queda para iteración 2. No describir Google como única opción: existe acceso con email. |
| C03 | Auth: textos de fallo genéricos | “We couldn’t sign you in. Check your details and try again.” / “We couldn’t open Google sign-in. Try again.” | Solo mapear estados ya disponibles y evitar revelar datos de cuenta. Mostrar el error visible de OAuth no requiere cambiar OAuth. |
| C04 | Subida: campo “Name” | “Store or Receipt Name” con hint “Use a name you’ll recognize, such as Grocery Store.” | Aclara qué se está nombrando sin cambiar la columna ni su obligatoriedad. |
| C05 | Subida: “Upload” → “Uploading…” → “Receipt uploaded — redirecting...” | “Upload Receipt” → “Uploading Receipt…” → “Receipt Uploaded” | Mismo objeto y acción en toda la secuencia; quitar detalle técnico de redirección. |
| C06 | Cola OCR: “Pending” / “Waiting to process...” | “Waiting to Read” / “Your receipt is uploaded and waiting to be read.” | Distinguir subida finalizada de extracción pendiente. |
| C07 | OCR: “Completed” | “Ready to Review” en superficies de recibos | El procesamiento completo no significa revisión humana ni lista guardada. Mantener “Completed” para sesiones finalizadas. |
| C08 | Retry: “Retry”, “Reprocess”, “Try Again” / “OCR processing started” | “Read Receipt Again” → “Starting…” → “Reading Receipt Again” | Evita jerga OCR y explica que se reutiliza la misma foto. No presentar otra subida como sustitución del recibo. |
| C09 | Sin items: “Upload a Clearer Photo” abre una nueva subida | “Upload a New Receipt” y “Try a clearer photo in a new upload, or read this receipt again.” | El diálogo no reemplaza la imagen existente. No crear endpoint de reemplazo. |
| C10 | Selección: “Clear” | “Clear Selection” | Evita interpretar que borra artículos o el recibo. |
| C11 | Selección: “Add to a List” y “Add N Items” | Conservar “Add to a List”; confirmar “Add 1 Item” / “Add 3 Items”. En modo nuevo: “Create List with 3 Items”. | Aclara la creación frente al merge sin alterar los handlers. |
| C12 | Merge: “Items merged successfully”, “0 new, 0 updated, 0 skipped” | “Items Added to Your List” con conteos reales “3 added · 2 updated · 1 skipped”, solo si los devuelve el contrato existente. | No inventar éxito parcial ni 0 por ausencia de datos; si el contrato no permite el resumen, mostrar solo éxito genérico veraz. |
| C13 | Recibo: “Calculated total”; suma de precios extraídos | “Extracted Item Total” y “Based on prices found for 12 of 19 items. This may differ from the total printed on your receipt.” | No prometer total pagado, impuestos o descuentos. Adaptar el hint al caso de cobertura completa/parcial; no cambiar el cálculo. |
| C14 | Grupos: ejemplos que alternan tiendas, categorías y hogar | “Keep related base lists together, for example by store or household.” | No restringir el modelo a tiendas ni sugerir que un grupo equivale a permisos compartidos. |
| C15 | Grupo: “View Details” | “View Lists”, con nombre accesible “View Lists in [group]”. | La acción abre sus listas; distinguir de historial. |
| C16 | Lista: “View Items” | Conservar, con nombre accesible “View Items in [list]”. | Destino reconocible también fuera del contexto visual. |
| C17 | Lista bloqueada: “This list is locked because it is being shopped right now.” | “A shopping session is using this list. Make changes in that session, or finish it to edit this base list.” | Explica el motivo y una salida existente. Presentar un enlace de continuación solo cuando ya se dispone del destino. |
| C18 | Compra móvil: botón “Actions” | Acción principal “Complete Shopping”; secundaria “Cancel Shopping”. | El usuario identifica el siguiente paso sin abrir un menú genérico. |
| C19 | Compra: trigger “Complete Shopping”, confirmación “Complete Session”, carga “Completing…” | “Complete Shopping” → “Complete Shopping?” → “Completing Shopping…” | Una sola acción y vocabulario estable. Mantener el título de éxito cuando todo está marcado, sin afirmar que ya se guardó. |
| C20 | Confirmación con pendientes: pregunta genérica | “2 items are still unchecked. Complete shopping and save the items you collected to your history?” | Describe lo que se guarda según la vista histórica actual; comprobar contra el contrato, no cambiar qué se persiste. |
| C21 | Sync: “Sync changes back to base list” | “Update the Base List” y “Apply this session’s changes to your reusable list.” | Evita prometer qué campos concretos cambian sin verificar la RPC. Mantener el checkbox y su valor por defecto actual. |
| C22 | Cancelación: “Cancel Shopping” + “Keep Shopping” | Conservar el par y la advertencia de que no se guarda en historial. | Ya distingue descartar de continuar. Unificar cierre/confirmación visual, no alterar consecuencias. |
| C23 | Historial: “1 shopping”, “shoppings”, “No shoppings yet” | “1 shopping session”, “2 shopping sessions”, “No completed shopping sessions yet”. | Corrige inglés y nombra el objeto real. |
| C24 | Errores: “Error loading tickets: {error}”, “Failed to load data” | “We couldn’t load your receipts. Try again.” / “We couldn’t load your lists. Close this window and try again.” | No exponer mensajes del proveedor; el siguiente paso debe existir. No añadir un botón que no reintente nada. |
| C25 | Perfil/cuenta: “auth provider”, “Supabase Auth”, “Manage authentication” sin acción | “Sign-in Provider”, “Your profile photo comes from your sign-in provider.”; retirar el título de gestión si solo hay información. | Información comprensible y sin prometer ajustes que no existen. |
| C26 | Footer público: About, Contact, Privacy, Terms apuntan a “#” | Retirar enlaces sin destino o conectar únicamente un destino existente y aprobado. | No inventar páginas, direcciones de contacto ni textos legales. Los documentos legales siguen siendo dependencia de lanzamiento. |
| C27 | Marketing: “Nothing is saved until you have looked at it” / “before anything is saved” | “Review the extracted items before adding them to a base list.” | El recibo y la extracción ya se almacenan; el límite real es añadir a la lista. |
| C28 | Marketing: “Every name, quantity and price stays editable” | “Compare the extracted items with your receipt, then select what to add to a list.” | La revisión actual selecciona y compara; no expone edición completa de esas líneas. No construir esa función en esta pasada. |
| C29 | FAQ: “Invite them to a group” | “Share a base list using its invite link.” | El flujo de compartir está asociado a la lista, no al grupo. |
| C30 | Marketing: “Works for any store”, “in seconds”, objetivo 99% | “Use a clear photo of your receipt” y “Listys reads the items so you can review them.” | Quitar garantías universales y métricas sin evidencia mantenida; una intención no es una medición. |
| C31 | Auth/CTA: “Google sign-in · no card · your lists stay yours” | “Google or email sign-in · no credit card required”. | Coincide con las opciones presentes; no convertir una frase de marca en una garantía de privacidad. |
| C32 | Offline: “Reconnect to continue syncing your shopping data.” | “You’re Offline” / “Reconnect to load Listys and check the latest changes to your lists.” | No sugiere una cola de cambios offline garantizada. No implementar modo offline nuevo. |
| C33 | Guardar edición: “Save” | “Save Changes” → “Saving Changes…” | Acción específica, sin cambiar cuándo se guarda. En una edición de artículo puede ser “Save Item”. |
| C34 | Cancelar una alta de varios artículos tras añadir uno deja el formulario abierto | “Done” si no queda un borrador; “Cancel” si se descarta el borrador actual. | Explicar la salida sin insinuar que deshace artículos ya guardados. No modificar la persistencia. |

## Reglas de aplicación

- Mantener los límites reales del proyecto; no introducir promesas de tiempo, precisión o disponibilidad nuevas.
- Relacionar acción, estado pendiente, éxito y recuperación; usar elipsis tipográfica en cargas.
- Para operaciones destructivas, nombrar el objeto, alcance e irreversibilidad; el botón de rechazo debe expresar conservación cuando “Cancel” sea ambiguo.
- Mantener frases completas para futura localización y admitir un 30% de expansión sin truncar consecuencias ni botones principales.
- Los textos derivados de errores necesitan un catálogo seguro. Si falta información para distinguir estados, usar una frase genérica accionable y registrar el contrato faltante para la segunda iteración.
- Las constantes antiguas en `src/data/constants/landing.ts` incluyen claims que no necesariamente se renderizan. Retirarlas o corregirlas cuando se toque ese módulo, pero no reportar que el visitante vio una estadística solo porque aparece en ese archivo.
