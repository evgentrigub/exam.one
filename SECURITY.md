# Security Policy

## Supported versions

Security fixes target the latest stable exam.one release. Older releases and development branches may be investigated, but fixes are not guaranteed for them.

| Version                                      | Security support                     |
| -------------------------------------------- | ------------------------------------ |
| Latest stable release, beginning with v1.0.0 | Supported after publication          |
| Older releases                               | Upgrade to the latest stable release |
| Unreleased development commits               | No support commitment                |

## Reporting a vulnerability

Do not disclose an unpatched vulnerability, exploit, or sensitive data in a public issue or pull request.

Email [examonecontact@proton.me](mailto:examonecontact@proton.me) for private reports. This is also the private contact for [Code of Conduct](CODE_OF_CONDUCT.md) concerns.

If GitHub private vulnerability reporting is enabled, you may also use **Security → Report a vulnerability** in the [exam.one repository](https://github.com/evgentrigub/exam.one).

Include:

- The affected release tag or commit and installation method.
- A description of the vulnerability and potential impact.
- Reproduction steps or a minimal proof of concept using synthetic data.
- Relevant configuration and sanitized logs.
- Any suggested fix and your preferred name for acknowledgement.

Never include passwords, provider API keys, session tokens, encryption keys, or real users' records. Test only instances and accounts you own or are authorized to assess.

## Scope

Reports may cover authentication and sessions, account isolation, saved API keys, practice records, file handling, background jobs, deployment defaults, and AI or speech integrations maintained in this repository.

Report exploitable dependency issues when they affect exam.one, identifying the affected component. Upstream projects may also need a coordinated report. Instance operators remain responsible for their infrastructure and configuration.

## Handling reports

Maintainers review reports as availability permits and may request additional information. After confirming an issue, maintainers aim to coordinate a fix and disclosure with the reporter. Credit is given with the reporter's permission.

There is currently no guaranteed response time, fix deadline, or paid bug bounty. This policy does not grant permission to test systems operated by other people.

## Operating an instance

- Keep exam.one and its dependencies updated, and read release notes before upgrading.
- Use separate, strong `JWT_SECRET` and `SECRETS_ENCRYPTION_KEY` values. Protect `.env` and backup copies.
- Configure HTTPS, public URLs, and secure cookies before exposing an instance to the internet. The supplied Compose setup targets local use.
- Keep databases, queues, speech endpoints, and administrative interfaces appropriately restricted.
- Review registration and email configuration for the intended audience.
- Back up the database, queue state, generated files, and required secrets; test restoration.
- Understand which content is sent to external AI providers when optional AI features are enabled.

See the [README](README.md#configuration) for configuration and [backup instructions](README.md#backup-restore-and-upgrades).
