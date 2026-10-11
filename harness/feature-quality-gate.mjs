import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

/**
 * Feature-level verification gate. Pure validation: cannot grant approval.
 * A passing generic harness test is never a substitute for a feature test.
 */
export function validateFeatureQuality({ featureId, revision, policy, checkRuns, workflowRuns } = {}) {
  const errors = [];
  const config = policy?.features?.[featureId];
  if (!config) return { ok: false, errors: ['No verification policy for feature.'] };
  if (config.status !== 'enabled') errors.push('Feature-specific test workflow is not yet enabled.');
  if (!config.workflow || !config.required_check) errors.push('Incomplete feature test policy.');
  const trustedSuites = (Array.isArray(workflowRuns) ? workflowRuns : [])
    .filter(run => run.path === config.workflow && run.head_sha === revision &&
      run.event === 'push' && run.status === 'completed' && run.conclusion === 'success')
    .map(run => run.check_suite_id)
    .filter(id => Number.isInteger(id));
  if (!trustedSuites.length) errors.push('No successful trusted feature workflow for the requested revision.');
  const passed = (Array.isArray(checkRuns) ? checkRuns : []).some(run =>
    run.name === config.required_check && run.head_sha === revision &&
    run.status === 'completed' && run.conclusion === 'success' &&
    run.app?.slug === 'github-actions' && trustedSuites.includes(run.check_suite?.id));
  if (!passed) errors.push('Required feature-specific check did not pass for the requested revision.');
  return { ok: errors.length === 0, errors };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const [policyPath, featureId, revision, checksPath, workflowsPath] = process.argv.slice(2);
    if (![policyPath, featureId, revision, checksPath, workflowsPath].every(Boolean)) {
      throw Error('Usage: node harness/feature-quality-gate.mjs <policy.json> <feature-id> <sha> <checks.json> <workflow-runs.json>');
    }
    const policy = JSON.parse(readFileSync(policyPath, 'utf8'));
    const checkRuns = JSON.parse(readFileSync(checksPath, 'utf8')).check_runs;
    const workflowRuns = JSON.parse(readFileSync(workflowsPath, 'utf8')).workflow_runs;
    const result = validateFeatureQuality({ featureId, revision, policy, checkRuns, workflowRuns });
    console.log(JSON.stringify(result, null, 2));
    process.exitCode = result.ok ? 0 : 1;
  } catch (error) {
    console.error(error.message);
    process.exitCode = 2;
  }
}
