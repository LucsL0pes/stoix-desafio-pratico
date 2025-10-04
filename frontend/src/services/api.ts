import type { Task, TaskPayload } from "../types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000/api";
let csrfToken: string | null = null;

async function fetchCsrfToken(force = false) {
  if (csrfToken && !force) {
    return csrfToken;
  }

  const response = await fetch(`${API_BASE_URL}/csrf-token`, {
    credentials: "include"
  });

  if (!response.ok) {
    throw new Error("Não foi possível obter o token CSRF");
  }

  const data: { csrfToken: string } = await response.json();
  csrfToken = data.csrfToken;
  return csrfToken;
}

async function request<T>(endpoint: string, options: RequestInit = {}, requireCsrf = false, retry = true): Promise<T> {
  const headers = new Headers(options.headers ?? {});

  if (requireCsrf) {
    const token = await fetchCsrfToken();
    headers.set("X-CSRF-Token", token);
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    credentials: "include",
    ...options,
    headers
  });

  if (response.status === 403 && retry) {
    csrfToken = null;
    await fetchCsrfToken(true);
    return request<T>(endpoint, options, requireCsrf, false);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  if (!response.ok) {
    let message = "Erro inesperado";
    try {
      const body = await response.json();
      if (body && typeof body.message === "string") {
        message = body.message;
      }
    } catch {
      // ignore
    }
    throw new Error(message);
  }

  return response.json() as Promise<T>;
}

export async function getTasks(): Promise<Task[]> {
  return request<Task[]>("/tasks", { method: "GET" }, false);
}

export async function createTask(payload: TaskPayload): Promise<Task> {
  return request<Task>(
    "/tasks",
    {
      method: "POST",
      body: JSON.stringify(payload)
    },
    true
  );
}

export async function updateTask(id: number, payload: TaskPayload): Promise<Task> {
  return request<Task>(
    `/tasks/${id}`,
    {
      method: "PUT",
      body: JSON.stringify(payload)
    },
    true
  );
}

export async function deleteTask(id: number): Promise<void> {
  await request<void>(`/tasks/${id}`, { method: "DELETE" }, true);
}

export async function ensureCsrf() {
  await fetchCsrfToken();
}