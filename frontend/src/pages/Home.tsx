import { useEffect, useMemo, useRef, useState } from "react";
import TaskForm from "../components/TaskForm";
import TaskList from "../components/TaskList";
import TaskSummary from "../components/TaskSummary";
import TaskFilters, { type TaskSortOption, type TaskViewMode } from "../components/TaskFilters";
import { createTask, deleteTask, ensureCsrf, getTasks, updateTask } from "../services/api";
import type { Task, TaskPayload, TaskStatus } from "../types";

function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<TaskStatus | "ALL">("ALL");
  const [sortOption, setSortOption] = useState<TaskSortOption>("createdAt-desc");
  const [viewMode, setViewMode] = useState<TaskViewMode>("comfortable");
  const [highlightedTaskId, setHighlightedTaskId] = useState<number | null>(null);
  const highlightTimer = useRef<number | null>(null);

  useEffect(() => {
    const initialize = async () => {
      try {
        await ensureCsrf();
        const data = await getTasks();
        setTasks(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Não foi possível carregar as tarefas");
      } finally {
        setLoading(false);
      }
    };

    initialize();
  }, []);

  useEffect(() => {
    return () => {
      if (highlightTimer.current) {
        window.clearTimeout(highlightTimer.current);
      }
    };
  }, []);

  const handleCreate = async (payload: TaskPayload) => {
    try {
      setError(null);
      setSubmitting(true);
      const created = await createTask(payload);
      setTasks((prev) => [created, ...prev]);
      setHighlightedTaskId(created.id);
      if (highlightTimer.current) {
        window.clearTimeout(highlightTimer.current);
      }
      highlightTimer.current = window.setTimeout(() => setHighlightedTaskId(null), 4000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar tarefa");
      throw err;
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async (payload: TaskPayload) => {
    if (!editingTask) return;

    try {
      setError(null);
      setSubmitting(true);
      const updated = await updateTask(editingTask.id, payload);
      setTasks((prev) => prev.map((task) => (task.id === updated.id ? updated : task))); 
      setEditingTask(null);
      setHighlightedTaskId(updated.id);
      if (highlightTimer.current) {
        window.clearTimeout(highlightTimer.current);
      }
      highlightTimer.current = window.setTimeout(() => setHighlightedTaskId(null), 4000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao atualizar tarefa");
      throw err;
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (task: Task) => {
    try {
      setError(null);
      setDeletingId(task.id);
      await deleteTask(task.id);
      setTasks((prev) => prev.filter((item) => item.id !== task.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao excluir tarefa");
    } finally {
      setDeletingId(null);
    }
  };

  const filteredTasks = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    return tasks.filter((task) => {
      const matchesStatus = statusFilter === "ALL" || task.status === statusFilter;
      if (!normalizedSearch) {
        return matchesStatus;
      }
      const matchesSearch = [task.title, task.description ?? ""].some((field) => field.toLowerCase().includes(normalizedSearch));
      return matchesStatus && matchesSearch;
    });
  }, [tasks, searchTerm, statusFilter]);

  const sortedTasks = useMemo(() => {
    const copy = [...filteredTasks];
    const safeTime = (value: string | null) => {
      if (!value) return 0;
      const date = new Date(value).getTime();
      return Number.isNaN(date) ? 0 : date;
    };

    copy.sort((a, b) => {
      switch (sortOption) {
        case "createdAt-asc":
          return safeTime(a.createdAt) - safeTime(b.createdAt);
        case "dueDate-asc":
          return (safeTime(a.dueDate) || Number.POSITIVE_INFINITY) - (safeTime(b.dueDate) || Number.POSITIVE_INFINITY);
        case "dueDate-desc":
          return (safeTime(b.dueDate) || Number.NEGATIVE_INFINITY) - (safeTime(a.dueDate) || Number.NEGATIVE_INFINITY);
        case "title-asc": {
          return a.title.localeCompare(b.title, undefined, { sensitivity: "base" });
        }
        case "createdAt-desc":
        default:
          return safeTime(b.createdAt) - safeTime(a.createdAt);
      }
    });

    return copy;
  }, [filteredTasks, sortOption]);

  const resetEdit = () => {
    setEditingTask(null);
  };

  const renderLoading = () => {
    const placeholders = Array.from({ length: viewMode === "compact" ? 6 : 3 });
    return (
      <div className="task-skeletons">
        {placeholders.map((_, index) => (
          <div key={index} className="task-skeleton">
            <div className="task-skeleton__title" />
            <div className="task-skeleton__line" />
            <div className="task-skeleton__line task-skeleton__line--short" />
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="layout">
      <header className="layout__header">
        <span className="eyebrow">Stoix Task Manager</span>
        <h1>Organize, acompanhe e finalize com estilo</h1>
        <p>Gerencie suas tarefas com uma experiência moderna, rápida e focada no que realmente importa.</p>
      </header>

      <TaskSummary tasks={tasks} />

      {error ? <div className="alert">{error}</div> : null}

      <div className="grid">
        <TaskForm
          mode={editingTask ? "edit" : "create"}
          initialTask={editingTask}
          onSubmit={editingTask ? handleUpdate : handleCreate}
          onCancelEdit={editingTask ? resetEdit : undefined}
          isSubmitting={submitting}
        />

        <section className="card tasks-card">
          <header className="card-header card-header--sticky">
            <div className="card-header__titles">
              <p className="eyebrow">Painel</p>
              <h2>Tarefas</h2>
            </div>
            <p className="muted">Filtre, ordene e alterne a visualização para lidar com listas extensas.</p>
            <TaskFilters
              searchTerm={searchTerm}
              statusFilter={statusFilter}
              sortOption={sortOption}
              viewMode={viewMode}
              onSearchTermChange={setSearchTerm}
              onStatusFilterChange={setStatusFilter}
              onSortOptionChange={setSortOption}
              onViewModeChange={setViewMode}
            />
          </header>
          <div className="card-body tasks-card__body">
            {loading ? (
              renderLoading()
            ) : (
              <TaskList
                tasks={sortedTasks}
                onEdit={setEditingTask}
                onDelete={handleDelete}
                deletingId={deletingId}
                viewMode={viewMode}
                highlightedTaskId={highlightedTaskId}
              />
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

export default Home;

