import test from 'node:test';
import assert from 'node:assert/strict';
import { validateTransition } from '../harness/validate-transition.mjs';

const registry = {
  features: [
    { id: 'TASK-001', state: 'not_started', depends_on: [] },
    { id: 'TASK-002', state: 'not_started', depends_on: ['TASK-001'] },
  ],
};
const evidence = {
  revision: 'abc123',
  acceptanceCriteriaPassed: true,
  checks: [{ command: 'npm test', status: 'passed', revision: 'abc123' }],
};
const call = (state, to, extras = {}) => validateTransition({
  registry: { features: [{ id: 'TASK-001', state, depends_on: [] }] },
  featureId: 'TASK-001', to, ...extras,
});

test('starts authorized feature', () => {
  assert.equal(call('not_started', 'in_progress', { authorizedPhase: true }).ok, true);
});
test('cannot start without phase authorization', () => {
  assert.match(call('not_started', 'in_progress').errors.join(' '), /authorized/);
});
test('cannot skip dependency', () => {
  const result = validateTransition({ registry, featureId: 'TASK-002', to: 'in_progress', authorizedPhase: true });
  assert.match(result.errors.join(' '), /Dependency/);
});
test('rejects forbidden skip to done', () => {
  assert.equal(call('not_started', 'done', { evidence, approvalGranted: true }).ok, false);
});
test('blocker requires a reason', () => {
  assert.equal(call('in_progress', 'blocked').ok, false);
  assert.equal(call('in_progress', 'blocked', { evidence: { blocker: 'Awaiting API spec' } }).ok, true);
});
test('recovery requires resolution', () => {
  assert.equal(call('blocked', 'in_progress').ok, false);
  assert.equal(call('blocked', 'in_progress', { evidence: { resolution: 'API spec received' } }).ok, true);
});
test('no test results means no review', () => {
  assert.equal(call('in_progress', 'awaiting_approval').ok, false);
});
test('passed tests allow review state', () => {
  assert.equal(call('in_progress', 'awaiting_approval', { evidence }).ok, true);
});
test('failed tests prevent review', () => {
  assert.equal(call('in_progress', 'awaiting_approval', { evidence: { ...evidence, checks: [{ ...evidence.checks[0], status: 'failed' }] } }).ok, false);
});
test('stale revision prevents review', () => {
  assert.equal(call('in_progress', 'awaiting_approval', { evidence: { ...evidence, revision: 'new456' } }).ok, false);
});
test('approved tests without human approval cannot be done', () => {
  assert.equal(call('awaiting_approval', 'done', { evidence }).ok, false);
});
test('approved and verified feature can be done', () => {
  assert.equal(call('awaiting_approval', 'done', { evidence, approvalGranted: true }).ok, true);
});
test('human approval without tests cannot be done', () => {
  assert.equal(call('awaiting_approval', 'done', { approvalGranted: true }).ok, false);
});
test('requested corrections reopen feature', () => {
  assert.equal(call('awaiting_approval', 'in_progress').ok, true);
});
test('regression must have reason', () => {
  assert.equal(call('done', 'in_progress').ok, false);
  assert.equal(call('done', 'in_progress', { evidence: { regression: 'Reported failing flow' } }).ok, true);
});
test('unknown feature is rejected', () => {
  assert.equal(validateTransition({ registry, featureId: 'missing', to: 'in_progress' }).ok, false);
});
