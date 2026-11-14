import test from "node:test";
import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";

const mediaDirectory = new URL("../docs/media/", import.meta.url);
const svgFiles = (await readdir(mediaDirectory))
  .filter((name) => name.toLowerCase().endsWith(".svg"))
  .sort();

function inspectXmlElements(source) {
  const tokens = source.match(/<!--[\\s\\S]*?-->|<\\/?[A-Za-z_][\\w:.-]*[^<>]*>/g) ?? [];
  const stack = [];
  let rootCount = 0;

  for (const token of tokens) {
    if (token.startsWith("<!--")) continue;
    const closing = token.startsWith("</");
    const name = token.match(/^<\\/?([A-Za-z_][\\w:.-]*)/)?.[1];
    if (!name) continue;

    if (closing) {
      assert.equal(stack.pop(), name, "SVG element closing tags must match their opening tags");
      continue;
    }

    if (stack.length === 0) rootCount += 1;
    if (!/\\/\\s*>$/.test(token)) stack.push(name);
  }

  return { rootCount, unclosedElements: stack };
}

test("documentation SVGs are accessible, self-contained and structurally balanced", async () => {
  assert.ok(svgFiles.length >= 6, "expected the two existing diagrams and four governance diagrams");

  for (const filename of svgFiles) {
    const source = await readFile(new URL(filename, mediaDirectory), "utf8");
    assert.match(source, /^<svg\\b/, filename + " must start with an SVG root");
    assert.match(source, /xmlns="http:\\/\\/www\\.w3\\.org\\/2000\\/svg"/, filename + " must declare the SVG namespace");
    assert.match(source, /viewBox="[^"]+"/, filename + " must define a scalable viewBox");
    assert.match(source, /role="img"\\s+aria-labelledby="title desc"/, filename + " must expose an accessible image name and description");
    assert.match(source, /<title id="title">[\\s\\S]+?<\\/title>/, filename + " must have a non-empty title");
    assert.match(source, /<desc id="desc">[\\s\\S]+?<\\/desc>/, filename + " must have a non-empty description");
    assert.doesNotMatch(source, /<(?:script|image|foreignObject)\\b/i, filename + " must not embed scripts, remote images or foreign HTML");
    assert.doesNotMatch(source, /\\b(?:href|xlink:href)\\s*=|url\\(\\s*https?:/i, filename + " must not depend on remote resources");

    const structure = inspectXmlElements(source);
    assert.equal(structure.rootCount, 1, filename + " must have exactly one root element");
    assert.deepEqual(structure.unclosedElements, [], filename + " must close every XML element");
  }
});

test("README links every documentation SVG in the asset library", async () => {
  const readme = await readFile(new URL("../README.md", import.meta.url), "utf8");
  for (const filename of svgFiles) {
    assert.ok(readme.includes("docs/media/" + filename), "README must reference " + filename);
  }
});
