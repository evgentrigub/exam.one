import {
  DEFAULT_PACK_ID,
  getAvailableExamParts,
  getLivePack,
  listLivePacks,
  type ExamPack,
  type ExamPart,
  type SkillId,
} from '@exam-one/exam-packs'
import { storeToRefs } from 'pinia'
import { useSettingsStore } from '~/stores/settings'
import type { Difficulty } from '~/utils/types'

export function useActivePack() {
  const settingsStore = useSettingsStore()
  const { packId } = storeToRefs(settingsStore)

  const pack = computed((): ExamPack => getLivePack(packId.value || DEFAULT_PACK_ID))
  const livePacks = listLivePacks()
  const examLevel = computed<Difficulty>(() => pack.value.cefr)

  function partsFor(skill: SkillId): ExamPart[] {
    return getAvailableExamParts(pack.value, skill)
  }

  return {
    pack,
    packId,
    examLevel,
    livePacks,
    partsFor,
  }
}
