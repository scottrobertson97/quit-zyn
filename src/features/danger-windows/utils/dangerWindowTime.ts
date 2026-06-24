import type {
  ActiveDangerWindow,
  DangerWindow,
  DangerWindowCheckIn,
  DangerWindowOccurrence,
  DangerWindowStats,
  DayOfWeek,
  PendingDangerWindowCheckIn,
  UpcomingDangerWindow,
} from '../types'

const pendingCheckInWindowMs = 6 * 60 * 60 * 1000

export function getActiveDangerWindow(
  windows: DangerWindow[],
  now: Date = new Date(),
): ActiveDangerWindow | null {
  const active = windows
    .filter((window) => window.isActive)
    .map((window) => getOccurrenceForDate(window, now))
    .filter((occurrence): occurrence is DangerWindowOccurrence =>
      Boolean(occurrence),
    )
    .filter((occurrence) => {
      const start = new Date(occurrence.windowStartAt).getTime()
      const end = new Date(occurrence.windowEndAt).getTime()
      const current = now.getTime()
      return current >= start && current < end
    })
    .sort(
      (first, second) =>
        new Date(first.windowEndAt).getTime() -
        new Date(second.windowEndAt).getTime(),
    )

  return active[0] ?? null
}

export function getNextDangerWindow(
  windows: DangerWindow[],
  now: Date = new Date(),
): UpcomingDangerWindow | null {
  const upcoming: DangerWindowOccurrence[] = []

  for (let dayOffset = 0; dayOffset <= 7; dayOffset += 1) {
    const date = new Date(now)
    date.setDate(now.getDate() + dayOffset)

    for (const window of windows) {
      if (!window.isActive) {
        continue
      }

      const occurrence = getOccurrenceForDate(window, date)
      if (!occurrence) {
        continue
      }

      if (new Date(occurrence.windowStartAt).getTime() > now.getTime()) {
        upcoming.push(occurrence)
      }
    }
  }

  return (
    upcoming.sort(
      (first, second) =>
        new Date(first.windowStartAt).getTime() -
        new Date(second.windowStartAt).getTime(),
    )[0] ?? null
  )
}

export function getPendingCheckIn(
  windows: DangerWindow[],
  checkIns: DangerWindowCheckIn[],
  now: Date = new Date(),
): PendingDangerWindowCheckIn | null {
  const pending = windows
    .filter((window) => window.isActive)
    .map((window) => getOccurrenceForDate(window, now))
    .filter((occurrence): occurrence is DangerWindowOccurrence =>
      Boolean(occurrence),
    )
    .filter((occurrence) => {
      const end = new Date(occurrence.windowEndAt).getTime()
      const ended = end <= now.getTime()
      const recent = now.getTime() - end <= pendingCheckInWindowMs
      const checkedIn = checkIns.some(
        (checkIn) =>
          checkIn.dangerWindowId === occurrence.window.id &&
          checkIn.windowStartAt === occurrence.windowStartAt,
      )

      return ended && recent && !checkedIn
    })
    .sort(
      (first, second) =>
        new Date(second.windowEndAt).getTime() -
        new Date(first.windowEndAt).getTime(),
    )

  return pending[0] ?? null
}

export function getDangerWindowStats(
  windows: DangerWindow[],
  checkIns: DangerWindowCheckIn[],
): DangerWindowStats {
  const protectedCount = checkIns.filter(
    (checkIn) => checkIn.outcome === 'protected',
  ).length
  const delayedCount = checkIns.filter(
    (checkIn) => checkIn.outcome === 'delayed',
  ).length
  const usedCount = checkIns.filter((checkIn) => checkIn.outcome === 'used')
    .length
  const skippedCheckInCount = checkIns.filter(
    (checkIn) => checkIn.outcome === 'skipped_checkin',
  ).length
  const totalCheckIns = checkIns.length

  return {
    totalCheckIns,
    protectedCount,
    delayedCount,
    usedCount,
    skippedCheckInCount,
    protectionRate: totalCheckIns > 0 ? protectedCount / totalCheckIns : 0,
    bestWindowId: getBestWindowId(windows, checkIns),
    hardestWindowId: getHardestWindowId(windows, checkIns),
    mostHelpfulDefense: getMostHelpfulDefense(windows, checkIns),
  }
}

export function validateDangerWindowTime(startTime: string, endTime: string) {
  if (!startTime || !endTime) {
    return 'Start and end time are required.'
  }

  if (timeToMinutes(endTime) <= timeToMinutes(startTime)) {
    return 'For now, danger windows must start and end on the same day. Create two windows instead.'
  }

  return undefined
}

export function findOverlappingDangerWindow(
  candidate: Pick<DangerWindow, 'id' | 'startTime' | 'endTime' | 'daysOfWeek'>,
  windows: DangerWindow[],
) {
  return windows.find((window) => {
    if (!window.isActive || window.id === candidate.id) {
      return false
    }

    const sharedDay = candidate.daysOfWeek.some((day) =>
      window.daysOfWeek.includes(day),
    )

    if (!sharedDay) {
      return false
    }

    return timeRangesOverlap(
      candidate.startTime,
      candidate.endTime,
      window.startTime,
      window.endTime,
    )
  })
}

export function getOccurrenceForDate(
  window: DangerWindow,
  date: Date,
): DangerWindowOccurrence | null {
  const day = date.getDay() as DayOfWeek
  if (!window.daysOfWeek.includes(day)) {
    return null
  }

  const start = applyTimeToDate(date, window.startTime)
  const end = applyTimeToDate(date, window.endTime)

  return {
    window,
    windowStartAt: start.toISOString(),
    windowEndAt: end.toISOString(),
  }
}

export function formatDangerWindowTimeRange(
  occurrenceOrWindow: DangerWindowOccurrence | DangerWindow,
) {
  if ('windowStartAt' in occurrenceOrWindow) {
    return `${formatTime(occurrenceOrWindow.windowStartAt)}-${formatTime(
      occurrenceOrWindow.windowEndAt,
    )}`
  }

  return `${formatClockTime(occurrenceOrWindow.startTime)}-${formatClockTime(
    occurrenceOrWindow.endTime,
  )}`
}

export function formatDangerWindowEnd(occurrence: DangerWindowOccurrence) {
  return formatTime(occurrence.windowEndAt)
}

export function timeToMinutes(time: string) {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

function applyTimeToDate(date: Date, time: string) {
  const [hours, minutes] = time.split(':').map(Number)
  const next = new Date(date)
  next.setHours(hours, minutes, 0, 0)
  return next
}

function timeRangesOverlap(
  firstStart: string,
  firstEnd: string,
  secondStart: string,
  secondEnd: string,
) {
  return (
    timeToMinutes(firstStart) < timeToMinutes(secondEnd) &&
    timeToMinutes(firstEnd) > timeToMinutes(secondStart)
  )
}

function formatClockTime(time: string) {
  const date = applyTimeToDate(new Date(), time)
  return formatTime(date.toISOString())
}

function formatTime(dateInput: string) {
  return new Intl.DateTimeFormat(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(dateInput))
}

function getBestWindowId(
  windows: DangerWindow[],
  checkIns: DangerWindowCheckIn[],
) {
  return getWindowRates(windows, checkIns)
    .filter((rate) => rate.total > 0)
    .sort((first, second) => second.protectionRate - first.protectionRate)[0]?.id
}

function getHardestWindowId(
  windows: DangerWindow[],
  checkIns: DangerWindowCheckIn[],
) {
  return getWindowRates(windows, checkIns)
    .filter((rate) => rate.total > 0)
    .sort((first, second) => first.protectionRate - second.protectionRate)[0]?.id
}

function getMostHelpfulDefense(
  windows: DangerWindow[],
  checkIns: DangerWindowCheckIn[],
) {
  const windowById = new Map(windows.map((window) => [window.id, window]))
  const defenseCounts = new Map<string, { protected: number; total: number }>()

  for (const checkIn of checkIns) {
    const window = windowById.get(checkIn.dangerWindowId)
    if (!window) {
      continue
    }

    const current = defenseCounts.get(window.defenseAction) ?? {
      protected: 0,
      total: 0,
    }
    defenseCounts.set(window.defenseAction, {
      protected: current.protected + (checkIn.outcome === 'protected' ? 1 : 0),
      total: current.total + 1,
    })
  }

  return [...defenseCounts.entries()]
    .filter(([, value]) => value.total > 0)
    .sort(
      ([, first], [, second]) =>
        second.protected / second.total - first.protected / first.total,
    )[0]?.[0] as DangerWindowStats['mostHelpfulDefense']
}

function getWindowRates(
  windows: DangerWindow[],
  checkIns: DangerWindowCheckIn[],
) {
  return windows.map((window) => {
    const windowCheckIns = checkIns.filter(
      (checkIn) => checkIn.dangerWindowId === window.id,
    )
    const protectedCount = windowCheckIns.filter(
      (checkIn) => checkIn.outcome === 'protected',
    ).length

    return {
      id: window.id,
      total: windowCheckIns.length,
      protectionRate:
        windowCheckIns.length > 0 ? protectedCount / windowCheckIns.length : 0,
    }
  })
}
