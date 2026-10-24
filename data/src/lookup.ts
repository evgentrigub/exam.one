import type { ExamPack, ExamPart, PromptKind, PromptSpec, SkillId } from './types'

export function findPrompt(
  pack: ExamPack,
  skill: SkillId,
  part: number,
  kind: PromptKind
): PromptSpec | undefined {
  return pack.prompts.find(spec => spec.skill === skill && spec.part === part && spec.kind === kind)
}

export function getAvailableExamParts(pack: ExamPack, skill: SkillId): ExamPart[] {
  return (
    pack.structure
      .find(module => module.id === skill)
      ?.parts.filter(part => part.available !== false) ?? []
  )
}

export function generatorParts(
  pack: ExamPack,
  skill: SkillId,
  count = 1
): Array<{ part: number; prompt: string }> {
  return pack.prompts
    .filter(spec => spec.skill === skill && spec.kind === 'generator')
    .slice()
    .sort((left, right) => left.part - right.part)
    .map(spec => ({ part: spec.part, prompt: spec.assemble({ count }) }))
}

export function packTotalMinutes(pack: ExamPack): number {
  return pack.structure.reduce((sum, module) => sum + module.minutes, 0)
}

export function packTotalPoints(pack: ExamPack): number {
  return pack.structure.reduce((sum, module) => sum + module.points, 0)
}
