import { rm } from 'node:fs/promises'
import path from 'node:path'

interface DeleteListeningAudioBody {
  exerciseIds?: string[]
}

export default defineEventHandler(
  async (event): Promise<{ data: { deleted: number }; error: string | null }> => {
    const body = await readBody<DeleteListeningAudioBody>(event)
    const exerciseIds = (body?.exerciseIds ?? []).filter(id =>
      /^listening-a2-part[1-4]-[a-z0-9-]+$/i.test(id)
    )
    if (exerciseIds.length === 0) return { data: { deleted: 0 }, error: null }

    const root = path.join(process.cwd(), 'public', 'audio', 'listening', 'generated')
    let deleted = 0
    for (const exerciseId of exerciseIds) {
      try {
        await rm(path.join(root, exerciseId), { recursive: true, force: true })
        deleted += 1
      } catch (error) {
        console.warn(`[tts/delete-listening-audio] failed id=${exerciseId}`, error)
      }
    }

    return { data: { deleted }, error: null }
  }
)
