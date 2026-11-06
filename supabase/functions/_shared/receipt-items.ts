/** Keep one extracted item per printed product row; repeated purchases are separate receipt lines. */
export const RECEIPT_LINE_ITEM_INSTRUCTIONS = `
PRODUCT ROWS AND REPEATS:
- Return one item object for every printed product row, in the same top-to-bottom order.
- If the same product appears on multiple printed rows, return each row as a separate item object. Never collapse repeats or add their prices or quantities together.
- The quantity is only the count printed on that single row; do not use it to represent repeated rows.
- If the receipt prints an item-count line such as "# ITEMS SOLD 21", compare it with the number of product rows returned and restore any omitted repeated rows before responding.
`
