import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { validateFeatureQuality } from './feature-quality-gate.mjs';

/** API data must be independently retrieved by the read-only collector.
 * Registry fields are configuration, never proof of test success or approval.
 */
export function validateIntegratedEvidence({ registry, featureId, revision, currentHead, checkRuns, workflowRuns, policy } = {}) {
  const errors = [];
  if (!/^[a-f0-9]{40}$/.test(revision ?? '')) errors.push('Revision must be a full 40-character commit SHA.');
  if (revision !== currentHead) errors.push('Revision must exactly match the current protected main HEAD.');
  const feature = Array.isArray(registry?.features) ? registry.features.find(f => f.id === featureId) : undefined;
  if (!feature) errors.push('Unknown feature ID.');
  else {
    if (!['in_progress', 'awaiting_approval'].includes(feature.state)) errors.push('Feature must be in_progress or awaiting_approval.');
    if (feature.verification?.source !== 'github_actions') errors.push('Independent GitHub Actions evidence source required.');
    // Reject legacy self-attested evidence rather than silently treating it as current.
    if (feature.verification?.revision !== undefined || feature.verification?.status === 'passed') errors.push('Registry cannot declare a passed revision; use live GitHub evidence.');
    if (!Array.isArray(feature.verification?.commands) || !feature.verification.commands.length) errors.push('No feature verification commands configured.');
    if (!Array.isArray(feature.acceptance_criteria) || !feature.acceptance_criteria.length) errors.push('Missing acceptance criteria.');
  }
  const trustedSuiteIds = (Array.isArray(workflowRuns) ? workflowRuns : []).filter(run =>
    run.path === '.github/workflows/harness-validation.yml' && run.head_sha === revision &&
    run.event === 'push' && run.head_branch === 'main' && run.status === 'completed' && run.conclusion === 'success'
  ).map(run => run.check_suite_id).filter(Number.isInteger);
  const passing = Array.isArray(checkRuns) && checkRuns.some(run =>
    run.name === 'validate' && run.status === 'completed' && run.conclusion === 'success' &&
    run.head_sha === revision && run.app?.slug === 'github-actions' && trustedSuiteIds.includes(run.check_suite?.id));
  if (!passing) errors.push('No successful validate check in a trusted completed main-push suite for the exact revision.');
  const quality = validateFeatureQuality({ featureId, revision, policy, checkRuns, workflowRuns });
  errors.push(...quality.errors);
  return { ok: errors.length === 0, featureId, revision, errors };
}

export function validateApprovalRequest(input = {}) {
  const result = validateIntegratedEvidence(input);
  if (!Array.isArray(input.registry?.features) || input.registry.features.find(f => f.id === input.featureId)?.state !== 'awaiting_approval') {
    result.errors.push('Feature is not awaiting_approval.');
    result.ok = false;
  }
  return result;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const [registryPath, featureId, revision, head, runsPath, workflowsPath, policyPath] = process.argv.slice(2);
    if (![registryPath, featureId, revision, head, runsPath, workflowsPath, policyPath].every(Boolean)) throw Error('Usage: node harness/verify-approval-request.mjs <features.json> <feature-id> <revision> <head-sha> <check-runs.json> <workflow-runs.json> <policy.json>');
    const result = validateApprovalRequest({ registry: JSON.parse(readFileSync(registryPath)), featureId, revision, currentHead: head,
      checkRuns: JSON.parse(readFileSync(runsPath)).check_runs, workflowRuns: JSON.parse(readFileSync(workflowsPath)).workflow_runs, policy: JSON.parse(readFileSync(policyPath)) });
    console.log(JSON.stringify(result, null, 2));
    process.exitCode = result.ok ? 0 : 1;
  } catch (error) { console.error(error.message); process.exitCode = 2; }
}
