import test from 'node:test';
import assert from 'node:assert/strict';
import { validateApprovalRequest } from '../harness/verify-approval-request.mjs';

const sha = 'a'.repeat(40);
const registry = { features: [{
  id: 'TASK-001', state: 'awaiting_approval',
  acceptance_criteria: ['User can create task'],
  verification: { status: 'passed', revision: sha, commands: ['npm test'] },
}] };
const runs = [{ name: 'validate', status: 'completed', conclusion: 'success', head_sha: sha, app: { slug: 'github-actions' }, check_suite: { id: 123 } }];
const check = (override = {}) => validateApprovalRequest({
  registry, featureId: 'TASK-001', revision: sha, currentHead: sha, checkRuns: runs, trustedSuiteIds: [123], ...override,
});
test('accepts valid pending request with trusted passing check', () => assert.equal(check().ok, true));
test('rejects feature not awaiting approval', () => assert.equal(check({ registry: { features: [{ ...registry.features[0], state: 'not_started' }] } }).ok, false));
test('rejects missing feature-specific verification', () => assert.equal(check({ registry: { features: [{ ...registry.features[0], verification: { status: 'not_configured', commands: [] } }] } }).ok, false));
test('rejects old main SHA', () => assert.equal(check({ currentHead: 'b'.repeat(40) }).ok, false));
test('rejects shortened revision', () => assert.equal(check({ revision: 'abcdef' }).ok, false));
test('rejects check failure', () => assert.equal(check({ checkRuns: [{ ...runs[0], conclusion: 'failure' }] }).ok, false));
test('rejects check spoof from unexpected app', () => assert.equal(check({ checkRuns: [{ ...runs[0], app: { slug: 'third-party' } }] }).ok, false));
test('rejects stale feature evidence', () => assert.equal(check({ registry: { features: [{ ...registry.features[0], verification: { status: 'passed', revision: 'b'.repeat(40), commands: ['npm test'] } }] } }).ok, false));
test('rejects a same-named check from unrelated workflow suite', () => assert.equal(check({ checkRuns: [{ ...runs[0], check_suite: { id: 999 } }] }).ok, false));
test('rejects missing trusted workflow suites', () => assert.equal(check({ trustedSuiteIds: [] }).ok, false));
