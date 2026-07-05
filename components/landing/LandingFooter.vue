<template>
  <footer
    class="px-6 py-12"
    :class="light ? 'bg-neutral text-white/70' : 'bg-base-100 border-t border-base-300'"
  >
    <div class="max-w-6xl mx-auto grid md:grid-cols-[1.6fr_1fr_1fr_1fr] gap-8">
      <div>
        <LandingWordmark :light="light" />
        <p
          class="text-sm mt-3 max-w-xs"
          :class="light ? 'text-white/55' : 'text-base-content/60'"
        >
          Open-source, self-hostable practice for every part of a language exam — with bring-your-own-key AI feedback.
        </p>
        <div class="flex items-center gap-2 mt-4">
          <a
            v-for="icon in socials"
            :key="icon"
            href="#"
            class="btn btn-sm btn-circle"
            :class="light ? 'btn-ghost text-white' : 'btn-ghost'"
          >
            <LandingIcon :name="icon" :size="16" />
          </a>
        </div>
      </div>

      <div v-for="col in cols" :key="col.title">
        <div
          class="text-xs font-semibold uppercase tracking-wider mb-3"
          :class="light ? 'text-white/45' : 'text-base-content/45'"
        >
          {{ col.title }}
        </div>
        <ul class="space-y-2">
          <li v-for="item in col.items" :key="item">
            <a
              href="#"
              class="text-sm hover:text-primary cursor-pointer"
              :class="light ? 'text-white/70' : 'text-base-content/70'"
            >
              {{ item }}
            </a>
          </li>
        </ul>
      </div>
    </div>

    <div
      class="max-w-6xl mx-auto mt-10 pt-6 flex flex-wrap items-center justify-between gap-3 text-xs"
      :class="light ? 'border-t border-white/10 text-white/45' : 'border-t border-base-300 text-base-content/45'"
    >
      <span>© Exam.one 2026 · MIT licensed</span>
      <span class="flex items-center gap-1.5">
        Proudly open-source
        <LandingIcon name="heart" :size="12" cls="text-error" />
      </span>
    </div>
  </footer>
</template>

<script setup lang="ts">
defineProps<{
  light?: boolean
}>()

const cols = [
  { title: 'Product', items: ['Features', 'Mock exams', 'Supported exams', 'Pricing'] },
  { title: 'Open source', items: ['GitHub', 'Self-host guide', 'Prompt templates', 'Roadmap'] },
  { title: 'Resources', items: ['Docs', 'Bring your own key', 'Community', 'Changelog'] },
]

const socials = ['git-branch', 'message-circle', 'book-open']
</script>
