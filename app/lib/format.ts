import type { YearMonth } from '~/types/capacity'

/** 0.326 -> "32.6%"; null (no capacity) -> "—" */
export function formatPercent(value: number | null): string {
  if (value === null) {
    return '—'
  }
  return new Intl.NumberFormat('en', {
    style: 'percent',
    maximumFractionDigits: 1,
  }).format(value)
}

/** Calendar year-month for today, e.g. "2026-09". */
export function currentYearMonth(now = new Date()): YearMonth {
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  return `${year}-${month}` as YearMonth
}

/** "2026-09" -> "September 2026" */
export function formatMonth(month: YearMonth): string {
  const [year, monthNumber] = month.split('-').map(Number)
  return new Date(year!, monthNumber! - 1, 1).toLocaleDateString('en', {
    month: 'long',
    year: 'numeric',
  })
}

/** "2025-09-14" -> "Sep 14, 2025" */
export function formatDate(date: string): string {
  return new Date(`${date}T00:00:00`).toLocaleDateString('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

/** Age in whole months/years at a reference date, e.g. "8mo" or "3y 4mo". */
export function formatAge(dateOfBirth: string, onDate: string): string {
  const dob = new Date(`${dateOfBirth}T00:00:00`)
  const ref = new Date(`${onDate}T00:00:00`)
  let months
    = (ref.getFullYear() - dob.getFullYear()) * 12
      + (ref.getMonth() - dob.getMonth())
  if (ref.getDate() < dob.getDate()) {
    months--
  }
  if (months < 0) {
    return 'not born yet'
  }
  const years = Math.floor(months / 12)
  const rest = months % 12
  if (years === 0) {
    return `${rest}mo`
  }
  return rest === 0 ? `${years}y` : `${years}y ${rest}mo`
}

export function initials(firstName: string, lastName: string): string {
  return `${firstName[0] ?? ''}${lastName[0] ?? ''}`.toUpperCase()
}

export type UtilizationTone = 'ok' | 'high' | 'over'

/** Traffic-light bucket for a utilization ratio (1 = full). */
export function utilizationTone(utilization: number | null): UtilizationTone {
  if (utilization === null || utilization < 0.9) {
    return 'ok'
  }
  return utilization > 1 ? 'over' : 'high'
}

export const utilizationTextClass: Record<UtilizationTone, string> = {
  ok: 'text-primary',
  high: 'text-warning',
  over: 'text-destructive',
}

export const utilizationBarClass: Record<UtilizationTone, string> = {
  ok: '**:data-[slot=progress-indicator]:bg-primary',
  high: '**:data-[slot=progress-indicator]:bg-warning',
  over: '**:data-[slot=progress-indicator]:bg-destructive',
}
