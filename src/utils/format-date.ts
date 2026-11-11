export function formatDate(date: Date): string {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const day = date.getDate()
  const month = months[date.getMonth()]
  const year = date.getFullYear()
  return `${day} ${month} ${year}`
}

export function formatTime(date: Date): string {
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  return `${hours}:${minutes}`
}

/** Day and month ("22 Feb"), with the year only when it is not the current one: the date a receipt takes its title from. */
export function formatShortDate(date: Date, now = new Date()): string {
  const base = formatDate(date).slice(0, -5)
  return date.getFullYear() === now.getFullYear() ? base : `${base} ${date.getFullYear()}`
}
