import { modules } from '../structure'
import { promptsFor } from './common'
export const writingPrompts = promptsFor(
  'writing',
  modules.find(module => module.id === 'writing')?.tasks ?? []
)
