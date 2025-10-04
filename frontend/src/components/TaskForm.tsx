import { useEffect, useMemo, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import type { Task, TaskPayload, TaskStatus } from "../types";

interface TaskFormProps {
  mode: "create" | "edit";
  initialTask?: Task | null;
  onSubmit: (payload: TaskPayload) => Promise<void> | void;
  onCancelEdit?: () => void;
  isSubmitting: boolean;
}

type FieldName = "title" | "description" | "status" | "dueDate";

const STATUS_OPTIONS: { label: string; value: TaskStatus; helper: string }[] = [
  { label: "Pendente", value: "PENDING", helper: "Tarefas aguardando início" },
  { label: "Em andamento", value: "IN_PROGRESS", helper: "Você está trabalhando nelas" },
  { label: "Concluída", value: "COMPLETED", helper: "Trabalho finalizado" }
];

const EMPTY_STATE: TaskPayload = {
  title: "",
  description: "",
  status: "PENDING",
  dueDate: ""
};

function TaskForm({ mode, initialTask, onSubmit, onCancelEdit, isSubmitting }: TaskFormProps) {
  const [values, setValues] = useState<TaskPayload>(EMPTY_STATE);
  const [error, setError] = useState<string | null>(null);
  const descriptionLimit = 500;
  const abortController = useRef<number | null>(null);

  useEffect(() => {
    if (mode === "edit" && initialTask) {
      setValues({
        title: initialTask.title,
        description: initialTask.description ?? "",
        status: initialTask.status,
        dueDate: initialTask.dueDate ? initialTask.dueDate.substring(0, 10) : ""
      });
    } else {
      setValues(EMPTY_STATE);
    }
  }, [mode, initialTask]);

  useEffect(() => {
    return () => {
      if (abortController.current) {
        window.clearTimeout(abortController.current);
      }
    };
  }, []);

  const characterCount = values.description?.length ?? 0;
  const descriptionOverflow = characterCount > descriptionLimit;

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = event.target as { name: FieldName; value: string };
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleStatusToggle = (status: TaskStatus) => {
    setValues((prev) => ({ ...prev, status }));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!values.title.trim()) {
      setError("Informe um título para a tarefa");
      return;
    }

    if (descriptionOverflow) {
      setError("A descrição ultrapassou o limite de 500 caracteres");
      return;
    }

    try {
      const payload: TaskPayload = {
        title: values.title.trim(),
        description: values.description?.trim() ? values.description.trim() : undefined,
        status: values.status,
        dueDate: values.dueDate ? values.dueDate : undefined
      };

      await onSubmit(payload);

      if (mode === "create") {
        setValues(EMPTY_STATE);
      }
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Erro ao salvar tarefa");
    }
  };

  const statusHelper = useMemo(() => {
    const option = STATUS_OPTIONS.find((item) => item.value === values.status);
    return option?.helper ?? "";
  }, [values.status]);

  return (
    <form className="card form" onSubmit={handleSubmit}>
      <header className="card-header">
        <p className="eyebrow">{mode === "create" ? "Planejamento" : "Revisando tarefa"}</p>
        <h2>{mode === "create" ? "Nova tarefa" : "Editar tarefa"}</h2>
        <p className="muted">Defina o que precisa ser feito, ajuste o status e acompanhe o prazo com clareza.</p>
      </header>

      <div className="card-body form-body">
        <div className="form-grid">
          <label className="field">
            <span className="field__label">Título</span>
            <input
              type="text"
              name="title"
              value={values.title}
              onChange={handleChange}
              placeholder="Ex: Revisar proposta do cliente"
              autoComplete="off"
              disabled={isSubmitting}
              required
            />
            <small className="field__hint">Seja direto: um bom título ajuda a identificar a tarefa rapidamente.</small>
          </label>

          <label className="field field--stacked">
            <span className="field__label">Descrição</span>
            <textarea
              name="description"
              value={values.description ?? ""}
              onChange={handleChange}
              placeholder="Inclua informações adicionais, links ou observações importantes"
              disabled={isSubmitting}
              rows={mode === "create" ? 4 : 5}
              maxLength={descriptionLimit + 50}
            />
            <div className="field__bottom">
              <small className="field__hint">Opcional, mas útil para compartilhar contexto com o time.</small>
              <span className={`counter${descriptionOverflow ? " counter--danger" : ""}`}>
                {characterCount}/{descriptionLimit}
              </span>
            </div>
          </label>
        </div>

        <div className="form-grid form-grid--split">
          <div className="field">
            <span className="field__label">Status</span>
            <div className="chip-group" role="radiogroup" aria-label="Selecionar status">
              {STATUS_OPTIONS.map((option) => {
                const isActive = values.status === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    className={`chip chip--selectable${isActive ? " is-active" : ""}`}
                    onClick={() => handleStatusToggle(option.value)}
                    aria-pressed={isActive}
                    disabled={isSubmitting}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
            <small className="field__hint">{statusHelper}</small>
          </div>

          <label className="field">
            <span className="field__label">Data limite</span>
            <input
              type="date"
              name="dueDate"
              value={values.dueDate ?? ""}
              onChange={handleChange}
              disabled={isSubmitting}
              min={new Date().toISOString().substring(0, 10)}
            />
            <small className="field__hint">Deixe vazio se a tarefa não tiver prazo definido.</small>
          </label>
        </div>

        {error ? <p className="feedback feedback--error">{error}</p> : null}
      </div>

      <footer className="card-footer form-footer">
        {mode === "edit" && onCancelEdit ? (
          <button type="button" className="button subtle" onClick={onCancelEdit} disabled={isSubmitting}>
            Cancelar
          </button>
        ) : null}
        <button type="submit" className="button" disabled={isSubmitting}>
          {isSubmitting ? "Salvando..." : mode === "create" ? "Adicionar tarefa" : "Atualizar tarefa"}
        </button>
      </footer>
    </form>
  );
}

export default TaskForm;

