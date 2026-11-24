# Tasks

## 1. Store the date and keep it

- [x] 1.1 Add `purchase_date_by_user` with an additive migration and update the generated types.
- [x] 1.2 Accept `purchase_date` in `PATCH /api/v1/tickets/{id}` (real day, from 1900, not after today with one day of slack), set the mark and scope the update to the owner; reject mixed payloads.
- [x] 1.3 Make both OCR functions skip the read date when the person set it.
- [ ] 1.4 Apply the migration to the database and deploy the two OCR functions.

## 2. Edit the date on the receipt

- [x] 2.1 Add the Purchase date field to the store card with its states (read, not found, saving, saved, set by you, after today, save failed) and move the missing-store state into the card when the date is shown.
- [x] 2.2 Show "(upload date)" in the metadata line when no date was read.
- [ ] 2.3 Verify the field on a phone and in the signed-in app, including the browser's own date picker.

## 3. Document and verify

- [x] 3.1 Cover the route (owner scope, refusals) and the OCR guard with tests.
- [x] 3.2 Record the change in the CHANGELOG and the Design System.
