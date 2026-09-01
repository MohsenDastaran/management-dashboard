<script setup lang="ts">
const { isDark } = useTheme()
</script>

<template>
  <UiSidebarProvider>
    <AppSidebar />
    <UiSidebarInset>
      <AppNavbar />
      <div class="flex flex-1 flex-col gap-4 p-4 md:p-6">
        <slot />
      </div>
    </UiSidebarInset>
  </UiSidebarProvider>
  <UiSonner :theme="isDark ? 'dark' : 'light'" position="bottom-right" />
</template>
