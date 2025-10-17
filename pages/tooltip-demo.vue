<template>
  <div class="min-h-screen bg-gray-50 p-8">
    <div class="max-w-4xl mx-auto">
      <h1 class="text-3xl font-bold text-gray-900 mb-8">
        Tooltip Component Demo
      </h1>

      <div class="bg-white rounded-lg shadow-md p-8 space-y-12">
        <!-- Position demos -->
        <div>
          <h2 class="text-xl font-semibold text-gray-800 mb-6">
            Tooltip Positions
          </h2>
          <div class="flex items-center justify-center gap-12 py-16">
            <Tooltip text="Top tooltip" position="top">
              <button class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                Hover me (Top)
              </button>
            </Tooltip>

            <Tooltip text="Bottom tooltip" position="bottom">
              <button class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
                Hover me (Bottom)
              </button>
            </Tooltip>

            <Tooltip text="Left tooltip" position="left">
              <button class="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700">
                Hover me (Left)
              </button>
            </Tooltip>

            <Tooltip text="Right tooltip" position="right">
              <button class="px-4 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700">
                Hover me (Right)
              </button>
            </Tooltip>
          </div>
        </div>

        <!-- Icon button demo (like the repeat button) -->
        <div>
          <h2 class="text-xl font-semibold text-gray-800 mb-6">
            Icon Button with Tooltip (Writing Exercise Use Case)
          </h2>
          <div class="flex items-center justify-center gap-4 py-8">
            <button class="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700">
              {{ $t('writing.checkReview') }}
            </button>

            <Tooltip :text="$t('writing.repeatExercise')" position="top">
              <button class="px-3 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                </svg>
              </button>
            </Tooltip>
          </div>
        </div>

        <!-- Multiple tooltips -->
        <div>
          <h2 class="text-xl font-semibold text-gray-800 mb-6">
            Multiple Tooltips in a Row
          </h2>
          <div class="flex items-center justify-center gap-4 py-8">
            <Tooltip text="Edit document" position="top">
              <button class="p-3 bg-gray-200 rounded-md hover:bg-gray-300">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                </svg>
              </button>
            </Tooltip>

            <Tooltip text="Delete document" position="top">
              <button class="p-3 bg-red-100 text-red-600 rounded-md hover:bg-red-200">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                </svg>
              </button>
            </Tooltip>

            <Tooltip text="Download file" position="top">
              <button class="p-3 bg-blue-100 text-blue-600 rounded-md hover:bg-blue-200">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
                </svg>
              </button>
            </Tooltip>

            <Tooltip text="Share with others" position="top">
              <button class="p-3 bg-green-100 text-green-600 rounded-md hover:bg-green-200">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/>
                </svg>
              </button>
            </Tooltip>
          </div>
        </div>

        <!-- Instructions -->
        <div class="border-t pt-6">
          <h3 class="text-lg font-medium text-gray-700 mb-3">
            Features:
          </h3>
          <ul class="list-disc list-inside space-y-2 text-gray-600">
            <li>Smooth fade-in/out animation with scale effect</li>
            <li>200ms delay before showing (prevents accidental triggers)</li>
            <li>Small arrow pointing to the trigger element</li>
            <li>Four position options: top, bottom, left, right</li>
            <li>Dark theme with shadow for better contrast</li>
            <li>Fully accessible with keyboard support (focus/blur)</li>
            <li>Reusable component - use anywhere in the app</li>
          </ul>
        </div>
      </div>

      <div class="mt-8 text-center">
        <NuxtLink to="/writing" class="text-blue-600 hover:text-blue-800 font-medium">
          ← Back to Writing Exercise
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Demo page for Tooltip component
</script>

