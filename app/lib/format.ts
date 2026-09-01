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

/** "2026-09" -> "September 2026" */
export function formatMonth(month: YearMonth): string {
  const [year, monthNumber] = month.split('-').map(Number)
  return new Date(year!, monthNumber! - 1, 1).toLocaleDateString('en', {
    month: 'long',
    year: 'numeric',
  })
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
