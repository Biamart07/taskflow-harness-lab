import test from 'node:test';
import assert from 'node:assert/strict';
import { validateFeatureQuality } from '../harness/feature-quality-gate.mjs';

const sha = 'a'.repeat(40);
const featureId = 'TASK-001';
const workflow = '.github/workflows/taskflow-feature-tests.yml';
const policy = { features: { [featureId]: {
  status: 'enabled', workflow, required_check: 'feature / TASK-001',
} } };
const workflowRuns = [{ path: workflow, head_sha: sha, event: 'push', status: 'completed', conclusion: 'success', check_suite_id: 99 }];
const checkRuns = [{ name: 'feature / TASK-001', head_sha: sha, status: 'completed', conclusion: 'success', check_suite: { id: 99 }, app: { slug: 'github-actions' } }];
const check = (changes = {}) => validateFeatureQuality({ featureId, revision: sha, policy, workflowRuns, checkRuns, ...changes });

test('allows correctly verified feature on exact revision', () => assert.equal(check().ok, true));
test('rejects pending production policy', () => assert.equal(check({ policy: { features: { [featureId]: { ...policy.features[featureId], status: 'pending' } } } }).ok, false));
test('rejects absent feature policy', () => assert.equal(check({ featureId: 'TASK-999' }).ok, false));
test('rejects generic harness validation check', () => assert.equal(check({ checkRuns: [{ ...checkRuns[0], name: 'validate' }] }).ok, false));
test('rejects passing check belonging to another workflow suite', () => assert.equal(check({ checkRuns: [{ ...checkRuns[0], check_suite: { id: 5 } }] }).ok, false));
test('rejects stale revision', () => assert.equal(check({ revision: 'b'.repeat(40) }).ok, false));
test('rejects failed check', () => assert.equal(check({ checkRuns: [{ ...checkRuns[0], conclusion: 'failure' }] }).ok, false));
test('rejects untrusted workflow', () => assert.equal(check({ workflowRuns: [{ ...workflowRuns[0], path: 'malicious.yml' }] }).ok, false));
test('rejects untrusted app', () => assert.equal(check({ checkRuns: [{ ...checkRuns[0], app: { slug: 'other' } }] }).ok, false));
test('rejects PR-only run as proof of main push', () => assert.equal(check({ workflowRuns: [{ ...workflowRuns[0], event: 'pull_request' }] }).ok, false));
