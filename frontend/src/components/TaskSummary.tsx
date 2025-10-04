import type { Task } from "../types";

interface TaskSummaryProps {
  tasks: Task[];
}

const STATUS_LABEL: Record<Task["status"], string> = {
  PENDING: "Pendente",
  IN_PROGRESS: "Em andamento",
  COMPLETED: "Concluída"
};

function getCompletionRate(tasks: Task[]) {
  if (!tasks.length) return 0;
  const completed = tasks.filter((task) => task.status === "COMPLETED").length;
  return Math.round((completed / tasks.length) * 100);
}

function getUpcomingTask(tasks: Task[]) {
  const upcoming = tasks
    .filter((task) => task.dueDate)
    .map((task) => ({ ...task, dueTime: new Date(task.dueDate as string).getTime() }))
    .filter((task) => !Number.isNaN(task.dueTime) && task.dueTime >= Date.now())
    .sort((a, b) => a.dueTime - b.dueTime);

  return upcoming[0];
}

function formatDate(date: string) {
  try {
    return new Date(date).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
  } catch {
    return date;
  }
}

function TaskSummary({ tasks }: TaskSummaryProps) {
  const total = tasks.length;
  const pending = tasks.filter((task) => task.status === "PENDING").length;
  const inProgress = tasks.filter((task) => task.status === "IN_PROGRESS").length;
  const completed = tasks.filter((task) => task.status === "COMPLETED").length;
  const completionRate = getCompletionRate(tasks);
  const upcomingTask = getUpcomingTask(tasks);
  const tasksDueSoon = tasks.filter((task) => {
    if (!task.dueDate) return false;
    const due = new Date(task.dueDate).getTime();
    if (Number.isNaN(due)) return false;
    const diffDays = Math.ceil((due - Date.now()) / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 7;
  }).length;

  return (
    <section className="summary-grid" aria-label="Resumo das tarefas">
      <article className="summary-card summary-card--primary">
        <header className="summary-card__header">
          <span className="summary-card__label">Tarefas</span>
          <span className="summary-card__badge">{completionRate}%</span>
        </header>
        <strong className="summary-card__metric">{total}</strong>
        <p className="summary-card__detail">
          {pending} pendentes | {inProgress} em andamento | {completed} concluídas
        </p>
        <div className="summary-card__progress" role="presentation">
          <div className="summary-card__progress-bar" style={{ width: `${completionRate}%` }} />
        </div>
      </article>

      <article className="summary-card summary-card--accent">
        <header className="summary-card__header">
          <span className="summary-card__label">Próximos prazos</span>
          <span className="summary-card__badge summary-card__badge--soft">{tasksDueSoon}</span>
        </header>
        {upcomingTask ? (
          <>
            <strong className="summary-card__metric">{upcomingTask.title}</strong>
            <p className="summary-card__detail">
              Vence em {formatDate(upcomingTask.dueDate as string)} | Status: {STATUS_LABEL[upcomingTask.status]}
            </p>
          </>
        ) : (
          <>
            <strong className="summary-card__metric">Sem urgências</strong>
            <p className="summary-card__detail">Defina datas limite para manter o foco no que importa.</p>
          </>
        )}
      </article>

      <article className="summary-card summary-card--surface">
        <header className="summary-card__header">
          <span className="summary-card__label">Destaques</span>
        </header>
        <ul className="summary-card__list">
          <li>Organize as tarefas por status ou data limite.</li>
          <li>Use a visualização compacta para grandes listas.</li>
          <li>Mantenha as descrições curtas e objetivas.</li>
        </ul>
      </article>
    </section>
  );
}

export default TaskSummary;


