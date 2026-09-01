<script setup lang="ts">
import { Calendar, ChevronsUpDown, Moon, Sun } from '@lucide/vue'

const route = useRoute()
const { isDark, toggle } = useTheme()

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
      <UiDropdownMenu>
        <UiDropdownMenuTrigger as-child>
          <UiButton variant="outline" size="sm">
            <Calendar class="size-4" />
            <span class="hidden sm:inline">Reporting month</span>
            <ChevronsUpDown class="size-3.5 opacity-50" />
          </UiButton>
        </UiDropdownMenuTrigger>
        <UiDropdownMenuContent align="end" class="w-52">
          <UiDropdownMenuLabel>Month selector</UiDropdownMenuLabel>
          <UiDropdownMenuItem disabled>
            Wired in Step 5
          </UiDropdownMenuItem>
        </UiDropdownMenuContent>
      </UiDropdownMenu>

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
