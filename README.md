# Brightdesk-Assets

The central, offline-first source of truth for approved Brightdesk visual assets and their provenance, licensing, attribution and integrity records.

This is shared engineering infrastructure for Brightdesk Suite and the ten approved products. It is not a customer product, runtime asset server or CDN. Customer builds must bundle the assets they need so they remain available offline.

## Current status

- The asset manifest contract and local validator are implemented.
- The approved asset manifest is intentionally empty: no artwork or screenshots are approved by this initial change.
- No real product screenshot is claimed. Verified screenshots must come from an actual tested build and identify the exact product, platform, version, source commit and workflow evidence.
- Concepts must remain labelled as concepts and cannot be presented as working-product evidence.

## Ownership boundaries

- **Brightdesk-Assets:** approved visual files, manifest records, source and rights evidence, attribution and asset validation.
- **Brightdesk-Design-System:** design tokens, reusable UI components and design contracts.
- **Brightdesk-Fonts:** font binaries, provenance, licensing and redistribution/embedding permissions.
- **Brightdesk-Type-Preview:** local font-preview contracts and generation.

## Validation

Use Node.js 24.22.2. No runtime dependencies are required.

    npm test
    npm run validate

See docs/asset-governance.md and schemas/asset-manifest.schema.json before adding files. Rights must be explicitly cleared for redistribution and bundling; public availability alone is not permission. Do not include unverified assets.

## Permanent requirements

Use original Brightdesk implementation and branding only. Do not copy ArtCraft/Craft Launcher assets, Adobe assets or Microsoft assets. Do not add runtime network fetching, external asset hosting, telemetry, cloud content or a Brightdesk-Services dependency. Keep all customer use local/offline.
