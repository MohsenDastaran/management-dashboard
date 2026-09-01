/**
 * Capacity engine: derives utilization, availability, and exception signals
 * from the raw Capacity Overview payload.
 *
 * Capacity rules (from the brief):
 * - Each full-time enrolment consumes one physical place.
 * - One three-day and one two-day enrolment may share one place.
 * - An unpaired part-time enrolment still consumes one place.
 * - Unassigned children are shown but never counted against a classroom.
 * - Over-capacity rooms and incompatible age groups are signals, not errors.
 *
 * Pure functions only — no Vue/Nuxt imports — so everything is unit-testable.
 */

import type {
  CapacityOverview,
  Centre,
  Classroom,
  Enrolment,
  IsoDate,
} from '../types/capacity'

export interface AttendanceCounts {
  fullTime: number
  threeDay: number
  twoDay: number
}

export interface ClassroomSummary {
  classroom: Classroom
  /** Enrolments actively assigned to this room on the effective date. */
  enrolments: Enrolment[]
  counts: AttendanceCounts
  /** Number of 3D+2D pairs sharing a single place. */
  sharedPairs: number
  occupied: number
  /** Remaining places; negative when over capacity. */
  available: number
  /** occupied / capacity, in 0..n (1 = full). Null when capacity is 0. */
  utilization: number | null
  isOverCapacity: boolean
  /** Assigned enrolments whose age group the room does not accept. */
  ageGroupMismatches: Enrolment[]
}

export interface CentreSummary {
  centre: Centre
  classrooms: ClassroomSummary[]
  capacity: number
  occupied: number
  available: number
  utilization: number | null
  /** Active enrolments in this centre with no active classroom assignment. */
  unassigned: Enrolment[]
  overCapacityCount: number
  ageGroupMismatchCount: number
}

export interface OverviewSummary {
  effectiveOn: IsoDate
  centres: CentreSummary[]
  capacity: number
  occupied: number
  available: number
  utilization: number | null
  unassignedCount: number
  overCapacityCount: number
  ageGroupMismatchCount: number
}

/** Inclusive date-range check; ISO dates compare correctly as strings. */
export function isActiveOn(
  date: IsoDate,
  startsOn: IsoDate,
  endsOn: IsoDate | null,
): boolean {
  return startsOn <= date && (endsOn === null || endsOn >= date)
}

export function countAttendance(enrolments: Enrolment[]): AttendanceCounts {
  const counts: AttendanceCounts = { fullTime: 0, threeDay: 0, twoDay: 0 }
  for (const enrolment of enrolments) {
    if (enrolment.attendance_type === 'full_time') {
      counts.fullTime++
    }
    else if (enrolment.attendance_type === 'three_days_per_week') {
      counts.threeDay++
    }
    else {
      counts.twoDay++
    }
  }
  return counts
}

/**
 * Physical places consumed: every 3D pairs with a 2D where possible, so the
 * part-time enrolments occupy max(threeDay, twoDay) places in total.
 */
export function occupiedPlaces(counts: AttendanceCounts): number {
  return counts.fullTime + Math.max(counts.threeDay, counts.twoDay)
}

export function summarizeClassroom(
  classroom: Classroom,
  assignedEnrolments: Enrolment[],
): ClassroomSummary {
  const counts = countAttendance(assignedEnrolments)
  const sharedPairs = Math.min(counts.threeDay, counts.twoDay)
  const occupied = occupiedPlaces(counts)
  const accepted = new Set(classroom.accepted_age_group_ids)

  return {
    classroom,
    enrolments: assignedEnrolments,
    counts,
    sharedPairs,
    occupied,
    available: classroom.capacity - occupied,
    utilization: classroom.capacity > 0 ? occupied / classroom.capacity : null,
    isOverCapacity: occupied > classroom.capacity,
    ageGroupMismatches: assignedEnrolments.filter(
      enrolment => !accepted.has(enrolment.age_group),
    ),
  }
}

export function summarize(overview: CapacityOverview): OverviewSummary {
  const effectiveOn = overview.meta.effective_on

  const activeEnrolments = overview.enrolments.filter(enrolment =>
    isActiveOn(effectiveOn, enrolment.starts_on, enrolment.ends_on),
  )

  const byClassroom = new Map<string, Enrolment[]>()
  const unassignedByCentre = new Map<string, Enrolment[]>()

  for (const enrolment of activeEnrolments) {
    const assignment = enrolment.assignment
    const isAssigned
      = assignment !== null
        && isActiveOn(effectiveOn, assignment.starts_on, assignment.ends_on)

    if (isAssigned) {
      const list = byClassroom.get(assignment.classroom_id) ?? []
      list.push(enrolment)
      byClassroom.set(assignment.classroom_id, list)
    }
    else {
      const list = unassignedByCentre.get(enrolment.centre_id) ?? []
      list.push(enrolment)
      unassignedByCentre.set(enrolment.centre_id, list)
    }
  }

  const centres = overview.centres.map((centre) => {
    const classrooms = overview.classrooms
      .filter(classroom => classroom.centre_id === centre.id)
      .map(classroom =>
        summarizeClassroom(classroom, byClassroom.get(classroom.id) ?? []),
      )

    const capacity = classrooms.reduce((sum, room) => sum + room.classroom.capacity, 0)
    const occupied = classrooms.reduce((sum, room) => sum + room.occupied, 0)

    const summary: CentreSummary = {
      centre,
      classrooms,
      capacity,
      occupied,
      available: capacity - occupied,
      utilization: capacity > 0 ? occupied / capacity : null,
      unassigned: unassignedByCentre.get(centre.id) ?? [],
      overCapacityCount: classrooms.filter(room => room.isOverCapacity).length,
      ageGroupMismatchCount: classrooms.reduce(
        (sum, room) => sum + room.ageGroupMismatches.length,
        0,
      ),
    }
    return summary
  })

  const capacity = centres.reduce((sum, centre) => sum + centre.capacity, 0)
  const occupied = centres.reduce((sum, centre) => sum + centre.occupied, 0)

  return {
    effectiveOn,
    centres,
    capacity,
    occupied,
    available: capacity - occupied,
    utilization: capacity > 0 ? occupied / capacity : null,
    unassignedCount: centres.reduce((sum, centre) => sum + centre.unassigned.length, 0),
    overCapacityCount: centres.reduce((sum, centre) => sum + centre.overCapacityCount, 0),
    ageGroupMismatchCount: centres.reduce(
      (sum, centre) => sum + centre.ageGroupMismatchCount,
      0,
    ),
  }
}
