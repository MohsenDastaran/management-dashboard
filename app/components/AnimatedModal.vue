<script setup lang="ts">
import { X } from '@lucide/vue'
import { AnimatePresence, motion } from 'motion-v'
import { cn } from '~/lib/utils'

const props = withDefaults(
  defineProps<{
    title: string
    description?: string
    class?: string
  }>(),
  { description: '', class: '' },
)

const open = defineModel<boolean>('open', { default: false })

const containerVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  show: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.3, ease: 'easeInOut', staggerChildren: 0.05 },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: { duration: 0.2, ease: 'easeInOut' },
  },
}

function staggeredEntry(index: number) {
  return {
    variants: {
      hidden: { opacity: 0, y: 8 },
      show: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.25, delay: index * 0.05 },
      },
    },
  }
}
</script>

<template>
  <Teleport to="body">
    <AnimatePresence>
      <div
        v-if="open"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        <component
          :is="motion.div"
          :initial="{ opacity: 0 }"
          :animate="{ opacity: 1 }"
          :exit="{ opacity: 0 }"
          class="bg-background/60 absolute inset-0 backdrop-blur-sm"
          @click="open = false"
        />
        <component
          :is="motion.div"
          :variants="containerVariants"
          initial="hidden"
          animate="show"
          exit="exit"
          role="dialog"
          aria-modal="true"
          :aria-labelledby="'animated-modal-title'"
          :class="
            cn(
              'bg-card text-card-foreground ring-foreground/10 relative w-full max-w-md overflow-hidden rounded-xl border p-6 shadow-2xl ring-1',
              props.class,
            )
          "
        >
          <UiButton
            variant="ghost"
            size="icon-sm"
            class="absolute top-3 right-3"
            aria-label="Close"
            @click="open = false"
          >
            <X class="size-4" />
          </UiButton>

          <component :is="motion.div" v-bind="staggeredEntry(0)" class="pr-8">
            <h2 id="animated-modal-title" class="text-lg font-semibold tracking-tight">
              {{ title }}
            </h2>
            <p v-if="description" class="text-muted-foreground mt-1 text-sm">
              {{ description }}
            </p>
          </component>

          <slot :staggered-entry="staggeredEntry" />
        </component>
      </div>
    </AnimatePresence>
  </Teleport>
</template>
