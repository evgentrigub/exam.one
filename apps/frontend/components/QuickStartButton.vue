<template>
  <ClientOnly>
    <div class="quick-start-trigger relative flex items-center" :class="{ 'is-open': open }">
      <span :id="tooltipId" role="tooltip" class="quick-start-tooltip">
        {{ $t('quickStart.tooltip') }}
      </span>
      <button
        ref="trigger"
        type="button"
        class="w-9 h-9 shrink-0 rounded-full grid place-items-center transition-colors hover:bg-base-200 focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
        :class="{ 'bg-base-200': open }"
        :aria-label="$t('quickStart.title')"
        :aria-describedby="open ? undefined : tooltipId"
        aria-haspopup="dialog"
        :aria-expanded="open"
        :aria-controls="open ? panelId : undefined"
        @click="open ? close(true) : show()"
      >
        <CircleHelp :size="16" aria-hidden="true" />
      </button>
      <Teleport to="body">
        <QuickStartPanel
          v-if="open"
          :id="panelId"
          ref="panel"
          :mobile="mobile"
          :style="mobile ? undefined : position"
          @close="close(true)"
          @outside="close(false)"
          @navigate="close(true)"
          @focusout="onPanelFocusOut"
        />
      </Teleport>
    </div>
  </ClientOnly>
</template>

<script setup lang="ts">
import { CircleHelp } from 'lucide-vue-next'
import type { CSSProperties } from 'vue'
import type QuickStartPanel from '~/components/QuickStartPanel.vue'

const route = useRoute()
const id = useId()
const panelId = `quick-start-${id}`
const tooltipId = `${panelId}-tooltip`
const trigger = ref<HTMLButtonElement | null>(null)
const panel = ref<InstanceType<typeof QuickStartPanel> | null>(null)
const open = ref(false)
const mobile = ref(false)
const position = ref<CSSProperties>({})
let mediaQuery: MediaQueryList | undefined

function updatePosition() {
  if (!import.meta.client || mobile.value || !trigger.value) return
  const rect = trigger.value.getBoundingClientRect()
  const width = Math.min(380, window.innerWidth - 32)
  const top = rect.bottom + 12
  position.value = {
    width: `${width}px`,
    left: `${Math.max(16, Math.min(rect.right - width, window.innerWidth - width - 16))}px`,
    top: `${top}px`,
    maxHeight: `${Math.max(0, Math.min(640, window.innerHeight - 76, window.innerHeight - top - 16))}px`,
  }
}

async function show() {
  updatePosition()
  open.value = true
  await nextTick()
  if (open.value) panel.value?.activate()
}

function close(restoreFocus: boolean) {
  if (!open.value) return
  open.value = false
  if (restoreFocus) void nextTick(() => trigger.value?.focus({ preventScroll: true }))
}

function isInside(target: EventTarget | null) {
  return (
    target instanceof Node && (trigger.value?.contains(target) || panel.value?.contains(target))
  )
}

function onPointerDown(event: PointerEvent) {
  if (open.value && !mobile.value && !isInside(event.target)) close(false)
}

function onFocusIn(event: FocusEvent) {
  if (open.value && !mobile.value && !isInside(event.target)) close(false)
}

function onPanelFocusOut(event: FocusEvent) {
  if (!mobile.value && !isInside(event.relatedTarget)) close(false)
}

function onKeyDown(event: KeyboardEvent) {
  if (open.value && event.key === 'Escape') {
    event.preventDefault()
    close(true)
  }
}

function onBreakpointChange(event: MediaQueryListEvent) {
  close(true)
  mobile.value = event.matches
}

watch(
  () => route.fullPath,
  () => close(false)
)

onMounted(() => {
  mediaQuery = window.matchMedia('(max-width: 767px)')
  mobile.value = mediaQuery.matches
  mediaQuery.addEventListener('change', onBreakpointChange)
  document.addEventListener('pointerdown', onPointerDown)
  document.addEventListener('focusin', onFocusIn)
  document.addEventListener('keydown', onKeyDown)
  window.addEventListener('resize', updatePosition)
  window.addEventListener('scroll', updatePosition, true)
})

onBeforeUnmount(() => {
  if (!import.meta.client) return
  mediaQuery?.removeEventListener('change', onBreakpointChange)
  document.removeEventListener('pointerdown', onPointerDown)
  document.removeEventListener('focusin', onFocusIn)
  document.removeEventListener('keydown', onKeyDown)
  window.removeEventListener('resize', updatePosition)
  window.removeEventListener('scroll', updatePosition, true)
})
</script>

<style scoped>
.quick-start-tooltip {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  z-index: 62;
  pointer-events: none;
  white-space: nowrap;
  border-radius: 6px;
  padding: 5px 9px;
  font-size: 12px;
  font-weight: 500;
  line-height: 1.2;
  background: var(--color-neutral);
  color: var(--color-neutral-content);
  visibility: hidden;
  opacity: 0;
  transform: translateY(-2px);
  transition:
    opacity 120ms,
    transform 120ms,
    visibility 120ms;
}
.quick-start-trigger:not(.is-open):hover .quick-start-tooltip,
.quick-start-trigger:not(.is-open):has(:focus-visible) .quick-start-tooltip {
  visibility: visible;
  opacity: 1;
  transform: none;
  transition-delay: 250ms;
}
@media (hover: none) {
  .quick-start-tooltip {
    display: none;
  }
}
@media (prefers-reduced-motion: reduce) {
  .quick-start-tooltip {
    transition: none;
  }
}
</style>
