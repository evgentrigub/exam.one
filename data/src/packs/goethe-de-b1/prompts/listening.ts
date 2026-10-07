import { modules } from '../structure'
import { promptsFor } from './common'
export const listeningPrompts = promptsFor(
  'listening',
  modules.find(module => module.id === 'listening')?.tasks ?? []
)
