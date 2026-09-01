/**
 * Types mirroring the Capacity Overview API (OpenAPI 3.1 contract).
 * GET /api/v1/capacity-overview?month=YYYY-MM
 */

export type AgeGroupId
  = | 'infant'
    | 'baby'
    | 'toddler'
    | 'preschool'
    | 'kindergarten'
    | 'school'

export type AttendanceTypeId
  = | 'full_time'
    | 'three_days_per_week'
    | 'two_days_per_week'

/** `YYYY-MM` */
export type YearMonth = string

/** `YYYY-MM-DD` */
export type IsoDate = string

export interface Meta {
  month: YearMonth
  effective_on: IsoDate
  timezone: string
  available_months: YearMonth[]
}

export interface AgeGroup {
  id: AgeGroupId
  label: string
}

export interface AttendanceType {
  id: AttendanceTypeId
  label: string
  abbreviation: string
}

export interface Centre {
  id: string
  name: string
  abbreviation: string
}

export interface Classroom {
  id: string
  centre_id: string
  name: string
  capacity: number
  accepted_age_group_ids: AgeGroupId[]
}

export interface Child {
  id: string
  first_name: string
  last_name: string
  date_of_birth: IsoDate
}

export interface ClassroomAssignment {
  id: string
  classroom_id: string
  starts_on: IsoDate
  ends_on: IsoDate | null
}

export interface Enrolment {
  id: string
  centre_id: string
  starts_on: IsoDate
  ends_on: IsoDate | null
  attendance_type: AttendanceTypeId
  age_group: AgeGroupId
  child: Child
  assignment: ClassroomAssignment | null
}

export interface CapacityOverview {
  meta: Meta
  age_groups: AgeGroup[]
  attendance_types: AttendanceType[]
  centres: Centre[]
  classrooms: Classroom[]
  enrolments: Enrolment[]
}

/** 422 response body for an invalid/unavailable month. */
export interface ValidationError {
  message: string
  errors: {
    month: string[]
  }
}
