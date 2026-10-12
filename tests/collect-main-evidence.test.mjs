import test from 'node:test';
import assert from 'node:assert/strict';
import { collectMainEvidence } from '../harness/collect-main-evidence.mjs';
const sha = 'c'.repeat(40);
const config = () => ({ repository: 'owner/taskflow', featureId: 'TASK-001', revision: sha,
  registry: { features: [{ id: 'TASK-001', state: 'in_progress', acceptance_criteria: ['Create'], verification: { status: 'pending', source: 'github_actions', commands: ['specific tests'] } }] },
  policy: { features: { 'TASK-001': { status: 'enabled', workflow: '.github/workflows/taskflow-feature-tests.yml', required_check: 'feature / TASK-001' } } } });
const checks = ['validate', 'feature / TASK-001'].map((name, i) => ({ id: i + 1, name, head_sha: sha, status: 'completed', conclusion: 'success', app: { slug: 'github-actions' }, check_suite: { id: i + 10 } }));
const workflows = ['harness-validation', 'taskflow-feature-tests'].map((name, i) => ({ id: i + 1, path: `.github/workflows/${name}.yml`, head_sha: sha, event: 'push', head_branch: 'main', status: 'completed', conclusion: 'success', check_suite_id: i + 10 }));
function fakeApi({ moved = false, paginated = false, failed = false } = {}) {
  let headReads = 0;
  return async path => {
    assert.ok(path.startsWith('/repos/owner/taskflow/'));
    if (failed) throw Error('GitHub unavailable');
    if (path.endsWith('/git/ref/heads/main')) return { object: { sha: moved && ++headReads > 1 ? 'd'.repeat(40) : sha } };
    if (path.includes('/check-runs')) return { check_runs: paginated && path.endsWith('page=1') ? Array.from({ length: 100 }, () => ({ name: 'unrelated' })) : checks };
    if (path.includes('/actions/runs')) { assert.ok(path.includes(`head_sha=${sha}&branch=main&event=push`)); return { workflow_runs: workflows }; }
    throw Error('Unexpected API path');
  };
}
test('collects live post-integration SHA, not PR SHA, without changing registry', async () => {
  const input = config(); const before = structuredClone(input.registry);
  const receipt = await collectMainEvidence({ ...input, api: fakeApi() });
  assert.equal(receipt.revision, sha); assert.equal(receipt.ok, true); assert.deepEqual(input.registry, before);
});
test('follows pagination to avoid trusting only the first page', async () => assert.equal((await collectMainEvidence({ ...config(), api: fakeApi({ paginated: true }) })).ok, true));
test('rejects main moving while evidence is collected', async () => assert.rejects(collectMainEvidence({ ...config(), api: fakeApi({ moved: true }) }), /current protected main HEAD/));
test('rejects PR or outdated SHA before fetching checks', async () => assert.rejects(collectMainEvidence({ ...config(), revision: 'd'.repeat(40), api: fakeApi() }), /not live main HEAD/));
test('API failure does not fall back to registry evidence', async () => assert.rejects(collectMainEvidence({ ...config(), api: fakeApi({ failed: true }) }), /unavailable/));
test('collector approval mode cannot approve an in_progress feature', async () => assert.rejects(collectMainEvidence({ ...config(), mode: 'approval', api: fakeApi() }), /not awaiting_approval/));

test('rejects incomplete API collections', async () => assert.rejects(collectMainEvidence({ ...config(), api: async path => path.endsWith('/git/ref/heads/main') ? { object: { sha } } : {} }), /Invalid GitHub collection/));
test('fails closed if pagination never terminates', async () => assert.rejects(collectMainEvidence({ ...config(), api: async path => path.endsWith('/git/ref/heads/main') ? { object: { sha } } : { check_runs: Array.from({ length: 100 }, () => ({})) } }), /pagination limit/));
