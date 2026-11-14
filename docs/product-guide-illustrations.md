# Product guide illustration provenance

**Recorded:** 14 November 2026

## Purpose and boundary

This record tracks ten original Brightdesk workflow illustrations copied into the shared Brightdesk Assets library. Each diagram explains a simple three-step workflow for one of the ten approved customer products.

These SVGs are **documentation illustrations only**. They are not screenshots from running applications, verified UI captures, proof of feature implementation, or distributable customer product assets. They are not listed in `assets/manifest.json`. Genuine screenshots require a tested live build and exact source/workflow provenance as defined in [asset governance](asset-governance.md).

## Source

- Repository: [conz20/Brightdesk-Wiki](https://github.com/conz20/Brightdesk-Wiki)
- Source branch at copy time: `improve/customer-search-examples-2026-11-14`
- Exact source revision: [`6c39f32d542debb7de899c6718127bba9755ba73`](https://github.com/conz20/Brightdesk-Wiki/commit/6c39f32d542debb7de899c6718127bba9755ba73)
- Original directory: `docs/assets/images/`
- Destination directory: `Brightdesk-Assets/docs/media/`

## File mapping

| Product | Source file | Source blob | Shared library file |
| --- | --- | --- | --- |
| Pages | `docs/assets/images/guide-pages.svg` | [`f25ffde`](https://github.com/conz20/Brightdesk-Wiki/blob/6c39f32d542debb7de899c6718127bba9755ba73/docs/assets/images/guide-pages.svg) | `docs/media/guide-pages.svg` |
| Sheets | `docs/assets/images/guide-sheets.svg` | [`590a6ef`](https://github.com/conz20/Brightdesk-Wiki/blob/6c39f32d542debb7de899c6718127bba9755ba73/docs/assets/images/guide-sheets.svg) | `docs/media/guide-sheets.svg` |
| Decks | `docs/assets/images/guide-decks.svg` | [`68aef61`](https://github.com/conz20/Brightdesk-Wiki/blob/6c39f32d542debb7de899c6718127bba9755ba73/docs/assets/images/guide-decks.svg) | `docs/media/guide-decks.svg` |
| Notes | `docs/assets/images/guide-notes.svg` | [`9fa8db7`](https://github.com/conz20/Brightdesk-Wiki/blob/6c39f32d542debb7de899c6718127bba9755ba73/docs/assets/images/guide-notes.svg) | `docs/media/guide-notes.svg` |
| Database | `docs/assets/images/guide-database.svg` | [`e58fbd1`](https://github.com/conz20/Brightdesk-Wiki/blob/6c39f32d542debb7de899c6718127bba9755ba73/docs/assets/images/guide-database.svg) | `docs/media/guide-database.svg` |
| Forms | `docs/assets/images/guide-forms.svg` | [`044d86f`](https://github.com/conz20/Brightdesk-Wiki/blob/6c39f32d542debb7de899c6718127bba9755ba73/docs/assets/images/guide-forms.svg) | `docs/media/guide-forms.svg` |
| Lists | `docs/assets/images/guide-lists.svg` | [`617fa29`](https://github.com/conz20/Brightdesk-Wiki/blob/6c39f32d542debb7de899c6718127bba9755ba73/docs/assets/images/guide-lists.svg) | `docs/media/guide-lists.svg` |
| Planner | `docs/assets/images/guide-planner.svg` | [`612f952`](https://github.com/conz20/Brightdesk-Wiki/blob/6c39f32d542debb7de899c6718127bba9755ba73/docs/assets/images/guide-planner.svg) | `docs/media/guide-planner.svg` |
| To Do | `docs/assets/images/guide-to-do.svg` | [`ba7db75`](https://github.com/conz20/Brightdesk-Wiki/blob/6c39f32d542debb7de899c6718127bba9755ba73/docs/assets/images/guide-to-do.svg) | `docs/media/guide-to-do.svg` |
| Workspace | `docs/assets/images/guide-workspace.svg` | [`a934c9f`](https://github.com/conz20/Brightdesk-Wiki/blob/6c39f32d542debb7de899c6718127bba9755ba73/docs/assets/images/guide-workspace.svg) | `docs/media/guide-workspace.svg` |

## Validation at import

All ten source files were checked before copying. Each has an SVG root, namespace and scalable viewBox; an accessible `role="img"` with `aria-labelledby="title desc"`; a non-empty title and description; balanced XML elements; and no scripts, embedded images, foreign HTML or remote resource references.

The Assets repository's `test/documentation-media.test.mjs` rechecks every SVG in `docs/media/` during `npm test`, and requires every one to be linked from the root README.

## Approval status

- Documentation-only: yes.
- Original Brightdesk workflow illustrations: yes, based on source repository and provenance above.
- Verified product screenshots: no.
- Approved distributable manifest entries: no.
- Customer runtime bundle assets: no.

Do not present any of these diagrams as a product screenshot or as evidence that the illustrated workflow passed a real application acceptance test.