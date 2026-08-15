# Public-Core Roadmap

This roadmap intentionally distinguishes public scientific infrastructure from private/product modules.

## v0.2 — modularize the engine

- Split physics, geometry, metrics, rendering, and UI into modules
- Add deterministic unit tests for TTC/PET and footprint overlap
- Export/import scenario JSON
- Add reproducibility seed/config metadata

## v0.3 — transportation-safety metrics

- DRAC / required-deceleration measures
- Time advantage / conflict-point arrival measures
- Better conflict-type classification
- Expanded VRU geometry and paths
- Validation examples with analytical solutions

## v0.4 — open roadway/scenario layer

- Straight, intersection, T-intersection, curve, and roundabout primitives
- Lane-level paths
- Basic traffic controls suitable for open examples
- Scenario gallery

## v0.5 — research interoperability

- Batch scenario runner
- CSV/JSON outputs
- Python-friendly result schema
- WOMD/trajectory-adapter interfaces where redistribution terms permit

## Private/product track

Potential private modules can evolve independently: advanced autonomy policies, hosted projects, collaboration, proprietary analytics, premium scenario packs, customer integrations, and specialized model/agent pipelines.
