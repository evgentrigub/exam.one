import { createHash } from 'node:crypto'
import { createInterface } from 'node:readline'
import { resolve } from 'node:path'
import { readFileSync, existsSync } from 'node:fs'
import * as bcrypt from 'bcrypt'
import { AuthTokenType, createPrismaClient } from '../src'

const BCRYPT_ROUNDS = 10

function loadEnvFile(): void {
  const candidates = [
    resolve(process.cwd(), '.env'),
    resolve(process.cwd(), '../../.env'),
    resolve(__dirname, '../../../.env'),
  ]
  for (const file of candidates) {
    if (!existsSync(file)) continue
    const text = readFileSync(file, 'utf8')
    for (const line of text.split('\n')) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const eq = trimmed.indexOf('=')
      if (eq <= 0) continue
      const key = trimmed.slice(0, eq).trim()
      let value = trimmed.slice(eq + 1).trim()
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1)
      }
      if (process.env[key] === undefined) {
        process.env[key] = value
      }
    }
    break
  }
}

function parseArgs(argv: string[]): { email: string | null; password: string | null } {
  let email: string | null = null
  let password: string | null = null
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]
    if (arg === '--email' || arg === '-e') {
      email = argv[i + 1] ?? null
      i++
    } else if (arg?.startsWith('--email=')) {
      email = arg.slice('--email='.length)
    } else if (arg === '--password' || arg === '-p') {
      password = argv[i + 1] ?? null
      i++
    } else if (arg?.startsWith('--password=')) {
      password = arg.slice('--password='.length)
    }
  }
  return { email, password }
}

function promptHidden(question: string): Promise<string> {
  return new Promise(resolvePrompt => {
    const rl = createInterface({ input: process.stdin, output: process.stdout })
    const stdin = process.stdin
    const wasRaw = stdin.isRaw
    if (stdin.isTTY) stdin.setRawMode(true)

    process.stdout.write(question)
    let value = ''

    const onData = (buf: Buffer) => {
      const str = buf.toString('utf8')
      if (str === '\n' || str === '\r' || str === '\u0004') {
        if (stdin.isTTY) stdin.setRawMode(wasRaw ?? false)
        stdin.removeListener('data', onData)
        process.stdout.write('\n')
        rl.close()
        resolvePrompt(value)
        return
      }
      if (str === '\u0003') {
        if (stdin.isTTY) stdin.setRawMode(wasRaw ?? false)
        process.stdout.write('\n')
        process.exit(130)
      }
      if (str === '\u007f' || str === '\b') {
        value = value.slice(0, -1)
        return
      }
      value += str
    }

    stdin.on('data', onData)
  })
}

async function main(): Promise<void> {
  loadEnvFile()
  const { email: emailArg, password: passwordArg } = parseArgs(process.argv.slice(2))
  if (!emailArg) {
    console.error('Usage: pnpm auth:set-password --email you@example.com')
    process.exit(1)
  }

  const email = emailArg.trim().toLowerCase()
  if (!process.env['DATABASE_URL']) {
    console.error('DATABASE_URL is not set. Copy .env.example to .env or export DATABASE_URL.')
    process.exit(1)
  }

  let password = passwordArg
  if (!password) {
    password = await promptHidden('New password: ')
    const confirm = await promptHidden('Confirm password: ')
    if (password !== confirm) {
      console.error('Passwords do not match.')
      process.exit(1)
    }
  }

  if (password.length < 8) {
    console.error('Password must be at least 8 characters.')
    process.exit(1)
  }
  if (password.length > 72) {
    console.error('Password must be at most 72 characters.')
    process.exit(1)
  }

  const prisma = createPrismaClient()
  try {
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      console.error(`No user found for ${email}`)
      process.exit(1)
    }

    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS)
    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { passwordHash, emailVerified: true },
      }),
      prisma.authToken.deleteMany({
        where: {
          userId: user.id,
          type: { in: [AuthTokenType.REFRESH, AuthTokenType.PASSWORD_RESET] },
        },
      }),
    ])

    // Touch hash util so token revocation path stays consistent with the API
    void createHash('sha256')

    console.info(`Password updated for ${email}. Sign in with the new password.`)
  } finally {
    await prisma.$disconnect()
  }
}

main().catch((error: unknown) => {
  console.error(error)
  process.exit(1)
})
