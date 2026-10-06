<template>
  <ClientOnly>
    <Teleport to="body">
      <div v-if="center.toasts.value.length" class="fixed bottom-5 right-5 z-[70] flex flex-col gap-2 w-[340px] max-w-[calc(100vw-2rem)]" role="status">
        <div v-for="toast in center.toasts.value" :key="toast.id" class="bg-base-100 rounded-box border border-base-300 shadow-xl p-3 flex gap-3 items-center">
          <ActivityKindIcon :type="toast.job.type" :status="toast.job.status" :size="30" />
          <div class="flex-1 min-w-0">
            <div class="text-xs font-semibold truncate">{{ $t(`activity.status.${toast.job.status}`) }}</div>
            <div class="text-[11px] text-base-content/55 truncate">{{ toast.job.title }}</div>
          </div>
          <button v-if="toast.job.status === 'COMPLETED'" class="btn btn-primary btn-xs rounded-full" @click="void center.navigate(toast.job); center.dismissToast(toast.id)">{{ $t('activity.open') }}</button>
          <button v-else class="btn btn-outline btn-error btn-xs rounded-full" @click="void center.retry(toast.job.id); center.dismissToast(toast.id)">{{ $t('activity.retry') }}</button>
          <button class="btn btn-ghost btn-xs btn-circle" :aria-label="$t('activity.dismiss')" @click="center.dismissToast(toast.id)"><X :size="12" /></button>
        </div>
      </div>
    </Teleport>
  </ClientOnly>
</template>

<script setup lang="ts">
import { X } from 'lucide-vue-next'
const center = useJobCenter()
</script>
