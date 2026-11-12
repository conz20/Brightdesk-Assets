# README and Visual Asset Audit — 12 November 2026

## Scope

This audit covers the root `README.md`, README-linked media, and repository visual-file inventory on `main` for all 26 Brightdesk repositories owned by `conz20`.

The benchmark is Microsoft's current Fluent and Windows app design guidance: clear hierarchy, calm and coherent layouts, purposeful colour, readable typography, consistent spacing, recognisable iconography, predictable navigation, accessibility, and concise writing. Brightdesk must apply those quality principles through its own original identity. Do not copy Microsoft or Adobe logos, product names, proprietary artwork, source code, or trade dress.

References:
- https://learn.microsoft.com/en-us/windows/apps/design/
- https://learn.microsoft.com/en-us/windows/apps/design/guidelines-overview
- https://learn.microsoft.com/en-us/windows/apps/design/design-principles
- https://developer.microsoft.com/en-us/fluentui

## Non-negotiable evidence rules

1. A screenshot means a direct capture of the real Brightdesk application running from an identified build. A hand-drawn SVG, mock-up, concept board, promotional collage, or composited image is not a screenshot.
2. Label every concept illustration as a design preview/concept. Never imply that an illustrated control, workflow, installer, notification, or product feature is implemented unless the current build proves it.
3. Replace a concept preview in a product README only after the matching real screen has been captured and the relevant workflow has passed verification. Keep a concept preview only when it remains useful and is clearly labelled.
4. Capture screenshots using approved remote CI/build infrastructure, not by treating a developer's local desktop as release evidence. Record product, version, source commit, platform, capture date, workflow run, and verification result.
5. Keep master artwork and screenshot provenance in Brightdesk-Assets. Product repositories may carry approved local copies for README rendering and application packaging; do not make customer software depend on GitHub, a CDN, or a remote asset download at runtime.
6. Use original Brightdesk names, marks, icons, colours, and UI. Microsoft is a quality/design reference only. Adobe is not a product, integration, dependency, or asset source.
7. Use meaningful alt text, readable image dimensions, relative paths where practical, and no external image hotlinks. Avoid decorative images that do not explain the product or repository.
8. Do not force screenshots into infrastructure repositories that have no customer-facing UI. Use an architecture or workflow diagram only when it materially explains the system.

## Repository-by-repository findings

| Repository | Current README/visual state | Required treatment |
| --- | --- | --- |
| Brightdesk-suite | Root README contains the approved Home design SVG and ten original product icons. The old `assets/hero-showcase.png` is described as a promotional collage, not evidence. Draft PR #48 removes that collage and labels an App Centre concept. | Reconcile PR #48 with current `main` before merging. Keep one current, clearly labelled Suite design reference. Add genuine Suite screenshots only after a real build is launched and verified. Fix stale repository-owner links and the malformed Development command block in the current README. |
| Brightdesk-Pages | Original logo, Pages icon, and workspace design-preview SVG. | Keep the preview clearly labelled as conceptual; replace/add a genuine document-workspace screenshot after verified capture. |
| Brightdesk-Sheets | Original logo, Sheets icon, and spreadsheet workspace preview SVG. | Keep the preview clearly labelled as conceptual; add a genuine spreadsheet screenshot after verified capture. |
| Brightdesk-Decks | Original mark, Decks icon, and slide-workspace preview SVG. | Keep the preview clearly labelled as conceptual; add a genuine presentation-workspace screenshot after verified capture. |
| Brightdesk-Notes | Original mark, Notes icon, and notes-workspace preview SVG. | Keep the preview clearly labelled as conceptual; add a genuine notes-workspace screenshot after verified capture. |
| Brightdesk-Database | Original mark, Database icon, and record-manager preview SVG. | Keep the preview clearly labelled as conceptual; add a genuine database/table screenshot after verified capture. |
| Brightdesk-Forms | Original mark, Forms icon, and form-builder preview SVG. | Keep the preview clearly labelled as conceptual; add a genuine form-builder screenshot after verified capture. |
| Brightdesk-Lists | Original mark, Lists icon, and Lists workspace preview SVG. | Keep the preview clearly labelled as conceptual; add a genuine lists screenshot after verified capture. |
| Brightdesk-Planner | Original mark, Planner icon, and Planner workspace preview SVG. | Keep the preview clearly labelled as conceptual; add a genuine planner screenshot after verified capture. |
| Brightdesk-To-Do | Original mark, To Do icon, and To Do workspace preview SVG. | Keep the preview clearly labelled as conceptual; add a genuine task-list screenshot after verified capture. |
| Brightdesk-Workspace | Original mark, Workspace icon, and Workspace preview SVG. | Keep the preview clearly labelled as conceptual; add a genuine workspace/page screenshot after verified capture. |
| Brightdesk-AI | One portfolio architecture SVG; it is a technical diagram, not a customer application screenshot. | Keep it only as an architecture diagram. Keep the repository private and clearly separate from the ten customer products. |
| Brightdesk-Fonts | Text-led README; no visual assets. | No product screenshot needed. Add a small font pipeline/metadata diagram only if it improves the explanation. Keep font licensing and provenance prominent. |
| Brightdesk-Localization | Text-led README; no visual assets. | No product screenshot needed. A dictionary/catalogue delivery diagram may help, but only when it describes implemented behaviour accurately. |
| Brightdesk-Engine | Text-led README; no visual assets. | No product screenshot needed. Prefer a compact API/data-flow diagram if it clarifies the native engine boundary. |
| Brightdesk-Design-System | One navigation-states SVG. | Keep as a design-state diagram, not a screenshot. Ensure labels and components match the current shared design contract. |
| Brightdesk-Common-Libs | Text-led README; no visual assets. | No product screenshot needed. A dependency-boundary diagram is optional once the actual package structure is implemented. |
| Brightdesk-Common-Actions | README-only repository. | No screenshot. Keep planned actions clearly marked as planned until code and tests exist. |
| Brightdesk-Developer-Tools | README-only repository. | No screenshot. Add diagrams only when real tools and workflows exist. |
| Brightdesk-Extensions | README-only repository. | No screenshot. Do not show a fictional extension gallery or unimplemented UI. |
| Brightdesk-Wiki | README-only repository. | No screenshot. A navigation/content map is optional after the wiki structure exists. |
| Brightdesk-Release-Tools | README-only repository. | No screenshot. Use a release-pipeline diagram only after the pipeline is implemented and verified. |
| Brightdesk-Services | One-line README; no other tracked files on `main`. | Expand the repository explanation when implementation begins. No customer UI screenshot; any architecture diagram must reinforce that this is optional owner-operated infrastructure, not a customer runtime dependency. |
| Brightdesk-Type-Preview | Text-led README and documentation; no visual assets. | A type specimen may be useful if it reflects the real local/offline preview tool. Do not present it as a customer product. |
| Brightdesk-Assets | One-line README; no other tracked files on `main`. Existing draft PRs #1 and #2 establish the asset registry and repository identity. | Complete the manifest/rights-validation work, then populate only approved original artwork and verified screenshots. Record provenance, rights, hashes, source commit, platform, and verification evidence. |
| Brightdesk-Printing | One-line README; no other tracked files on `main`. | Expand documentation when implementation exists. A print pipeline diagram is more appropriate than a product screenshot; no fictional print dialog. |

## Portfolio-wide follow-up checks

- Correct legacy `connormolloy12` repository links to the current `conz20` locations. The scan found old-owner references in the Suite README, all ten product READMEs, Brightdesk-AI, Brightdesk-Release-Tools, and Brightdesk-Type-Preview; confirm each destination before changing it. The other scanned root READMEs did not contain that legacy owner.
- Review all app-preview SVGs and README captions together so the ten product pages use one consistent presentation standard.
- Check internal legacy asset names such as `loop.svg` and `slides.svg` against source references and customer-visible navigation. Do not delete them until compatibility and build references are checked; the approved customer-facing product list remains exactly ten.
- Review the Suite README's old collage and the App Centre/Home design references together. Avoid duplicate or conflicting hero imagery.
- Do not add Microsoft or Adobe logos, screenshots, copied UI, or other third-party artwork.
- Do not claim platform screenshot coverage until the corresponding Windows, macOS, and Linux build has actually been launched and checked.

## Screenshot acceptance checklist

For each customer product (Suite plus the ten products), a screenshot is accepted only when:
- It is captured directly from the real application, not rendered from an SVG/mock-up.
- The exact product version and source commit are recorded.
- The target platform and capture environment are recorded.
- The primary workflow shown in the image passes its current acceptance test.
- Sample data is fictional and contains no personal information.
- The screenshot is legible at README display size and has accurate alt text.
- The original image and its provenance record are stored in Brightdesk-Assets; the approved README copy is traceable to that source.
- The README explicitly distinguishes verified screenshots from any remaining design concepts.

## Current conclusion

The portfolio has original iconography and useful design-preview artwork, but it does not yet have a complete, verified screenshot set for the Suite and ten products. The correct next step is to finish the shared asset registry, reconcile the existing Suite concept-preview PR, and establish a remote capture-and-verification path. Do not manufacture screenshots or treat SVG concepts as proof of implementation.
