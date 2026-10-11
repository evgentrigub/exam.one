import { modules } from '../structure'
import { promptsFor } from './common'
export const readingPrompts = promptsFor('reading', modules.find(m => m.id === 'reading')!.tasks)
