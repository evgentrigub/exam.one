import {
  findPrompt,
  getLivePack,
  generatorParts,
  type PromptKind,
  type PromptVars,
  type SkillId,
} from '@exam-one/exam-packs'

export function usePackPrompt(requestPackId?: string) {
  const active = useActivePack()
  const pack = computed(() => requestPackId ? getLivePack(requestPackId) : active.pack.value)
  const examLevel = computed(() => pack.value.cefr)

  function assemble(
    skill: SkillId,
    part: number,
    kind: PromptKind,
    vars: PromptVars = {}
  ): string | undefined {
    return findPrompt(pack.value, skill, part, kind)?.assemble(vars)
  }

  function generators(skill: SkillId, count = 1): Array<{ part: number; prompt: string }> {
    return generatorParts(pack.value, skill, count)
  }

  return {
    pack,
    examLevel,
    assemble,
    generators,
  }
}
