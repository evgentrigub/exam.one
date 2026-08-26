<template>
  <div class="flex flex-col gap-5">
    <SetCard>
      <SetHead :title="$t('settings.dataTitle')" :desc="$t('settings.dataDesc')" />
      <div class="divide-y divide-base-300">
        <SetRow
          :icon="Download"
          :title="$t('settings.exportTitle')"
          :desc="$t('settings.exportDesc')"
        >
          <template #control>
            <button
              type="button"
              class="btn btn-sm btn-outline rounded-field"
              disabled
              :title="$t('settings.dataUnavailable')"
            >
              {{ $t('settings.export') }}
            </button>
          </template>
        </SetRow>
        <SetRow
          :icon="Upload"
          :title="$t('settings.importTitle')"
          :desc="$t('settings.importDesc')"
        >
          <template #control>
            <button
              type="button"
              class="btn btn-sm btn-outline rounded-field"
              disabled
              :title="$t('settings.dataUnavailable')"
            >
              {{ $t('settings.import') }}
            </button>
          </template>
        </SetRow>
      </div>
      <p class="mt-3 text-xs text-base-content/50">{{ $t('settings.dataUnavailable') }}</p>
    </SetCard>

    <SetCard class-name="p-6 border-error/25">
      <SetHead
        danger
        :title="$t('settings.dangerTitle')"
        :desc="$t('settings.dangerDesc')"
      />
      <div class="divide-y divide-base-300">
        <SetRow
          danger
          :icon="PauseCircle"
          :title="$t('settings.pauseTitle')"
          :desc="$t('settings.pauseDesc')"
        >
          <template #control>
            <button
              type="button"
              class="btn btn-sm btn-outline rounded-field"
              disabled
              :title="$t('settings.deleteUnavailable')"
            >
              {{ $t('settings.pause') }}
            </button>
          </template>
        </SetRow>
        <SetRow
          danger
          :icon="Trash2"
          :title="$t('settings.deleteTitle')"
          :desc="$t('settings.deleteDesc')"
        >
          <template #control>
            <button
              type="button"
              class="btn btn-sm btn-error rounded-field"
              disabled
              :title="$t('settings.deleteUnavailable')"
            >
              {{ $t('settings.delete') }}
            </button>
          </template>
        </SetRow>
      </div>
      <p class="mt-3 text-xs text-base-content/50">{{ $t('settings.deleteUnavailable') }}</p>
    </SetCard>
  </div>
</template>

<script setup lang="ts">
import { Download, PauseCircle, Trash2, Upload } from 'lucide-vue-next'
</script>
