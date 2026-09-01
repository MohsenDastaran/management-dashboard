<script setup lang="ts">
import type { CentreSummary, ClassroomSummary } from '~/lib/capacity'
import {
  Inbox,
  SearchX,
  TriangleAlert,
} from '@lucide/vue'
import { formatPercent } from '~/lib/format'

interface CentreGroup {
  centre: CentreSummary
  rooms: ClassroomSummary[]
}

const route = useRoute()
const router = useRouter()
const { data, summary, isLoading, isEmpty, error } = useCapacityOverview()

const centreFilter = ref<string>(
  typeof route.query.centre === 'string' ? route.query.centre : 'all',
)
const exceptionsOnly = ref(route.query.exceptions === '1')

watch([centreFilter, exceptionsOnly], ([centre, exceptions]) => {
  router.replace({
    query: {
      ...route.query,
      centre: centre === 'all' ? undefined : centre,
      exceptions: exceptions ? '1' : undefined,
    },
  })
})

const groups = computed<CentreGroup[]>(() => {
  if (!summary.value) {
    return []
  }
  return summary.value.centres
    .filter(centre => centreFilter.value === 'all' || centre.centre.id === centreFilter.value)
    .map(centre => ({
      centre,
      rooms: centre.classrooms.filter(
        room =>
          !exceptionsOnly.value
          || room.isOverCapacity
          || room.ageGroupMismatches.length > 0,
      ),
    }))
    .filter(group => group.rooms.length > 0)
})

const shownRooms = computed(() =>
  groups.value.reduce((total, group) => total + group.rooms.length, 0),
)
const totalRooms = computed(() => summary.value
  ? summary.value.centres.reduce((total, centre) => total + centre.classrooms.length, 0)
  : 0)

const ageGroupLabels = computed(
  () => new Map(data.value?.age_groups.map(group => [group.id, group.label]) ?? []),
)
const attendanceAbbr = computed(
  () => new Map(data.value?.attendance_types.map(type => [type.id, type.abbreviation]) ?? []),
)

function clearFilters() {
  centreFilter.value = 'all'
  exceptionsOnly.value = false
}
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-semibold tracking-tight">
        Classrooms
      </h1>
      <p class="text-muted-foreground text-sm">
        Room-level occupancy, accepted age groups, and exception signals.
      </p>
    </div>

    <!-- Loading -->
    <template v-if="isLoading">
      <div class="flex gap-3">
        <UiSkeleton class="h-9 w-48" />
        <UiSkeleton class="h-9 w-40" />
      </div>
      <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <UiSkeleton v-for="index in 6" :key="index" class="h-56 rounded-xl" />
      </div>
    </template>

    <!-- Error -->
    <DataErrorAlert v-else-if="error" title="Couldn't load classroom data" />

    <!-- Empty -->
    <div
      v-else-if="isEmpty"
      class="text-muted-foreground flex flex-col items-center gap-3 rounded-xl border border-dashed py-16 text-center"
    >
      <Inbox class="size-8" />
      <p class="text-foreground font-medium">
        No classroom data for this month
      </p>
    </div>

    <!-- Data -->
    <template v-else-if="summary">
      <div class="flex flex-wrap items-center gap-x-4 gap-y-3">
        <UiSelect v-model="centreFilter">
          <UiSelectTrigger class="w-44">
            <UiSelectValue placeholder="All centres" />
          </UiSelectTrigger>
          <UiSelectContent>
            <UiSelectItem value="all">
              All centres
            </UiSelectItem>
            <UiSelectItem
              v-for="centre in summary.centres"
              :key="centre.centre.id"
              :value="centre.centre.id"
            >
              {{ centre.centre.name }}
            </UiSelectItem>
          </UiSelectContent>
        </UiSelect>

        <label class="flex cursor-pointer items-center gap-2 text-sm">
          <UiSwitch v-model="exceptionsOnly" size="sm" />
          Exceptions only
        </label>

        <span class="text-muted-foreground ml-auto text-sm tabular-nums">
          {{ shownRooms }} of {{ totalRooms }} rooms
        </span>
      </div>

      <!-- No rooms match filters -->
      <div
        v-if="groups.length === 0"
        class="text-muted-foreground flex flex-col items-center gap-3 rounded-xl border border-dashed py-16 text-center"
      >
        <SearchX class="size-8" />
        <p class="text-foreground font-medium">
          No rooms match the current filters
        </p>
        <UiButton variant="outline" size="sm" @click="clearFilters">
          Clear filters
        </UiButton>
      </div>

      <section
        v-for="group in groups"
        :key="group.centre.centre.id"
        class="space-y-3"
      >
        <div class="flex flex-wrap items-center gap-x-3 gap-y-2">
          <div class="bg-primary/10 text-primary flex size-8 shrink-0 items-center justify-center rounded-md text-xs font-bold">
            {{ group.centre.centre.abbreviation }}
          </div>
          <h2 class="text-base font-semibold tracking-tight">
            {{ group.centre.centre.name }}
          </h2>
          <span class="text-muted-foreground text-sm tabular-nums">
            {{ group.rooms.length }} room{{ group.rooms.length === 1 ? '' : 's' }}
            · {{ group.centre.occupied }}/{{ group.centre.capacity }} places
            · {{ formatPercent(group.centre.utilization) }}
          </span>
          <span class="flex flex-wrap gap-1.5">
            <UiBadge v-if="group.centre.overCapacityCount > 0" variant="destructive">
              <TriangleAlert />
              {{ group.centre.overCapacityCount }} over capacity
            </UiBadge>
            <UiBadge
              v-if="group.centre.ageGroupMismatchCount > 0"
              variant="outline"
              class="text-warning border-warning/40"
            >
              <TriangleAlert />
              {{ group.centre.ageGroupMismatchCount }} age mismatch{{ group.centre.ageGroupMismatchCount === 1 ? '' : 'es' }}
            </UiBadge>
          </span>
        </div>

        <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <ClassroomCard
            v-for="room in group.rooms"
            :key="room.classroom.id"
            :room="room"
            :age-group-labels="ageGroupLabels"
            :attendance-abbr="attendanceAbbr"
          />
        </div>
      </section>
    </template>
  </div>
</template>
