<script setup lang="ts">
import type { Component } from 'vue'

withDefaults(defineProps<{
  label: string
  value: string | number
  icon: Component
  hint?: string
  tone?: 'default' | 'warning' | 'danger'
}>(), {
  tone: 'default',
})

const toneClasses = {
  default: 'bg-primary/10 text-primary',
  warning: 'bg-warning/15 text-warning',
  danger: 'bg-destructive/10 text-destructive',
}
</script>

<template>
  <UiCard
    size="sm"
    class="group gap-3 transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-md hover:ring-primary/25"
  >
    <UiCardHeader class="flex-row items-center justify-between">
      <UiCardDescription class="text-xs font-medium tracking-wide uppercase">
        {{ label }}
      </UiCardDescription>
      <div
        class="flex size-8 shrink-0 items-center justify-center rounded-md transition-transform duration-200 ease-out group-hover:scale-110 group-hover:-rotate-3"
        :class="toneClasses[tone]"
      >
        <component :is="icon" class="size-4" />
      </div>
    </UiCardHeader>
    <UiCardContent class="space-y-1">
      <div class="text-2xl font-semibold tracking-tight tabular-nums">
        {{ value }}
      </div>
      <p v-if="hint" class="text-muted-foreground text-xs">
        {{ hint }}
      </p>
    </UiCardContent>
  </UiCard>
</template>
