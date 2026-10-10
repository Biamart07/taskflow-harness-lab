// Harness validator — Phase 3. Run with: node harness/validate-transition.mjs <request.json>
import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

export const TRANSITIONS = Object.freeze({
  not_started: ['in_progress'],
  in_progress: ['blocked', 'awaiting_approval'],
  blocked: ['in_progress'],
  awaiting_approval: ['in_progress', 'done'],
  done: ['in_progress'],
});
const STATES = Object.keys(TRANSITIONS);
const isText = (x) => typeof x === 'string' && x.trim().length > 0;
const isObject = (x) => x !== null && typeof x === 'object' && !Array.isArray(x);

/**
 * Pure preflight validator; does NOT write features.json or securely verify approval.
 * Treat all request/evidence data as untrusted. The caller must supply an independent
 * trusted approval decision, never one read from agent-editable feature records.
 */
export function validateTransition({ registry, featureId, to, evidence = {}, approvalGranted = false, authorizedPhase = false } = {}) {
  const errors = [];
  if (!isObject(registry) || !Array.isArray(registry.features)) {
    return { ok: false, errors: ['Invalid feature registry: expected features array.'] };
  }
  const feature = registry.features.find((f) => f.id === featureId);
  if (!feature) return { ok: false, errors: [`Unknown feature: ${String(featureId)}.`] };
  const from = feature.state;
  if (!STATES.includes(from) || !STATES.includes(to) || !TRANSITIONS[from].includes(to)) {
    errors.push(`Forbidden transition: ${String(from)} -> ${String(to)}.`);
    return { ok: false, featureId, from, to, errors };
  }
  if (from === 'not_started' && to === 'in_progress') {
    if (authorizedPhase !== true) errors.push('Current phase has not been independently authorized.');
    for (const id of feature.depends_on ?? []) {
      const dependency = registry.features.find((item) => item.id === id);
      if (!dependency || dependency.state !== 'done') errors.push(`Dependency ${id} must be done.`);
    }
  }
  if (to === 'blocked' && !isText(evidence.blocker)) errors.push('Missing concrete blocker reason.');
  if (from === 'blocked' && to === 'in_progress' && !isText(evidence.resolution)) errors.push('Missing blocker resolution.');
  if (from === 'done' && to === 'in_progress' && !isText(evidence.regression)) errors.push('Missing regression/rework reason.');
  if (to === 'awaiting_approval' || to === 'done') {
    const checks = evidence.checks;
    if (!Array.isArray(checks) || checks.length === 0) {
      errors.push('Missing required automated verification evidence.');
    } else {
      for (const check of checks) {
        if (!isObject(check) || !isText(check.command) || check.status !== 'passed' || !isText(check.revision)) {
          errors.push('Each check must have command, status=passed and revision.');
          break;
        }
      }
    }
    if (evidence.acceptanceCriteriaPassed !== true) errors.push('Acceptance criteria not verified.');
    if (!isText(evidence.revision)) errors.push('Missing target revision for verification.');
    if (Array.isArray(checks) && checks.some((c) => c?.revision !== evidence.revision)) {
      errors.push('Verification evidence does not match target revision.');
    }
  }
  if (to === 'done' && approvalGranted !== true) {
    errors.push('Missing independently verified human approval.');
  }
  return { ok: errors.length === 0, featureId, from, to, errors };
}

const invoked = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (invoked) {
  try {
    const file = process.argv[2];
    if (!file) throw new Error('Usage: node harness/validate-transition.mjs <request.json>');
    const request = JSON.parse(readFileSync(file, 'utf8'));
    const result = validateTransition(request);
    process.stdout.write(JSON.stringify(result, null, 2) + '\n');
    if (!result.ok) process.exitCode = 1;
  } catch (error) {
    process.stderr.write(`Validation error: ${error.message}\n`);
    process.exitCode = 2;
  }
}
