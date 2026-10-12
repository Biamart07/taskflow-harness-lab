import { TaskBoard } from '../features/tasks/ui/TaskBoard';
import type { TaskService } from '../features/tasks/application/task-service';
export function App({ tasks }: { tasks: TaskService }) { return <TaskBoard service={tasks} />; }
