<template>
  <div class="relative flex">
    <!-- Trigger slot -->
    <div
      ref="triggerRef"
      class="flex flex-1"
      @mouseenter="showTooltip"
      @mouseleave="hideTooltip"
      @focus="showTooltip"
      @blur="hideTooltip"
    >
      <slot />
    </div>

    <!-- Tooltip portal to body to avoid clipping -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition-all duration-150 ease-out"
        enter-from-class="opacity-0 scale-95 translate-y-1"
        enter-to-class="opacity-100 scale-100 translate-y-0"
        leave-active-class="transition-all duration-100 ease-in"
        leave-from-class="opacity-100 scale-100 translate-y-0"
        leave-to-class="opacity-0 scale-95 translate-y-1"
      >
        <div
          v-if="isVisible && tooltipPosition"
          :style="{
            position: 'fixed',
            left: tooltipPosition.left + 'px',
            top: tooltipPosition.top + 'px',
            zIndex: 9999,
            transform: getTransform(),
          }"
          class="pointer-events-none"
          role="tooltip"
        >
          <!-- Tooltip content -->
          <div
            class="bg-neutral text-neutral-content text-xs font-medium px-3 py-2 rounded-lg shadow-lg whitespace-nowrap"
          >
            {{ text }}
          </div>
          <!-- Arrow -->
          <div :class="arrowClasses" class="absolute">
            <div class="w-2 h-2 bg-neutral transform rotate-45" />
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
/**
 * Tooltip Component
 * A reusable tooltip with smooth animations and customizable positioning
 */

interface Props {
  text: string
  position?: 'top' | 'bottom' | 'left' | 'right'
  delay?: number
}

const props = withDefaults(defineProps<Props>(), {
  position: 'top',
  delay: 200,
})

const isVisible = ref(false)
const triggerRef = ref<HTMLElement>()
const tooltipPosition = ref<{ left: number; top: number } | null>(null)
let timeoutId: ReturnType<typeof setTimeout> | null = null

/**
 * Calculate tooltip position based on trigger element and position prop
 */
const calculatePosition = () => {
  if (!triggerRef.value) return null

  const rect = triggerRef.value.getBoundingClientRect()
  const spacing = 8 // 8px spacing from trigger

  const positions = {
    top: {
      left: rect.left + rect.width / 2,
      top: rect.top - spacing,
    },
    bottom: {
      left: rect.left + rect.width / 2,
      top: rect.bottom + spacing,
    },
    left: {
      left: rect.left - spacing,
      top: rect.top + rect.height / 2,
    },
    right: {
      left: rect.right + spacing,
      top: rect.top + rect.height / 2,
    },
  }

  return positions[props.position]
}

const showTooltip = () => {
  if (timeoutId) clearTimeout(timeoutId)
  timeoutId = setTimeout(() => {
    tooltipPosition.value = calculatePosition()
    isVisible.value = true
  }, props.delay)
}

const hideTooltip = () => {
  if (timeoutId) clearTimeout(timeoutId)
  isVisible.value = false
  tooltipPosition.value = null
}

// Update position on scroll/resize
const updatePosition = () => {
  if (isVisible.value) {
    tooltipPosition.value = calculatePosition()
  }
}

onMounted(() => {
  window.addEventListener('scroll', updatePosition, true)
  window.addEventListener('resize', updatePosition)
})

/**
 * Get transform to center tooltip based on position
 */
const getTransform = () => {
  const transforms = {
    top: 'translate(-50%, -100%)',
    bottom: 'translate(-50%, 0%)',
    left: 'translate(-100%, -50%)',
    right: 'translate(0%, -50%)',
  }
  return transforms[props.position]
}

// Computed classes for arrow positioning
const arrowClasses = computed(() => {
  const arrows = {
    top: 'left-1/2 -translate-x-1/2 top-full -mt-1',
    bottom: 'left-1/2 -translate-x-1/2 bottom-full -mb-1',
    left: 'top-1/2 -translate-y-1/2 left-full -ml-1',
    right: 'top-1/2 -translate-y-1/2 right-full -mr-1',
  }
  return arrows[props.position]
})

// Cleanup on unmount
onUnmounted(() => {
  if (timeoutId) clearTimeout(timeoutId)
  window.removeEventListener('scroll', updatePosition, true)
  window.removeEventListener('resize', updatePosition)
})
</script>
