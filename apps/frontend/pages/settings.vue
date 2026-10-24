<template>
  <div class="max-w-[1180px] mx-auto px-6 py-8 lg:px-8">
    <div class="flex flex-col lg:flex-row gap-8 items-start">
      <nav class="w-full lg:w-56 shrink-0 lg:sticky lg:top-6">
        <div v-for="group in nav" :key="group.groupKey" class="mb-5">
          <div
            class="text-[11px] font-semibold uppercase tracking-wider text-base-content/40 px-3 mb-1.5"
          >
            {{ $t(group.groupKey) }}
          </div>
          <div class="flex flex-col gap-0.5">
            <template v-for="item in group.items" :key="item.id">
              <div v-if="item.children" class="flex flex-col gap-0.5">
                <NuxtLink
                  :to="{ path: '/settings', query: { section: item.children[0]!.id } }"
                  class="w-full flex items-center gap-2.5 px-3 h-9 rounded-field text-sm text-left transition-colors hover:bg-base-200"
                  :class="
                    item.children.some(child => child.id === section)
                      ? 'text-base-content font-medium'
                      : 'text-base-content/70'
                  "
                >
                  <component :is="item.icon" :size="15" />
                  {{ $t(item.labelKey) }}
                </NuxtLink>
                <div class="ml-[19px] pl-3 border-l border-base-300 flex flex-col gap-0.5">
                  <NuxtLink
                    v-for="child in item.children"
                    :key="child.id"
                    :to="{ path: '/settings', query: { section: child.id } }"
                    class="w-full flex items-center gap-2 px-2.5 h-8 rounded-field text-[13px] text-left transition-colors"
                    :class="
                      section === child.id
                        ? 'nav-item-active font-medium'
                        : 'text-base-content/65 hover:bg-base-200'
                    "
                  >
                    <component :is="child.icon" :size="14" />
                    {{ $t(child.labelKey) }}
                  </NuxtLink>
                </div>
              </div>
              <NuxtLink
                v-else
                :to="{ path: '/settings', query: { section: item.id } }"
                class="w-full flex items-center gap-2.5 px-3 h-9 rounded-field text-sm text-left transition-colors"
                :class="
                  section === item.id
                    ? 'nav-item-active font-medium'
                    : 'text-base-content/70 hover:bg-base-200'
                "
              >
                <component :is="item.icon" :size="15" />
                {{ $t(item.labelKey) }}
              </NuxtLink>
            </template>
          </div>
        </div>
      </nav>
      <div class="flex-1 min-w-0 w-full">
        <SettingsProfile v-if="section === 'profile'" />
        <SettingsPlan v-else-if="section === 'plan'" />
        <SettingsLearning v-else-if="section === 'learning'" />
        <SettingsAi v-else-if="section === 'ai'" />
        <SettingsNotify v-else-if="section === 'notify'" />
        <SettingsAppearance v-else-if="section === 'appearance'" />
        <SettingsMedia
          v-else-if="
            section === 'media-audio' || section === 'media-voices' || section === 'media-stt'
          "
          :view="section === 'media-stt' ? 'stt' : section === 'media-voices' ? 'voices' : 'audio'"
        />
        <SettingsData v-else-if="section === 'data'" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  Bell,
  CreditCard,
  Database,
  FolderOpen,
  Headphones,
  Mic,
  Palette,
  Sparkles,
  Target,
  User,
} from 'lucide-vue-next'
import { resolveSettingsSection, type SettingsSectionId } from '~/data/account/settingsNav'

usePageMeta('pageMeta.settingsTitle', 'pageMeta.settingsSubtitle')
const { t } = useI18n()
useHead({ title: () => `${t('pageMeta.settingsTitle')} — Exam.one` })

const route = useRoute()
const section = computed(() => resolveSettingsSection(route.query['section']))

type NavLeaf = { id: SettingsSectionId; labelKey: string; icon: typeof User }
/** A section, or a group whose children are the sections (Generated files). */
type NavItem = { id: string; labelKey: string; icon: typeof User; children?: NavLeaf[] }

const nav: { groupKey: string; items: NavItem[] }[] = [
  {
    groupKey: 'settings.groupAccount',
    items: [
      { id: 'profile', labelKey: 'settings.navProfile', icon: User },
      { id: 'plan', labelKey: 'settings.navPlan', icon: CreditCard },
    ],
  },
  {
    groupKey: 'settings.groupStudying',
    items: [
      { id: 'learning', labelKey: 'settings.navLearning', icon: Target },
      { id: 'ai', labelKey: 'settings.navAi', icon: Sparkles },
      { id: 'notify', labelKey: 'settings.navNotify', icon: Bell },
    ],
  },
  {
    groupKey: 'settings.groupWorkspace',
    items: [
      { id: 'appearance', labelKey: 'settings.navAppearance', icon: Palette },
      {
        id: 'media',
        labelKey: 'settings.navMedia',
        icon: FolderOpen,
        children: [
          { id: 'media-audio', labelKey: 'settings.navMediaAudio', icon: Headphones },
          { id: 'media-voices', labelKey: 'settings.navMediaVoices', icon: Mic },
          { id: 'media-stt', labelKey: 'settings.sttModelsMenu', icon: Mic },
        ],
      },
      { id: 'data', labelKey: 'settings.navData', icon: Database },
    ],
  },
]
</script>
