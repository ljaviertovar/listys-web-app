# Spec Delta

## MODIFIED Requirements

### Requirement: The upload sheet says what is read from the receipt

La hoja de subida de recibos SHALL decir que se leen la tienda, la fecha y el total, y que el usuario los confirma antes de guardar nada. Cuando no hay fotos, SHALL ofrecer "Scan Receipt" como acción principal con `ScanTextIcon` y "Choose Photos" como alternativa. Si la cámara no está disponible, el permiso se deniega o falla el escáner, SHALL explicar que no se pudo abrir y mantener accesible "Choose Photos". El botón de envío SHALL decir "Upload", o "Upload N Photos" con más de una foto. El progreso SHALL decir cuántas fotos suben y pedir mantener la pantalla abierta, sin inventar un porcentaje.

#### Scenario: Upload without selected photos
- **WHEN** el usuario abre la hoja de carga
- **THEN** ve "Scan Receipt" con `ScanTextIcon` como acción principal y "Choose Photos" como alternativa

#### Scenario: One photo
- **WHEN** el usuario elige una foto
- **THEN** el botón dice "Upload"

#### Scenario: Several photos
- **WHEN** el usuario elige tres fotos
- **THEN** el botón dice "Upload 3 Photos"

#### Scenario: Camera cannot open
- **WHEN** el escáner no está disponible o no obtiene permiso para usar la cámara
- **THEN** la hoja indica que no se pudo abrir el escáner y mantiene la acción "Choose Photos"
