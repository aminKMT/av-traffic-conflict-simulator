# AV Traffic Conflict Simulator

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Repository checks](https://github.com/aminKMT/av-traffic-conflict-simulator/actions/workflows/quality.yml/badge.svg)](https://github.com/aminKMT/av-traffic-conflict-simulator/actions/workflows/quality.yml)

An interactive browser-based laboratory for exploring **autonomous-vehicle traffic conflicts**, including **Time to Collision (TTC)**, **Post-Encroachment Time (PET)**, predicted collision timing, minimum separation, and configurable conflict-zone occupancy.

This repository is the **open-core edition** of the AV Traffic Conflict Simulator. The public core is intended for education, reproducible transportation-safety research, demonstrations, and community contributions. Advanced/private modules can remain in separate repositories or commercial distributions.

> **Status:** v0.1 public-core release. The current source package is the exported TTC/PET simulator core. Newer experimental features can be migrated into the modular roadmap without exposing private modules.

## What the public core includes

- Top-down AV-versus-road-user simulation
- Passenger vehicle, pedestrian, and bicycle interaction modes
- Configurable positions, headings, velocities, acceleration, dimensions, and start delays
- Configurable conflict-zone geometry
- Time to Collision (TTC) calculation and collision prediction
- Post-Encroachment Time (PET) based on conflict-zone occupancy
- Collision / near-conflict / safe-passage classification
- Minimum separation tracking
- Play, pause, step, reset, playback-speed controls
- Example scenarios for direct collision, near conflict, safe passage, and no shared conflict
- Responsive browser UI with no build step or external runtime dependencies

## Live demo

Add your production demo URL here after publishing:

`https://YOUR-DOMAIN.example/`

For GitHub Pages, see [docs/GITHUB_PUBLISHING.md](docs/GITHUB_PUBLISHING.md).

## Quick start

### Option 1 — open directly

Open `app/index.html` in a modern desktop browser.

### Option 2 — local web server

```bash
python3 -m http.server 8080 -d app
```

Then visit `http://localhost:8080`.

Or:

```bash
npm start
```

## Repository structure

```text
.
├── app/                         # Public browser simulator
│   ├── index.html
│   ├── script.js
│   └── styles.css
├── docs/                        # Methodology, architecture, publishing, roadmap docs
├── tests/                       # Lightweight repository/core checks
├── scripts/                     # Maintainer tooling
├── .github/                     # Issues, PR template, CI
├── CITATION.cff                 # Academic/research citation metadata
├── CONTRIBUTING.md
├── CODE_OF_CONDUCT.md
├── OPEN_CORE.md                 # Public/private feature boundary
├── ROADMAP.md
├── SECURITY.md
└── LICENSE                      # MIT license for this public repository
```

## Safety-measure interpretation

This simulator is a **research and educational tool**, not a certified vehicle-safety system and not a substitute for field validation, standards-compliant simulation, or safety-case evidence.

The current core treats TTC as a predicted time until vehicle footprints overlap under the simulator's motion assumptions. PET is computed from the temporal gap between road users occupying the configured conflict zone. The PET threshold in the UI is explicitly configurable and should not be interpreted as a universal safety standard.

For implementation notes and validation expectations, read [docs/METHODOLOGY.md](docs/METHODOLOGY.md).

## Open-core model

The intention is to make the scientific/educational foundation open while allowing advanced products to remain separately licensed. See [OPEN_CORE.md](OPEN_CORE.md) for the boundary.

A practical split is:

**Open:** basic scene configuration, motion simulation, TTC/PET, conflict classification, visualization, examples, documentation, basic exports.

**Private / optional commercial modules:** advanced autonomy decision agents, enterprise collaboration, proprietary scenario packs, cloud persistence, high-volume batch simulation, private datasets, hosted analytics, specialized validation pipelines, and customer integrations.

## Research citation

If you use the simulator in academic work, cite the software using the repository's `CITATION.cff`. GitHub can surface this as a **Cite this repository** action.

Suggested software citation:

> Keramati, A. (2026). *AV Traffic Conflict Simulator* (Version 0.1.0) [Computer software]. GitHub.

Update the repository URL and DOI after the first public release or Zenodo archive.

## Contributing

Issues and pull requests are welcome for the public core. Start with [CONTRIBUTING.md](CONTRIBUTING.md). Please keep proprietary/private modules out of public pull requests.

Good first contribution areas include:

- Unit tests for TTC/PET edge cases
- Additional open scenario examples
- Accessibility and mobile improvements
- Validation notebooks using synthetic scenarios
- Documentation of assumptions
- New surrogate-safety measures with references and tests

## License

The code in this public repository is licensed under the [MIT License](LICENSE).

**Important open-core note:** code not present in this repository is not automatically covered by this license. Private/proprietary modules should live in a separate private repository and have their own license terms.

## Author

**Amin Keramati**  
Transportation safety · autonomous vehicles · AI/ML · time-to-event risk modeling

GitHub: `@aminKMT`

## Disclaimer

This software is provided for research, education, prototyping, and demonstration. Outputs may be sensitive to assumptions, discretization, geometry, thresholds, and scenario configuration. Do not use simulator output as the sole basis for real-world driving, regulatory, legal, operational, or safety-critical decisions.
