export const CATEGORIES = [
  'Produce',
  'Dairy',
  'Meat',
  'Seafood',
  'Bakery',
  'Pantry',
  'Frozen',
  'Beverages',
  'Snacks',
  'Health & Beauty',
  'Household',
  'Other',
] as const

export type Category = typeof CATEGORIES[number]
