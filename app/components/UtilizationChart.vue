<script setup lang="ts">
import type { CentreSummary } from '~/lib/capacity'
import {
  formatPercent,
  utilizationTextClass,
  utilizationTone,
} from '~/lib/format'
import type { UtilizationTone } from '~/lib/format'

const props = defineProps<{
  centres: CentreSummary[]
}>()

const view = ref<'centres' | 'rooms'>('centres')

const barClass: Record<UtilizationTone, string> = {
  ok: 'bg-primary',
  high: 'bg-warning',
  over: 'bg-destructive',
}

interface Row {
  id: string
  label: string
  sublabel: string | null
  occupied: number
  capacity: number
  utilization: number | null
}

const rows = computed<Row[]>(() => {
  if (view.value === 'centres') {
    return props.centres.map(centre => ({
      id: centre.centre.id,
      label: centre.centre.name,
      sublabel: null,
      occupied: centre.occupied,
      capacity: centre.capacity,
      utilization: centre.utilization,
    }))
  }
  return props.centres.flatMap(centre =>
    centre.classrooms.map(room => ({
      id: room.classroom.id,
      label: room.classroom.name,
      sublabel: centre.centre.abbreviation,
      occupied: room.occupied,
      capacity: room.classroom.capacity,
      utilization: room.utilization,
    })),
  )
})
</script>

<template>
  <UiCard size="sm" class="gap-4">
    <UiCardHeader>
      <UiCardTitle class="text-sm">
        Utilization
      </UiCardTitle>
      <UiCardDescription class="text-xs">
        Occupied share of physical places.
      </UiCardDescription>
      <UiCardAction>
        <UiTabs v-model="view">
          <UiTabsList class="h-8">
            <UiTabsTrigger value="centres" class="px-2.5 text-xs">
              Centres
            </UiTabsTrigger>
            <UiTabsTrigger value="rooms" class="px-2.5 text-xs">
              Rooms
            </UiTabsTrigger>
          </UiTabsList>
        </UiTabs>
      </UiCardAction>
    </UiCardHeader>

    <UiCardContent>
      <div
        class="space-y-3"
        :class="view === 'rooms' ? 'max-h-72 overflow-y-auto pr-2' : ''"
      >
        <div v-for="row in rows" :key="row.id">
          <div class="mb-1 flex items-baseline justify-between gap-2 text-sm">
            <span class="min-w-0 truncate font-medium">
              {{ row.label }}
              <span v-if="row.sublabel" class="text-muted-foreground ml-0.5 text-xs font-normal">
                {{ row.sublabel }}
              </span>
            </span>
            <span class="text-muted-foreground shrink-0 text-xs tabular-nums">
              {{ row.occupied }}/{{ row.capacity }}
              <span
                class="ml-1 font-semibold"
                :class="utilizationTextClass[utilizationTone(row.utilization)]"
              >
                {{ formatPercent(row.utilization) }}
              </span>
            </span>
          </div>
          <UiTooltip>
            <UiTooltipTrigger as-child>
              <div
                class="bg-muted h-2.5 cursor-default overflow-hidden rounded-full"
                role="img"
                :aria-label="`${row.label}: ${row.occupied} of ${row.capacity} places occupied`"
              >
                <div
                  class="h-full rounded-full transition-[width] duration-700 ease-out"
                  :class="barClass[utilizationTone(row.utilization)]"
                  :style="{ width: `${Math.min(100, (row.utilization ?? 0) * 100)}%` }"
                />
              </div>
            </UiTooltipTrigger>
            <UiTooltipContent side="top">
              {{ row.label }}
              <span v-if="row.sublabel" class="opacity-70">{{ row.sublabel }}</span>
              <span class="opacity-70 tabular-nums">
                {{ row.occupied }}/{{ row.capacity }} · {{ formatPercent(row.utilization) }}
              </span>
            </UiTooltipContent>
          </UiTooltip>
        </div>
      </div>
    </UiCardContent>
  </UiCard>
</template>
