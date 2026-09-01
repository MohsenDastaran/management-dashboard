<script setup lang="ts">
import {
  CalendarDays,
  DoorOpen,
  Gauge,
  Inbox,
  TriangleAlert,
  Users,
  UserX,
} from '@lucide/vue'
import { formatMonth, formatPercent } from '~/lib/format'

const { data, summary, isLoading, isEmpty, error, monthError, processingError, refresh } = useCapacityOverview()

const kpis = computed(() => {
  if (!summary.value) {
    return []
  }
  const s = summary.value
  const exceptions = s.overCapacityCount + s.ageGroupMismatchCount

  return [
    {
      label: 'Total capacity',
      value: s.capacity,
      icon: DoorOpen,
      hint: `across ${s.centres.length} centres`,
      tone: 'default' as const,
    },
    {
      label: 'Occupied places',
      value: s.occupied,
      icon: Users,
      hint: `${s.available} places free`,
      tone: 'default' as const,
    },
    {
      label: 'Utilisation',
      value: formatPercent(s.utilization),
      icon: Gauge,
      hint: 'occupied / total places',
      tone: 'default' as const,
    },
    {
      label: 'Unassigned children',
      value: s.unassignedCount,
      icon: UserX,
      hint: 'not counted against rooms',
      tone: s.unassignedCount > 0 ? ('warning' as const) : ('default' as const),
    },
    {
      label: 'Exceptions',
      value: exceptions,
      icon: TriangleAlert,
      hint: `${s.overCapacityCount} over capacity · ${s.ageGroupMismatchCount} age mismatches`,
      tone: exceptions > 0 ? ('danger' as const) : ('default' as const),
    },
  ]
})
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 class="text-2xl font-semibold tracking-tight">
          Overview
        </h1>
        <p class="text-muted-foreground text-sm">
          Centre and classroom capacity at a glance.
        </p>
      </div>
      <UiBadge v-if="data" variant="secondary" class="h-6">
        <CalendarDays />
        {{ formatMonth(data.meta.month) }}
      </UiBadge>
    </div>

    <!-- Loading -->
    <template v-if="isLoading">
      <div class="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
        <UiSkeleton v-for="n in 5" :key="n" class="h-28 rounded-xl" />
      </div>
      <div class="grid gap-4 lg:grid-cols-2">
        <UiSkeleton v-for="n in 2" :key="n" class="h-64 rounded-xl" />
      </div>
      <div class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <UiSkeleton v-for="n in 4" :key="n" class="h-44 rounded-xl" />
      </div>
    </template>

    <!-- Error -->
    <DataErrorAlert
      v-else-if="error || processingError"
      title="Couldn't load capacity data"
      :error="error"
      :month-error="monthError"
      :message="processingError"
      @retry="refresh()"
    />

    <!-- Empty -->
    <div
      v-else-if="isEmpty"
      class="text-muted-foreground flex flex-col items-center gap-3 rounded-xl border border-dashed py-16 text-center"
    >
      <Inbox class="size-8" />
      <div>
        <p class="text-foreground font-medium">
          No centres to show
        </p>
        <p class="text-sm">
          This reporting month has no centre or classroom data.
        </p>
      </div>
    </div>

    <!-- Data -->
    <template v-else-if="summary">
      <section aria-label="Key metrics" class="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
        <KpiCard
          v-for="kpi in kpis"
          :key="kpi.label"
          v-bind="kpi"
        />
      </section>

      <section aria-label="Insights" class="grid gap-4 lg:grid-cols-2">
        <UtilizationChart :centres="summary.centres" />
        <EnrolmentMixChart
          :centres="summary.centres"
          :age-groups="data?.age_groups ?? []"
          :attendance-types="data?.attendance_types ?? []"
        />
      </section>

      <section aria-label="Centres" class="space-y-3">
        <h2 class="text-lg font-semibold tracking-tight">
          Centres
        </h2>
        <div class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <CentreCard
            v-for="centre in summary.centres"
            :key="centre.centre.id"
            :summary="centre"
          />
        </div>
      </section>
    </template>
  </div>
</template>
