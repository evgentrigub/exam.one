<template>
  <div class="bg-base-100 rounded-box border border-base-300 ring-soft overflow-hidden text-left">
    <div class="px-4 h-11 flex items-center gap-2 border-b border-base-300">
      <span class="inline-flex items-center gap-1.5 text-xs font-semibold text-writing">
        <LandingIcon name="pen-line" :size="13" /> Writing · Formal email
      </span>
      <span class="ml-auto level-pip">Sie · 30–40 words</span>
    </div>

    <div class="p-4 text-sm leading-relaxed text-base-content/85">
      Sehr geehrte Damen und Herren,
      <mark class="fb-good">ich möchte einen Termin</mark>
      für nächste Woche
      <mark class="fb-bad">vereinbahren</mark>.
      Können Sie mir
      <mark class="fb-good">am Dienstag</mark>
      einen Platz
      <mark class="fb-bad">gében</mark>?
      Mit freundlichen Grüßen, Lena.
    </div>

    <div class="mx-4 mb-4 rounded-field bg-base-200/70 border border-base-300 p-3">
      <div class="flex items-center gap-2 mb-2">
        <LandingIcon name="sparkles" :size="14" cls="text-primary" />
        <span class="text-xs font-semibold">AI review · CEFR rubric</span>
        <span class="ml-auto font-mono text-sm font-bold text-success">
          4.4<span class="text-base-content/40">/5</span>
        </span>
      </div>
      <ul class="text-xs text-base-content/70 space-y-1.5">
        <li class="flex gap-2">
          <LandingIcon name="check" :size="13" cls="text-success shrink-0 mt-0.5" />
          Register and greeting fit a formal email.
        </li>
        <li class="flex gap-2">
          <LandingIcon name="x" :size="13" cls="text-error shrink-0 mt-0.5" />
          Spelling: <i>vereinbahren → vereinbaren</i>, <i>gében → geben</i>.
        </li>
      </ul>
    </div>
  </div>
</template>
