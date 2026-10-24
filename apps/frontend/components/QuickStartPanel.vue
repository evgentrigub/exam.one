<template>
  <component
    :is="mobile ? 'dialog' : 'section'"
    :id="id"
    ref="surface"
    role="dialog"
    :aria-modal="mobile ? 'true' : undefined"
    :aria-labelledby="`${id}-title`"
    tabindex="-1"
    class="quick-start-panel bg-base-100 text-base-content flex-col overflow-hidden text-left outline-none shadow-2xl"
    :class="panelClass"
    @cancel.prevent="emit('close')"
    @click="onBackdropClick"
    @keydown="onKeyDown"
  >
    <div v-if="mobile" class="pt-2 flex justify-center shrink-0" aria-hidden="true">
      <span class="w-9 h-1 rounded-full bg-base-content/20" />
    </div>
    <div class="quick-start-header flex items-center gap-2 border-b border-base-300/70 shrink-0">
      <h2 :id="`${id}-title`" class="font-display text-[17px] font-bold leading-none">
        {{ $t('quickStart.title') }}
      </h2>
      <button
        type="button"
        class="quick-start-close ml-auto btn btn-ghost btn-circle focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
        :aria-label="$t('quickStart.close')"
        @click="emit('close')"
      >
        <X :size="mobile ? 18 : 14" aria-hidden="true" />
      </button>
    </div>
    <ol class="quick-start-list overflow-y-auto flex-1 min-h-0 divide-y divide-base-300/60">
      <li
        v-for="(item, index) in items"
        :key="item"
        class="quick-start-item grid grid-cols-[18px_minmax(0,1fr)] gap-x-2"
      >
        <span
          class="font-mono text-[11px] font-semibold leading-5 text-base-content/50 tabular-nums"
          aria-hidden="true"
          >{{ index + 1 }}</span
        >
        <div>
          <h3 class="quick-start-question font-semibold leading-5">
            {{ $t(`quickStart.${item}.question`) }}
          </h3>
          <i18n-t
            :keypath="`quickStart.${item}.answer`"
            tag="p"
            scope="global"
            class="quick-start-answer mt-1 text-base-content/70"
          >
            <template v-for="label in labels" :key="label.slot" #[label.slot]>
              <span class="font-medium text-base-content">{{ $t(label.key) }}</span>
            </template>
            <template v-for="link in links" :key="link.slot" #[link.slot]>
              <NuxtLink
                :to="{ path: '/settings', query: { section: link.section } }"
                class="quick-start-link"
                @click="emit('navigate')"
              >
                {{ $t(link.key) }}
              </NuxtLink>
            </template>
          </i18n-t>
          <p
            v-if="item === 'models'"
            class="mt-2 flex gap-1.5 text-[11.5px] leading-snug text-base-content/65 rounded-field bg-base-200 px-2.5 py-2"
          >
            <KeyRound :size="12" class="mt-0.5 shrink-0" aria-hidden="true" />
            <span>{{ $t('quickStart.models.note') }}</span>
          </p>
        </div>
      </li>
    </ol>
    <div
      class="quick-start-footer shrink-0 border-t border-base-300/70 bg-base-200/40 flex items-center"
    >
      <a :href="docsUrl" target="_blank" rel="noopener noreferrer" class="quick-start-link">
        {{ $t('quickStart.documentation') }} <span aria-hidden="true">{{ '↗' }}</span>
        <span class="sr-only"> {{ $t('quickStart.opensInNewTab') }}</span>
      </a>
    </div>
  </component>
</template>

<script setup lang="ts">
import { KeyRound, X } from 'lucide-vue-next'
import type { SettingsSectionId } from '~/data/account/settingsNav'

const props = defineProps<{ id: string; mobile: boolean }>()
const emit = defineEmits<{ close: []; outside: []; navigate: [] }>()
const surface = ref<HTMLElement | null>(null)
const docsUrl = useRuntimeConfig().public.docsUrl
const panelClass = computed(() =>
  props.mobile
    ? 'quick-start-sheet rounded-t-[20px] border-t border-base-300'
    : 'quick-start-popover rounded-box border border-base-300'
)
const items = ['ai', 'language', 'models', 'exercises', 'audio', 'mock'] as const
const labels = [
  { slot: 'settings', key: 'nav.settings' },
  { slot: 'examTarget', key: 'shell.examTarget' },
  { slot: 'learningPlan', key: 'settings.navLearning' },
  { slot: 'generatedFiles', key: 'settings.navMedia' },
  { slot: 'exercises', key: 'nav.exercises' },
  { slot: 'reading', key: 'skill.reading' },
  { slot: 'writing', key: 'skill.writing' },
  { slot: 'listening', key: 'skill.listening' },
  { slot: 'speaking', key: 'skill.speaking' },
  { slot: 'generateExercises', key: 'generation.generateExercises' },
  { slot: 'generateAudio', key: 'listening.generateAudio' },
  { slot: 'mockExams', key: 'nav.mockExams' },
]
const links: { slot: string; key: string; section: SettingsSectionId }[] = [
  { slot: 'aiProvider', key: 'settings.navAi', section: 'ai' },
  { slot: 'voiceModels', key: 'settings.navMediaVoices', section: 'media-voices' },
  { slot: 'speechModels', key: 'settings.sttModelsMenu', section: 'media-stt' },
]
let restoreScroll: (() => void) | undefined

function activate() {
  if (!import.meta.client || !surface.value) return
  if (props.mobile) {
    const dialog = surface.value as HTMLDialogElement
    if (!dialog.open) dialog.showModal()
    const htmlOverflow = document.documentElement.style.overflow
    const bodyOverflow = document.body.style.overflow
    document.documentElement.style.overflow = 'hidden'
    document.body.style.overflow = 'hidden'
    restoreScroll = () => {
      document.documentElement.style.overflow = htmlOverflow
      document.body.style.overflow = bodyOverflow
    }
  }
  surface.value.focus({ preventScroll: true })
}

function onBackdropClick(event: MouseEvent) {
  if (!props.mobile || event.target !== surface.value || !surface.value) return
  const rect = surface.value.getBoundingClientRect()
  if (
    event.clientX < rect.left ||
    event.clientX > rect.right ||
    event.clientY < rect.top ||
    event.clientY > rect.bottom
  )
    emit('outside')
}

function onKeyDown(event: KeyboardEvent) {
  if (!props.mobile || event.key !== 'Tab' || !surface.value) return
  const controls = surface.value.querySelectorAll<HTMLElement>('a[href], button:not([disabled])')
  const first = controls[0]
  const last = controls[controls.length - 1]
  if (!first || !last) return
  const current = document.activeElement
  if (event.shiftKey && (current === first || current === surface.value)) {
    event.preventDefault()
    last.focus()
  } else if (!event.shiftKey && current === last) {
    event.preventDefault()
    first.focus()
  }
}

defineExpose({ activate, contains: (target: Node) => surface.value?.contains(target) ?? false })

onBeforeUnmount(() => {
  if (props.mobile && surface.value) (surface.value as HTMLDialogElement).close()
  restoreScroll?.()
})
</script>

<style scoped>
.quick-start-panel {
  padding: 0;
}
.quick-start-popover {
  position: fixed;
  z-index: 61;
  display: flex;
  max-width: calc(100vw - 32px);
  max-height: min(640px, calc(100dvh - 76px));
  transform-origin: top right;
  animation: quick-start-pop 160ms cubic-bezier(0.2, 0.7, 0.3, 1);
}
.quick-start-sheet {
  position: fixed;
  inset: auto 0 0;
  margin: 0;
  width: 100%;
  max-width: 100%;
  max-height: 85dvh;
  animation: quick-start-sheet 220ms cubic-bezier(0.2, 0.7, 0.3, 1);
}
.quick-start-sheet[open] {
  display: flex;
}
.quick-start-sheet::backdrop {
  background: color-mix(in oklab, var(--color-base-content) 40%, transparent);
  animation: quick-start-fade 160ms ease-out;
}
.quick-start-header {
  height: 52px;
  padding: 0 10px 0 16px;
}
.quick-start-close {
  width: 24px;
  height: 24px;
  min-height: 24px;
  padding: 0;
}
.quick-start-item {
  padding: 14px 16px;
}
.quick-start-list {
  overscroll-behavior: contain;
  scrollbar-width: thin;
  list-style: none;
}
.quick-start-question {
  font-size: 13px;
}
.quick-start-answer {
  font-size: 12.5px;
  line-height: 1.55;
  text-wrap: pretty;
}
.quick-start-footer {
  min-height: 44px;
  padding: 8px 16px;
  font-size: 12px;
}
.quick-start-sheet .quick-start-header {
  height: 56px;
  padding: 0 12px 0 20px;
}
.quick-start-sheet .quick-start-close {
  width: 44px;
  height: 44px;
  min-height: 44px;
}
.quick-start-sheet .quick-start-item {
  padding: 16px 20px;
}
.quick-start-sheet .quick-start-question {
  font-size: 14px;
}
.quick-start-sheet .quick-start-answer {
  font-size: 13.5px;
}
.quick-start-sheet .quick-start-footer {
  min-height: calc(56px + env(safe-area-inset-bottom, 0px));
  padding: 8px 20px calc(8px + env(safe-area-inset-bottom, 0px));
  font-size: 13.5px;
}
.quick-start-link {
  color: var(--color-primary);
  font-weight: 500;
  text-decoration: underline;
  text-decoration-thickness: 1px;
  text-underline-offset: 3px;
  text-decoration-color: color-mix(in oklab, var(--color-primary) 40%, transparent);
  border-radius: 3px;
  transition:
    text-decoration-color 120ms,
    background-color 120ms;
}
.quick-start-link:hover {
  text-decoration-color: var(--color-primary);
  background: color-mix(in oklab, var(--color-primary) 9%, transparent);
}
.quick-start-link:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
  text-decoration-color: var(--color-primary);
}
@keyframes quick-start-pop {
  from {
    opacity: 0;
    transform: translateY(-4px) scale(0.985);
  }
  to {
    opacity: 1;
    transform: none;
  }
}
@keyframes quick-start-sheet {
  from {
    opacity: 0;
    transform: translateY(24px);
  }
  to {
    opacity: 1;
    transform: none;
  }
}
@keyframes quick-start-fade {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
@media (prefers-reduced-motion: reduce) {
  .quick-start-panel,
  .quick-start-sheet::backdrop {
    animation: none;
  }
  .quick-start-link {
    transition: none;
  }
}
</style>
