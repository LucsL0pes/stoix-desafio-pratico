import type { Task } from "../types";
import type { TaskViewMode } from "./TaskFilters";

interface TaskItemProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void | Promise<void>;
  isProcessing?: boolean;
  viewMode: TaskViewMode;
  order?: number;
  isHighlighted?: boolean;
}

function translateStatus(status: Task["status"]) {
  switch (status) {
    case "COMPLETED":
      return "Concluída";
    case "IN_PROGRESS":
      return "Em andamento";
    default:
      return "Pendente";
  }
}

function formatRelativeTime(isoDate: string) {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) {
    return "Data inválida";
  }

  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.round(diffMs / (1000 * 60));

  if (diffMinutes < 1) return "Agora mesmo";
  if (diffMinutes < 60) return `Há ${diffMinutes} min`;

  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) return `Há ${diffHours} hora${diffHours > 1 ? "s" : ""}`;

  const diffDays = Math.round(diffHours / 24);
  if (diffDays < 7) return `Há ${diffDays} dia${diffDays > 1 ? "s" : ""}`;

  return date.toLocaleDateString("pt-BR");
}

function getDueInfo(dueDate?: string | null) {
  if (!dueDate) {
    return { label: "Sem prazo", tone: "neutral" as const };
  }

  const due = new Date(dueDate);
  if (Number.isNaN(due.getTime())) {
    return { label: "Data inválida", tone: "warning" as const };
  }

  const now = new Date();
  const diff = due.getTime() - now.getTime();
  const diffDays = Math.ceil(diff / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return { label: `Atrasada ${Math.abs(diffDays)}d`, tone: "danger" as const };
  }

  if (diffDays === 0) {
    return { label: "Vence hoje", tone: "warning" as const };
  }

  if (diffDays <= 3) {
    return { label: `Em ${diffDays}d`, tone: "warning" as const };
  }

  return { label: `Em ${diffDays}d`, tone: "success" as const };
}

function TaskItem({ task, onEdit, onDelete, isProcessing, viewMode, order = 0, isHighlighted }: TaskItemProps) {
  const dueInfo = getDueInfo(task.dueDate);
  const animationDelay = Math.min(order, 8) * 60;
  const createdRelative = formatRelativeTime(task.createdAt);

  return (
    <article
      className={`task-item task-item--${viewMode}${isProcessing ? " is-processing" : ""}${isHighlighted ? " is-highlighted" : ""}`}
      style={{ animationDelay: `${animationDelay}ms` }}
    >
      <header className="task-item__header">
        <div className="task-item__title-group">
          <h3 className="task-item__title">{task.title}</h3>
          <div className="task-item__badges">
            <span className={`pill pill--status pill--${task.status.toLowerCase()}`}>{translateStatus(task.status)}</span>
            <span className={`pill pill--due pill--${dueInfo.tone}`}>{dueInfo.label}</span>
          </div>
        </div>
        <time className="task-item__meta" dateTime={task.createdAt}>
          Criada {createdRelative}
        </time>
      </header>

      {task.description ? <p className="task-item__description">{task.description}</p> : null}

      <footer className="task-item__footer">
        <div className="task-item__dates">
          <span className="task-item__date-label">Atualizada {formatRelativeTime(task.updatedAt)}</span>
          {task.dueDate ? (
            <span className="task-item__date-label">Entrega {new Date(task.dueDate).toLocaleDateString("pt-BR")}</span>
          ) : (
            <span className="task-item__date-label">Prazo livre</span>
          )}
        </div>
        <div className="task-item__actions">
          <button className="button secondary" onClick={() => onEdit(task)} disabled={isProcessing}>
            Editar
          </button>
          <button className="button danger" onClick={() => onDelete(task)} disabled={isProcessing}>
            {isProcessing ? "Removendo..." : "Excluir"}
          </button>
        </div>
      </footer>
    </article>
  );
}

export default TaskItem;

