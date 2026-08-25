<template>
  <div class="min-h-screen bg-base-200 flex items-center justify-center p-4 lg:p-8">
    <div class="card bg-base-100 shadow-xl w-full max-w-5xl overflow-hidden border border-base-300">
      <div class="grid lg:grid-cols-2 min-h-[640px]">
        <AuthAside />
        <div class="flex flex-col p-7 sm:p-10">
          <div class="flex items-center justify-between gap-3 lg:hidden mb-8">
            <div class="flex items-center gap-2">
              <div
                class="w-7 h-7 rounded-field bg-primary text-primary-content grid place-items-center font-display font-bold text-sm"
              >
                E
              </div>
              <div class="font-display font-bold leading-none">
                Exam<span class="text-primary">.one</span>
              </div>
            </div>
          </div>
          <div class="flex-1 flex items-center justify-center">
            <div class="w-full max-w-sm">
              <slot />
            </div>
          </div>
          <div v-if="$slots['footer']" class="pt-6 text-center text-sm text-base-content/60">
            <slot name="footer" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
