<script setup lang="ts">
import type { AgeGroup } from '~/types/capacity'
import type { ClassroomSummary } from '~/lib/capacity'
import { motion } from 'motion-v'
import { toast } from 'vue-sonner'

const props = defineProps<{
  room: ClassroomSummary
  ageGroups: AgeGroup[]
}>()

const open = defineModel<boolean>('open', { default: false })

const { patchClassroom } = useLocalEdits()

const name = ref(props.room.classroom.name)
const capacity = ref(props.room.classroom.capacity)
const accepted = ref([...props.room.classroom.accepted_age_group_ids])

watch(open, (isOpen) => {
  if (isOpen) {
    name.value = props.room.classroom.name
    capacity.value = props.room.classroom.capacity
    accepted.value = [...props.room.classroom.accepted_age_group_ids]
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
  const parsedCapacity = Number(capacity.value)
  patchClassroom(props.room.classroom.id, {
    name: name.value.trim() || props.room.classroom.name,
    capacity: Number.isFinite(parsedCapacity) && parsedCapacity >= 0
      ? Math.floor(parsedCapacity)
      : props.room.classroom.capacity,
    accepted_age_group_ids: accepted.value,
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
    :title="`Edit room ${room.classroom.name}`"
    description="Changes stay on this device until you refresh or switch month."
  >
    <template #default="{ staggeredEntry }">
      <form class="mt-5 space-y-4" @submit.prevent="apply">
        <component :is="motion.div" v-bind="staggeredEntry(1)" class="space-y-1.5">
          <label class="text-sm font-medium" for="room-name">Name</label>
          <UiInput id="room-name" v-model="name" />
        </component>

        <component :is="motion.div" v-bind="staggeredEntry(2)" class="space-y-1.5">
          <label class="text-sm font-medium" for="room-capacity">Capacity</label>
          <UiInput
            id="room-capacity"
            v-model="capacity"
            type="number"
            min="0"
            step="1"
          />
        </component>

        <component :is="motion.div" v-bind="staggeredEntry(3)" class="space-y-1.5">
          <p class="text-sm font-medium">
            Accepted age groups
          </p>
          <div class="flex flex-wrap gap-1.5">
            <button
              v-for="group in ageGroups"
              :key="group.id"
              type="button"
              class="rounded-md border px-2 py-1 text-xs font-medium transition-colors"
              :class="accepted.includes(group.id)
                ? 'bg-primary text-primary-foreground border-primary'
                : 'text-muted-foreground hover:bg-muted'"
              @click="toggleAge(group.id)"
            >
              {{ group.label }}
            </button>
          </div>
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
