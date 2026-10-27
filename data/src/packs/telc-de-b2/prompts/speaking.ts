import { modules } from '../structure'
import { promptsFor } from './common'

export const speakingPrompts = promptsFor('speaking', modules.find(m => m.id === 'speaking')!.tasks)
