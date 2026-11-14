import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const products = [
  { slug: "pages", repo: "Brightdesk-Pages", iconSha: "8e4cb35ea5918f62d2102775b1f5608eb59d64f8", previewSha: "23304786b7ef0efdc1284c7edb456a43f1553d8c", socialSha: "93ff885a7d0aca2b14a79a31dd6387acfe33145a" },
  { slug: "sheets", repo: "Brightdesk-Sheets", iconSha: "3765d1a63bcf205fec4af0ea69940ac07c2bb6db", previewSha: "fec0e85f4f13abef89196429f903d2d67776fe1b", socialSha: "93bee927a35814426e6a23e762d4317ffd3be383" },
  { slug: "decks", repo: "Brightdesk-Decks", iconSha: "49e17f01dd97e0d2e300166c82b60d5ff097edd5", previewSha: "fd2ed65bcf0b8dd32e0602befde12a1e538eb01a", socialSha: "0067a43ff091a2ca864a16d5234a90266d74ba14" },
  { slug: "notes", repo: "Brightdesk-Notes", iconSha: "3a9332cef159babab6a5bd4642fec0d9e13e7e5f", previewSha: "4f2cd74a5cbc36e35fdc4cd624a5dcbfb193293e", socialSha: "c4199aedb33f834ef2a8b2410e79428f1c9f2238" },
  { slug: "database", repo: "Brightdesk-Database", iconSha: "3dfc2df71ddde40e16f501f1d36f83ad91d52c57", previewSha: "52105007d9bbd7f9c74307738db67a343397aec9", socialSha: "fecd52b777349e80c5b569dfe444be5d2ee517e9" },
  { slug: "forms", repo: "Brightdesk-Forms", iconSha: "71b9c017ac89c6b2a86b52c9f0c168d38da65fb4", previewSha: "b8bab38883a2920d9fb502567143105c65de112d", socialSha: "6688920eeb87550cdcd391f011cd3194176c0c71" },
  { slug: "lists", repo: "Brightdesk-Lists", iconSha: "10034aab944ffc94b6027b600b06beb5cce465b6", previewSha: "91d08eb9d06ef1b8e8263ec3de3a53362bc648dc", socialSha: "86e5e5f656b27addfd346c3eff8dbc4efe764621" },
  { slug: "planner", repo: "Brightdesk-Planner", iconSha: "c5781db09487556b62a38e935afa05a9789be890", previewSha: "0e5ddd4173c06c9c21a794467ace93ee3e0d4d12", socialSha: "d8e676258f86415667ad4cd6e769c51c9b0c4c68" },
  { slug: "todo", repo: "Brightdesk-To-Do", iconSha: "8856d1365bdc600780f99e8baa3d359e8e78fd0f", previewSha: "f273ed2df2a668ed6678f06d21c7f2415227ec70", socialSha: "cc0912c03753e05f06c8479ca9b38e913542825c" },
  { slug: "workspace", repo: "Brightdesk-Workspace", iconSha: "79ef8dceb5f0d9a43cb2cfbc8d7a0d2a4dce96ef", previewSha: "2033fc5b28630a34f18dea768e2fb46ffce3b602", socialSha: "5ea9af0fd8b69bd9fa723af6725c37ed5703cdf3" },
];

function assertSelfContainedAccessibleSvg(source, filename) {
  assert.match(source, /<svg\b/, filename + " must contain an SVG root");
  assert.match(source, /xmlns="http:\/\/www\.w3\.org\/2000\/svg"/, filename + " must declare SVG namespace");
  assert.match(source, /viewBox="[^"]+"/, filename + " must declare a viewBox");
  assert.match(source, /<(title|desc)\b|aria-label=/, filename + " must have accessible naming metadata");
  assert.doesNotMatch(source, /<(?:script|image|foreignObject)\b/i, filename + " must not embed scripts, raster image elements or foreign HTML");
  assert.doesNotMatch(source, /\b(?:href|xlink:href)\s*=|url\(\s*https?:/i, filename + " must not depend on external resources");
  assert.match(source, /<\/svg>\s*$/, filename + " must close its SVG root");
}

test("the shared library contains the actual ten product application icons", async () => {
  for (const product of products) {
    const source = await readFile(new URL("../assets/product-icons/" + product.slug + ".svg", import.meta.url), "utf8");
    assertSelfContainedAccessibleSvg(source, product.slug + " icon");
  }
});

test("the shared library contains ten product workspace previews and ten social banners", async () => {
  for (const product of products) {
    const preview = await readFile(new URL("../assets/product-previews/" + product.slug + ".svg", import.meta.url), "utf8");
    const social = await readFile(new URL("../assets/social-previews/" + product.slug + ".svg", import.meta.url), "utf8");
    assertSelfContainedAccessibleSvg(preview, product.slug + " workspace preview");
    assertSelfContainedAccessibleSvg(social, product.slug + " social banner");
  }
});

test("source catalog traces every mirrored product file to its original repository blob", async () => {
  const catalog = await readFile(new URL("../docs/source-asset-catalog.md", import.meta.url), "utf8");
  for (const product of products) {
    assert.ok(catalog.includes("conz20/" + product.repo), product.slug + " source repository must be documented");
    assert.ok(catalog.includes(product.iconSha), product.slug + " icon source blob must be documented");
    assert.ok(catalog.includes(product.previewSha), product.slug + " workspace preview source blob must be documented");
    assert.ok(catalog.includes(product.socialSha), product.slug + " social banner source blob must be documented");
  }
});

test("README points to the 48-file gallery and distinguishes previews from screenshots", async () => {
  const readme = await readFile(new URL("../README.md", import.meta.url), "utf8");
  const gallery = await readFile(new URL("../ASSET-GALLERY.md", import.meta.url), "utf8");
  assert.match(readme, /\[Open the complete SVG asset gallery\]\(ASSET-GALLERY\.md\)/);
  assert.match(readme, /48 SVG files/);
  assert.match(gallery, /48 SVG files/);
  assert.match(gallery, /not verified screenshots/i);
  assert.match(gallery, /Source-mirrored asset catalog/);
});


test("the root README visibly presents each approved product preview and icon", async () => {
  const readme = await readFile(new URL("../README.md", import.meta.url), "utf8");

  const productNames = {
    pages: "Pages",
    sheets: "Sheets",
    decks: "Decks",
    notes: "Notes",
    database: "Database",
    forms: "Forms",
    lists: "Lists",
    planner: "Planner",
    todo: "To Do",
    workspace: "Workspace",
  };

  for (const [slug, name] of Object.entries(productNames)) {
    const previewImage = new RegExp(
      `<img\\s+src="assets/product-previews/${slug}\\.svg"\\s+alt="Brightdesk ${name} workspace artwork preview, not a screenshot of running software"`,
      "i",
    );
    const iconImage = new RegExp(
      `<img\\s+src="assets/product-icons/${slug}\\.svg"\\s+alt="Brightdesk ${name} application icon"`,
      "i",
    );

    assert.match(readme, previewImage, name + " workspace preview must be visibly embedded with an honest screenshot disclaimer");
    assert.match(readme, iconImage, name + " application icon must be visibly embedded");
    assert.ok(readme.includes(`href="assets/product-previews/${slug}.svg"`), name + " preview must link to its original SVG");
    assert.ok(readme.includes(`href="assets/product-icons/${slug}.svg"`), name + " icon must link to its original SVG");
  }
});
