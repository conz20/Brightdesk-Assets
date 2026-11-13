import { createHash } from 'node:crypto';
import { constants as fsConstants } from 'node:fs';
import { lstat, open, readFile, realpath } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const FORMATS = new Set(['.gif', '.ico', '.icns', '.jpeg', '.jpg', '.pdf', '.png', '.svg', '.webm', '.webp', '.mp4']);
const PRODUCTS = new Set(['suite', 'pages', 'sheets', 'decks', 'notes', 'database', 'forms', 'lists', 'planner', 'todo', 'workspace']);
const KINDS = new Set(['brand', 'screenshot', 'release-help', 'illustration', 'diagram', 'marketing']);
const CLASSES = new Set(['verified-screenshot', 'concept', 'artwork', 'reference']);
const PLATFORMS = new Set(['windows-x64', 'macos-arm64', 'macos-x64', 'linux-x64', 'linux-arm64']);
const SHA = /^[a-f0-9]{64}$/i;
const ID = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const COMMIT = /^(?:[a-f0-9]{40}|[a-f0-9]{64})$/i;

function allowedKeys(value, keys, prefix, errors) {
  for (const key of Object.keys(value)) {
    if (!keys.has(key)) errors.push(prefix + ' contains unsupported property: ' + key);
  }
}

function nonEmpty(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function stringField(errors, value, field) {
  if (!nonEmpty(value)) errors.push(field + ' must be a non-empty string');
}

function isAbsoluteHttpsUrl(value) {
  if (typeof value !== 'string' || !value.startsWith('https://')) return false;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && url.hostname.length > 0 && !url.username && !url.password;
  } catch {
    return false;
  }
}

function isWindowsReservedDeviceName(component) {
  const stem = component.split('.')[0].replace(/[ .]+$/g, '').toUpperCase();
  return /^(?:CON|PRN|AUX|NUL|COM[1-9¹²³]|LPT[1-9¹²³])$/.test(stem);
}

function contentMatches(filePath, bytes) {
  switch (path.posix.extname(filePath).toLowerCase()) {
    case '.png': return bytes.length >= 8 && bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
    case '.jpg':
    case '.jpeg': return bytes.length >= 3 && bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255;
    case '.webp': return bytes.length >= 12 && bytes.toString('ascii', 0, 4) === 'RIFF' && bytes.toString('ascii', 8, 12) === 'WEBP';
    case '.gif': return bytes.length >= 6 && ['GIF87a', 'GIF89a'].includes(bytes.toString('ascii', 0, 6));
    case '.pdf': return bytes.length >= 5 && bytes.toString('ascii', 0, 5) === '%PDF-';
    case '.svg': {
      try {
        const text = new TextDecoder('utf-8', { fatal: true }).decode(bytes).replace(/^\uFEFF/, '').trimStart();
        return /^(?:<\?xml[^>]*>\s*)?<svg(?:\s|>)/i.test(text);
      } catch {
        return false;
      }
    }
    case '.ico': return bytes.length >= 4 && bytes.subarray(0, 4).equals(Buffer.from([0, 0, 1, 0]));
    case '.icns': return bytes.length >= 8 && bytes.toString('ascii', 0, 4) === 'icns';
    case '.webm': return bytes.length >= 4 && bytes.subarray(0, 4).equals(Buffer.from([26, 69, 223, 163]));
    case '.mp4': return bytes.length >= 8 && bytes.toString('ascii', 4, 8) === 'ftyp';
    default: return false;
  }
}

async function safeFile(rootDir, relativePath, openAsset = open) {
  if (!nonEmpty(relativePath) || !/^[A-Za-z0-9¹²³][A-Za-z0-9¹²³._/-]*$/.test(relativePath) || path.posix.isAbsolute(relativePath)) {
    return { error: 'unsafe relative path' };
  }
  const parts = relativePath.split('/');
  if (parts.some((part) => !part || part === '.' || part === '..')) return { error: 'unsafe relative path' };
  if (parts.some(isWindowsReservedDeviceName)) {
    return { error: 'Windows-reserved device name is not allowed in asset path: ' + relativePath };
  }

  const root = await realpath(rootDir);
  const candidate = path.resolve(root, ...parts);
  const rel = path.relative(root, candidate);
  if (!rel || rel === '..' || rel.startsWith('..' + path.sep) || path.isAbsolute(rel)) return { error: 'unsafe relative path' };

  let current = root;
  let metadata = null;
  for (let index = 0; index < parts.length; index += 1) {
    current = path.join(current, parts[index]);
    let info;
    try { info = await lstat(current); }
    catch { return { error: 'file does not exist or cannot be read: ' + relativePath }; }
    if (info.isSymbolicLink()) return { error: 'symbolic links are not allowed: ' + relativePath };
    if (index < parts.length - 1 && !info.isDirectory()) return { error: 'path component is not a directory: ' + relativePath };
    if (index === parts.length - 1 && !info.isFile()) return { error: 'asset/evidence path must be a regular file: ' + relativePath };
    if (index === parts.length - 1) metadata = info;
  }

  let fileHandle;
  try {
    const flags = fsConstants.O_RDONLY | (fsConstants.O_NOFOLLOW ?? 0);
    fileHandle = await openAsset(current, flags);
    const openedMetadata = await fileHandle.stat();
    if (!openedMetadata.isFile() ||
        openedMetadata.dev !== metadata.dev ||
        openedMetadata.ino !== metadata.ino ||
        openedMetadata.size !== metadata.size) {
      return { error: 'file changed during validation: ' + relativePath };
    }
    return { bytes: await fileHandle.readFile() };
  } catch {
    return { error: 'file does not exist or cannot be read: ' + relativePath };
  } finally {
    if (fileHandle) {
      try { await fileHandle.close(); } catch {}
    }
  }
}

function checkRights(asset, index, errors) {
  const prefix = 'assets[' + index + '].rights';
  const rights = asset.rights;
  if (!rights || typeof rights !== 'object' || Array.isArray(rights)) {
    errors.push(prefix + ' must be an object');
    return;
  }
  allowedKeys(rights, new Set(['name', 'evidencePath', 'evidenceSha256', 'redistribution', 'bundleAllowed', 'attributionRequired', 'attributionText']), prefix, errors);
  stringField(errors, rights.name, prefix + '.name');
  stringField(errors, rights.evidencePath, prefix + '.evidencePath');
  if (!SHA.test(rights.evidenceSha256 || '')) errors.push(prefix + '.evidenceSha256 must be a 64-character SHA-256 hex digest');
  if (rights.redistribution !== 'approved') errors.push(prefix + '.redistribution is not approved');
  if (rights.bundleAllowed !== true) errors.push(prefix + '.bundleAllowed must be true for distributable assets');
  if (typeof rights.attributionRequired !== 'boolean') errors.push(prefix + '.attributionRequired must be a boolean');
  if (rights.attributionRequired === true) stringField(errors, rights.attributionText, prefix + '.attributionText');
}

function checkVerification(asset, index, errors) {
  const prefix = 'assets[' + index + '].verification';
  if (asset.classification === 'verified-screenshot') {
    if (asset.kind !== 'screenshot') errors.push('assets[' + index + '] verified screenshots must use kind "screenshot"');
    const value = asset.verification;
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      errors.push(prefix + ' must be present for a verified screenshot');
      return;
    }
    allowedKeys(value, new Set(['product', 'platform', 'appVersion', 'sourceCommit', 'testedWorkflow', 'workflowUrl']), prefix, errors);
    if (!PRODUCTS.has(value.product)) errors.push(prefix + '.product must identify one of the ten products or the Suite');
    if (!PLATFORMS.has(value.platform)) errors.push(prefix + '.platform must be a supported tested platform');
    stringField(errors, value.appVersion, prefix + '.appVersion');
    stringField(errors, value.testedWorkflow, prefix + '.testedWorkflow');
    if (!COMMIT.test(value.sourceCommit || '')) errors.push(prefix + '.sourceCommit must be a full Git commit SHA');
    if (!isAbsoluteHttpsUrl(value.workflowUrl)) {
      errors.push(prefix + '.workflowUrl must be an HTTPS URL to the recorded workflow evidence');
    }
  } else if (asset.kind === 'screenshot' && asset.classification !== 'concept') {
    errors.push('assets[' + index + '] screenshots must be classified as verified-screenshot or concept');
  }
  if (asset.classification === 'concept' && asset.verification !== undefined) {
    errors.push('assets[' + index + '] concept assets must not contain verification evidence');
  } else if (asset.classification !== 'verified-screenshot' && asset.verification !== undefined) {
    errors.push('assets[' + index + '] verification evidence is only allowed for verified screenshots');
  }
  if (asset.classification === 'verified-screenshot' && Array.isArray(asset.products) && asset.verification && !asset.products.includes(asset.verification.product)) {
    errors.push('assets[' + index + '] verification.product must also appear in products');
  }
}

export async function validateManifest(manifest, options = {}) {
  const rootDir = options.rootDir || process.cwd();
  const openAsset = options.openAsset || open;
  const errors = [];
  if (!manifest || typeof manifest !== 'object' || Array.isArray(manifest)) {
    return { valid: false, checkedAssets: 0, errors: ['manifest must be a JSON object'] };
  }
  allowedKeys(manifest, new Set(['schemaVersion', 'assets']), 'manifest', errors);
  if (manifest.schemaVersion !== 1) errors.push('manifest.schemaVersion must equal 1');
  if (!Array.isArray(manifest.assets)) errors.push('manifest.assets must be an array');
  if (errors.length) return { valid: false, checkedAssets: 0, errors };

  const ids = new Set();
  const paths = new Set();
  const digests = new Set();
  let checkedAssets = 0;
  const assetDigests = new Set();
  const rightsEvidenceDigests = [];

  for (const [index, asset] of manifest.assets.entries()) {
    const prefix = 'assets[' + index + ']';
    if (!asset || typeof asset !== 'object' || Array.isArray(asset)) {
      errors.push(prefix + ' must be an object');
      continue;
    }
    allowedKeys(asset, new Set(['id', 'path', 'kind', 'classification', 'description', 'altText', 'products', 'source', 'rights', 'sha256', 'verification']), prefix, errors);
    stringField(errors, asset.id, prefix + '.id');
    if (nonEmpty(asset.id) && !ID.test(asset.id)) errors.push(prefix + '.id must be a lowercase kebab-case identifier');
    if (nonEmpty(asset.id)) {
      if (ids.has(asset.id)) errors.push(prefix + ' has duplicate asset ID: ' + asset.id);
      ids.add(asset.id);
    }
    stringField(errors, asset.path, prefix + '.path');
    if (nonEmpty(asset.path)) {
      if (paths.has(asset.path)) errors.push(prefix + ' has duplicate asset path: ' + asset.path);
      paths.add(asset.path);
      if (!FORMATS.has(path.posix.extname(asset.path).toLowerCase())) errors.push(prefix + ' uses unsupported asset format: ' + asset.path);
    }
    if (!KINDS.has(asset.kind)) errors.push(prefix + '.kind is not supported');
    if (!CLASSES.has(asset.classification)) errors.push(prefix + '.classification is not supported');
    stringField(errors, asset.description, prefix + '.description');
    stringField(errors, asset.altText, prefix + '.altText');

    if (!Array.isArray(asset.products) || asset.products.length === 0) errors.push(prefix + '.products must list at least one approved product ID');
    else {
      for (const product of asset.products) if (!PRODUCTS.has(product)) errors.push(prefix + '.products contains an unapproved product ID: ' + String(product));
      if (new Set(asset.products).size !== asset.products.length) errors.push(prefix + '.products contains duplicate product IDs');
    }

    const source = asset.source;
    if (!source || typeof source !== 'object' || Array.isArray(source)) errors.push(prefix + '.source must be an object');
    else {
      allowedKeys(source, new Set(['type', 'creator', 'reference']), prefix + '.source', errors);
      if (!['original', 'third-party', 'generated'].includes(source.type)) errors.push(prefix + '.source.type is not supported');
      stringField(errors, source.creator, prefix + '.source.creator');
      stringField(errors, source.reference, prefix + '.source.reference');
      if (source.type === 'third-party' && !isAbsoluteHttpsUrl(source.reference)) {
        errors.push(prefix + '.source.reference must be an HTTPS source URL for third-party assets');
      }
    }

    checkRights(asset, index, errors);
    checkVerification(asset, index, errors);
    if (!SHA.test(asset.sha256 || '')) errors.push(prefix + '.sha256 must be a 64-character SHA-256 hex digest');
    if (nonEmpty(asset.path) && SHA.test(asset.sha256 || '')) {
      const file = await safeFile(rootDir, asset.path, openAsset);
      if (file.error) errors.push(prefix + ': ' + file.error);
      else {
        checkedAssets += 1;
        const actual = createHash('sha256').update(file.bytes).digest('hex');
        assetDigests.add(actual);
        if (actual !== asset.sha256.toLowerCase()) errors.push(prefix + ' SHA-256 mismatch for ' + asset.path);
        if (!contentMatches(asset.path, file.bytes)) errors.push(prefix + ' file content does not match the declared format: ' + asset.path);
        if (digests.has(actual)) errors.push(prefix + ' has duplicate asset content (SHA-256 ' + actual + '); reuse one manifest entry for shared assets');
        digests.add(actual);
      }
    }
    if (asset.rights && nonEmpty(asset.rights.evidencePath) && SHA.test(asset.rights.evidenceSha256 || '')) {
      const evidence = await safeFile(rootDir, asset.rights.evidencePath, openAsset);
      if (evidence.error) errors.push(prefix + ': cannot read rights evidence (' + evidence.error + ')');
      else {
        const actual = createHash('sha256').update(evidence.bytes).digest('hex');
        if (actual !== asset.rights.evidenceSha256.toLowerCase()) errors.push(prefix + ' rights evidence SHA-256 mismatch');
        rightsEvidenceDigests.push({ index, digest: actual });
      }
    }
  }
  for (const evidence of rightsEvidenceDigests) {
    if (assetDigests.has(evidence.digest)) {
      errors.push('assets[' + evidence.index + '] rights evidence must be distinct from the asset file; its content matches an asset in the manifest');
    }
  }
  return { valid: errors.length === 0, checkedAssets, errors };
}

async function main() {
  const rootDir = process.cwd();
  const manifestPath = path.resolve(rootDir, process.argv[2] || 'assets/manifest.json');
  let manifest;
  try { manifest = JSON.parse(await readFile(manifestPath, 'utf8')); }
  catch (error) {
    console.error('Could not read asset manifest: ' + error.message);
    process.exitCode = 1;
    return;
  }
  const result = await validateManifest(manifest, { rootDir });
  if (!result.valid) {
    console.error('Asset validation failed (' + result.errors.length + ' issue(s)):');
    for (const error of result.errors) console.error('- ' + error);
    process.exitCode = 1;
    return;
  }
  console.log('Asset manifest valid: ' + result.checkedAssets + ' asset file(s) verified.');
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) await main();
