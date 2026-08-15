# Contributing

Thank you for considering a contribution to the AV Traffic Conflict Simulator.

## Before opening a pull request

1. Search existing issues and pull requests.
2. Keep changes scoped to the public core.
3. Do not include proprietary source code, confidential data, API secrets, restricted datasets, or assets you do not have permission to redistribute.
4. For changes to TTC, PET, collision logic, or safety classifications, explain the mathematical assumption and add/adjust tests.
5. Run:

```bash
npm test
npm run check
```

## Development

No bundler is required. Serve the `app/` directory locally:

```bash
python3 -m http.server 8080 -d app
```

## Pull-request expectations

A good pull request states:

- What problem is being solved
- What changed
- Why the change is scientifically/technically defensible
- How it was tested
- Whether metrics or classifications changed
- Screenshots/GIFs for visible UI changes

## Scientific changes

For a new surrogate-safety metric or modification to TTC/PET:

- Define the measure mathematically or operationally.
- State units.
- State motion assumptions.
- Identify edge cases.
- Cite the original or authoritative methodological source when practical.
- Add at least one synthetic test where the expected value is known.

## Contributor licensing

By submitting a contribution, you agree that your contribution may be distributed under the repository's MIT License and that you have the right to submit it under those terms.
