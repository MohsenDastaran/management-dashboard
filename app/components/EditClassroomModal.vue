<script setup lang="ts">
import type { AgeGroup } from '~/types/capacity'
import type { ClassroomSummary } from '~/lib/capacity'
import type { FieldErrors } from '~/lib/editValidation'
import { CircleAlert } from '@lucide/vue'
import { motion } from 'motion-v'
import { toast } from 'vue-sonner'
import { parseClassroomCapacity, validateClassroomForm } from '~/lib/editValidation'

const props = defineProps<{
  room: ClassroomSummary
  ageGroups: AgeGroup[]
}>()

const open = defineModel<boolean>('open', { default: false })

const { patchClassroom } = useLocalEdits()

const name = ref(props.room.classroom.name)
const capacity = ref(String(props.room.classroom.capacity))
const accepted = ref([...props.room.classroom.accepted_age_group_ids])
const errors = ref<FieldErrors>({})

const hasErrors = computed(() => Object.keys(errors.value).length > 0)

watch(open, (isOpen) => {
  if (isOpen) {
    name.value = props.room.classroom.name
    capacity.value = String(props.room.classroom.capacity)
    accepted.value = [...props.room.classroom.accepted_age_group_ids]
    errors.value = {}
  }
})

watch([name, capacity, accepted], () => {
  if (hasErrors.value) {
    errors.value = {}
  }
})

function toggleAge(id: AgeGroup['id']) {
  if (accepted.value.includes(id)) {
    accepted.value = accepted.value.filter(age => age !== id)
  }
  else {
    accepted.value = [...accepted.value, id]
  }
}

function apply() {
  const nextErrors = validateClassroomForm({
    name: name.value,
    capacity: capacity.value,
    accepted: accepted.value,
  })
  errors.value = nextErrors
  if (Object.keys(nextErrors).length > 0) {
    return
  }

  try {
    patchClassroom(props.room.classroom.id, {
      name: name.value.trim(),
      capacity: parseClassroomCapacity(capacity.value),
      accepted_age_group_ids: accepted.value,
    })
  }
  catch {
    toast.error('Could not apply those changes', {
      description: 'The room data is not valid. Check the fields and try again.',
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
    :title="`Edit room ${room.classroom.name}`"
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
          <label class="text-sm font-medium" for="room-name">Name</label>
          <UiInput
            id="room-name"
            v-model="name"
            :aria-invalid="!!errors.name"
            :aria-describedby="errors.name ? 'room-name-error' : undefined"
          />
          <p v-if="errors.name" id="room-name-error" class="text-destructive text-xs">
            {{ errors.name }}
          </p>
        </component>

        <component :is="motion.div" v-bind="staggeredEntry(2)" class="space-y-1.5">
          <label class="text-sm font-medium" for="room-capacity">Capacity</label>
          <UiInput
            id="room-capacity"
            v-model="capacity"
            type="number"
            min="0"
            step="1"
            :aria-invalid="!!errors.capacity"
            :aria-describedby="errors.capacity ? 'room-capacity-error' : undefined"
          />
          <p v-if="errors.capacity" id="room-capacity-error" class="text-destructive text-xs">
            {{ errors.capacity }}
          </p>
        </component>

        <component :is="motion.div" v-bind="staggeredEntry(3)" class="space-y-1.5">
          <p id="room-ages-label" class="text-sm font-medium">
            Accepted age groups
          </p>
          <div
            class="flex flex-wrap gap-1.5"
            role="group"
            aria-labelledby="room-ages-label"
            :aria-invalid="!!errors.accepted"
            :aria-describedby="errors.accepted ? 'room-ages-error' : undefined"
          >
            <button
              v-for="group in ageGroups"
              :key="group.id"
              type="button"
              class="rounded-md border px-2 py-1 text-xs font-medium transition-colors"
              :class="accepted.includes(group.id)
                ? 'bg-primary text-primary-foreground border-primary'
                : errors.accepted
                  ? 'border-destructive/50 text-muted-foreground hover:bg-muted'
                  : 'text-muted-foreground hover:bg-muted'"
              @click="toggleAge(group.id)"
            >
              {{ group.label }}
            </button>
          </div>
          <p v-if="errors.accepted" id="room-ages-error" class="text-destructive text-xs">
            {{ errors.accepted }}
          </p>
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
