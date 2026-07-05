<template>
  <div class="bg-base-100">
    <nav class="sticky top-0 z-40 bg-neutral/85 backdrop-blur border-b border-white/10">
      <div class="max-w-6xl mx-auto px-6 h-16 flex items-center gap-6">
        <LandingWordmark light />
        <div class="hidden md:flex items-center gap-6 ml-4 text-sm text-white/65">
          <a v-for="link in ['Features', 'Self-host', 'Pricing', 'Docs']" :key="link" href="#" class="hover:text-white cursor-pointer">
            {{ link }}
          </a>
        </div>
        <div class="ml-auto flex items-center gap-2">
          <LandingGhStars light />
          <a href="#" class="btn btn-sm btn-primary rounded-field whitespace-nowrap">Get started</a>
        </div>
      </div>
    </nav>

    <!-- HERO -->
    <header class="bg-neutral text-white hero-noise relative overflow-hidden">
      <div class="max-w-6xl mx-auto px-6 pt-20 pb-24 grid lg:grid-cols-[1.05fr_1fr] gap-14 items-center">
        <div>
          <div class="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/80">
            <span class="w-1.5 h-1.5 rounded-full bg-success" /> Open-source · self-hostable · MIT
          </div>
          <h1 class="font-display text-5xl lg:text-6xl font-bold leading-[1.03] mt-5 tracking-tight">
            Practice any language exam.<br><span class="text-primary">Until you know you'll pass.</span>
          </h1>
          <p class="text-lg text-white/65 mt-5 max-w-xl leading-relaxed">
            Self-host an exam-realistic trainer for Reading, Writing, Listening and Speaking. Plug in your own LLM key and run unlimited graded attempts — on your machine, at your cost.
          </p>
          <div class="flex flex-wrap items-center gap-3 mt-8">
            <a href="#" class="btn btn-primary rounded-field gap-2">
              <LandingIcon name="terminal" :size="16" /> docker compose up
            </a>
            <a href="#" class="btn btn-outline border-white/25 text-white hover:bg-white hover:text-base-content rounded-field gap-2">
              <LandingIcon name="star" :size="16" /> Star on GitHub
            </a>
          </div>
          <div class="flex items-center gap-6 mt-8 text-sm text-white/55">
            <span class="flex items-center gap-2"><LandingIcon name="wifi-off" :size="15" /> Offline-first core</span>
            <span class="flex items-center gap-2"><LandingIcon name="key-round" :size="15" /> Bring your own key</span>
            <span class="flex items-center gap-2"><LandingIcon name="infinity" :size="15" /> Unlimited attempts</span>
          </div>
        </div>
        <div class="space-y-4">
          <LandingTerminalMock light />
          <div class="opacity-95">
            <LandingReadinessPanel compact />
          </div>
        </div>
      </div>

      <!-- logos / trust -->
      <div class="border-t border-white/10">
        <div class="max-w-6xl mx-auto px-6 py-5 flex flex-wrap items-center gap-x-8 gap-y-3 text-white/45 text-sm">
          <span class="text-white/35 uppercase text-xs tracking-wider">Works with your own keys</span>
          <span v-for="p in ['OpenAI', 'Google Gemini', 'Anthropic', 'Ollama (local)', 'Mistral']" :key="p" class="font-mono text-xs">{{ p }}</span>
        </div>
      </div>
    </header>

    <!-- WHO IT'S FOR -->
    <section class="max-w-6xl mx-auto px-6 py-20">
      <div class="text-center max-w-2xl mx-auto reveal">
        <div class="text-xs uppercase tracking-wider font-semibold text-primary">Who it's for</div>
        <h2 class="font-display text-3xl font-bold mt-2">Built to be owned, not rented</h2>
      </div>
      <div class="grid md:grid-cols-3 gap-4 mt-10">
        <div
          v-for="(card, idx) in whoCards"
          :key="card.title"
          class="reveal card-hov bg-base-100 rounded-box border border-base-300 ring-soft p-6"
          :style="{ transitionDelay: `${idx * 80}ms` }"
        >
          <div class="w-11 h-11 rounded-field bg-primary/10 text-primary grid place-items-center">
            <LandingIcon :name="card.icon" :size="20" />
          </div>
          <div class="font-semibold text-lg mt-4">{{ card.title }}</div>
          <p class="text-sm text-base-content/65 mt-1.5 leading-relaxed">{{ card.body }}</p>
        </div>
      </div>
    </section>

    <!-- FOUR SKILLS -->
    <section class="bg-base-200/60 border-y border-base-300">
      <div class="max-w-6xl mx-auto px-6 py-20">
        <div class="max-w-2xl reveal">
          <div class="text-xs uppercase tracking-wider font-semibold text-primary">Every part of the exam</div>
          <h2 class="font-display text-3xl font-bold mt-2">All four skills, one consistent workflow</h2>
          <p class="text-base-content/65 mt-3">Brief → do → review. The same rhythm and the same keyboard flow whether you're reading, writing, listening or speaking.</p>
        </div>
        <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mt-10">
          <div
            v-for="(s, idx) in skills"
            :key="s.id"
            class="reveal card-hov bg-base-100 rounded-box border border-base-300 ring-soft p-5"
            :style="{ transitionDelay: `${idx * 70}ms` }"
          >
            <div class="w-11 h-11 rounded-field grid place-items-center" :class="`bg-${s.tint}-soft text-${s.tint}`">
              <LandingIcon :name="s.icon" :size="20" />
            </div>
            <div class="flex items-center gap-2 mt-4">
              <div class="font-semibold text-lg">{{ s.label }}</div>
              <span class="ml-auto font-mono text-xs text-base-content/45">{{ s.minutes }}m</span>
            </div>
            <p class="text-sm text-base-content/65 mt-1.5 leading-relaxed">{{ s.blurb }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- HOW SELF-HOST WORKS -->
    <section class="max-w-6xl mx-auto px-6 py-20">
      <div class="grid lg:grid-cols-[1fr_1.1fr] gap-12 items-center">
        <div class="reveal">
          <div class="text-xs uppercase tracking-wider font-semibold text-primary">Up and running in minutes</div>
          <h2 class="font-display text-3xl font-bold mt-2">Three steps to your own exam trainer</h2>
          <div class="mt-8 space-y-5">
            <div v-for="(step, idx) in steps" :key="step.title" class="flex gap-4">
              <div class="w-9 h-9 shrink-0 rounded-field bg-primary text-primary-content grid place-items-center font-mono font-bold text-sm">
                {{ idx + 1 }}
              </div>
              <div>
                <div class="font-semibold flex items-center gap-2">
                  {{ step.title }} <LandingIcon :name="step.icon" :size="14" cls="text-base-content/40" />
                </div>
                <p class="text-sm text-base-content/65 mt-0.5 leading-relaxed">{{ step.body }}</p>
              </div>
            </div>
          </div>
        </div>
        <div class="reveal space-y-4">
          <LandingTerminalMock :light="false" />
          <div class="bg-base-100 rounded-box border border-base-300 ring-soft p-4 flex items-start gap-3">
            <div class="w-9 h-9 rounded-field bg-primary/10 text-primary grid place-items-center shrink-0">
              <LandingIcon name="key-round" :size="18" />
            </div>
            <div>
              <div class="font-semibold text-sm">Bring your own key</div>
              <p class="text-xs text-base-content/65 mt-1 leading-relaxed">
                Provider-agnostic. Generation, review and grading all run on <i>your</i> account — so unlimited realistic attempts cost only what your provider charges.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- OPEN SOURCE BANNER -->
    <section class="bg-neutral text-white">
      <div class="max-w-6xl mx-auto px-6 py-16 grid md:grid-cols-[1.4fr_1fr] gap-10 items-center">
        <div class="reveal">
          <div class="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/80">
            <LandingIcon name="git-branch" :size="13" /> 100% open source
          </div>
          <h2 class="font-display text-3xl font-bold mt-4 leading-tight">Transparent structure for exercises, review and grading — fork it, audit it, extend it.</h2>
          <p class="text-white/60 mt-3 max-w-lg">Prompt templates ship as editable demo files. The framework is exam-agnostic by design, so adding a new language or level is seed data, not a rewrite.</p>
          <div class="flex flex-wrap gap-3 mt-6">
            <a href="#" class="btn btn-primary rounded-field gap-2">
              <LandingIcon name="git-branch" :size="16" /> View the repo
            </a>
            <a href="#" class="btn btn-outline border-white/25 text-white hover:bg-white hover:text-base-content rounded-field gap-2">
              <LandingIcon name="book-open" :size="16" /> Read the docs
            </a>
          </div>
        </div>
        <div class="grid grid-cols-2 gap-3 reveal">
          <div v-for="stat in stats" :key="stat.label" class="rounded-box border border-white/10 bg-white/5 p-4">
            <LandingIcon :name="stat.icon" :size="16" cls="text-primary" />
            <div class="font-mono text-2xl font-bold mt-2">{{ stat.value }}</div>
            <div class="text-xs text-white/55">{{ stat.label }}</div>
          </div>
        </div>
      </div>
    </section>

    <!-- PRICING -->
    <section class="max-w-5xl mx-auto px-6 py-20">
      <div class="text-center max-w-2xl mx-auto reveal">
        <div class="text-xs uppercase tracking-wider font-semibold text-primary">Pricing</div>
        <h2 class="font-display text-3xl font-bold mt-2">Free forever if you host it yourself</h2>
        <p class="text-base-content/65 mt-3">Or let us run the same project in the cloud when you'd rather not.</p>
      </div>
      <div class="grid md:grid-cols-2 gap-5 mt-10">
        <div class="reveal card-hov bg-base-100 rounded-box border-2 border-primary ring-soft p-7 relative">
          <span class="absolute top-5 right-5 badge badge-primary badge-sm">Recommended</span>
          <div class="text-sm font-semibold text-primary">Self-hosted</div>
          <div class="font-display text-4xl font-bold mt-2">
            €0<span class="text-base font-normal text-base-content/50"> / forever</span>
          </div>
          <p class="text-sm text-base-content/60 mt-2">Run it on your own machine with your own keys.</p>
          <ul class="mt-5 space-y-2.5 text-sm">
            <li v-for="f in selfHostedFeatures" :key="f" class="flex gap-2.5">
              <LandingIcon name="check" :size="16" cls="text-success shrink-0 mt-0.5" /> {{ f }}
            </li>
          </ul>
          <a href="#" class="btn btn-primary rounded-field w-full mt-6 gap-2">
            <LandingIcon name="terminal" :size="15" /> Get the install command
          </a>
        </div>
        <div class="reveal card-hov bg-base-100 rounded-box border border-base-300 ring-soft p-7">
          <div class="text-sm font-semibold">Hosted cloud</div>
          <div class="font-display text-4xl font-bold mt-2">
            €9.90<span class="text-base font-normal text-base-content/50"> / month</span>
          </div>
          <p class="text-sm text-base-content/60 mt-2">We host it, you just practice. Includes managed AI.</p>
          <ul class="mt-5 space-y-2.5 text-sm">
            <li v-for="f in hostedFeatures" :key="f" class="flex gap-2.5">
              <LandingIcon name="check" :size="16" cls="text-success shrink-0 mt-0.5" /> {{ f }}
            </li>
          </ul>
          <a href="#" class="btn btn-outline border-base-300 rounded-field w-full mt-6">Start free trial</a>
        </div>
      </div>
    </section>

    <!-- FAQ -->
    <section class="bg-base-200/60 border-t border-base-300">
      <div class="max-w-3xl mx-auto px-6 py-20">
        <h2 class="font-display text-3xl font-bold text-center reveal">Frequently asked questions</h2>
        <div class="mt-8 space-y-3">
          <div
            v-for="(item, i) in faq"
            :key="i"
            class="reveal collapse collapse-arrow bg-base-100 rounded-box border border-base-300"
          >
            <input type="checkbox" :checked="i === 0">
            <div class="collapse-title font-semibold text-base">{{ item.q }}</div>
            <div class="collapse-content text-sm text-base-content/70 leading-relaxed">
              <p>{{ item.a }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="max-w-6xl mx-auto px-6 py-20">
      <div class="reveal rounded-box bg-neutral text-white hero-noise p-10 md:p-14 text-center relative overflow-hidden">
        <h2 class="font-display text-4xl font-bold leading-tight">Be ready before exam day.</h2>
        <p class="text-white/65 mt-3 max-w-xl mx-auto">Clone the repo, add a key, and start your first graded attempt in minutes.</p>
        <div class="flex flex-wrap justify-center gap-3 mt-7">
          <a href="#" class="btn btn-primary rounded-field gap-2">
            <LandingIcon name="terminal" :size="16" /> docker compose up
          </a>
          <a href="#" class="btn btn-outline border-white/25 text-white hover:bg-white hover:text-base-content rounded-field gap-2">
            <LandingIcon name="star" :size="16" /> Star on GitHub
          </a>
        </div>
      </div>
    </section>

    <LandingFooter light />
  </div>
</template>

<script setup lang="ts">
useLandingReveal()

definePageMeta({
  layout: 'landing',
})

useHead({
  title: 'Exam.one — Open-source, self-hostable exam practice',
})

const whoCards = [
  { title: 'Self-learners', icon: 'user', body: 'Run it locally like n8n. Your drafts, attempts and results never leave your machine.' },
  { title: 'Tinkerers & devs', icon: 'code-2', body: 'Fork it, edit the prompt templates, add a new exam level. Typed seed data, no lock-in.' },
  { title: 'Schools & tutors', icon: 'graduation-cap', body: 'Host one instance for your cohort and swap in the certification you actually teach.' },
]

const skills = [
  { id: 'reading', label: 'Reading', icon: 'book-open', tint: 'reading', blurb: 'Four short authentic texts — read for gist, detail, and to match offers to people.', minutes: 30 },
  { id: 'writing', label: 'Writing', icon: 'pen-line', tint: 'writing', blurb: 'A casual message and a polite formal email, scored against the real rubric.', minutes: 30 },
  { id: 'listening', label: 'Listening', icon: 'headphones', tint: 'listening', blurb: 'Announcements, a long matching dialogue, short exchanges and an interview.', minutes: 25 },
  { id: 'speaking', label: 'Speaking', icon: 'mic', tint: 'speaking', blurb: 'Interview, monologue and a planning task — recorded and evaluated like the exam.', minutes: 15 },
]

const steps = [
  { title: 'Clone & compose', icon: 'git-branch', body: 'One command spins up the Nuxt frontend. No database, no backend to wire up for the MVP.' },
  { title: 'Add your LLM key', icon: 'key-round', body: 'Paste a key from any provider — or point it at a local model. AI stays an optional enhancement.' },
  { title: 'Practice offline', icon: 'wifi-off', body: 'Core reading, writing, listening and speaking flows work with zero network. Your data lives in your browser.' },
]

const stats = [
  { value: '21.4k', label: 'GitHub stars', icon: 'star' },
  { value: 'MIT', label: 'License', icon: 'scale' },
  { value: '2', label: 'Exams in MVP', icon: 'file-badge' },
  { value: '∞', label: 'Attempts', icon: 'infinity' },
]

const selfHostedFeatures = [
  'All four skills + mock exam mode',
  'Bring-your-own-key AI review',
  'Editable prompt templates',
  'Offline-first, data stays local',
  'Community support',
]

const hostedFeatures = [
  'Everything in self-hosted',
  'No setup — sign in and go',
  'Managed AI review included',
  'Cloud sync across devices',
  'Full mock-exam library',
]

const faq = [
  { q: 'Do I need an LLM key to use it?', a: 'No. Core practice for all four skills works fully offline. AI review and exercise generation are optional enhancements that use your own provider key.' },
  { q: 'Which exams are supported?', a: 'The MVP ships with German Goethe A2 and English Cambridge A2. The framework is exam-agnostic — more levels and languages come as typed seed data.' },
  { q: 'Where is my data stored?', a: 'Everything — drafts, attempts, results — lives client-side in your browser. Nothing is sent anywhere except your chosen LLM provider when you opt into AI.' },
  { q: 'What does the mock exam mode do?', a: 'A true single-attempt simulation: exam-authentic timers, no pauses, and no feedback until you submit — the same constraints as the real test.' },
]
</script>
