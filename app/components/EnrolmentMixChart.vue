<script setup lang="ts">
import type { AgeGroup, AttendanceType } from '~/types/capacity'
import type { CentreSummary } from '~/lib/capacity'

const props = defineProps<{
  centres: CentreSummary[]
  ageGroups: AgeGroup[]
  attendanceTypes: AttendanceType[]
}>()

const view = ref<'age' | 'attendance'>('age')

/** Six slots: five chart tokens plus a neutral for the sixth age group. */
const palette = [
  'bg-chart-1',
  'bg-chart-2',
  'bg-chart-3',
  'bg-chart-4',
  'bg-chart-5',
  'bg-foreground/40',
]

const categories = computed(() =>
  view.value === 'age'
    ? props.ageGroups.map(group => ({ id: group.id as string, label: group.label }))
    : props.attendanceTypes.map(type => ({ id: type.id as string, label: type.label })),
)

interface Segment {
  id: string
  label: string
  count: number
  percent: number
  colorClass: string
}

const rows = computed(() =>
  props.centres.map((centre) => {
    const enrolments = centre.classrooms.flatMap(room => room.enrolments)
    const counts = new Map<string, number>()
    for (const enrolment of enrolments) {
      const key = view.value === 'age' ? enrolment.age_group : enrolment.attendance_type
      counts.set(key, (counts.get(key) ?? 0) + 1)
    }
    const total = enrolments.length
    const segments: Segment[] = categories.value.map((category, index) => {
      const count = counts.get(category.id) ?? 0
      return {
        id: category.id,
        label: category.label,
        count,
        percent: total > 0 ? (count / total) * 100 : 0,
        colorClass: palette[index % palette.length]!,
      }
    })
    return { centre: centre.centre, total, segments }
  }),
)

/** Legend totals across all centres. */
const legend = computed(() =>
  categories.value.map((category, index) => ({
    ...category,
    colorClass: palette[index % palette.length]!,
    total: rows.value.reduce(
      (sum, row) => sum + (row.segments.find(s => s.id === category.id)?.count ?? 0),
      0,
    ),
  })),
)
</script>

<template>
  <UiCard size="sm" class="gap-4">
    <UiCardHeader>
      <UiCardTitle class="text-sm">
        Enrolment mix
      </UiCardTitle>
      <UiCardDescription class="text-xs">
        Assigned children per centre, by {{ view === 'age' ? 'age group' : 'attendance type' }}.
      </UiCardDescription>
      <UiCardAction>
        <UiTabs v-model="view">
          <UiTabsList class="h-8">
            <UiTabsTrigger value="age" class="px-2.5 text-xs">
              Age group
            </UiTabsTrigger>
            <UiTabsTrigger value="attendance" class="px-2.5 text-xs">
              Attendance
            </UiTabsTrigger>
          </UiTabsList>
        </UiTabs>
      </UiCardAction>
    </UiCardHeader>

    <UiCardContent class="space-y-4">
      <div class="space-y-3">
        <div v-for="row in rows" :key="row.centre.id">
          <div class="mb-1 flex items-baseline justify-between gap-2 text-sm">
            <span class="min-w-0 truncate font-medium">{{ row.centre.name }}</span>
            <span class="text-muted-foreground shrink-0 text-xs tabular-nums">
              {{ row.total }} {{ row.total === 1 ? 'child' : 'children' }}
            </span>
          </div>
          <div
            v-if="row.total > 0"
            class="flex h-3 gap-px overflow-hidden rounded-full"
            role="img"
            :aria-label="`${row.centre.name} enrolment breakdown`"
          >
            <div
              v-for="segment in row.segments.filter(s => s.count > 0)"
              :key="segment.id"
              class="h-full transition-[width] duration-500 ease-out first:rounded-l-full last:rounded-r-full"
              :class="segment.colorClass"
              :style="{ width: `${segment.percent}%` }"
              :title="`${segment.label}: ${segment.count}`"
            />
          </div>
          <div v-else class="bg-muted h-3 rounded-full" />
        </div>
      </div>

      <div class="flex flex-wrap gap-x-4 gap-y-1.5 border-t pt-3">
        <span
          v-for="item in legend"
          :key="item.id"
          class="text-muted-foreground flex items-center gap-1.5 text-xs"
        >
          <span class="size-2.5 shrink-0 rounded-[3px]" :class="item.colorClass" />
          {{ item.label }}
          <span class="text-foreground font-medium tabular-nums">{{ item.total }}</span>
        </span>
      </div>
    </UiCardContent>
  </UiCard>
</template>
