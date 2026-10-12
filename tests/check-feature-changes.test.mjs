import test from 'node:test';
import assert from 'node:assert/strict';
import { checkFeatureChanges } from '../harness/check-feature-changes.mjs';

const base = () => ({ features: [
  { id: 'TASK-001', state: 'awaiting_approval', approval: { status: 'not_requested', approved_by: null, approved_at: null } },
] });
const change = (patch) => {
  const before = base();
  return checkFeatureChanges(before, { features: [{ ...before.features[0], ...patch }] });
};
test('allows unchanged feature', () => assert.equal(change({}).ok, true));
test('allows return to in_progress', () => assert.equal(change({ state: 'in_progress' }).ok, true));
test('rejects untrusted transition to done', () => {
  assert.match(change({ state: 'done' }).errors.join(' '), /cannot set state=done/);
});
test('rejects spoofed approval', () => {
  assert.equal(change({ approval: { status: 'approved', approved_by: 'owner', approved_at: '2026-10-10' } }).ok, false);
});
test('rejects approval field modification even without approved state', () => {
  assert.equal(change({ approval: { status: 'pending', approved_by: null, approved_at: null } }).ok, false);
});
test('rejects deletion of an existing feature', () => {
  assert.equal(checkFeatureChanges(base(), { features: [] }).ok, false);
});
test('rejects edits to previously completed feature', () => {
  const before = base();
  before.features[0].state = 'done';
  assert.equal(checkFeatureChanges(before, { features: [{ ...before.features[0], state: 'in_progress' }] }).ok, false);
});
test('rejects duplicate feature IDs', () => {
  const b = base();
  assert.equal(checkFeatureChanges(b, { features: [b.features[0], b.features[0]] }).ok, false);
});

for (const [from, to, allowed] of [
  ['not_started', 'awaiting_approval', false],
  ['not_started', 'in_progress', true],
  ['in_progress', 'awaiting_approval', true],
  ['blocked', 'awaiting_approval', false],
  ['not_started', 'done', false],
  ['in_progress', 'unknown', false],
]) {
  test(`checks final base-to-head transition ${from} -> ${to}`, () => {
    const before = base(); before.features[0].state = from;
    const after = structuredClone(before); after.features[0].state = to;
    assert.equal(checkFeatureChanges(before, after).ok, allowed);
  });
}
test('intermediate commits do not authorize skipped final merge transition', () => {
  const before = base(); before.features[0].state = 'not_started';
  const middle = structuredClone(before); middle.features[0].state = 'in_progress';
  const after = structuredClone(middle); after.features[0].state = 'awaiting_approval';
  assert.equal(checkFeatureChanges(before, middle).ok, true);
  assert.equal(checkFeatureChanges(middle, after).ok, true);
  assert.equal(checkFeatureChanges(before, after).ok, false);
});
