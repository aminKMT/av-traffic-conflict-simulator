# Public Release Checklist

- [ ] Confirm every public source file is intended for redistribution.
- [ ] Remove passwords, tokens, API keys, private endpoints, emails that should not be public, and `.env` files.
- [ ] Confirm images/icons/fonts/assets have redistribution rights.
- [ ] Confirm datasets are either absent or redistributable under their terms.
- [ ] Replace placeholder live-demo links in `README.md`.
- [ ] Confirm the GitHub repository URL in `CITATION.cff`.
- [ ] Add ORCID to `CITATION.cff` if desired.
- [ ] Run `npm test` and `npm run check`.
- [ ] Open the app in Chrome, Firefox, and Safari.
- [ ] Test a direct collision scenario.
- [ ] Test a non-collision scenario.
- [ ] Test a near-conflict PET scenario.
- [ ] Test a no-shared-conflict scenario.
- [ ] Verify the README screenshots/demo GIF are current.
- [ ] Create `v0.1.0` GitHub release.
- [ ] Enable Issues and security reporting.
- [ ] Add repository topics and description.
