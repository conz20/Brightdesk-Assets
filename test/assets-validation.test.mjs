import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdtemp, mkdir, open, readFile, realpath, rm, symlink, unlink, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { validateManifest } from '../scripts/validate-assets.mjs';

const digest = (value) => createHash('sha256').update(value).digest('hex');

async function fixture(t) {
  const rootDir = await mkdtemp(path.join(os.tmpdir(), 'brightdesk-assets-'));
  t.after(() => rm(rootDir, { recursive: true, force: true }));
  await mkdir(path.join(rootDir, 'assets'), { recursive: true });
  await mkdir(path.join(rootDir, 'legal'), { recursive: true });
  const assetBytes = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"/>');
  const rightsBytes = Buffer.from('Owner-created asset; redistribution and bundling approved for Brightdesk products.');
  await writeFile(path.join(rootDir, 'assets', 'logo.svg'), assetBytes);
  await writeFile(path.join(rootDir, 'legal', 'logo-rights.txt'), rightsBytes);
  const record = {
    id: 'brightdesk-logo',
    path: 'assets/logo.svg',
    kind: 'brand',
    classification: 'artwork',
    description: 'Primary Brightdesk logo artwork.',
    altText: 'Brightdesk logo',
    products: ['suite'],
    source: { type: 'original', creator: 'Brightdesk', reference: 'Internal creation record BD-BRAND-001' },
    rights: {
      name: 'Brightdesk-owned asset rights',
      evidencePath: 'legal/logo-rights.txt',
      evidenceSha256: digest(rightsBytes),
      redistribution: 'approved',
      bundleAllowed: true,
      attributionRequired: false
    },
    sha256: digest(assetBytes)
  };
  const manifest = { schemaVersion: 1, assets: [record] };
  return { rootDir, record, manifest, assetBytes, rightsBytes };
}

test('accepts an empty manifest while the asset library is being established', async () => {
  const result = await validateManifest({ schemaVersion: 1, assets: [] }, { rootDir: os.tmpdir() });
  assert.equal(result.valid, true, result.errors.join('\n'));
  assert.equal(result.checkedAssets, 0);
});

test('accepts an asset when its file and rights evidence match their SHA-256 records', async (t) => {
  const f = await fixture(t);
  const result = await validateManifest(f.manifest, { rootDir: f.rootDir });
  assert.equal(result.valid, true, result.errors.join('\n'));
  assert.equal(result.checkedAssets, 1);
});

test('rejects duplicate asset IDs and duplicate paths', async (t) => {
  const f = await fixture(t);
  f.manifest.assets.push({ ...f.record });
  const result = await validateManifest(f.manifest, { rootDir: f.rootDir });
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((message) => message.includes('duplicate asset ID')));
  assert.ok(result.errors.some((message) => message.includes('duplicate asset path')));
});

test('rejects paths that escape the repository root', async (t) => {
  const f = await fixture(t);
  f.record.path = '../outside.svg';
  const result = await validateManifest(f.manifest, { rootDir: f.rootDir });
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((message) => message.includes('unsafe relative path')));
});

test('rejects symbolic links instead of following them', async (t) => {
  if (process.platform === 'win32') return t.skip('Creating symlinks may require elevated Windows permissions.');
  const f = await fixture(t);
  const outside = path.join(f.rootDir, 'outside.svg');
  await writeFile(outside, f.assetBytes);
  await rm(path.join(f.rootDir, 'assets', 'logo.svg'));
  await symlink(outside, path.join(f.rootDir, 'assets', 'logo.svg'));
  const result = await validateManifest(f.manifest, { rootDir: f.rootDir });
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((message) => message.includes('symbolic links are not allowed')));
});

test('rejects asset checksum mismatches', async (t) => {
  const f = await fixture(t);
  f.record.sha256 = '0'.repeat(64);
  const result = await validateManifest(f.manifest, { rootDir: f.rootDir });
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((message) => message.includes('SHA-256 mismatch')));
});

test('rejects missing redistribution approval and missing legal evidence', async (t) => {
  const f = await fixture(t);
  f.record.rights.redistribution = 'review-required';
  f.record.rights.evidencePath = 'legal/missing.txt';
  const result = await validateManifest(f.manifest, { rootDir: f.rootDir });
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((message) => message.includes('redistribution is not approved')));
  assert.ok(result.errors.some((message) => message.includes('cannot read rights evidence')));
});

test('requires tested-build evidence for verified product screenshots', async (t) => {
  const f = await fixture(t);
  f.record.kind = 'screenshot';
  f.record.classification = 'verified-screenshot';
  f.record.verification = {};
  const result = await validateManifest(f.manifest, { rootDir: f.rootDir });
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((message) => message.includes('verification.product')));
  assert.ok(result.errors.some((message) => message.includes('verification.sourceCommit')));
  assert.ok(result.errors.some((message) => message.includes('verification.workflowUrl')));
});

test('requires concepts to be labelled and never treats a concept as tested-build evidence', async (t) => {
  const f = await fixture(t);
  f.record.kind = 'screenshot';
  f.record.classification = 'concept';
  f.record.verification = { product: 'pages' };
  const result = await validateManifest(f.manifest, { rootDir: f.rootDir });
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((message) => message.includes('concept assets must not contain verification evidence')));
});

test('rejects duplicate asset content stored under different paths', async (t) => {
  const f = await fixture(t);
  await writeFile(path.join(f.rootDir, 'assets', 'logo-copy.svg'), f.assetBytes);
  f.manifest.assets.push({ ...f.record, id: 'brightdesk-logo-copy', path: 'assets/logo-copy.svg' });
  const result = await validateManifest(f.manifest, { rootDir: f.rootDir });
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((message) => message.includes('duplicate asset content')));
});

test('rejects files whose contents do not match their declared extension', async (t) => {
  const f = await fixture(t);
  await writeFile(path.join(f.rootDir, 'assets', 'fake.png'), f.assetBytes);
  f.record.path = 'assets/fake.png';
  f.record.sha256 = digest(f.assetBytes);
  const result = await validateManifest(f.manifest, { rootDir: f.rootDir });
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((message) => message.includes('file content does not match')));
});

test('accepts a verified screenshot only when complete tested-build evidence is present', async (t) => {
  const f = await fixture(t);
  const pngBytes = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00]);
  await writeFile(path.join(f.rootDir, 'assets', 'actual-build.png'), pngBytes);
  f.record.path = 'assets/actual-build.png';
  f.record.kind = 'screenshot';
  f.record.classification = 'verified-screenshot';
  f.record.products = ['pages'];
  f.record.sha256 = digest(pngBytes);
  f.record.verification = {
    product: 'pages',
    platform: 'macos-arm64',
    appVersion: '0.1.0',
    sourceCommit: 'a'.repeat(40),
    testedWorkflow: 'Pages UI acceptance',
    workflowUrl: 'https://github.com/conz20/Brightdesk-Pages/actions/runs/123'
  };
  const result = await validateManifest(f.manifest, { rootDir: f.rootDir });
  assert.equal(result.valid, true, result.errors.join('\n'));
});

test('rejects unapproved customer product identifiers', async (t) => {
  const f = await fixture(t);
  f.record.products = ['outlook'];
  const result = await validateManifest(f.manifest, { rootDir: f.rootDir });
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((message) => message.includes('unapproved product ID')));
});

test('requires lowercase stable kebab-case asset identifiers', async (t) => {
  const f = await fixture(t);
  f.record.id = 'Brightdesk Logo';
  const result = await validateManifest(f.manifest, { rootDir: f.rootDir });
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((message) => message.includes('lowercase kebab-case')));
});

test('requires third-party source records to use HTTPS provenance', async (t) => {
  const f = await fixture(t);
  f.record.source = { type: 'third-party', creator: 'Example creator', reference: 'http://example.com/asset' };
  const result = await validateManifest(f.manifest, { rootDir: f.rootDir });
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((message) => message.includes('HTTPS source URL')));
});

test('requires verified screenshot product to be listed as a consumer', async (t) => {
  const f = await fixture(t);
  const pngBytes = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00]);
  await writeFile(path.join(f.rootDir, 'assets', 'actual-build.png'), pngBytes);
  f.record.path = 'assets/actual-build.png';
  f.record.kind = 'screenshot';
  f.record.classification = 'verified-screenshot';
  f.record.sha256 = digest(pngBytes);
  f.record.verification = {
    product: 'sheets', platform: 'macos-arm64', appVersion: '0.1.0',
    sourceCommit: 'b'.repeat(40), testedWorkflow: 'Sheets UI acceptance',
    workflowUrl: 'https://github.com/conz20/Brightdesk-Sheets/actions/runs/456'
  };
  const result = await validateManifest(f.manifest, { rootDir: f.rootDir });
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((message) => message.includes('verification.product must also appear in products')));
});

test('rejects unsupported file extensions', async (t) => {
  const f = await fixture(t);
  const bad = await readFile(path.join(f.rootDir, 'assets', 'logo.svg'));
  await writeFile(path.join(f.rootDir, 'assets', 'logo.exe'), bad);
  f.record.path = 'assets/logo.exe';
  f.record.sha256 = digest(bad);
  const result = await validateManifest(f.manifest, { rootDir: f.rootDir });
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((message) => message.includes('unsupported asset format')));
});


test('rejects path characters outside the manifest schema relative-path contract', async (t) => {
  const f = await fixture(t);
  const invalidPath = 'assets/logo image.svg';
  await writeFile(path.join(f.rootDir, 'assets', 'logo image.svg'), f.assetBytes);
  f.record.path = invalidPath;
  const result = await validateManifest(f.manifest, { rootDir: f.rootDir });
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((message) => message.includes('unsafe relative path')));
});

test('requires third-party HTTPS references to use the schema absolute URL form', async (t) => {
  const f = await fixture(t);
  f.record.source = { type: 'third-party', creator: 'Example creator', reference: 'https:example.com/asset.svg' };
  const result = await validateManifest(f.manifest, { rootDir: f.rootDir });
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((message) => message.includes('HTTPS source URL')));
});

test('requires screenshot workflow evidence URLs to use the schema absolute HTTPS form', async (t) => {
  const f = await fixture(t);
  const pngBytes = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00]);
  await writeFile(path.join(f.rootDir, 'assets', 'actual-build.png'), pngBytes);
  f.record.path = 'assets/actual-build.png';
  f.record.kind = 'screenshot';
  f.record.classification = 'verified-screenshot';
  f.record.products = ['pages'];
  f.record.sha256 = digest(pngBytes);
  f.record.verification = {
    product: 'pages',
    platform: 'macos-arm64',
    appVersion: '0.1.0',
    sourceCommit: 'c'.repeat(40),
    testedWorkflow: 'Pages UI acceptance',
    workflowUrl: 'https:github.com/conz20/Brightdesk-Pages/actions/runs/123'
  };
  const result = await validateManifest(f.manifest, { rootDir: f.rootDir });
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((message) => message.includes('workflowUrl must be an HTTPS URL')));
});

test('rejects invalid UTF-8 SVG payloads without crashing validation', async (t) => {
  const f = await fixture(t);
  const malformedSvg = Buffer.from([0x3c, 0x73, 0x76, 0x67, 0xff]);
  await writeFile(path.join(f.rootDir, 'assets', 'logo.svg'), malformedSvg);
  f.record.sha256 = digest(malformedSvg);
  const result = await validateManifest(f.manifest, { rootDir: f.rootDir });
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((message) => message.includes('file content does not match the declared format')));
});

test('keeps the JSON Schema aligned with the approved-only runtime registry', async () => {
  const schema = JSON.parse(await readFile(new URL('../schemas/asset-manifest.schema.json', import.meta.url), 'utf8'));
  const asset = schema.$defs.asset;
  assert.equal(asset.properties.rights.properties.redistribution.const, 'approved');
  assert.equal(asset.properties.rights.properties.bundleAllowed.const, true);
  assert.ok(asset.allOf.some((rule) =>
    rule.if?.properties?.kind?.const === 'screenshot' &&
    rule.then?.properties?.classification?.enum?.includes('concept') &&
    rule.then?.properties?.classification?.enum?.includes('verified-screenshot')
  ));
});


test('rejects HTTPS provenance and workflow URLs that embed credentials', async (t) => {
  const f = await fixture(t);
  f.record.source = {
    type: 'third-party',
    creator: 'Example creator',
    reference: 'https://user:secret@example.com/asset.svg'
  };
  let result = await validateManifest(f.manifest, { rootDir: f.rootDir });
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((message) => message.includes('HTTPS source URL')));

  const screenshot = await fixture(t);
  const pngBytes = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00]);
  await writeFile(path.join(screenshot.rootDir, 'assets', 'actual-build.png'), pngBytes);
  screenshot.record.path = 'assets/actual-build.png';
  screenshot.record.kind = 'screenshot';
  screenshot.record.classification = 'verified-screenshot';
  screenshot.record.products = ['pages'];
  screenshot.record.sha256 = digest(pngBytes);
  screenshot.record.verification = {
    product: 'pages',
    platform: 'macos-arm64',
    appVersion: '0.1.0',
    sourceCommit: 'd'.repeat(40),
    testedWorkflow: 'Pages UI acceptance',
    workflowUrl: 'https://user:secret@github.com/conz20/Brightdesk-Pages/actions/runs/123'
  };
  result = await validateManifest(screenshot.manifest, { rootDir: screenshot.rootDir });
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((message) => message.includes('workflowUrl must be an HTTPS URL')));
});

test('rejects asset bytes reused as their own rights evidence', async (t) => {
  const f = await fixture(t);
  await writeFile(path.join(f.rootDir, 'legal', 'copied-logo.svg'), f.assetBytes);
  f.record.rights.evidencePath = 'legal/copied-logo.svg';
  f.record.rights.evidenceSha256 = digest(f.assetBytes);

  const result = await validateManifest(f.manifest, { rootDir: f.rootDir });

  assert.equal(result.valid, false);
  assert.ok(result.errors.some((message) => message.includes('rights evidence must be distinct from the asset file')));
});


test('rejects an asset replaced by a symlink between path inspection and file open', async (t) => {
  if (process.platform === 'win32') return t.skip('Symlink replacement is covered on POSIX runners.');
  const f = await fixture(t);
  const assetPath = path.join(await realpath(f.rootDir), 'assets', 'logo.svg');
  const outsidePath = path.join(f.rootDir, 'replacement-outside.svg');
  await writeFile(outsidePath, Buffer.from('<svg>replacement with different length</svg>'));
  let replaced = false;

  const result = await validateManifest(f.manifest, {
    rootDir: f.rootDir,
    openAsset: async (filePath, flags) => {
      if (filePath === assetPath && !replaced) {
        await unlink(filePath);
        await symlink(outsidePath, filePath);
        replaced = true;
      }
      return open(filePath, flags);
    }
  });

  assert.equal(replaced, true);
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((message) =>
    message.includes('file does not exist or cannot be read') || message.includes('file changed during validation')
  ));
});


test('rejects Windows-reserved device names in every asset path component', async (t) => {
  const f = await fixture(t);
  const invalidPaths = [
    'assets/CON.svg',
    'assets/con.svg',
    'assets/NUL.svg',
    'assets/PRN.svg',
    'assets/AUX.svg',
    'assets/COM1.svg',
    'assets/LPT9.svg',
    'CON/assets.svg'
  ];

  for (const relativePath of invalidPaths) {
    const absolutePath = path.join(f.rootDir, ...relativePath.split('/'));
    await mkdir(path.dirname(absolutePath), { recursive: true });
    await writeFile(absolutePath, f.assetBytes);
    f.record.path = relativePath;
    f.record.sha256 = digest(f.assetBytes);

    const result = await validateManifest(f.manifest, { rootDir: f.rootDir });

    assert.equal(result.valid, false, `validator accepted Windows-reserved path: ${relativePath}`);
    assert.ok(
      result.errors.some((message) => message.includes('Windows-reserved device name')),
      `validator did not explain the Windows-reserved path: ${relativePath}`
    );
  }
});


test('JSON Schema rejects Windows-reserved device names in every asset path component', async () => {
  const schema = JSON.parse(await readFile(new URL('../schemas/asset-manifest.schema.json', import.meta.url), 'utf8'));
  const pathPattern = new RegExp(schema.$defs.relativePath.pattern);
  const invalidPaths = [
    'assets/CON.svg',
    'assets/con.svg',
    'assets/NUL.svg',
    'assets/PRN.svg',
    'assets/AUX.svg',
    'assets/COM1.svg',
    'assets/LPT9.svg',
    'CON/assets.svg'
  ];

  for (const relativePath of invalidPaths) {
    assert.equal(pathPattern.test(relativePath), false, `schema accepted Windows-reserved path: ${relativePath}`);
  }
});
