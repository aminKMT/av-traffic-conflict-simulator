# Security Policy

## Supported versions

Security fixes are currently applied to the latest public release.

## Reporting a vulnerability

Please do **not** disclose exploitable vulnerabilities, leaked credentials, or private data in a public GitHub issue.

Use GitHub Private Vulnerability Reporting if enabled for the repository. Otherwise, contact the maintainer privately using the contact information on the maintainer's GitHub profile.

Include:

- A concise description
- Steps to reproduce
- Potential impact
- Affected files/version
- Any suggested mitigation

## Secrets

The public core should require no API keys. Never commit `.env` files, tokens, credentials, private endpoints, customer data, or private model keys.
