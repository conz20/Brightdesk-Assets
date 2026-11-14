# Brightdesk Assets

**The shared, offline-first home for original Brightdesk visual assets, product screenshots and supporting media.**

This repository is engineering infrastructure for Brightdesk Suite and its ten approved customer products. It is not a customer product, runtime asset server or CDN. Products bundle the approved files they need so that visuals remain available offline.

<p align="center">
  <img src="docs/media/asset-library-blueprint.svg" alt="Planning diagram of the Brightdesk visual library: brand identity, product screenshots, help and release media, diagrams, rights records and offline packaging." width="100%">
</p>

<p align="center"><em>Collection blueprint — a documentation diagram, not a product screenshot or an approved asset catalogue.</em></p>

## What this library is intended to contain

| Collection | What belongs here |
| --- | --- |
| **Brand and identity** | Original Brightdesk logos and marks, the ten product icons, approved illustrations and brand artwork. |
| **Product screenshots** | Genuine screenshots captured directly from tested Suite and product builds, with exact product, version, platform, source commit and workflow evidence. |
| **Help and release media** | Setup and installation guidance, update instructions, release imagery and support illustrations. |
| **Diagrams and concepts** | Architecture, workflow and explanatory diagrams. Concepts and mock-ups must remain clearly labelled and must never be presented as proof that a feature works. |
| **Rights and provenance** | Creator/source records, explicit permission evidence, attribution requirements and SHA-256 integrity records. |

## Planned product screenshot coverage

The intended customer screenshot set covers the Suite and exactly ten products across the three desktop platforms. The matrix below is a **capture plan**: every cell is still planned, not a claim that a screenshot or tested build already exists.

<p align="center">
  <img src="docs/media/screenshot-coverage-plan.svg" alt="Planned screenshot coverage matrix for Brightdesk Suite, Pages, Sheets, Decks, Notes, Database, Forms, Lists, Planner, To Do and Workspace across Windows, macOS and Linux. All 33 product-platform targets are marked planned." width="100%">
</p>

<p align="center"><em>Capture roadmap — all 33 targets are planned; no verified product screenshot is represented.</em></p>

A screenshot can be approved only after it is captured from the actual running application and tied to the exact build that passed its relevant workflow. A hand-drawn interface, design preview, mock-up or promotional composition is not a verified screenshot.

## Current repository status

- The versioned asset manifest, JSON Schema and local validator are implemented.
- `assets/manifest.json` is intentionally empty. **There are currently no approved distributable images, artwork or product screenshots in the asset collection.**
- The two SVGs shown above are README documentation diagrams stored under `docs/media/`. They explain the intended collection and capture plan; they are not customer product assets and are not listed as approved assets.
- Real product screenshots will be added only when matching tested-build evidence is available. Concepts will remain labelled as concepts until replaced by real captures.

This distinction is deliberate: the README can explain what the repository is being built to contain without pretending that uncreated or unverified assets already exist.

## Ownership boundaries

- **Brightdesk-Assets:** approved visual files, manifest records, source and rights evidence, attribution and asset validation.
- **Brightdesk-Design-System:** design tokens, reusable UI components and design contracts.
- **Brightdesk-Fonts:** font binaries, provenance, licensing and redistribution/embedding permissions.
- **Brightdesk-Type-Preview:** local font-preview contracts and generation.

## Approval requirements

Every distributable asset needs a stable ID and path, a clear purpose and alt text, intended product assignment, source/creator details, documented rights evidence, explicit redistribution approval, explicit bundling permission and a SHA-256 digest.

Do not infer permission from a public URL or from the fact that a file exists in a repository. Original or generated artwork also needs a documented rights basis. If provenance or permission is unclear, keep it out of the approved manifest and out of customer builds.

For verified screenshots, record the product, platform, app version, exact source commit, tested workflow name and HTTPS link to matching workflow evidence. The source commit and workflow must refer to the same tested build.

See [asset governance](docs/asset-governance.md) and the [asset manifest schema](schemas/asset-manifest.schema.json) before adding distributable files.

## Offline and branding requirements

Use original Brightdesk implementation and branding only. Do not copy Microsoft or Adobe logos, proprietary artwork, source code or trade dress. Microsoft design guidance may be used as a quality reference only. Do not add Adobe applications, services, integrations or assets.

Customer products must bundle approved assets locally. Do not add runtime network fetching, external asset hosting, telemetry, cloud content or a Brightdesk-Services dependency.

## Validation

Use Node.js **24.22.2**. No runtime dependencies are required.

```sh
npm test
npm run validate
```
