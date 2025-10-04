import type { TaskStatus } from "../types";

export type TaskSortOption = "createdAt-desc" | "createdAt-asc" | "dueDate-asc" | "dueDate-desc" | "title-asc";
export type TaskViewMode = "comfortable" | "compact";

interface TaskFiltersProps {
  searchTerm: string;
  statusFilter: TaskStatus | "ALL";
  sortOption: TaskSortOption;
  viewMode: TaskViewMode;
  onSearchTermChange: (value: string) => void;
  onStatusFilterChange: (value: TaskStatus | "ALL") => void;
  onSortOptionChange: (option: TaskSortOption) => void;
  onViewModeChange: (mode: TaskViewMode) => void;
}

const STATUS_FILTERS: { label: string; value: TaskStatus | "ALL" }[] = [
  { value: "ALL", label: "Todas" },
  { value: "PENDING", label: "Pendentes" },
  { value: "IN_PROGRESS", label: "Em andamento" },
  { value: "COMPLETED", label: "Concluídas" }
];

const SORT_OPTIONS: { value: TaskSortOption; label: string }[] = [
  { value: "createdAt-desc", label: "Recentes primeiro" },
  { value: "createdAt-asc", label: "Mais antigas" },
  { value: "dueDate-asc", label: "Menor prazo" },
  { value: "dueDate-desc", label: "Maior prazo" },
  { value: "title-asc", label: "Título A-Z" }
];

function TaskFilters({
  searchTerm,
  statusFilter,
  sortOption,
  viewMode,
  onSearchTermChange,
  onStatusFilterChange,
  onSortOptionChange,
  onViewModeChange
}: TaskFiltersProps) {
  return (
    <div className="filters">
      <div className="filters__row">
        <div className="filters__search">
          <input
            type="search"
            placeholder="Pesquisar por Título ou descrição"
            value={searchTerm}
            onChange={(event) => onSearchTermChange(event.target.value)}
            aria-label="Pesquisar tarefas"
          />
          {searchTerm ? (
            <button type="button" className="filters__clear" onClick={() => onSearchTermChange("")} aria-label="Limpar pesquisa">
              Limpar
            </button>
          ) : null}
        </div>
        <div className="filters__view-toggle" role="group" aria-label="Alternar visualização">
          <button
            type="button"
            className={`chip chip--ghost${viewMode === "comfortable" ? " is-active" : ""}`}
            onClick={() => onViewModeChange("comfortable")}
            aria-pressed={viewMode === "comfortable"}
          >
            Detalhada
          </button>
          <button
            type="button"
            className={`chip chip--ghost${viewMode === "compact" ? " is-active" : ""}`}
            onClick={() => onViewModeChange("compact")}
            aria-pressed={viewMode === "compact"}
          >
            Compacta
          </button>
        </div>
      </div>

      <div className="filters__row filters__row--wrap">
        <div className="chip-group" role="tablist" aria-label="Filtrar por status">
          {STATUS_FILTERS.map((filter) => {
            const isActive = statusFilter === filter.value;
            return (
              <button
                key={filter.value}
                type="button"
                className={`chip chip--selectable${isActive ? " is-active" : ""}`}
                onClick={() => onStatusFilterChange(filter.value)}
                aria-pressed={isActive}
              >
                {filter.label}
              </button>
            );
          })}
        </div>

        <label className="filters__sort">
          <span className="filters__sort-label">Ordenar por</span>
          <select value={sortOption} onChange={(event) => onSortOptionChange(event.target.value as TaskSortOption)}>
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>
    </div>
  );
}

export default TaskFilters;


