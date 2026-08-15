# Methodology and Assumptions

## Purpose

The simulator is designed to make traffic-conflict concepts observable in a small, interactive browser environment. It is not intended to reproduce the full behavior stack of a production autonomous-driving system.

## State variables

The current public core allows each simulated object to be configured with position, speed, heading, acceleration, start delay, length, and width. The simulation advances these states over a configurable time step.

## Time to Collision (TTC)

The public core predicts collision using the objects' simulated future motion and geometric footprints. If a future overlap is found, TTC is the time from the current simulation state until the predicted overlap. If objects already overlap, TTC is zero.

Interpretation depends on the assumed future trajectories. Any TTC method based on extrapolated motion can change materially when acceleration, steering, braking, or trajectory assumptions change.

## Post-Encroachment Time (PET)

The simulator records entry/exit timing for a configured rectangular conflict zone. PET is calculated from the temporal separation between one road user leaving the zone and the other entering it. Overlapping occupancy corresponds to zero temporal separation.

## Near-conflict threshold

The UI exposes a configurable PET threshold. It is an illustrative scenario parameter, not a universal or regulatory threshold. Research publications and applications use different thresholds depending on context, road-user type, speed, geometry, measurement method, and study purpose.

## Numerical discretization

The simulation uses a finite physics time step. Smaller time steps can improve temporal resolution but increase computation. Collision time, zone crossing, and minima may therefore depend slightly on step size.

## Validation priorities

Before using the tool for research conclusions:

1. Validate TTC against analytical constant-velocity scenarios.
2. Validate PET against known conflict-zone traversal examples.
3. Test sensitivity to the physics time step.
4. Check footprint geometry at different headings.
5. Document every threshold and classification rule.
6. Keep the simulator version/configuration with exported results.
