import { readFileSync, writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { validateApprovalRequest, validateIntegratedEvidence } from './verify-approval-request.mjs';

// Only reads GitHub and writes a receipt, never registry/approval/state files.
export async function collectMainEvidence({ api, repository, registry, policy, featureId, revision, mode = 'verification' }) {
  if (!/^[\w.-]+\/[\w.-]+$/.test(repository ?? '')) throw Error('Invalid repository.');
  if (!/^[a-f0-9]{40}$/.test(revision ?? '')) throw Error('Full SHA required.');
  if (!['verification', 'approval'].includes(mode)) throw Error('Invalid evidence mode.');
  const base = `/repos/${repository}`;
  const first = await api(`${base}/git/ref/heads/main`);
  if (first.object?.sha !== revision) throw Error('Requested revision is not live main HEAD.');
  async function pages(path, key) {
    const values = [];
    for (let page = 1; page <= 100; page++) {
      const data = await api(`${path}${path.includes('?') ? '&' : '?'}per_page=100&page=${page}`);
      if (!Array.isArray(data[key])) throw Error('Invalid GitHub collection response.');
      values.push(...data[key]);
      if (data[key].length < 100) return values;
    }
    throw Error('GitHub pagination limit reached; evidence incomplete.');
  }
  const checkRuns = await pages(`${base}/commits/${revision}/check-runs?filter=latest`, 'check_runs');
  const workflowRuns = await pages(`${base}/actions/runs?head_sha=${revision}&branch=main&event=push`, 'workflow_runs');
  const last = await api(`${base}/git/ref/heads/main`);
  const validate = mode === 'approval' ? validateApprovalRequest : validateIntegratedEvidence;
  const result = validate({ registry, featureId, revision, currentHead: last.object?.sha, checkRuns, workflowRuns, policy });
  if (!result.ok) throw Error(result.errors.join('\n'));
  return { ...result, repository, mode, notice: 'Read-only test evidence, not human approval or a state transition.',
    checks: checkRuns.filter(check => check.head_sha === revision).map(check => ({ id: check.id, name: check.name, conclusion: check.conclusion, suite: check.check_suite?.id })),
    workflows: workflowRuns.map(run => ({ id: run.id, path: run.path, head_sha: run.head_sha, event: run.event, head_branch: run.head_branch, status: run.status, conclusion: run.conclusion, check_suite_id: run.check_suite_id })) };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const [featureId, revision, mode, outputPath] = process.argv.slice(2);
    if (!outputPath || !process.env.GH_TOKEN) throw Error('Usage: GH_TOKEN=... node harness/collect-main-evidence.mjs <feature> <sha> <verification|approval> <receipt-path>');
    const api = async path => {
      const response = await fetch(`https://api.github.com${path}`, { headers: { Authorization: `Bearer ${process.env.GH_TOKEN}`, Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28' } });
      if (!response.ok) throw Error(`GitHub request failed (${response.status}).`);
      return response.json();
    };
    const result = await collectMainEvidence({ api, repository: process.env.GITHUB_REPOSITORY, featureId, revision, mode,
      registry: JSON.parse(readFileSync('harness/features.json')), policy: JSON.parse(readFileSync('harness/feature-verification-policy.json')) });
    writeFileSync(outputPath, JSON.stringify(result, null, 2) + '\n');
    console.log(`Verified ${featureId} at live main ${revision}; no state changed.`);
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}
