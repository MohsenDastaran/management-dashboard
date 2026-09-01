<script setup lang="ts">
import { CalendarX2, CircleAlert, RefreshCw, Undo2 } from '@lucide/vue'

defineProps<{
  /** Title used for generic (non-month) failures. */
  title: string
}>()

const selectedMonth = useReportingMonth()
const { error, monthError, refresh } = useCapacityOverview()
</script>

<template>
  <UiAlert variant="destructive">
    <CalendarX2 v-if="monthError" />
    <CircleAlert v-else />
    <UiAlertTitle>
      {{ monthError ? 'Reporting month unavailable' : title }}
    </UiAlertTitle>
    <UiAlertDescription>
      {{ monthError
        || error?.statusMessage
        || error?.message
        || 'The request failed. Check your connection and try again.' }}
    </UiAlertDescription>
    <UiAlertAction>
      <UiButton
        v-if="monthError"
        variant="outline"
        size="sm"
        @click="selectedMonth = null"
      >
        <Undo2 />
        Back to current month
      </UiButton>
      <UiButton v-else variant="outline" size="sm" @click="refresh()">
        <RefreshCw />
        Retry
      </UiButton>
    </UiAlertAction>
  </UiAlert>
</template>
