import { describe, expect, it, vi } from 'vitest';
import { createTask, InvalidTaskTitle } from '../../src/features/tasks/domain/task';
import { TaskService, type TaskRepository } from '../../src/features/tasks/application/task-service';
import { MemoryTaskRepository } from '../../src/features/tasks/infrastructure/memory-task-repository';
describe('TASK-001', () => {
  it.each(['', ' ', '\t\n', '\u00a0'])('rejects blank title %j', title => {
    const repository = { list: () => [], add: vi.fn() } satisfies TaskRepository;
    expect(() => new TaskService(repository, () => 'id').create(title)).toThrow(InvalidTaskTitle);
    expect(repository.add).not.toHaveBeenCalled();
  });
  it('normalizes outside whitespace and assigns Todo in the domain', () => {
    expect(createTask('id', '  Preparar  roteiro  ')).toEqual({ id: 'id', title: 'Preparar  roteiro', status: 'todo' });
  });
  it('creates distinct tasks and lists them through the repository interface', () => {
    let id = 0;
    const service = new TaskService(new MemoryTaskRepository(), () => String(++id));
    service.create('Primeira'); service.create('Segunda');
    expect(service.list()).toEqual([{ id: '1', title: 'Primeira', status: 'todo' }, { id: '2', title: 'Segunda', status: 'todo' }]);
  });
  it('isolates repository snapshots and adapter instances', () => {
    const repository = new MemoryTaskRepository();
    const original = createTask('id', 'Título'); repository.add(original);
    expect(repository.list()[0]).not.toBe(original);
    expect(repository.list()[0]).not.toBe(repository.list()[0]);
    expect(new MemoryTaskRepository().list()).toEqual([]);
  });
  it('propagates repository failure without reporting successful creation', () => {
    const repository = { list: () => [], add: () => { throw new Error('unavailable'); } } satisfies TaskRepository;
    expect(() => new TaskService(repository, () => 'id').create('Título')).toThrow('unavailable');
  });
});
