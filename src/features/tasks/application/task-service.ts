import { createTask, type Task } from '../domain/task';
export interface TaskRepository { list(): readonly Task[]; add(task: Task): void }
export class TaskService {
  constructor(private readonly repository: TaskRepository, private readonly nextId: () => string) {}
  list(): readonly Task[] { return this.repository.list(); }
  create(title: string): Task {
    const task = createTask(this.nextId(), title);
    this.repository.add(task);
    return task;
  }
}
