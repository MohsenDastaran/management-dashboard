<script setup lang="ts">
import type { AgeGroup, AgeGroupId, AttendanceType, AttendanceTypeId, Classroom, Enrolment } from '~/types/capacity'
import { motion } from 'motion-v'
import { toast } from 'vue-sonner'

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

watch(open, (isOpen) => {
  if (isOpen) {
    ageGroup.value = props.enrolment.age_group
    attendanceType.value = props.enrolment.attendance_type
    classroomId.value = props.enrolment.assignment?.classroom_id ?? UNASSIGNED
  }
})

const childName = computed(
  () => `${props.enrolment.child.first_name} ${props.enrolment.child.last_name}`,
)

function apply() {
  patchEnrolment(props.enrolment.id, {
    age_group: ageGroup.value,
    attendance_type: attendanceType.value,
    classroom_id: classroomId.value === UNASSIGNED ? null : classroomId.value,
  })
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
      <form class="mt-5 space-y-4" @submit.prevent="apply">
        <component :is="motion.div" v-bind="staggeredEntry(1)" class="space-y-1.5">
          <label class="text-sm font-medium">Age group</label>
          <UiSelect v-model="ageGroup">
            <UiSelectTrigger class="w-full">
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
        </component>

        <component :is="motion.div" v-bind="staggeredEntry(2)" class="space-y-1.5">
          <label class="text-sm font-medium">Attendance</label>
          <UiSelect v-model="attendanceType">
            <UiSelectTrigger class="w-full">
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
        </component>

        <component :is="motion.div" v-bind="staggeredEntry(3)" class="space-y-1.5">
          <label class="text-sm font-medium">Classroom</label>
          <UiSelect v-model="classroomId">
            <UiSelectTrigger class="w-full">
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
        </component>

        <component :is="motion.div" v-bind="staggeredEntry(4)" class="flex justify-end gap-2 pt-2">
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
