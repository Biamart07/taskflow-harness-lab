export type TaskStatus = 'todo' | 'in_progress' | 'done';
export interface Task { readonly id: string; readonly title: string; readonly status: TaskStatus }
export class InvalidTaskTitle extends Error {
  constructor() { super('Digite um título para a tarefa.'); }
}
export function createTask(id: string, title: string): Task {
  const normalized = title.trim();
  if (!normalized) throw new InvalidTaskTitle();
  return { id, title: normalized, status: 'todo' };
}
