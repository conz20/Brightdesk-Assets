# Brightdesk asset governance

assets/manifest.json is the registry of approved distributable visual assets. An empty registry is valid and intentional: no artwork, screenshot or third-party item is approved merely because a file exists in this repository.

## Ownership boundaries

- **Brightdesk-Assets** owns approved visual files, manifest records, rights evidence, attribution and validation rules.
- **Brightdesk-Design-System** owns design tokens, reusable UI components and design contracts.
- **Brightdesk-Fonts** owns font binaries, font provenance, exact font licences and redistribution/embedding permissions.
- **Brightdesk-Type-Preview** owns local font-preview contracts and generation.

This repository is not a CDN or runtime service. Products must bundle the assets they use and work offline. Do not fetch assets at runtime or depend on Brightdesk-Services.

## Approval requirements

Every manifest entry must identify a stable ID and path, purpose, alt text, intended product(s), source/creator, exact rights basis, a local rights-evidence file and its SHA-256, explicit redistribution approval, explicit bundling permission and the asset SHA-256. The validator rejects missing evidence, unapproved redistribution, disabled bundling, missing files, symbolic links, unsafe paths, unsupported formats and digest mismatches. Do not guess a licence or treat a public URL as redistribution permission.

Third-party assets require evidence that covers the exact asset and intended redistribution. Original or generated assets still require a documented rights basis. If permission or provenance is unclear, keep the file out of the approved manifest and do not package it.

## Screenshots and concepts

A screenshot is not release evidence merely because it looks like a product. Use classification "verified-screenshot" only when captured from the actual running build. Record product, platform, app version, exact source commit, tested workflow name and HTTPS link to matching workflow evidence. The source commit and workflow must refer to the same tested build.

Concepts, mockups, diagrams and marketing compositions must be labelled honestly. A concept screenshot uses classification "concept" and must not contain tested-build verification fields. Never substitute concept artwork for a genuine product screenshot or use it to claim a workflow works.

## Formats and validation

The initial validator supports GIF, ICO, ICNS, JPEG, PDF, PNG, SVG, WebM, WebP and MP4. It validates metadata, path safety, regular-file status, basic file signatures and SHA-256 for assets and rights evidence. Signature checks do not replace full media decoding or SVG sanitisation. The tool does not approve licences, prove ownership or prove that screenshot workflow links remain available; those remain separate review gates.

Run from the repository root with Node.js 24.22.2:

    npm test
    npm run validate

No font binaries or product screenshots are included by this initial implementation. Add only assets that have completed the required review.
