#!/usr/bin/env node
// Fails when locale files in a directory disagree on keys or interpolation placeholders.
// Usage: node scripts/check-locale-parity.mjs [localesDir]
import { readdirSync, readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'

const DEFAULT_DIR = 'apps/frontend/i18n/locales'
const PLACEHOLDER_RE = /\{\s*(\w+)\s*\}/g

const localesDir = resolve(process.argv[2] ?? DEFAULT_DIR)

const flatten = (node, prefix = '') =>
  Object.entries(node).flatMap(([key, value]) =>
    value !== null && typeof value === 'object'
      ? flatten(value, `${prefix}${key}.`)
      : [[`${prefix}${key}`, String(value)]],
  )

const placeholders = text => [...text.matchAll(PLACEHOLDER_RE)].map(m => m[1]).sort().join(',')

const locales = readdirSync(localesDir)
  .filter(file => file.endsWith('.json'))
  .map(file => {
    try {
      const json = JSON.parse(readFileSync(join(localesDir, file), 'utf8'))
      return { file, entries: new Map(flatten(json)) }
    } catch (error) {
      console.error(`✗ ${file}: ${error.message}`)
      process.exit(1)
    }
  })

if (locales.length < 2) {
  console.error(`✗ Expected at least two locale files in ${localesDir}`)
  process.exit(1)
}

const [reference, ...others] = locales
const problems = []

for (const other of others) {
  for (const [key, value] of reference.entries) {
    if (!other.entries.has(key)) {
      problems.push(`${other.file}: missing "${key}"`)
      continue
    }
    if (placeholders(value) !== placeholders(other.entries.get(key))) {
      problems.push(`${other.file}: placeholder mismatch in "${key}"`)
    }
  }
  for (const key of other.entries.keys()) {
    if (!reference.entries.has(key)) problems.push(`${reference.file}: missing "${key}"`)
  }
}

for (const { file, entries } of locales) {
  for (const [key, value] of entries) {
    if (value.trim() === '') problems.push(`${file}: empty value for "${key}"`)
  }
}

if (problems.length > 0) {
  console.error(problems.map(p => `✗ ${p}`).join('\n'))
  console.error(`\n${problems.length} locale problem(s) in ${localesDir}`)
  process.exit(1)
}

console.log(`✓ ${locales.map(l => l.file).join(', ')} in sync (${reference.entries.size} keys)`)
