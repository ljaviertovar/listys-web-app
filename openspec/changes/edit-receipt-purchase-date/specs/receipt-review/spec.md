# Spec Delta

## MODIFIED Requirements

### Requirement: Receipt purchase and upload dates

El escaneo SHALL extraer la fecha impresa de la compra en la misma lectura que usa para los artículos
cuando la fecha se puede determinar. La metadata SHALL mostrar la fecha de carga y la fecha de compra.

#### Scenario: Receipt without a readable purchase date

- **WHEN** la fecha impresa no se puede determinar o un recibo histórico no tiene fecha extraída
- **THEN** la metadata muestra la fecha de carga como fecha de compra con la aclaración "(upload date)"

## ADDED Requirements

### Requirement: The purchase date can be corrected from the store card

La tarjeta de la tienda de un recibo leído SHALL mostrar la fecha de compra en un campo editable con la etiqueta "Purchase date", el día de la semana y una línea que diga su origen: "Read from the receipt.", "Not found on the receipt." o "Set by you.". Elegir un día SHALL guardarlo sin botón de guardar y SHALL NOT admitir un día posterior a hoy.

#### Scenario: Date read from the receipt

- **WHEN** el escaneo encontró la fecha de compra
- **THEN** el campo la muestra con la línea "Read from the receipt."

#### Scenario: Date not found

- **WHEN** el escaneo no encontró la fecha de compra
- **THEN** el campo muestra la fecha de carga y una línea de aviso dice que se usa hasta que la persona fije la fecha impresa

#### Scenario: Choose another day

- **WHEN** la persona elige otro día para un recibo que cuenta en el gasto y el día cae en otro mes
- **THEN** el día se guarda y la línea dice "Saved." con el mes en el que cuenta ahora el recibo

#### Scenario: Day after today

- **WHEN** la persona elige un día posterior a hoy
- **THEN** no se guarda y la línea dice "The purchase date can’t be after today."

#### Scenario: Save fails

- **WHEN** no se puede guardar el día elegido
- **THEN** el campo conserva el día elegido, la línea explica qué hacer y "Try Again" lo envía de nuevo

### Requirement: A purchase date set by the person is kept

Una fecha de compra fijada por la persona SHALL conservarse cuando el recibo se lea de nuevo. La lectura SHALL completar solo una fecha ausente o leída antes por el escaneo.

#### Scenario: Receipt read again

- **WHEN** la persona fijó la fecha de compra y vuelve a leer el recibo
- **THEN** la fecha de compra sigue siendo la que fijó la persona
