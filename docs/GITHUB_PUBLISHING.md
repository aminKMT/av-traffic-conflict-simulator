# Publishing to GitHub

## Repository

Repository name:

`av-traffic-conflict-simulator`

Recommended description:

> Interactive open-core AV traffic-conflict simulator for TTC, PET, collision risk, and surrogate safety research.

Recommended topics:

`autonomous-vehicles`, `traffic-safety`, `transportation`, `ttc`, `pet`, `surrogate-safety`, `simulation`, `javascript`, `canvas`, `research-software`

## Repository settings

- Enable Issues.
- Enable Discussions if community Q&A and research ideas should be separated from bug reports.
- Enable Private Vulnerability Reporting if available.
- Protect the `main` branch once external contributors begin submitting pull requests.
- Require the repository check workflow before merge.

## GitHub Pages

The simulator lives in `app/`. A Pages deployment workflow can publish `app/` as the site artifact. A separately hosted production demo can also remain the primary live link in the README.

## First release

Create a GitHub Release:

- Tag: `v0.1.0`
- Title: `AV Traffic Conflict Simulator v0.1.0 — Open Core`
- Summarize included TTC/PET capabilities and clearly label experimental limitations.

## Academic archive

For research citations, consider connecting the public GitHub repository to an archival service such as Zenodo after the repository is stable. Then update `CITATION.cff` with the DOI.
