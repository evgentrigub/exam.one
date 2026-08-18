<template>
  <div class="relative hidden lg:flex flex-col justify-between p-10 bg-base-200 overflow-hidden">
    <div
      class="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-primary/10 blur-3xl pointer-events-none"
    />
    <div
      class="absolute -bottom-28 -right-20 w-80 h-80 rounded-full bg-info/10 blur-3xl pointer-events-none"
    />

    <div class="relative flex items-center gap-2">
      <div
        class="w-8 h-8 rounded-field bg-primary text-primary-content grid place-items-center font-display font-bold"
      >
        E
      </div>
      <div class="font-display text-lg font-bold leading-none">
        Exam<span class="text-primary">.one</span>
      </div>
    </div>

    <div class="relative">
      <p class="font-display text-3xl font-bold leading-tight max-w-sm text-pretty">
        {{ $t('auth.asideTitle') }}
      </p>
      <p class="mt-3 text-base-content/65 max-w-sm text-pretty">
        {{ $t('auth.asideBody') }}
      </p>
    </div>

    <p class="relative text-[11px] text-base-content/45 leading-relaxed max-w-sm">
      {{ $t('auth.asideHint') }}
    </p>
  </div>
</template>
