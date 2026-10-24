import path from 'node:path'

/**
 * Resolve a relative audio path inside `root`, or return null if it would escape.
 *
 * Generated audio lives at `<sha256 of packId+userId+exerciseId>/{shared|item-<n>}.wav`. The
 * exercise id is hashed and never becomes a path segment, so traversal is already impossible
 * by construction; this is the second line of defence on the pieces that are interpolated.
 */
export function containedAudioPath(root: string, relativePath: string): string | null {
  if (path.isAbsolute(relativePath)) return null
  const parts = relativePath.split(/[/\\]/)
  if (parts.some(part => part === '' || part === '.' || part === '..')) return null
  const resolvedRoot = path.resolve(root)
  const absolute = path.resolve(resolvedRoot, relativePath)
  const prefix = resolvedRoot.endsWith(path.sep) ? resolvedRoot : resolvedRoot + path.sep
  if (!absolute.startsWith(prefix)) return null
  return absolute
}
