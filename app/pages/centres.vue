<script setup lang="ts">
import { CircleAlert, Inbox, RefreshCw } from '@lucide/vue'

const { summary, isLoading, isEmpty, error, refresh } = useCapacityOverview()
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-semibold tracking-tight">
        Centres
      </h1>
      <p class="text-muted-foreground text-sm">
        Capacity and exceptions per centre. Select a centre to inspect its
        classrooms.
      </p>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="grid grid-cols-1 gap-4 md:grid-cols-2">
      <UiSkeleton v-for="n in 4" :key="n" class="h-44 rounded-xl" />
    </div>

    <!-- Error -->
    <UiAlert v-else-if="error" variant="destructive">
      <CircleAlert />
      <UiAlertTitle>Couldn't load centre data</UiAlertTitle>
      <UiAlertDescription>
        {{ error.statusMessage || error.message || 'The request failed. Check your connection and try again.' }}
      </UiAlertDescription>
      <UiAlertAction>
        <UiButton variant="outline" size="sm" @click="refresh()">
          <RefreshCw />
          Retry
        </UiButton>
      </UiAlertAction>
    </UiAlert>

    <!-- Empty -->
    <div
      v-else-if="isEmpty"
      class="text-muted-foreground flex flex-col items-center gap-3 rounded-xl border border-dashed py-16 text-center"
    >
      <Inbox class="size-8" />
      <p class="text-foreground font-medium">
        No centres to show for this month
      </p>
    </div>

    <!-- Data -->
    <div v-else-if="summary" class="grid grid-cols-1 gap-4 md:grid-cols-2">
      <NuxtLink
        v-for="centre in summary.centres"
        :key="centre.centre.id"
        :to="{ path: '/classrooms', query: { centre: centre.centre.id } }"
        class="focus-visible:ring-ring rounded-xl outline-none focus-visible:ring-2"
      >
        <CentreCard :summary="centre" class="h-full" />
      </NuxtLink>
    </div>
  </div>
</template>
