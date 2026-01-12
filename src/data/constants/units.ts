export const UNITS = [
  'pcs',
  'kg',
  'lbs',
  'oz',
  'g',
  'ml',
  'l',
  'gal',
  'dozen',
  'pack',
] as const

export type Unit = typeof UNITS[number]
