import test from 'node:test';
import assert from 'node:assert/strict';
import { validateApprovalRequest, validateIntegratedEvidence } from '../harness/verify-approval-request.mjs';
const sha = 'a'.repeat(40);
const registry = { features: [{ id: 'TASK-001', state: 'awaiting_approval', acceptance_criteria: ['Create task'], verification: { status: 'pending', source: 'github_actions', commands: ['npm run test:task-001'] } }] };
const policy = { features: { 'TASK-001': { status: 'enabled', workflow: '.github/workflows/taskflow-feature-tests.yml', required_check: 'feature / TASK-001' } } };
const workflows = [
  { path: '.github/workflows/harness-validation.yml', head_sha: sha, event: 'push', head_branch: 'main', status: 'completed', conclusion: 'success', check_suite_id: 123 },
  { path: '.github/workflows/taskflow-feature-tests.yml', head_sha: sha, event: 'push', head_branch: 'main', status: 'completed', conclusion: 'success', check_suite_id: 456 },
];
const runs = ['validate', 'feature / TASK-001'].map((name, i) => ({ name, head_sha: sha, status: 'completed', conclusion: 'success', app: { slug: 'github-actions' }, check_suite: { id: i ? 456 : 123 } }));
const input = (patch = {}) => ({ registry, featureId: 'TASK-001', revision: sha, currentHead: sha, checkRuns: runs, workflowRuns: workflows, policy, ...patch });
const check = patch => validateApprovalRequest(input(patch));
test('accepts live integrated evidence without writing its SHA or passed status into registry', () => assert.equal(check().ok, true));
test('read-only evidence supports in_progress, approval preflight still requires awaiting_approval', () => {
  const patch = { registry: { features: [{ ...registry.features[0], state: 'in_progress' }] } };
  assert.equal(validateIntegratedEvidence(input(patch)).ok, true); assert.equal(check(patch).ok, false);
});
test('rejects unconfigured source and commands', () => assert.equal(check({ registry: { features: [{ ...registry.features[0], verification: { status: 'passed', commands: [] } }] } }).ok, false));
test('rejects old main SHA', () => assert.equal(check({ currentHead: 'b'.repeat(40) }).ok, false));
test('rejects shortened revision', () => assert.equal(check({ revision: 'abcdef' }).ok, false));
test('rejects self-attested registry status even with passing checks', () => assert.equal(check({ registry: { features: [{ ...registry.features[0], verification: { ...registry.features[0].verification, status: 'passed' } }] } }).ok, false));
test('rejects stale pre-integration revision in registry', () => assert.equal(check({ registry: { features: [{ ...registry.features[0], verification: { ...registry.features[0].verification, revision: 'b'.repeat(40) } }] } }).ok, false));
for (const index of [0, 1]) {
  for (const [field, value] of Object.entries({ conclusion: 'failure', head_sha: 'b'.repeat(40), name: 'generic', status: 'in_progress', app: { slug: 'third-party' }, check_suite: { id: 999 } })) {
    test(`rejects check ${index} with invalid ${field}`, () => {
      const checkRuns = structuredClone(runs); checkRuns[index][field] = value;
      assert.equal(check({ checkRuns }).ok, false);
    });
  }
  for (const [field, value] of Object.entries({ path: '.github/workflows/unrelated.yml', head_sha: 'b'.repeat(40), event: 'pull_request', head_branch: 'other', status: 'in_progress', conclusion: 'failure', check_suite_id: 999 })) {
    test(`rejects workflow ${index} with invalid ${field}`, () => {
      const workflowRuns = structuredClone(workflows); workflowRuns[index][field] = value;
      assert.equal(check({ workflowRuns }).ok, false);
    });
  }
}
test('generic validate cannot substitute missing feature check', () => assert.equal(check({ checkRuns: [runs[0]] }).ok, false));
test('registry claim cannot replace missing GitHub evidence', () => assert.equal(check({ workflowRuns: [], checkRuns: [] }).ok, false));
test('pending feature policy fails closed', () => assert.equal(check({ policy: { features: { 'TASK-001': { ...policy.features['TASK-001'], status: 'pending' } } } }).ok, false));

test('rejects malformed registry without throwing', () => assert.equal(check({ registry: { features: {} } }).ok, false));
