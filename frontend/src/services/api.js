const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000/api";
let csrfToken = null;
async function fetchCsrfToken(force = false) {
    if (csrfToken && !force) {
        return csrfToken;
    }
    const response = await fetch(`${API_BASE_URL}/csrf-token`, {
        credentials: "include"
    });
    if (!response.ok) {
        throw new Error("Failed to fetch CSRF token");
    }
    const data = await response.json();
    csrfToken = data.csrfToken;
    return csrfToken;
}
async function request(endpoint, options = {}, requireCsrf = false, retry = true) {
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
        return request(endpoint, options, requireCsrf, false);
    }
    if (response.status === 204) {
        return undefined;
    }
    if (!response.ok) {
        let message = "Unexpected error";
        try {
            const body = await response.json();
            if (body && typeof body.message === "string") {
                message = body.message;
            }
        }
        catch {
            // ignore
        }
        throw new Error(message);
    }
    return response.json();
}
export async function getTasks() {
    return request("/tasks", { method: "GET" }, false);
}
export async function createTask(payload) {
    return request("/tasks", {
        method: "POST",
        body: JSON.stringify(payload)
    }, true);
}
export async function updateTask(id, payload) {
    return request(`/tasks/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload)
    }, true);
}
export async function deleteTask(id) {
    await request(`/tasks/${id}`, { method: "DELETE" }, true);
}
export async function ensureCsrf() {
    await fetchCsrfToken();
}
