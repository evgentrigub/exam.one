<template>
  <div class="bg-base-100">
    <nav class="sticky top-0 z-40 bg-base-100/85 backdrop-blur border-b border-base-300">
      <div class="max-w-6xl mx-auto px-6 h-16 flex items-center gap-6">
        <LandingWordmark />
        <div class="hidden md:flex items-center gap-6 ml-4 text-sm text-base-content/65">
          <a v-for="link in ['How it works', 'Skills', 'Pricing', 'Exams']" :key="link" href="#" class="hover:text-primary cursor-pointer">
            {{ link }}
          </a>
        </div>
        <div class="ml-auto flex items-center gap-2">
          <a href="#" class="btn btn-sm btn-ghost rounded-field hidden sm:inline-flex whitespace-nowrap">Sign in</a>
          <a href="#" class="btn btn-sm btn-primary rounded-field gap-1.5 whitespace-nowrap">
            Start free <LandingIcon name="arrow-right" :size="14" />
          </a>
        </div>
      </div>
    </nav>

    <!-- HERO -->
    <header class="relative overflow-hidden">
      <div class="absolute inset-0 grid-pattern opacity-60" />
      <div class="absolute -top-24 -right-24 w-[420px] h-[420px] rounded-full bg-primary/10 blur-3xl" />
      <div class="relative max-w-6xl mx-auto px-6 pt-20 pb-20 grid lg:grid-cols-[1fr_1.05fr] gap-12 items-center">
        <div>
          <div class="inline-flex items-center gap-2 rounded-full border border-base-300 bg-base-100 px-3 py-1.5 text-xs font-medium text-base-content/70">
            <span class="flex -space-x-1">
              <span v-for="s in skills" :key="s.id" class="w-4 h-4 rounded-full border-2 border-base-100" :class="`bg-${s.tint}-soft`" />
            </span>
            Reading · Writing · Listening · Speaking
          </div>
          <h1 class="font-display text-5xl lg:text-[3.7rem] font-bold leading-[1.04] mt-5 tracking-tight">
            Walk into your exam<br>already knowing<br><span class="text-primary">you'll pass.</span>
          </h1>
          <p class="text-lg text-base-content/65 mt-5 max-w-lg leading-relaxed">
            Unlimited, exam-realistic practice across every skill — with instant AI feedback that tells you exactly what to fix before the real test.
          </p>
          <div class="flex flex-wrap items-center gap-3 mt-8">
            <a href="#" class="btn btn-primary btn-lg rounded-field gap-2">
              Start practising free <LandingIcon name="arrow-right" :size="17" />
            </a>
            <a href="#" class="btn btn-ghost btn-lg rounded-field gap-2">
              <LandingIcon name="play-circle" :size="18" /> See how it works
            </a>
          </div>
          <div class="flex items-center gap-2 mt-6 text-sm text-base-content/55">
            <LandingIcon name="check-circle-2" :size="16" cls="text-success" /> No card needed
            <span class="mx-1">·</span>
            <LandingIcon name="check-circle-2" :size="16" cls="text-success" /> Free forever plan
          </div>
        </div>
        <div class="relative reveal in">
          <LandingReadinessPanel />
          <div class="absolute -bottom-6 -left-6 hidden md:block w-56 rotate-[-3deg]">
            <div class="bg-base-100 rounded-box border border-base-300 ring-soft p-3 card-hov">
              <div class="flex items-center gap-2">
                <LandingIcon name="flame" :size="15" cls="text-warning" />
                <span class="text-xs font-semibold">12-day streak</span>
              </div>
              <div class="font-mono text-2xl font-bold mt-1">
                147<span class="text-sm text-base-content/40"> / 210 min</span>
              </div>
              <div class="text-[11px] text-base-content/55">this week</div>
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- OUTCOME STATS -->
    <section class="border-y border-base-300 bg-base-200/50">
      <div class="max-w-5xl mx-auto px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
        <div v-for="stat in outcomeStats" :key="stat.label" class="reveal">
          <div class="font-display text-3xl md:text-4xl font-bold text-primary">{{ stat.value }}</div>
          <div class="text-sm text-base-content/60 mt-1">{{ stat.label }}</div>
        </div>
      </div>
    </section>

    <!-- HOW IT WORKS -->
    <section class="max-w-6xl mx-auto px-6 py-20">
      <div class="text-center max-w-2xl mx-auto reveal">
        <div class="text-xs uppercase tracking-wider font-semibold text-primary">How it works</div>
        <h2 class="font-display text-3xl md:text-4xl font-bold mt-2">A loop that actually makes you ready</h2>
      </div>
      <div class="grid md:grid-cols-3 gap-4 mt-10">
        <div
          v-for="(card, idx) in howCards"
          :key="card.title"
          class="reveal card-hov bg-base-100 rounded-box border border-base-300 ring-soft p-6"
          :style="{ transitionDelay: `${idx * 80}ms` }"
        >
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-field bg-primary/10 text-primary grid place-items-center">
              <LandingIcon :name="card.icon" :size="19" />
            </div>
            <span class="font-mono text-xs text-base-content/40">0{{ idx + 1 }}</span>
          </div>
          <div class="font-semibold text-lg mt-4">{{ card.title }}</div>
          <p class="text-sm text-base-content/65 mt-1.5 leading-relaxed">{{ card.body }}</p>
        </div>
      </div>
    </section>

    <!-- SKILL SHOWCASE — alternating -->
    <section class="bg-base-200/50 border-y border-base-300">
      <div class="max-w-6xl mx-auto px-6 py-20 space-y-16">
        <div class="grid lg:grid-cols-2 gap-10 items-center">
          <div class="reveal">
            <span class="inline-flex items-center gap-1.5 text-xs font-semibold text-writing uppercase tracking-wide">
              <LandingIcon name="pen-line" :size="13" /> Writing
            </span>
            <h3 class="font-display text-3xl font-bold mt-3 leading-tight">See your own words marked up, instantly</h3>
            <p class="text-base-content/65 mt-3 leading-relaxed max-w-md">
              Your text sits right next to the feedback — green for what works, underlined for what to fix — with a rubric score and a model answer to compare against.
            </p>
            <ul class="mt-5 space-y-2.5 text-sm">
              <li v-for="f in writingFeatures" :key="f" class="flex gap-2.5">
                <LandingIcon name="check" :size="16" cls="text-success shrink-0 mt-0.5" /> {{ f }}
              </li>
            </ul>
          </div>
          <div class="reveal"><LandingWritingFeedback /></div>
        </div>

        <div class="grid lg:grid-cols-2 gap-10 items-center">
          <div class="reveal lg:order-2">
            <span class="inline-flex items-center gap-1.5 text-xs font-semibold text-speaking uppercase tracking-wide">
              <LandingIcon name="mic" :size="13" /> Speaking
            </span>
            <h3 class="font-display text-3xl font-bold mt-3 leading-tight">Record, transcribe, and get scored like the real thing</h3>
            <p class="text-base-content/65 mt-3 leading-relaxed max-w-md">
              Answer practice questions out loud. Exam.one can transcribe each take and review the editable transcript — so you build confidence before you ever face an examiner.
            </p>
            <ul class="mt-5 space-y-2.5 text-sm">
              <li v-for="f in speakingFeatures" :key="f" class="flex gap-2.5">
                <LandingIcon name="check" :size="16" cls="text-success shrink-0 mt-0.5" /> {{ f }}
              </li>
            </ul>
          </div>
          <div class="reveal lg:order-1"><LandingSpeakingMock /></div>
        </div>
      </div>
    </section>

    <!-- FOUR SKILLS GRID -->
    <section class="max-w-6xl mx-auto px-6 py-20">
      <div class="text-center max-w-2xl mx-auto reveal">
        <div class="text-xs uppercase tracking-wider font-semibold text-primary">Complete coverage</div>
        <h2 class="font-display text-3xl md:text-4xl font-bold mt-2">Train every part the exam tests</h2>
      </div>
      <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-10">
        <div
          v-for="(s, idx) in skills"
          :key="s.id"
          class="reveal card-hov bg-base-100 rounded-box border border-base-300 ring-soft p-5"
          :style="{ transitionDelay: `${idx * 70}ms` }"
        >
          <div class="w-12 h-12 rounded-box grid place-items-center" :class="`bg-${s.tint}-soft text-${s.tint}`">
            <LandingIcon :name="s.icon" :size="22" />
          </div>
          <div class="font-semibold text-lg mt-4">{{ s.label }}</div>
          <p class="text-sm text-base-content/65 mt-1.5 leading-relaxed">{{ s.blurb }}</p>
          <div class="mt-3 font-mono text-xs text-base-content/45">{{ s.minutes }} min section</div>
        </div>
      </div>
    </section>

    <!-- MOCK EXAM -->
    <section class="bg-base-200/50 border-y border-base-300">
      <div class="max-w-6xl mx-auto px-6 py-20 grid lg:grid-cols-[1fr_1.1fr] gap-10 items-center">
        <div class="reveal">
          <div class="text-xs uppercase tracking-wider font-semibold text-primary">Mock exam mode</div>
          <h2 class="font-display text-3xl md:text-4xl font-bold mt-2 leading-tight">Rehearse the real thing — pressure and all</h2>
          <p class="text-base-content/65 mt-3 leading-relaxed max-w-md">
            A single timed attempt with exam-authentic rules: no pauses, no peeking at feedback until you submit. The closest thing to exam day, as many times as you need.
          </p>
          <a href="#" class="btn btn-primary rounded-field gap-2 mt-6">
            Try a mock exam <LandingIcon name="arrow-right" :size="16" />
          </a>
        </div>
        <div class="reveal"><LandingMockExamStrip /></div>
      </div>
    </section>

    <!-- SUPPORTED EXAMS + TESTIMONIAL -->
    <section class="max-w-6xl mx-auto px-6 py-20 grid lg:grid-cols-2 gap-10">
      <div class="reveal">
        <div class="text-xs uppercase tracking-wider font-semibold text-primary">Supported today</div>
        <h2 class="font-display text-3xl font-bold mt-2">Two exams now, any exam soon</h2>
        <p class="text-base-content/65 mt-3 max-w-md">A generic framework that adapts to any certification with light configuration — more levels and languages are on the way.</p>
        <div class="grid sm:grid-cols-2 gap-3 mt-6">
          <div
            v-for="(exam, i) in exams"
            :key="i"
            class="rounded-box border border-base-300 p-4 flex items-center gap-3"
            :class="i > 1 ? 'opacity-60 border-dashed' : 'bg-base-100 ring-soft'"
          >
            <span class="text-2xl">{{ exam.flag }}</span>
            <div>
              <div class="font-semibold text-sm">{{ exam.name }}</div>
              <div class="text-xs text-base-content/55">{{ exam.level }}</div>
            </div>
          </div>
        </div>
      </div>
      <div class="reveal flex">
        <div class="bg-primary text-primary-content rounded-box p-8 flex flex-col justify-between w-full">
          <LandingIcon name="quote" :size="28" cls="opacity-40" />
          <p class="font-display text-2xl font-semibold leading-snug mt-4">
            "I took the same mock six times. By the real exam, nothing surprised me — I passed Goethe A2 first try."
          </p>
          <div class="flex items-center gap-3 mt-6">
            <span class="w-10 h-10 rounded-full bg-primary-content/20 grid place-items-center font-semibold text-sm">LB</span>
            <div>
              <div class="font-semibold text-sm">Lena Bauer</div>
              <div class="text-xs opacity-70">Self-learner · Munich</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- PRICING -->
    <section class="bg-base-200/50 border-t border-base-300">
      <div class="max-w-5xl mx-auto px-6 py-20">
        <div class="text-center max-w-2xl mx-auto reveal">
          <div class="text-xs uppercase tracking-wider font-semibold text-primary">Pricing</div>
          <h2 class="font-display text-3xl md:text-4xl font-bold mt-2">Start free. Upgrade when you're serious.</h2>
        </div>
        <div class="grid md:grid-cols-2 gap-5 mt-10">
          <div class="reveal card-hov bg-base-100 rounded-box border border-base-300 ring-soft p-7">
            <div class="text-sm font-semibold">Free</div>
            <div class="font-display text-4xl font-bold mt-2">
              €0<span class="text-base font-normal text-base-content/50"> / forever</span>
            </div>
            <p class="text-sm text-base-content/60 mt-2">Everything you need to get started.</p>
            <ul class="mt-5 space-y-2.5 text-sm">
              <li v-for="f in freeFeatures" :key="f" class="flex gap-2.5">
                <LandingIcon name="check" :size="16" cls="text-success shrink-0 mt-0.5" /> {{ f }}
              </li>
            </ul>
            <a href="#" class="btn btn-outline border-base-300 rounded-field w-full mt-6">Get started</a>
          </div>
          <div class="reveal card-hov bg-base-100 rounded-box border-2 border-primary ring-soft p-7 relative">
            <span class="absolute top-5 right-5 badge badge-primary badge-sm">Most popular</span>
            <div class="text-sm font-semibold text-primary">Pro</div>
            <div class="font-display text-4xl font-bold mt-2">
              €9.90<span class="text-base font-normal text-base-content/50"> / month</span>
            </div>
            <p class="text-sm text-base-content/60 mt-2">Unlimited AI review and the full library.</p>
            <ul class="mt-5 space-y-2.5 text-sm">
              <li v-for="f in proFeatures" :key="f" class="flex gap-2.5">
                <LandingIcon name="check" :size="16" cls="text-success shrink-0 mt-0.5" /> {{ f }}
              </li>
            </ul>
            <a href="#" class="btn btn-primary rounded-field w-full mt-6 gap-2">
              Start free trial <LandingIcon name="arrow-right" :size="15" />
            </a>
          </div>
        </div>
        <p class="text-center text-sm text-base-content/55 mt-6 reveal">
          Prefer to self-host? Exam.one is open source — <a href="#" class="text-primary font-medium cursor-pointer">run it free on your own machine</a>.
        </p>
      </div>
    </section>

    <!-- CTA -->
    <section class="max-w-6xl mx-auto px-6 py-20">
      <div class="reveal rounded-box border border-base-300 ring-soft bg-base-100 dot-pattern p-10 md:p-14 text-center relative overflow-hidden">
        <h2 class="font-display text-4xl font-bold leading-tight">Your exam date isn't going to wait.</h2>
        <p class="text-base-content/65 mt-3 max-w-xl mx-auto">Start your first realistic attempt today — free, no card, all four skills.</p>
        <a href="#" class="btn btn-primary btn-lg rounded-field gap-2 mt-7">
          Start practising free <LandingIcon name="arrow-right" :size="17" />
        </a>
      </div>
    </section>

    <LandingFooter />
  </div>
</template>

<script setup lang="ts">
useLandingReveal()

definePageMeta({
  layout: 'landing',
})

useHead({
  title: 'Exam.one — Practice until you pass',
})

const skills = [
  { id: 'reading', label: 'Reading', icon: 'book-open', tint: 'reading', blurb: 'Four short authentic texts — read for gist, detail, and to match offers to people.', minutes: 30 },
  { id: 'writing', label: 'Writing', icon: 'pen-line', tint: 'writing', blurb: 'A casual message and a polite formal email, scored against the real rubric.', minutes: 30 },
  { id: 'listening', label: 'Listening', icon: 'headphones', tint: 'listening', blurb: 'Announcements, a long matching dialogue, short exchanges and an interview.', minutes: 25 },
  { id: 'speaking', label: 'Speaking', icon: 'mic', tint: 'speaking', blurb: 'Interview, monologue and a planning task — recorded and evaluated like the exam.', minutes: 15 },
]

const outcomeStats = [
  { value: '∞', label: 'Realistic attempts' },
  { value: '4', label: 'Skills covered' },
  { value: '<2s', label: 'AI feedback' },
  { value: '100%', label: 'Exam-format match' },
]

const howCards = [
  { title: 'Practise the real format', icon: 'layers', body: 'Every exercise mirrors the actual exam parts, timings and question types — no surprises on the day.' },
  { title: 'Get feedback that teaches', icon: 'message-square-quote', body: 'AI marks your writing and speaking against the real rubric and names the exact thing to fix.' },
  { title: 'Watch your readiness rise', icon: 'trending-up', body: 'A single readiness score per skill shows where you stand today and what to drill tomorrow.' },
]

const writingFeatures = [
  'CEFR-aligned scoring',
  'Inline corrections, not vague advice',
  'Model answer for every task',
]

const speakingFeatures = [
  'Live transcript as you speak',
  'Fluency & accuracy scoring',
  'Interview, monologue & planning tasks',
]

const exams = [
  { flag: '🇩🇪', name: 'Goethe', level: 'German · A2' },
  { flag: '🇬🇧', name: 'Cambridge', level: 'English · A2' },
  { flag: '🇩🇪', name: 'Goethe', level: 'German · B1 · soon' },
  { flag: '➕', name: 'Your exam', level: 'Configure it' },
]

const freeFeatures = [
  'All practice exercises',
  'Self-checked feedback',
  'Basic progress tracking',
  '1 mock exam per level',
]

const proFeatures = [
  'Everything in Free',
  'Unlimited AI writing & speaking review',
  'Full mock-exam library',
  'Weak-spot drills & insights',
]
</script>
