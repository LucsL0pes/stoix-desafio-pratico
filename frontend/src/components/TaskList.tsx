import { useEffect, useMemo, useRef, useState } from "react";
import type { Task } from "../types";
import TaskItem from "./TaskItem";
import type { TaskViewMode } from "./TaskFilters";

interface TaskListProps {
  tasks: Task[];
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => Promise<void>;
  deletingId: number | null;
  viewMode: TaskViewMode;
  highlightedTaskId: number | null;
}

const BASE_BATCH = 18;

function TaskList({ tasks, onEdit, onDelete, deletingId, viewMode, highlightedTaskId }: TaskListProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const [visibleCount, setVisibleCount] = useState(() => Math.min(tasks.length, BASE_BATCH));

  const batchSize = useMemo(() => (viewMode === "compact" ? 40 : 18), [viewMode]);
  const initialBatch = useMemo(() => (viewMode === "compact" ? 30 : BASE_BATCH), [viewMode]);

  useEffect(() => {
    setVisibleCount(Math.min(tasks.length, initialBatch));
    if (containerRef.current) {
      containerRef.current.scrollTop = 0;
    }
  }, [tasks, initialBatch]);

  useEffect(() => {
    if (!containerRef.current || !sentinelRef.current) {
      return;
    }

    if (visibleCount >= tasks.length) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const isVisible = entries.some((entry) => entry.isIntersecting);
        if (isVisible) {
          setVisibleCount((prev) => Math.min(prev + batchSize, tasks.length));
        }
      },
      {
        root: containerRef.current,
        rootMargin: "120px",
        threshold: 0.1
      }
    );

    observer.observe(sentinelRef.current);

    return () => {
      observer.disconnect();
    };
  }, [batchSize, tasks.length, visibleCount]);

  const visibleTasks = useMemo(() => tasks.slice(0, visibleCount), [tasks, visibleCount]);
  const isShowingAll = visibleCount >= tasks.length;

  if (!tasks.length) {
    return (
      <div className="task-empty">
        <h3>Nenhuma tarefa por aqui</h3>
        <p>Use o formulário ao lado para criar sua primeira tarefa e acompanhar o progresso.</p>
      </div>
    );
  }

  return (
    <div className="task-list-wrapper">
      <div className="task-scroll" ref={containerRef}>
        <div className={`task-list task-list--${viewMode}`}>
          {visibleTasks.map((task, index) => (
            <TaskItem
              key={task.id}
              task={task}
              onEdit={onEdit}
              onDelete={onDelete}
              isProcessing={deletingId === task.id}
              viewMode={viewMode}
              order={index}
              isHighlighted={highlightedTaskId === task.id}
            />
          ))}
        </div>
        <div ref={sentinelRef} className="task-sentinel" aria-hidden="true" />
      </div>
      <footer className="task-list__footer">
        <span>
          Mostrando {visibleTasks.length} de {tasks.length} tarefa{tasks.length === 1 ? "" : "s"}
        </span>
        {!isShowingAll ? (
          <button type="button" className="button secondary is-ghost" onClick={() => setVisibleCount((prev) => Math.min(prev + batchSize, tasks.length))}>
            Carregar mais
          </button>
        ) : null}
      </footer>
    </div>
  );
}

export default TaskList;

