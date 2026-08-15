# Architecture

## Current v0.1

```text
index.html
   │
   ├── form controls / metrics DOM
   │
   ├── styles.css
   │
   └── script.js
        ├── configuration/state
        ├── kinematics
        ├── footprint geometry
        ├── collision prediction / TTC
        ├── conflict-zone occupancy / PET
        ├── classification
        └── canvas rendering + animation loop
```

The v0.1 source is intentionally preserved as the working exported core.

## Target modular architecture

```text
src/
  core/
    state.js
    integrator.js
    geometry.js
  metrics/
    ttc.js
    pet.js
    separation.js
  scenarios/
    schema.js
    examples.js
  rendering/
    canvas-renderer.js
  ui/
    controls.js
    metrics-panel.js
```

This split makes safety metrics testable without a browser and creates stable extension points for open and private modules.

## Open-core extension boundary

Private modules should depend on public interfaces rather than editing the public core directly wherever practical. That reduces merge conflicts and makes it clear which code is redistributable.
