import type { AgeGroupId, AttendanceTypeId, Classroom } from '~/types/capacity'

const YEAR_MONTH = /^\d{4}-\d{2}$/
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/
const AGE_GROUP_IDS = new Set<string>([
  'infant',
  'baby',
  'toddler',
  'preschool',
  'kindergarten',
  'school',
])
const ATTENDANCE_TYPE_IDS = new Set<string>([
  'full_time',
  'three_days_per_week',
  'two_days_per_week',
])

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export type FieldErrors = Record<string, string>

export interface ClassroomFormInput {
  name: string
  capacity: string | number
  accepted: AgeGroupId[]
}

export interface EnrolmentFormInput {
  ageGroup: string
  attendanceType: string
  classroomId: string
  allowedAgeGroups: AgeGroupId[]
  allowedAttendanceTypes: AttendanceTypeId[]
  allowedClassrooms: Classroom[]
  unassignedValue: string
}

export function validateClassroomForm(input: ClassroomFormInput): FieldErrors {
  const errors: FieldErrors = {}
  if (!input.name.trim()) {
    errors.name = 'Enter a room name.'
  }

  const rawCapacity = String(input.capacity).trim()
  const capacity = Number(rawCapacity)

  if (rawCapacity === '' || !Number.isFinite(capacity) || !Number.isInteger(capacity) || capacity < 0) {
    errors.capacity = 'Capacity must be a whole number of 0 or more.'
  }

  if (input.accepted.length === 0) {
    errors.accepted = 'Select at least one age group.'
  }

  return errors
}

export function parseClassroomCapacity(value: string | number): number {
  const capacity = typeof value === 'number' ? value : Number(String(value).trim())
  return Math.floor(capacity)
}

export function validateEnrolmentForm(input: EnrolmentFormInput): FieldErrors {
  const errors: FieldErrors = {}
  const ageIds = new Set(input.allowedAgeGroups)
  const attendanceIds = new Set(input.allowedAttendanceTypes)
  const roomIds = new Set(input.allowedClassrooms.map(room => room.id))

  if (!ageIds.has(input.ageGroup as AgeGroupId)) {
    errors.ageGroup = 'Select a valid age group.'
  }

  if (!attendanceIds.has(input.attendanceType as AttendanceTypeId)) {
    errors.attendanceType = 'Select a valid attendance type.'
  }

  if (
    input.classroomId !== input.unassignedValue
    && !roomIds.has(input.classroomId)
  ) {
    errors.classroomId = 'Select a classroom in this centre, or Unassigned.'
  }

  return errors
}

/** Non-blocking notice when the chosen room does not accept the age group. */
export function enrolmentAgeMismatchWarning(
  ageGroup: string,
  classroomId: string,
  unassignedValue: string,
  classrooms: Classroom[],
): string | null {
  if (classroomId === unassignedValue) {
    return null
  }
  const room = classrooms.find(item => item.id === classroomId)
  if (!room) {
    return null
  }
  if (room.accepted_age_group_ids.includes(ageGroup as AgeGroupId)) {
    return null
  }
  return 'This age group is not accepted by the selected room. You can still apply — it will show as an age mismatch.'
}

/**
 * Runtime check for the Capacity Overview payload. The API is untyped at the
 * wire, so a 200 response can still be unusable.
 */
export function getCapacityPayloadError(payload: unknown): string | null {
  if (!isRecord(payload)) {
    return 'Capacity data is not valid.'
  }

  if (!isRecord(payload.meta)) {
    return 'Capacity data is missing reporting-month metadata.'
  }
  if (typeof payload.meta.month !== 'string' || !YEAR_MONTH.test(payload.meta.month)) {
    return 'Capacity data has an invalid reporting month.'
  }
  if (typeof payload.meta.effective_on !== 'string' || !ISO_DATE.test(payload.meta.effective_on)) {
    return 'Capacity data has an invalid effective date.'
  }

  if (!Array.isArray(payload.age_groups) || !Array.isArray(payload.attendance_types)) {
    return 'Capacity data is missing age groups or attendance types.'
  }
  if (!Array.isArray(payload.centres) || !Array.isArray(payload.classrooms) || !Array.isArray(payload.enrolments)) {
    return 'Capacity data is missing centres, classrooms, or enrolments.'
  }

  const centreIds = new Set<string>()
  for (const centre of payload.centres) {
    if (!isRecord(centre) || typeof centre.id !== 'string' || !centre.id || typeof centre.name !== 'string') {
      return 'A centre in the response is not valid.'
    }
    centreIds.add(centre.id)
  }

  const classroomIds = new Set<string>()
  for (const room of payload.classrooms) {
    if (!isRecord(room) || typeof room.id !== 'string' || typeof room.name !== 'string') {
      return 'A classroom in the response is not valid.'
    }
    if (typeof room.centre_id !== 'string' || !centreIds.has(room.centre_id)) {
      return `Classroom "${room.name}" is not linked to a known centre.`
    }
    if (typeof room.capacity !== 'number' || !Number.isFinite(room.capacity) || room.capacity < 0) {
      return `Classroom "${room.name}" has an invalid capacity.`
    }
    if (!Array.isArray(room.accepted_age_group_ids)) {
      return `Classroom "${room.name}" has invalid accepted age groups.`
    }
    if (room.accepted_age_group_ids.some(id => typeof id !== 'string' || !AGE_GROUP_IDS.has(id))) {
      return `Classroom "${room.name}" has an invalid age group.`
    }
    classroomIds.add(room.id)
  }

  for (const enrolment of payload.enrolments) {
    if (!isRecord(enrolment) || typeof enrolment.id !== 'string') {
      return 'An enrolment in the response is not valid.'
    }
    if (typeof enrolment.centre_id !== 'string' || !centreIds.has(enrolment.centre_id)) {
      return 'An enrolment is not linked to a known centre.'
    }
    if (typeof enrolment.age_group !== 'string' || !AGE_GROUP_IDS.has(enrolment.age_group)) {
      return 'An enrolment has an invalid age group.'
    }
    if (typeof enrolment.attendance_type !== 'string' || !ATTENDANCE_TYPE_IDS.has(enrolment.attendance_type)) {
      return 'An enrolment has an invalid attendance type.'
    }
    if (typeof enrolment.starts_on !== 'string' || !ISO_DATE.test(enrolment.starts_on)) {
      return 'An enrolment has an invalid start date.'
    }
    if (
      enrolment.ends_on != null
      && (typeof enrolment.ends_on !== 'string' || !ISO_DATE.test(enrolment.ends_on))
    ) {
      return 'An enrolment has an invalid end date.'
    }
    if (
      !isRecord(enrolment.child)
      || typeof enrolment.child.first_name !== 'string'
      || typeof enrolment.child.last_name !== 'string'
    ) {
      return 'An enrolment is missing child details.'
    }
    if (enrolment.assignment != null) {
      if (!isRecord(enrolment.assignment) || typeof enrolment.assignment.classroom_id !== 'string') {
        return 'An enrolment assignment is not valid.'
      }
      if (!classroomIds.has(enrolment.assignment.classroom_id)) {
        return 'An enrolment is assigned to a classroom that does not exist.'
      }
    }
  }

  return null
}
