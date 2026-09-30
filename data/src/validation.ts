import { LAYOUT_FORMATS, OBJECTIVE_FORMATS, type ExamPack } from './types'

export function validatePacks(packs: readonly ExamPack[]): void {
  const identities = new Set<string>()
  for (const pack of packs) {
    const fail = (message: string): never => { throw new Error(`Pack ${pack.packId}: ${message}`) }
    for (const id of new Set([pack.packId, ...pack.examIds])) {
      if (identities.has(id)) fail(`duplicate identity ${id}`)
      identities.add(id)
    }
    if (!pack.live) continue
    if (!pack.cefr || !pack.language || !pack.title) fail('missing identity fields')
    if (new Set(pack.structure.map(m => m.id)).size !== pack.structure.length) fail('duplicate modules')
    const slots = new Set<string>()
    for (const prompt of pack.prompts) {
      const slot = `${prompt.skill}:${prompt.part}:${prompt.kind}`
      if (slots.has(slot)) fail(`duplicate prompt ${slot}`)
      slots.add(slot)
      if (!pack.structure.find(m => m.id === prompt.skill)?.parts.some(p => p.n === prompt.part)) fail(`unknown prompt part ${slot}`)
    }
    for (const [skill, seeds] of Object.entries(pack.seedExercises ?? {})) {
      const ids = new Set<string>()
      for (const seed of seeds ?? []) {
        const id = seed['id']
        if (typeof id !== 'string' || !id) fail(`${skill} seed without an id`)
        if (ids.has(String(id))) fail(`duplicate ${skill} seed ${String(id)}`)
        ids.add(String(id))
      }
    }
    for (const module of pack.structure) {
      if (new Set(module.parts.map(p => p.n)).size !== module.parts.length) fail(`duplicate ${module.id} parts`)
      for (const part of module.parts) {
        if (!Number.isInteger(part.n) || part.n < 1) fail('invalid part number')
        if (part.available === false) continue
        const rules = part.runtime
        if (!rules || !part.adapter) fail(`missing runtime for ${module.id}:${part.n}`)
        if (!rules) continue
        if (!Number.isFinite(rules.minutes) || rules.minutes <= 0 || !Number.isFinite(rules.maxPoints) || rules.maxPoints <= 0) fail('invalid timing or maximum score')
        if (![...OBJECTIVE_FORMATS, 'freeform', 'recording'].includes(part.itemFormat)) fail('unsupported format')
        if (part.layout !== undefined && LAYOUT_FORMATS[part.layout] !== part.itemFormat) fail(`layout ${part.layout} does not fit ${part.itemFormat} in ${module.id}:${part.n}`)
        const kinds = part.itemFormat === 'freeform' || part.itemFormat === 'recording' ? ['generator', 'answer', 'review'] : ['generator']
        for (const kind of kinds) if (!slots.has(`${module.id}:${part.n}:${kind}`)) fail(`missing ${module.id}:${part.n}:${kind}`)
        if (part.itemFormat === 'freeform' && !rules.fields?.length) fail('missing writing fields')
        if (part.itemFormat === 'recording' && !rules.segments?.length) fail('missing recording segments')
        if (kinds.length > 1 && (!rules.criteria?.length || Math.abs(rules.criteria.reduce((n, c) => n + c.maxPoints, 0) - rules.maxPoints) > 0.000001)) fail('rubric total differs from maximum')
        if (rules.criteria && (new Set(rules.criteria.map(c => c.id)).size !== rules.criteria.length || rules.criteria.some(c => !Number.isFinite(c.maxPoints) || c.maxPoints <= 0))) fail('invalid rubric criteria')
        if (rules.questionCount !== undefined && (!Number.isInteger(rules.questionCount) || rules.questionCount < 1)) fail('invalid question count')
        if (rules.optionCount !== undefined && (!Number.isInteger(rules.optionCount) || rules.optionCount < 2)) fail('invalid option count')
        if (rules.multiplier !== undefined && (!Number.isFinite(rules.multiplier) || rules.multiplier <= 0)) fail('invalid score multiplier')
        if (rules.replays !== undefined && (!Number.isInteger(rules.replays) || rules.replays < 1)) fail('invalid listening replay count')
        if (part.itemFormat === 'true-false' && rules.optionCount !== undefined && rules.optionCount !== 2) fail('true/false requires two options')
        if (part.itemFormat === 'gap-fill' && (rules.optionCount !== undefined || rules.reuseOptions !== undefined)) fail('gap-fill has no options')
        for (const fields of [rules.fields, rules.segments]) {
          if (fields && (fields.some(field => !field.id || !field.label) || new Set(fields.map(field => field.id)).size !== fields.length)) fail('duplicate or missing response field identity')
        }
        for (const field of rules.fields ?? []) {
          if ([field.minWords, field.maxWords, field.zeroBelowWords].some(value => value !== undefined && (!Number.isInteger(value) || value < 0))) fail(`invalid word limit for ${field.id}`)
          if (field.minWords !== undefined && field.maxWords !== undefined && field.minWords > field.maxWords) fail(`reversed word limits for ${field.id}`)
        }
      }
    }
  }
}
