<script setup lang="ts">
import { Calendar, ChevronsUpDown, Moon, Sun } from '@lucide/vue'
import { formatMonth } from '~/lib/format'

const route = useRoute()
const { isDark, toggle } = useTheme()

const selectedMonth = useReportingMonth()
const { data, availableMonths, isLoading } = useCapacityOverview()

/**
 * The API's own current reporting month, captured from the first response
 * that was fetched without an explicit month.
 */
const currentMonth = useState<string | null>('current-reporting-month', () => null)
watch(data, (payload) => {
  if (payload && selectedMonth.value === null) {
    currentMonth.value = payload.meta.month
  }
}, { immediate: true })

/** Month shown on the button: explicit selection, else the API's default. */
const activeMonth = computed(() => selectedMonth.value ?? data.value?.meta.month ?? null)

const pickerOpen = ref(false)

function selectMonth(month: string) {
  // Selecting the API's default month clears the override entirely.
  selectedMonth.value = month === currentMonth.value ? null : (month as typeof selectedMonth.value)
  pickerOpen.value = false
}

const crumbs = computed(() => {
  const segments = route.path.split('/').filter(Boolean)
  if (segments.length === 0) {
    return [{ label: 'Overview', to: '/', current: true }]
  }

  return segments.map((segment, index) => {
    const to = `/${segments.slice(0, index + 1).join('/')}`
    const label = segment.charAt(0).toUpperCase() + segment.slice(1)
    return { label, to, current: index === segments.length - 1 }
  })
})
</script>

<template>
  <header class="bg-background/80 sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b px-4 backdrop-blur-md">
    <UiSidebarTrigger class="-ml-1 mr-1" />

    <UiBreadcrumb>
      <UiBreadcrumbList>
        <UiBreadcrumbItem class="hidden sm:block">
          <UiBreadcrumbLink as-child>
            <NuxtLink to="/">
              Dashboard
            </NuxtLink>
          </UiBreadcrumbLink>
        </UiBreadcrumbItem>
        <UiBreadcrumbSeparator class="hidden sm:block" />
        <template v-for="(crumb, index) in crumbs" :key="crumb.to">
          <UiBreadcrumbItem>
            <UiBreadcrumbPage v-if="crumb.current">
              {{ crumb.label }}
            </UiBreadcrumbPage>
            <UiBreadcrumbLink v-else as-child>
              <NuxtLink :to="crumb.to">
                {{ crumb.label }}
              </NuxtLink>
            </UiBreadcrumbLink>
          </UiBreadcrumbItem>
          <UiBreadcrumbSeparator v-if="index < crumbs.length - 1" />
        </template>
      </UiBreadcrumbList>
    </UiBreadcrumb>

    <div class="ml-auto flex items-center gap-2">
      <UiPopover v-model:open="pickerOpen">
        <UiPopoverTrigger as-child>
          <UiButton variant="outline" size="sm" :disabled="isLoading && !data">
            <Calendar class="size-4" />
            <span class="hidden sm:inline">
              {{ activeMonth ? formatMonth(activeMonth) : 'Reporting month' }}
            </span>
            <ChevronsUpDown class="size-3.5 opacity-50" />
          </UiButton>
        </UiPopoverTrigger>
        <UiPopoverContent align="end" class="w-auto p-0">
          <MonthPicker
            :model-value="activeMonth"
            :available-months="availableMonths"
            @update:model-value="selectMonth"
          />
        </UiPopoverContent>
      </UiPopover>

      <UiButton
        variant="ghost"
        size="icon-sm"
        aria-label="Toggle theme"
        @click="toggle()"
      >
        <Sun v-if="isDark" class="size-4" />
        <Moon v-else class="size-4" />
      </UiButton>
    </div>
  </header>
</template>
