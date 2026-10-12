import type { TaskRepository } from '../application/task-service';
import type { Task } from '../domain/task';
// Session-only adapter. Durable storage belongs to TASK-006.
export class MemoryTaskRepository implements TaskRepository {
  private tasks: Task[] = [];
  list(): readonly Task[] { return this.tasks.map(task => ({ ...task })); }
  add(task: Task): void { this.tasks.push({ ...task }); }
}
