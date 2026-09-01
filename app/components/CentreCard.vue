<script setup lang="ts">
import type { CentreSummary } from '~/lib/capacity'
import { TriangleAlert, UserX, Users } from '@lucide/vue'
import {
  formatPercent,
  utilizationBarClass,
  utilizationTextClass,
  utilizationTone,
} from '~/lib/format'

const props = defineProps<{
  summary: CentreSummary
}>()

const tone = computed(() => utilizationTone(props.summary.utilization))

const progressValue = computed(() =>
  Math.min(100, Math.round((props.summary.utilization ?? 0) * 100)),
)

const needsAttention = computed(
  () =>
    props.summary.overCapacityCount > 0
    || props.summary.ageGroupMismatchCount > 0
    || props.summary.unassigned.length > 0,
)
</script>

<template>
  <UiCard
    size="sm"
    class="group hover:ring-primary/30 gap-4 transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-md"
  >
    <UiCardHeader class="flex-row items-center gap-3">
      <div class="bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground flex size-9 shrink-0 items-center justify-center rounded-md text-xs font-bold transition-colors duration-200">
        {{ summary.centre.abbreviation }}
      </div>
      <div class="min-w-0 flex-1">
        <UiCardTitle class="truncate text-sm">
          {{ summary.centre.name }}
        </UiCardTitle>
        <UiCardDescription class="text-xs">
          {{ summary.classrooms.length }} classrooms
        </UiCardDescription>
      </div>
      <span
        class="text-sm font-semibold tabular-nums"
        :class="utilizationTextClass[tone]"
      >
        {{ formatPercent(summary.utilization) }}
      </span>
    </UiCardHeader>

    <UiCardContent class="space-y-3">
      <div>
        <UiProgress
          :model-value="progressValue"
          :class="utilizationBarClass[tone]"
          :aria-label="`${summary.centre.name} utilization`"
        />
        <div class="text-muted-foreground mt-1.5 flex justify-between text-xs tabular-nums">
          <span>
            <Users class="mr-1 inline size-3 align-[-1px]" />
            {{ summary.occupied }} / {{ summary.capacity }} places
          </span>
          <span v-if="summary.available >= 0">{{ summary.available }} free</span>
          <span v-else class="text-destructive font-medium">
            {{ -summary.available }} over
          </span>
        </div>
      </div>

      <div v-if="needsAttention" class="flex flex-wrap gap-1.5">
        <UiBadge v-if="summary.overCapacityCount > 0" variant="destructive">
          <TriangleAlert />
          {{ summary.overCapacityCount }} over capacity
        </UiBadge>
        <UiBadge
          v-if="summary.ageGroupMismatchCount > 0"
          variant="outline"
          class="text-warning border-warning/40"
        >
          <TriangleAlert />
          {{ summary.ageGroupMismatchCount }} age mismatch{{ summary.ageGroupMismatchCount === 1 ? '' : 'es' }}
        </UiBadge>
        <UiBadge
          v-if="summary.unassigned.length > 0"
          variant="outline"
        >
          <UserX />
          {{ summary.unassigned.length }} unassigned
        </UiBadge>
      </div>
      <p v-else class="text-muted-foreground text-xs">
        No exceptions this month.
      </p>
    </UiCardContent>
  </UiCard>
</template>
