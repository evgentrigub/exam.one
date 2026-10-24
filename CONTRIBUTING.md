# Contributing to exam.one

Contributions to exam.one are welcome: bug fixes, documentation, translations, accessibility improvements, and original exam practice material.

Please read the [Code of Conduct](CODE_OF_CONDUCT.md). Report vulnerabilities privately using the [Security Policy](SECURITY.md).

## Before you start

Search existing issues and pull requests before opening a new one. For a substantial feature, new exam board, new interaction, or architectural change, open an issue describing the problem and proposed approach before implementing it.

For a bug report, include the release tag or commit, installation method, relevant platform details, reproduction steps, expected behavior, and actual behavior. Use synthetic examples and remove secrets and personal data from logs and screenshots.

## Development setup

Use Node.js 24 or newer, pnpm 10, and Docker Compose v2. Follow [Local development in the README](README.md#local-development), including dependency installation, environment configuration, migrations, and seeding.

Read [AGENTS.md](AGENTS.md) and the [implementation standards](agent-os/standards/index.yml) for repository conventions. Keep changes focused and preserve existing practice and mock-exam behavior.

## What to contribute

### Application changes

- Keep shared screens and APIs independent of a specific exam board or language.
- Keep practice data scoped to the signed-in user and exam pack.
- Keep AI optional and configurable through the supported providers.
- Include translations for new interface text and preserve accessibility and responsive behavior.
- Add or update tests when they meaningfully cover changed behavior.

### Exam packs and practice content

Follow the [exam-pack authoring guide](data/README.md). Place exam-specific structures, scoring, prompts, and exercises in the owning pack under `data/src/packs/`.

- Submit original material or material you have permission to redistribute under compatible terms.
- Identify any external material, its author, source, license, and modifications. Update [third-party notices](THIRD_PARTY_NOTICES.md) when needed.
- Do not copy official examination papers, paid preparation books, recordings, or answer keys without the necessary permission.
- Explain the exam format and scoring references used, keeping those references separate from contributed practice content.
- Review generated material for accuracy, answer consistency, language quality, and rights before submitting it.
- Identify changes to required voices, speech models, audio generation, or scoring behavior.

Exam-board names describe the formats being practised; they do not imply endorsement or affiliation.

## Checks before a pull request

For application changes, run:

```bash
pnpm lint
pnpm type-check
pnpm build
pnpm test
```

Run `pnpm i18n:check` when changing interface translations, and the relevant speech tests when changing speech tooling. `pnpm test` includes STT catalog tests requiring host Python 3.10 or newer; normal self-host setup runs speech dependencies inside Docker.

For documentation-only changes, check links, commands, spelling, and Markdown formatting. Run the application or end-to-end checks when the changed instructions or behavior require them. State any checks you could not run.

## Submitting a pull request

1. Create a focused branch and describe the problem your change solves.
2. Link the relevant issue and explain the resulting behavior.
3. Include verification results and screenshots for visible changes.
4. Document configuration changes, migrations, compatibility impact, and new dependencies.
5. Update the README, relevant guides, and `CHANGELOG.md` when the change affects users.

Do not include API keys, `.env` files, personal practice records, downloaded model weights, generated audio, or database backups.

The current CI dispatches end-to-end checks to a separate repository using a maintainer credential. Fork pull requests may need maintainer help to run that step; do not add credentials to your fork or bypass checks.

## Contribution licensing

Unless explicitly agreed otherwise before submission, contributions to exam.one's original code, documentation, and bundled practice content are submitted under **AGPL-3.0-only**, as described in the [README](README.md#license-and-attribution) and [LICENSE](LICENSE).

You retain copyright in your contribution. Submit only work you have the right to contribute. Preserve existing third-party notices and identify material with separate terms. This contribution policy does not transfer copyright or grant a separate proprietary relicensing right.
