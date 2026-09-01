<script setup lang="ts">
import type { ClassroomSummary } from "~/lib/capacity";
import { ChevronDown, CircleCheck, TriangleAlert } from "@lucide/vue";
import {
  formatPercent,
  initials,
  utilizationBarClass,
  utilizationTextClass,
  utilizationTone,
} from "~/lib/format";

const props = defineProps<{
  room: ClassroomSummary;
  ageGroupLabels: Map<string, string>;
  attendanceAbbr: Map<string, string>;
}>();

const open = ref(false);

const tone = computed(() => utilizationTone(props.room.utilization));

const accentClass: Record<string, string> = {
  ok: "bg-primary/20",
  high: "bg-warning",
  over: "bg-destructive",
};

const mismatchIds = computed(
  () => new Set(props.room.ageGroupMismatches.map((enrolment) => enrolment.id)),
);

const hasIssues = computed(
  () => props.room.isOverCapacity || props.room.ageGroupMismatches.length > 0,
);
</script>

<template>
  <UiCard
    size="sm"
    class="gap-0 overflow-hidden py-0 transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-md"
    :class="
      room.isOverCapacity ? 'ring-destructive/30' : 'hover:ring-primary/25'
    "
  >
    <div class="flex flex-1 flex-col gap-3 p-4">
      <div class="flex items-start justify-between gap-2">
        <div class="min-w-0">
          <p class="truncate text-sm font-semibold">
            {{ room.classroom.name }}
          </p>
          <p class="text-muted-foreground text-xs">
            Capacity {{ room.classroom.capacity }}
          </p>
        </div>
        <div class="flex shrink-0 flex-wrap justify-end gap-1">
          <UiBadge v-if="room.isOverCapacity" variant="destructive">
            <TriangleAlert />
            Over capacity
          </UiBadge>
          <UiBadge
            v-if="room.ageGroupMismatches.length > 0"
            variant="outline"
            class="text-warning border-warning/40"
          >
            <TriangleAlert />
            {{ room.ageGroupMismatches.length }} age mismatch{{
              room.ageGroupMismatches.length === 1 ? "" : "es"
            }}
          </UiBadge>
          <UiBadge
            v-if="!hasIssues"
            variant="ghost"
            class="text-muted-foreground"
          >
            <CircleCheck class="text-primary" />
            OK
          </UiBadge>
        </div>
      </div>

      <div>
        <div class="mb-1 flex items-baseline justify-between">
          <p class="text-2xl font-semibold tracking-tight tabular-nums">
            {{ room.occupied
            }}<span class="text-muted-foreground text-sm font-normal"
              >/{{ room.classroom.capacity }} places</span
            >
          </p>
          <span
            class="text-sm font-semibold tabular-nums"
            :class="utilizationTextClass[tone]"
          >
            {{ formatPercent(room.utilization) }}
          </span>
        </div>
        <UiProgress
          :model-value="
            Math.min(100, Math.round((room.utilization ?? 0) * 100))
          "
          :class="utilizationBarClass[tone]"
          :aria-label="`Room ${room.classroom.name} utilization`"
        />
        <div
          class="text-muted-foreground mt-1.5 flex justify-between text-xs tabular-nums"
        >
          <span v-if="room.available >= 0">{{ room.available }} free</span>
          <span v-else class="text-destructive font-medium"
            >{{ -room.available }} over capacity</span
          >
          <span>
            FT {{ room.counts.fullTime }} · 3D {{ room.counts.threeDay }} · 2D
            {{ room.counts.twoDay }}
          </span>
        </div>
      </div>

      <div class="flex flex-wrap gap-1">
        <UiBadge
          v-for="ageGroup in room.classroom.accepted_age_group_ids"
          :key="ageGroup"
          variant="secondary"
          class="font-normal"
        >
          {{ ageGroupLabels.get(ageGroup) ?? ageGroup }}
        </UiBadge>
      </div>

      <UiCollapsible v-model:open="open" class="mt-auto">
        <UiCollapsibleTrigger
          class="text-muted-foreground hover:text-foreground flex w-full cursor-pointer items-center justify-between border-t pt-2.5 text-xs font-medium transition-colors"
        >
          <span>
            {{ room.enrolments.length }} child{{
              room.enrolments.length === 1 ? "" : "ren"
            }}
            assigned
            <template v-if="room.sharedPairs > 0">
              · {{ room.sharedPairs }} shared place{{
                room.sharedPairs === 1 ? "" : "s"
              }}
            </template>
          </span>
          <ChevronDown
            class="size-3.5 transition-transform duration-200"
            :class="open ? 'rotate-180' : ''"
          />
        </UiCollapsibleTrigger>
        <UiCollapsibleContent>
          <div
            v-if="room.enrolments.length"
            class="mt-2.5 flex max-h-36 flex-wrap content-start gap-1.5 overflow-y-auto overscroll-contain pr-0.5"
          >
            <span
              v-for="enrolment in room.enrolments"
              :key="enrolment.id"
              class="bg-muted/40 flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs"
              :class="
                mismatchIds.has(enrolment.id)
                  ? 'border-warning/50 bg-warning/5'
                  : ''
              "
            >
              <span
                class="bg-primary/10 text-primary flex size-5 shrink-0 items-center justify-center rounded-full text-[9px] font-bold"
              >
                {{
                  initials(
                    enrolment.child.first_name,
                    enrolment.child.last_name,
                  )
                }}
              </span>
              {{ enrolment.child.first_name }} {{ enrolment.child.last_name }}
              <span
                class="font-medium"
                :class="
                  mismatchIds.has(enrolment.id)
                    ? 'text-warning'
                    : 'text-muted-foreground'
                "
              >
                {{
                  ageGroupLabels.get(enrolment.age_group) ?? enrolment.age_group
                }}
                · {{ attendanceAbbr.get(enrolment.attendance_type) }}
              </span>
            </span>
          </div>
          <p v-else class="text-muted-foreground pt-2.5 text-xs">
            No children assigned to this room.
          </p>
        </UiCollapsibleContent>
      </UiCollapsible>
    </div>
  </UiCard>
</template>
