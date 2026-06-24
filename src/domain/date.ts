const millisecondsPerDay = 86_400_000

export function getLocalDayKey(dateInput: Date | string = new Date()) {
  const date = toDate(dateInput)
  const year = date.getFullYear()
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  const day = `${date.getDate()}`.padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function isSameLocalDate(
  first: Date | string,
  second: Date | string,
) {
  return getLocalDayKey(first) === getLocalDayKey(second)
}

export function startOfLocalDay(dateInput: Date | string = new Date()) {
  const date = toDate(dateInput)
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

export function getInclusiveLocalDayCount(
  startInput: Date | string,
  endInput: Date | string = new Date(),
) {
  const start = startOfLocalDay(startInput).getTime()
  const end = startOfLocalDay(endInput).getTime()
  return Math.max(1, Math.floor((end - start) / millisecondsPerDay) + 1)
}

export function isWithinLastDays(
  dateInput: Date | string,
  days: number,
  nowInput: Date | string = new Date(),
) {
  const date = toDate(dateInput).getTime()
  const now = toDate(nowInput).getTime()
  return date >= now - days * millisecondsPerDay && date <= now
}

export function formatTimeOfDay(dateInput: Date | string) {
  return new Intl.DateTimeFormat(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  }).format(toDate(dateInput))
}

export function toDate(dateInput: Date | string) {
  return dateInput instanceof Date ? dateInput : new Date(dateInput)
}
