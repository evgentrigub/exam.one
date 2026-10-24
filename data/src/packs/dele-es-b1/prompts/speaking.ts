import { modules } from '../structure'
import { promptsFor } from './common'
export const speakingPrompts = promptsFor(
  'speaking',
  modules.find(module => module.id === 'speaking')?.tasks ?? []
)
