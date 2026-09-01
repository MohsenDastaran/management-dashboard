<script setup lang="ts">
import type { Enrolment } from '~/types/capacity'
import {
  Inbox,
  Search,
  UserX,
} from '@lucide/vue'
import { formatAge, formatDate, initials } from '~/lib/format'

interface ChildRow {
  enrolment: Enrolment
  centreName: string
  roomName: string | null
  isMismatch: boolean
}

const { data, summary, isLoading, isEmpty, error } = useCapacityOverview()

const tab = ref<'unassigned' | 'all'>('unassigned')
const search = ref('')

const allRows = computed<ChildRow[]>(() => {
  if (!summary.value) {
    return []
  }
  const rows: ChildRow[] = []
  for (const centre of summary.value.centres) {
    for (const room of centre.classrooms) {
      const mismatches = new Set(room.ageGroupMismatches.map(e => e.id))
      for (const enrolment of room.enrolments) {
        rows.push({
          enrolment,
          centreName: centre.centre.name,
          roomName: room.classroom.name,
          isMismatch: mismatches.has(enrolment.id),
        })
      }
    }
    for (const enrolment of centre.unassigned) {
      rows.push({
        enrolment,
        centreName: centre.centre.name,
        roomName: null,
        isMismatch: false,
      })
    }
  }
  return rows.sort((a, b) =>
    a.enrolment.child.last_name.localeCompare(b.enrolment.child.last_name),
  )
})

const unassignedRows = computed(() => allRows.value.filter(row => row.roomName === null))

const visibleRows = computed(() => {
  const base = tab.value === 'unassigned' ? unassignedRows.value : allRows.value
  const query = search.value.trim().toLowerCase()
  if (!query) {
    return base
  }
  return base.filter(({ enrolment }) =>
    `${enrolment.child.first_name} ${enrolment.child.last_name}`
      .toLowerCase()
      .includes(query),
  )
})

const ageGroupLabel = computed(
  () => new Map(data.value?.age_groups.map(group => [group.id, group.label]) ?? []),
)
const attendanceLabel = computed(
  () => new Map(data.value?.attendance_types.map(type => [type.id, type.abbreviation]) ?? []),
)

const effectiveOn = computed(() => data.value?.meta.effective_on ?? '')
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-semibold tracking-tight">
        Children
      </h1>
      <p class="text-muted-foreground text-sm">
        Enrolled children and their classroom assignments. Unassigned children
        are shown but never counted against a room.
      </p>
    </div>

    <!-- Loading -->
    <template v-if="isLoading">
      <div class="flex gap-3">
        <UiSkeleton class="h-9 w-56" />
        <UiSkeleton class="h-9 w-64" />
      </div>
      <UiSkeleton class="h-96 rounded-xl" />
    </template>

    <!-- Error -->
    <DataErrorAlert v-else-if="error" title="Couldn't load enrolment data" />

    <!-- Empty -->
    <div
      v-else-if="isEmpty"
      class="text-muted-foreground flex flex-col items-center gap-3 rounded-xl border border-dashed py-16 text-center"
    >
      <Inbox class="size-8" />
      <p class="text-foreground font-medium">
        No enrolment data for this month
      </p>
    </div>

    <!-- Data -->
    <template v-else-if="summary">
      <div class="flex flex-wrap items-center gap-x-4 gap-y-3">
        <UiTabs v-model="tab">
          <UiTabsList>
            <UiTabsTrigger value="unassigned">
              <UserX class="size-3.5" />
              Unassigned
              <UiBadge
                variant="secondary"
                class="ml-1 h-4 px-1.5 text-[10px]"
                :class="unassignedRows.length > 0 ? 'bg-warning/15 text-warning' : ''"
              >
                {{ unassignedRows.length }}
              </UiBadge>
            </UiTabsTrigger>
            <UiTabsTrigger value="all">
              All children
              <UiBadge variant="secondary" class="ml-1 h-4 px-1.5 text-[10px]">
                {{ allRows.length }}
              </UiBadge>
            </UiTabsTrigger>
          </UiTabsList>
        </UiTabs>

        <div class="relative ml-auto w-full sm:w-64">
          <Search class="text-muted-foreground absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
          <UiInput
            v-model="search"
            placeholder="Search by name…"
            class="h-9 pl-8"
          />
        </div>
      </div>

      <UiCard size="sm" class="py-0">
        <UiTable>
          <UiTableHeader>
            <UiTableRow>
              <UiTableHead class="pl-4">
                Child
              </UiTableHead>
              <UiTableHead>Age group</UiTableHead>
              <UiTableHead class="hidden sm:table-cell">
                Attendance
              </UiTableHead>
              <UiTableHead class="hidden md:table-cell">
                Centre
              </UiTableHead>
              <UiTableHead>Classroom</UiTableHead>
              <UiTableHead class="hidden pr-4 lg:table-cell">
                Enrolled since
              </UiTableHead>
            </UiTableRow>
          </UiTableHeader>
          <UiTableBody>
            <UiTableEmpty v-if="visibleRows.length === 0" :colspan="6">
              <span class="text-muted-foreground">
                <template v-if="tab === 'unassigned' && !search">
                  Every child has a classroom assignment this month.
                </template>
                <template v-else>
                  No children match your search.
                </template>
              </span>
            </UiTableEmpty>

            <UiTableRow
              v-for="row in visibleRows"
              :key="row.enrolment.id"
              :class="row.roomName === null ? 'bg-warning/5 hover:bg-warning/10' : ''"
            >
              <UiTableCell class="pl-4">
                <span class="flex items-center gap-2.5">
                  <span class="bg-primary/10 text-primary flex size-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold">
                    {{ initials(row.enrolment.child.first_name, row.enrolment.child.last_name) }}
                  </span>
                  <span class="leading-tight">
                    <span class="block font-medium">
                      {{ row.enrolment.child.first_name }} {{ row.enrolment.child.last_name }}
                    </span>
                    <span class="text-muted-foreground block text-xs">
                      {{ formatAge(row.enrolment.child.date_of_birth, effectiveOn) }}
                      · born {{ formatDate(row.enrolment.child.date_of_birth) }}
                    </span>
                  </span>
                </span>
              </UiTableCell>
              <UiTableCell>
                <UiBadge variant="secondary" class="font-normal">
                  {{ ageGroupLabel.get(row.enrolment.age_group) ?? row.enrolment.age_group }}
                </UiBadge>
              </UiTableCell>
              <UiTableCell class="hidden sm:table-cell">
                <UiBadge variant="outline" class="font-mono text-[10px]">
                  {{ attendanceLabel.get(row.enrolment.attendance_type) }}
                </UiBadge>
              </UiTableCell>
              <UiTableCell class="text-muted-foreground hidden md:table-cell">
                {{ row.centreName }}
              </UiTableCell>
              <UiTableCell>
                <template v-if="row.roomName">
                  <span class="font-medium tabular-nums">{{ row.roomName }}</span>
                  <UiBadge
                    v-if="row.isMismatch"
                    variant="outline"
                    class="text-warning border-warning/40 ml-1.5"
                  >
                    age mismatch
                  </UiBadge>
                </template>
                <UiBadge v-else variant="outline" class="text-warning border-warning/40">
                  <UserX />
                  Unassigned
                </UiBadge>
              </UiTableCell>
              <UiTableCell class="text-muted-foreground hidden pr-4 text-xs tabular-nums lg:table-cell">
                {{ formatDate(row.enrolment.starts_on) }}
              </UiTableCell>
            </UiTableRow>
          </UiTableBody>
        </UiTable>
      </UiCard>
    </template>
  </div>
</template>
