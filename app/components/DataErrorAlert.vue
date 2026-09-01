<script setup lang="ts">
import type { FetchError } from 'ofetch'
import { CalendarX2, CircleAlert, RefreshCw, Undo2 } from '@lucide/vue'

defineProps<{
  /** Title used for generic (non-month) failures. */
  title: string
  error?: FetchError | Error | null
  monthError?: string | null
  /** Invalid payload or processing failure after a successful fetch. */
  message?: string | null
}>()

const emit = defineEmits<{
  retry: []
}>()

const selectedMonth = useReportingMonth()
</script>

<template>
  <UiAlert variant="destructive">
    <CalendarX2 v-if="monthError" />
    <CircleAlert v-else />
    <UiAlertTitle>
      {{ monthError ? 'Reporting month unavailable' : message ? 'Capacity data is not valid' : title }}
    </UiAlertTitle>
    <UiAlertDescription>
      {{ monthError
        || message
        || (error && 'statusMessage' in error ? error.statusMessage : null)
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
      <UiButton v-else variant="outline" size="sm" @click="emit('retry')">
        <RefreshCw />
        Retry
      </UiButton>
    </UiAlertAction>
  </UiAlert>
</template>
