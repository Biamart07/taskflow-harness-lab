import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

/**
 * Fail-closed gate for UNTRUSTED feature-list changes in a pull request.
 * Only a separate trusted, approved workflow may promote a feature to done.
 */
export function checkFeatureChanges(before, after) {
  const errors = [];
  if (!before || !after || !Array.isArray(before.features) || !Array.isArray(after.features)) {
    return { ok: false, errors: ['Invalid feature list structure.'] };
  }
  const oldMap = new Map(before.features.map((f) => [f.id, f]));
  const newMap = new Map(after.features.map((f) => [f.id, f]));
  if (oldMap.size !== before.features.length || newMap.size !== after.features.length) {
    errors.push('Duplicate feature IDs detected.');
  }
  for (const [id, prev] of oldMap) {
    const next = newMap.get(id);
    if (!next) {
      errors.push(`Existing feature ${id} was removed.`);
      continue;
    }
    if (prev.state !== 'done' && next.state === 'done') {
      errors.push(`Feature ${id}: untrusted changes cannot set state=done. Owner-approved trusted workflow required.`);
    }
    if (prev.state === 'done' && next.state !== 'done') {
      errors.push(`Feature ${id}: modification of an approved state requires owner-supervised review.`);
    }
    if (prev.approval?.status !== 'approved' && next.approval?.status === 'approved') {
      errors.push(`Feature ${id}: untrusted changes cannot claim human approval.`);
    }
    if (JSON.stringify(prev.approval) !== JSON.stringify(next.approval)) {
      errors.push(`Feature ${id}: approval record is owner-controlled and cannot be edited in a PR.`);
    }
  }
  return { ok: errors.length === 0, errors };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    if (process.argv.length !== 4) throw new Error('Usage: node harness/check-feature-changes.mjs <base.json> <head.json>');
    const before = JSON.parse(readFileSync(process.argv[2], 'utf8'));
    const after = JSON.parse(readFileSync(process.argv[3], 'utf8'));
    const result = checkFeatureChanges(before, after);
    console.log(JSON.stringify(result, null, 2));
    process.exitCode = result.ok ? 0 : 1;
  } catch (error) {
    console.error('Gate error:', error.message);
    process.exitCode = 2;
  }
}
