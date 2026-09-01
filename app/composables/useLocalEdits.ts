import type { ClassroomEdit, EnrolmentEdit, LocalEdits } from '~/lib/capacity'
import { emptyEdits } from '~/lib/capacity'

export function useLocalEdits() {
  const edits = useState<LocalEdits>('local-edits', emptyEdits)
  const month = useReportingMonth()

  watch(month, () => {
    edits.value = emptyEdits()
  })

  function patchClassroom(id: string, patch: ClassroomEdit) {
    edits.value = {
      ...edits.value,
      classrooms: {
        ...edits.value.classrooms,
        [id]: { ...edits.value.classrooms[id], ...patch },
      },
    }
  }

  function patchEnrolment(id: string, patch: EnrolmentEdit) {
    edits.value = {
      ...edits.value,
      enrolments: {
        ...edits.value.enrolments,
        [id]: { ...edits.value.enrolments[id], ...patch },
      },
    }
  }

  return { edits, patchClassroom, patchEnrolment }
}
