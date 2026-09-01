<script setup lang="ts">
import { Inbox } from '@lucide/vue'

const { summary, isLoading, isEmpty, error } = useCapacityOverview()
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
    <DataErrorAlert v-else-if="error" title="Couldn't load centre data" />

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
