# Open-Core Boundary

The project follows an **open-core** model: a useful, scientifically understandable simulator is public, while differentiated production/enterprise capabilities can remain private.

## Public core

The public repository may include:

- Browser simulation engine
- Basic vehicle/VRU motion and geometry
- TTC and PET calculations
- Minimum-separation and collision checks
- Conflict-zone visualization
- Scenario configuration
- Basic traffic-conflict classifications
- Reproducible examples
- Public APIs/interfaces required to extend the simulator
- Documentation and validation tests

## Private or separately licensed modules

Keep these outside this repository unless you intentionally decide to open them:

- Proprietary Level-5 AV decision engine
- Advanced avoidance / lane-change planning logic
- Specialized commercial traffic-control libraries
- Customer-specific integrations
- Authentication, teams, private cloud workspaces
- Hosted project persistence and analytics
- Paid scenario packs
- High-volume batch/compute orchestration
- Proprietary reports and automated consulting workflows
- Private datasets or data adapters with redistribution restrictions
- Any model weights, prompts, agents, or APIs whose terms do not permit redistribution

## Repository separation

Recommended organization:

```text
aminKMT/av-traffic-conflict-simulator       PUBLIC — MIT
aminKMT/av-conflict-simulator-pro           PRIVATE — proprietary
aminKMT/av-conflict-simulator-research      PRIVATE/PUBLIC by project
```

The private repository can import/copy the public core according to the MIT license. Do not commit private keys, customer data, API secrets, paid assets, or restricted datasets to the public repository.

## Why MIT for v0.1

MIT is intentionally low-friction for education, research adoption, demos, forks, and recruiter review. It permits commercial use as long as the copyright/license notice is retained. This supports community growth, but it **does not stop another party from commercially using the public core**.

If preventing hosted commercial competitors from modifying and serving the public core without sharing source is more important than frictionless adoption, consider a future copyleft strategy such as AGPL for a later major version after obtaining appropriate legal advice. Do not casually relicense third-party contributions without contributor/license review.

## Naming and trademark

Open-source copyright licensing does not automatically grant trademark rights. If the project develops a distinctive logo/name used commercially, create a separate trademark policy before relying on brand restrictions.
