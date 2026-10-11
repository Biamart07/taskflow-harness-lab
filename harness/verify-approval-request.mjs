import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

/**
 * Validates an approval request against registry and independently retrieved
 * GitHub check runs. This validates evidence only; it is not an approval itself.
 */
export function validateApprovalRequest({ registry, featureId, revision, currentHead, checkRuns } = {}) {
  const errors = [];
  if (!/^[a-f0-9]{40}$/.test(revision ?? '')) errors.push('Revision must be a full 40-character commit SHA.');
  if (revision !== currentHead) errors.push('Revision must exactly match the current protected main HEAD.');
  if (!registry || !Array.isArray(registry.features)) {
    errors.push('Missing valid feature registry.');
  }
  const feature = registry?.features?.find(f => f.id === featureId);
  if (!feature) errors.push('Unknown feature ID.');
  else {
    if (feature.state !== 'awaiting_approval') errors.push('Feature is not awaiting_approval.');
    if (feature.verification?.status !== 'passed') errors.push('Feature verification is not marked passed.');
    if (feature.verification?.revision !== revision) errors.push('Feature verification revision does not match requested SHA.');
    const expected = feature.verification?.commands;
    if (!Array.isArray(expected) || expected.length === 0) errors.push('No feature verification commands configured.');
    if (!Array.isArray(feature.acceptance_criteria) || feature.acceptance_criteria.length === 0) errors.push('Missing acceptance criteria.');
  }
  const passing = Array.isArray(checkRuns) && checkRuns.some(run =>
    run.name === 'validate' && run.status === 'completed' && run.conclusion === 'success' &&
    run.head_sha === revision && run.app?.slug === 'github-actions');
  if (!passing) errors.push('No successful validate check by GitHub Actions for the exact revision.');
  return { ok: errors.length === 0, featureId, revision, errors };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const [registryPath, featureId, revision, head, runsPath] = process.argv.slice(2);
  try {
    if (![registryPath, featureId, revision, head, runsPath].every(Boolean)) throw Error('Usage: node harness/verify-approval-request.mjs <features.json> <feature-id> <revision> <head-sha> <check-runs.json>');
    const registry = JSON.parse(readFileSync(registryPath, 'utf8'));
    const runs = JSON.parse(readFileSync(runsPath, 'utf8'));
    const result = validateApprovalRequest({ registry, featureId, revision, currentHead: head, checkRuns: runs.check_runs });
    console.log(JSON.stringify(result, null, 2));
    process.exitCode = result.ok ? 0 : 1;
  } catch (err) {
    console.error(err.message);
    process.exitCode = 2;
  }
}
