import { modules } from '../structure'
import { promptsFor } from './common'
export const listeningPrompts = promptsFor(
  'listening',
  modules.find(m => m.id === 'listening')!.tasks
)
