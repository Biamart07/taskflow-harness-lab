import { useEffect, useLayoutEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react';
import { InvalidTaskTitle, type TaskStatus } from '../domain/task';
import type { TaskService } from '../application/task-service';
const columns: { status: TaskStatus; label: string; symbol: string; empty: string }[] = [
  { status: 'todo', label: 'A fazer', symbol: '○', empty: 'Um novo começo. Crie sua primeira tarefa.' },
  { status: 'in_progress', label: 'Em andamento', symbol: '◐', empty: 'As tarefas em andamento aparecerão aqui.' },
  { status: 'done', label: 'Concluído', symbol: '✓', empty: 'As tarefas concluídas aparecerão aqui.' },
];
export function TaskBoard({ service }: { service: TaskService }) {
  const [tasks, setTasks] = useState(() => service.list());
  const [title, setTitle] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [dark, setDark] = useState(false);
  const [mobile, setMobile] = useState(() => typeof window !== 'undefined' && window.matchMedia('(max-width: 700px)').matches);
  const [active, setActive] = useState<TaskStatus>('todo');
  const dialog = useRef<HTMLDialogElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const board = useRef<HTMLDivElement>(null);
  const recovery = useRef<TaskStatus | null>(null);
  useEffect(() => {
    const media = window.matchMedia('(max-width: 700px)');
    const change = () => {
      const focused = document.activeElement as HTMLElement | null;
      const status = focused?.closest<HTMLElement>('[data-column]')?.dataset.column as TaskStatus | undefined;
      if (status && media.matches) setActive(status);
      if (!media.matches && focused?.getAttribute('role') === 'tab') recovery.current = focused.dataset.column as TaskStatus;
      setMobile(media.matches);
    };
    media.addEventListener('change', change);
    return () => media.removeEventListener('change', change);
  }, []);
  useLayoutEffect(() => {
    if (recovery.current) {
      board.current?.querySelector<HTMLElement>(`#panel-${recovery.current}`)?.focus();
      recovery.current = null;
    }
  }, [mobile]);
  function open() { setTitle(''); setError(''); setNotice(''); dialog.current?.showModal(); input.current?.focus(); }
  function close() { dialog.current?.close(); }
  function trapFocus(event: KeyboardEvent<HTMLDialogElement>) {
    if (event.key !== 'Tab') return;
    const controls = dialog.current?.querySelectorAll<HTMLElement>('input, button');
    if (!controls?.length) return;
    const first = controls[0]; const last = controls[controls.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  }
  function submit(event: FormEvent) {
    event.preventDefault();
    try {
      const task = service.create(title);
      setTasks(service.list()); setActive('todo');
      setNotice(`Tarefa “${task.title}” criada em A fazer.`); close();
    } catch (failure) {
      setError(failure instanceof InvalidTaskTitle ? failure.message : 'Não foi possível criar a tarefa. Tente novamente.');
      input.current?.focus();
    }
  }
  function navigate(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? 2 : event.key === 'ArrowRight' ? (index + 1) % 3 : event.key === 'ArrowLeft' ? (index + 2) % 3 : null;
    if (next === null) return;
    event.preventDefault(); setActive(columns[next].status);
    board.current?.querySelector<HTMLElement>(`#tab-${columns[next].status}`)?.focus();
  }
  return <div className="editorial" data-theme={dark ? 'dark' : 'light'}>
    <header className="topbar"><span className="brand">TaskFlow</span><span>Meu quadro</span><button onClick={() => setDark(!dark)} aria-pressed={dark}>Tema escuro</button></header>
    <main>
      <div className="page-heading"><div><h1>Espaço para o que importa.</h1><p>Uma tarefa de cada vez, no seu ritmo.</p></div><button className="primary" ref={trigger} onClick={open}>Nova tarefa</button></div>
      <p className="session-note">As tarefas ficam disponíveis nesta sessão. Ao recarregar a página, o quadro será reiniciado.</p>
      <p role="status" className="notice">{notice}</p>
      <div ref={board}>
        {mobile && <div role="tablist" aria-label="Colunas do quadro" className="tabs">{columns.map((column, index) => <button key={column.status} id={`tab-${column.status}`} data-column={column.status} role="tab" aria-selected={active === column.status} aria-controls={`panel-${column.status}`} tabIndex={active === column.status ? 0 : -1} onClick={() => setActive(column.status)} onKeyDown={event => navigate(event, index)}>{column.label} <span>{tasks.filter(task => task.status === column.status).length}</span></button>)}</div>}
        <div className="columns">{columns.map(column => {
          const items = tasks.filter(task => task.status === column.status);
          return <section key={column.status} id={`panel-${column.status}`} data-column={column.status} role={mobile ? 'tabpanel' : undefined} aria-labelledby={mobile ? `tab-${column.status}` : `heading-${column.status}`} hidden={mobile && active !== column.status} tabIndex={mobile ? 0 : -1}>
            <h2 id={`heading-${column.status}`}><span aria-hidden="true" className={`symbol ${column.status}`}>{column.symbol}</span> {column.label} <span className="count">{items.length}</span></h2>
            {items.length ? <ul className="task-list">{items.map(task => <li className="task-card" key={task.id}><h3>{task.title}</h3></li>)}</ul> : <p className="empty">{column.empty}</p>}
          </section>;
        })}</div>
      </div>
      <dialog ref={dialog} aria-labelledby="create-heading" onKeyDown={trapFocus} onClose={() => trigger.current?.focus()}>
        <form noValidate onSubmit={submit}>
          <h2 id="create-heading">Nova tarefa</h2>
          <label htmlFor="task-title">Título da tarefa <span>(obrigatório)</span></label>
          <input ref={input} id="task-title" name="title" required value={title} onChange={event => { setTitle(event.target.value); setError(''); }} aria-invalid={Boolean(error)} aria-describedby={error ? 'title-help title-error' : 'title-help'} />
          <p id="title-help">Dê um nome ao seu próximo passo.</p>
          {error && <p id="title-error" role="alert" className="error">{error}</p>}
          <div className="actions"><button type="button" onClick={close}>Cancelar</button><button className="primary" type="submit">Criar tarefa</button></div>
        </form>
      </dialog>
    </main>
  </div>;
}
