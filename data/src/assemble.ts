import type { PromptSpec, PromptSpecFields, PromptVars } from './types'

const PLACEHOLDER = /\{([a-zA-Z][a-zA-Z0-9]*)\}/g

export function interpolate(template: string, vars: PromptVars): string {
  return template.replace(PLACEHOLDER, (match, key: string) => {
    const value = vars[key]
    if (value === undefined) return match
    return String(value)
  })
}

export function assemblePrompt(spec: PromptSpecFields, vars: PromptVars): string {
  const blocks: string[] = [
    interpolate(spec.role, vars).trim(),
    interpolate(spec.task, vars).trim(),
  ]
  if (spec.rules.length > 0) {
    blocks.push(spec.rules.map(rule => interpolate(rule, vars)).join('\n'))
  }
  if (spec.examples && spec.examples.length > 0) {
    blocks.push(spec.examples.map(example => interpolate(example, vars)).join('\n\n'))
  }
  if (spec.outputPrelude) {
    blocks.push(interpolate(spec.outputPrelude, vars).trim())
  }
  blocks.push(interpolate(spec.outputContract, vars).trim())
  return blocks.filter(block => block.length > 0).join('\n\n')
}

export function definePrompt(fields: PromptSpecFields): PromptSpec {
  const spec: PromptSpec = {
    ...fields,
    assemble: vars => assemblePrompt(spec, vars),
  }
  return spec
}
