<script setup lang="ts">
import type { YearMonth } from '~/types/capacity'
import { ChevronLeft, ChevronRight } from '@lucide/vue'

const props = defineProps<{
  /** Currently active month, highlighted in the grid. */
  modelValue: YearMonth | null
  /** Only these months are selectable; everything else is disabled. */
  availableMonths: YearMonth[]
}>()

const emit = defineEmits<{
  (event: 'update:modelValue', value: YearMonth): void
}>()

const MONTH_LABELS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
]

const available = computed(() => new Set<string>(props.availableMonths))

const years = computed(() =>
  props.availableMonths.map(month => Number(month.slice(0, 4))),
)

const fallbackYear = new Date().getFullYear()
const minYear = computed(() =>
  years.value.length ? Math.min(...years.value) : fallbackYear,
)
const maxYear = computed(() =>
  years.value.length ? Math.max(...years.value) : fallbackYear,
)

const displayYear = ref(
  Number((props.modelValue ?? props.availableMonths.at(-1))?.slice(0, 4)) || fallbackYear,
)

// Keep the visible year in sync when the selection changes externally.
watch(() => props.modelValue, (month) => {
  if (month) {
    displayYear.value = Number(month.slice(0, 4))
  }
})

function yearMonth(monthIndex: number): YearMonth {
  return `${displayYear.value}-${String(monthIndex + 1).padStart(2, '0')}` as YearMonth
}
</script>

<template>
  <div class="w-64 p-3">
    <div class="flex items-center justify-between">
      <UiButton
        variant="ghost"
        size="icon-sm"
        aria-label="Previous year"
        :disabled="displayYear <= minYear"
        @click="displayYear--"
      >
        <ChevronLeft class="size-4" />
      </UiButton>
      <span class="text-sm font-semibold tabular-nums">{{ displayYear }}</span>
      <UiButton
        variant="ghost"
        size="icon-sm"
        aria-label="Next year"
        :disabled="displayYear >= maxYear"
        @click="displayYear++"
      >
        <ChevronRight class="size-4" />
      </UiButton>
    </div>

    <div class="mt-3 grid grid-cols-4 gap-1">
      <button
        v-for="(label, index) in MONTH_LABELS"
        :key="label"
        type="button"
        class="focus-visible:ring-ring h-9 rounded-md text-sm font-medium transition-colors outline-none focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-35"
        :class="modelValue === yearMonth(index)
          ? 'bg-primary text-primary-foreground shadow-sm'
          : 'hover:bg-accent/15 hover:text-foreground text-foreground/80'"
        :disabled="!available.has(yearMonth(index))"
        @click="emit('update:modelValue', yearMonth(index))"
      >
        {{ label }}
      </button>
    </div>
  </div>
</template>
