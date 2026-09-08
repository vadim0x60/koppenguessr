const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { webcrypto } = require('node:crypto');
const { test } = require('node:test');
const vm = require('node:vm');

const source = readFileSync(`${__dirname}/locations.json`, 'utf8');
const selection = JSON.parse(readFileSync(`${__dirname}/game-selection.json`, 'utf8'));
const script = readFileSync(`${__dirname}/app.js`, 'utf8');

async function load(overrides = {}) {
  const warnings = [];
  const context = vm.createContext({
    document: { getElementById: () => ({}) },
    window: { addEventListener: () => {} },
    console: { warn: (...args) => warnings.push(args), error: assert.fail },
    crypto: webcrypto, TextEncoder,
    fetch: async (url) => url.startsWith('locations.json')
      ? { text: async () => source }
      : { ok: true, json: async () => selection, ...overrides },
  });
  vm.runInContext(script, context);
  // Isolate initialization from rendering; browser smoke check covers the DOM.
  vm.runInContext('renderReferenceGuide = setupEventListeners = startNewRound = () => {};', context);
  await vm.runInContext('init()', context);
  return { context, warnings, ids: vm.runInContext('locations.map(l => l.id)', context) };
}

test('game initializes its deck from exactly the reproducible selection', async () => {
  const { context, ids, warnings } = await load();
  assert.equal(warnings.length, 0);
  assert.deepEqual(new Set(ids), new Set(selection.selected_ids));
  assert.equal(vm.runInContext('availableLocations.length', context), ids.length);
});

test('shortlist scoring rewards precision and requires the correct climate', () => {
  const context = vm.createContext({
    document: { getElementById: () => ({}) },
    window: { addEventListener: () => {} },
  });
  vm.runInContext(script, context);

  assert.equal(vm.runInContext("calculateRoundScore(['Cfb'], 'Cfb')", context), 1);
  assert.equal(vm.runInContext("calculateRoundScore(['Cfb', 'Cfc'], 'Cfb')", context), 0.5);
  assert.equal(vm.runInContext("calculateRoundScore(['Cfa', 'Cfc'], 'Cfb')", context), 0);
});

for (const [name, overrides] of [
  ['missing', { ok: false }],
  ['stale', { json: async () => ({ ...selection, source_sha256: 'stale' }) }],
  ['empty', { json: async () => ({ ...selection, selected_ids: [] }) }],
  ['unknown ID', { json: async () => ({ ...selection, selected_ids: ['not-a-site'] }) }],
]) {
  test(`${name} selection falls back to the full playable pool`, async () => {
    const { ids, warnings } = await load(overrides);
    assert.equal(warnings.length, 1);
    assert.equal(ids.length, JSON.parse(source).length);
  });
}
