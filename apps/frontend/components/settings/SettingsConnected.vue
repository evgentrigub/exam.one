<template>
  <SetCard>
    <SetHead :title="$t('settings.connectedTitle')" :desc="$t('settings.connectedDesc')" />
    <div class="divide-y divide-base-300">
      <div class="flex items-start gap-4 py-4">
        <div class="grid size-10 place-items-center rounded-field bg-base-200 shrink-0">
          <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill="#4285F4"
              d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5a5.6 5.6 0 0 1-2.4 3.6v3h3.9c2.3-2.1 3.5-5.2 3.5-8.8Z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.2 0 5.9-1.1 7.9-2.9l-3.9-3a7.2 7.2 0 0 1-10.7-3.8h-4v3.1A12 12 0 0 0 12 24Z"
            />
            <path
              fill="#FBBC05"
              d="M5.3 14.3a7.1 7.1 0 0 1 0-4.6v-3.1h-4a12 12 0 0 0 0 10.8l4-3.1Z"
            />
            <path
              fill="#EA4335"
              d="M12 4.8c1.8 0 3.4.6 4.6 1.8l3.4-3.4A12 12 0 0 0 1.3 6.6l4 3.1A7.2 7.2 0 0 1 12 4.8Z"
            />
          </svg>
        </div>
        <div class="min-w-0 flex-1">
          <div class="font-medium leading-tight">{{ $t('settings.google') }}</div>
          <div class="text-sm text-base-content/60 mt-1">
            {{ $t('settings.googleNotConnected') }}
          </div>
        </div>
        <button
          type="button"
          class="btn btn-sm btn-primary rounded-field shrink-0"
          disabled
          :title="$t('auth.googleUnavailable')"
        >
          {{ $t('settings.googleConnect') }}
        </button>
      </div>
    </div>
    <p class="mt-2 text-xs text-base-content/50">{{ $t('auth.googleUnavailable') }}</p>
  </SetCard>
</template>
