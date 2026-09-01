<script setup lang="ts">
import type { Component } from "vue";
import { Baby, Building2, LayoutDashboard, School } from "@lucide/vue";

interface NavItem {
  title: string;
  to: string;
  icon: Component;
}

const route = useRoute();

const items: NavItem[] = [
  { title: "Overview", to: "/", icon: LayoutDashboard },
  { title: "Centres", to: "/centres", icon: Building2 },
  { title: "Classrooms", to: "/classrooms", icon: School },
  { title: "Children", to: "/children", icon: Baby },
];

function isActive(path: string) {
  if (path === "/") {
    return route.path === "/";
  }
  return route.path === path || route.path.startsWith(`${path}/`);
}
</script>

<template>
  <UiSidebar collapsible="icon">
    <UiSidebarHeader class="border-sidebar-border h-14 justify-center border-b">
      <UiSidebarMenu>
        <UiSidebarMenuItem>
          <UiSidebarMenuButton
            size="lg"
            tooltip="Capacity"
            class="hover:bg-transparent active:bg-transparent hover:translate-x-0 [&:hover_img]:scale-100"
          >
            <img
              src="/logo.svg"
              alt=""
              width="32"
              height="32"
              class="size-8 shrink-0 rounded-md"
            />
            <div class="grid flex-1 text-left leading-tight">
              <span class="truncate text-sm font-semibold tracking-tight"
                >Company Name</span
              >
              <span class="text-sidebar-foreground/60 truncate text-[11px]"
                >Capacity dashboard</span
              >
            </div>
          </UiSidebarMenuButton>
        </UiSidebarMenuItem>
      </UiSidebarMenu>
    </UiSidebarHeader>

    <UiSidebarContent>
      <UiSidebarGroup>
        <UiSidebarGroupLabel
          class="text-sidebar-foreground/50 text-[11px] font-medium tracking-widest uppercase"
        >
          Planning
        </UiSidebarGroupLabel>
        <UiSidebarGroupContent>
          <UiSidebarMenu>
            <UiSidebarMenuItem v-for="item in items" :key="item.to">
              <UiSidebarMenuButton
                as-child
                :is-active="isActive(item.to)"
                :tooltip="item.title"
                class="h-9 font-medium"
              >
                <NuxtLink :to="item.to">
                  <component :is="item.icon" class="size-4" />
                  <span>{{ item.title }}</span>
                </NuxtLink>
              </UiSidebarMenuButton>
            </UiSidebarMenuItem>
          </UiSidebarMenu>
        </UiSidebarGroupContent>
      </UiSidebarGroup>
    </UiSidebarContent>

    <UiSidebarRail />
  </UiSidebar>
</template>
