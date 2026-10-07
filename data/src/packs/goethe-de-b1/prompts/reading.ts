import { modules } from '../structure'
import { promptsFor } from './common'
export const readingPrompts = promptsFor(
  'reading',
  modules.find(module => module.id === 'reading')?.tasks ?? []
)
