<script setup lang="ts">
import type { AgeGroup, AgeGroupId, AttendanceType, AttendanceTypeId, Classroom, Enrolment } from '~/types/capacity'
import type { FieldErrors } from '~/lib/editValidation'
import { CircleAlert, TriangleAlert } from '@lucide/vue'
import { motion } from 'motion-v'
import { toast } from 'vue-sonner'
import { enrolmentAgeMismatchWarning, validateEnrolmentForm } from '~/lib/editValidation'

const props = defineProps<{
  enrolment: Enrolment
  ageGroups: AgeGroup[]
  attendanceTypes: AttendanceType[]
  classrooms: Classroom[]
}>()

const open = defineModel<boolean>('open', { default: false })

const { patchEnrolment } = useLocalEdits()

const UNASSIGNED = 'unassigned'

const ageGroup = ref<AgeGroupId>(props.enrolment.age_group)
const attendanceType = ref<AttendanceTypeId>(props.enrolment.attendance_type)
const classroomId = ref(props.enrolment.assignment?.classroom_id ?? UNASSIGNED)
const errors = ref<FieldErrors>({})

const hasErrors = computed(() => Object.keys(errors.value).length > 0)

const ageMismatchWarning = computed(() =>
  enrolmentAgeMismatchWarning(
    ageGroup.value,
    classroomId.value,
    UNASSIGNED,
    props.classrooms,
  ),
)

watch(open, (isOpen) => {
  if (isOpen) {
    ageGroup.value = props.enrolment.age_group
    attendanceType.value = props.enrolment.attendance_type
    classroomId.value = props.enrolment.assignment?.classroom_id ?? UNASSIGNED
    errors.value = {}
  }
})

watch([ageGroup, attendanceType, classroomId], () => {
  if (hasErrors.value) {
    errors.value = {}
  }
})

const childName = computed(
  () => `${props.enrolment.child.first_name} ${props.enrolment.child.last_name}`,
)

function apply() {
  const nextErrors = validateEnrolmentForm({
    ageGroup: ageGroup.value,
    attendanceType: attendanceType.value,
    classroomId: classroomId.value,
    allowedAgeGroups: props.ageGroups.map(group => group.id),
    allowedAttendanceTypes: props.attendanceTypes.map(type => type.id),
    allowedClassrooms: props.classrooms,
    unassignedValue: UNASSIGNED,
  })
  errors.value = nextErrors
  if (Object.keys(nextErrors).length > 0) {
    return
  }

  try {
    patchEnrolment(props.enrolment.id, {
      age_group: ageGroup.value,
      attendance_type: attendanceType.value,
      classroom_id: classroomId.value === UNASSIGNED ? null : classroomId.value,
    })
  }
  catch {
    toast.error('Could not apply those changes', {
      description: 'The enrolment data is not valid. Check the fields and try again.',
    })
    return
  }

  toast.info('Saved on this device only', {
    description: 'There is no edit API — changes reset on refresh or month change.',
  })
  open.value = false
}
</script>

<template>
  <AnimatedModal
    v-model:open="open"
    :title="`Edit ${childName}`"
    description="Changes stay on this device until you refresh or switch month."
  >
    <template #default="{ staggeredEntry }">
      <form class="mt-5 space-y-4" @submit.prevent="apply" novalidate>
        <component :is="motion.div" v-if="hasErrors" v-bind="staggeredEntry(0)">
          <UiAlert variant="destructive">
            <CircleAlert />
            <UiAlertTitle>This data is not valid</UiAlertTitle>
            <UiAlertDescription>
              Fix the highlighted fields, then apply again.
            </UiAlertDescription>
          </UiAlert>
        </component>

        <component :is="motion.div" v-bind="staggeredEntry(1)" class="space-y-1.5">
          <label class="text-sm font-medium" id="child-age-label">Age group</label>
          <UiSelect v-model="ageGroup">
            <UiSelectTrigger
              class="w-full"
              aria-labelledby="child-age-label"
              :aria-invalid="!!errors.ageGroup"
              :aria-describedby="errors.ageGroup ? 'child-age-error' : undefined"
            >
              <UiSelectValue />
            </UiSelectTrigger>
            <UiSelectContent>
              <UiSelectItem
                v-for="group in ageGroups"
                :key="group.id"
                :value="group.id"
              >
                {{ group.label }}
              </UiSelectItem>
            </UiSelectContent>
          </UiSelect>
          <p v-if="errors.ageGroup" id="child-age-error" class="text-destructive text-xs">
            {{ errors.ageGroup }}
          </p>
        </component>

        <component :is="motion.div" v-bind="staggeredEntry(2)" class="space-y-1.5">
          <label class="text-sm font-medium" id="child-attendance-label">Attendance</label>
          <UiSelect v-model="attendanceType">
            <UiSelectTrigger
              class="w-full"
              aria-labelledby="child-attendance-label"
              :aria-invalid="!!errors.attendanceType"
              :aria-describedby="errors.attendanceType ? 'child-attendance-error' : undefined"
            >
              <UiSelectValue />
            </UiSelectTrigger>
            <UiSelectContent>
              <UiSelectItem
                v-for="type in attendanceTypes"
                :key="type.id"
                :value="type.id"
              >
                {{ type.label }}
              </UiSelectItem>
            </UiSelectContent>
          </UiSelect>
          <p v-if="errors.attendanceType" id="child-attendance-error" class="text-destructive text-xs">
            {{ errors.attendanceType }}
          </p>
        </component>

        <component :is="motion.div" v-bind="staggeredEntry(3)" class="space-y-1.5">
          <label class="text-sm font-medium" id="child-room-label">Classroom</label>
          <UiSelect v-model="classroomId">
            <UiSelectTrigger
              class="w-full"
              aria-labelledby="child-room-label"
              :aria-invalid="!!errors.classroomId"
              :aria-describedby="errors.classroomId ? 'child-room-error' : undefined"
            >
              <UiSelectValue />
            </UiSelectTrigger>
            <UiSelectContent>
              <UiSelectItem :value="UNASSIGNED">
                Unassigned
              </UiSelectItem>
              <UiSelectItem
                v-for="room in classrooms"
                :key="room.id"
                :value="room.id"
              >
                {{ room.name }}
              </UiSelectItem>
            </UiSelectContent>
          </UiSelect>
          <p v-if="errors.classroomId" id="child-room-error" class="text-destructive text-xs">
            {{ errors.classroomId }}
          </p>
        </component>

        <component :is="motion.div" v-if="ageMismatchWarning && !hasErrors" v-bind="staggeredEntry(4)">
          <UiAlert>
            <TriangleAlert />
            <UiAlertTitle>Age mismatch</UiAlertTitle>
            <UiAlertDescription>
              {{ ageMismatchWarning }}
            </UiAlertDescription>
          </UiAlert>
        </component>

        <component :is="motion.div" v-bind="staggeredEntry(5)" class="flex justify-end gap-2 pt-2">
          <UiButton type="button" variant="outline" @click="open = false">
            Cancel
          </UiButton>
          <UiButton type="submit">
            Apply
          </UiButton>
        </component>
      </form>
    </template>
  </AnimatedModal>
</template>
