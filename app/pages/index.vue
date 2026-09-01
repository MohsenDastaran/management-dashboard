<template>
  <div class="space-y-2">
    <h1 class="text-2xl font-semibold tracking-tight">Overview</h1>
    <p class="text-muted-foreground max-w-2xl text-sm">
      Centre and classroom capacity will appear here in later steps. Use the
      sidebar to move around the dashboard.
    </p>
  </div>
</template>

<script setup lang="ts">
const { data, status, error, refresh } = useCapacityOverview();

console.log(data.value);
console.log(status.value);
console.log(error.value);
</script>
