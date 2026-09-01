<script setup lang="ts">
const route = useRoute()

const pageTitles: Record<string, string> = {
  '/': 'Overview',
  '/centres': 'Centres',
  '/classrooms': 'Classrooms',
  '/children': 'Children',
}

const pageTitle = computed(() => pageTitles[route.path] ?? 'Dashboard')

useHead({
  title: pageTitle,
  titleTemplate: (title) => {
    if (!title || title === 'Capacity') {
      return 'Capacity'
    }
    return `${title} · Capacity`
  },
})

useSeoMeta({
  ogTitle: () => `${pageTitle.value} · Capacity`,
})
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
