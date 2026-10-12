import { renderToStaticMarkup } from 'react-dom/server';
import { expect, it } from 'vitest';
import { App } from '../../src/app/App';
import { TaskService } from '../../src/features/tasks/application/task-service';
import { MemoryTaskRepository } from '../../src/features/tasks/infrastructure/memory-task-repository';
it('renders the board without browser or durable storage', () => {
  const markup = renderToStaticMarkup(<App tasks={new TaskService(new MemoryTaskRepository(), () => 'id')} />);
  expect(markup).toContain('TaskFlow');
  expect(markup).toContain('A fazer');
  expect(markup).toContain('<form');
});
