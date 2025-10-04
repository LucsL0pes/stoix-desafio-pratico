import { Request, Response, NextFunction } from "express";
import {
  listTasks,
  createTask,
  updateTask,
  deleteTask,
  getTaskById,
  TASK_STATUS_VALUES,
  type TaskStatus
} from "../models/taskModel.js";

const VALID_STATUSES = new Set<TaskStatus>(TASK_STATUS_VALUES);

function parseStatus(status?: string | null) {
  if (!status) return undefined;
  const normalized = status.toUpperCase() as TaskStatus;
  if (VALID_STATUSES.has(normalized)) {
    return normalized;
  }
  return null;
}

function parseDueDate(dueDate?: string | null) {
  if (!dueDate) return undefined;
  const parsed = new Date(dueDate);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }
  return parsed;
}

export async function getTasks(_req: Request, res: Response, next: NextFunction) {
  try {
    const tasks = await listTasks();
    res.json(tasks);
  } catch (error) {
    next(error);
  }
}

export async function postTask(req: Request, res: Response, next: NextFunction) {
  try {
    const { title, description, status, dueDate } = req.body ?? {};

    if (!title || typeof title !== "string") {
      res.status(400).json({ message: "Title is required" });
      return;
    }

    const parsedStatus = parseStatus(status);
    if (parsedStatus === null) {
      res.status(400).json({ message: "Invalid status value" });
      return;
    }

    const parsedDueDate = parseDueDate(dueDate);
    if (parsedDueDate === null) {
      res.status(400).json({ message: "Invalid due date" });
      return;
    }

    const newTask = await createTask({
      title: title.trim(),
      description: description ? String(description).trim() : undefined,
      status: parsedStatus,
      dueDate: parsedDueDate
    });

    res.status(201).json(newTask);
  } catch (error) {
    next(error);
  }
}

export async function putTask(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      res.status(400).json({ message: "Invalid task id" });
      return;
    }

    const existing = await getTaskById(id);
    if (!existing) {
      res.status(404).json({ message: "Task not found" });
      return;
    }

    const { title, description, status, dueDate } = req.body ?? {};

    const parsedStatus = parseStatus(status);
    if (parsedStatus === null) {
      res.status(400).json({ message: "Invalid status value" });
      return;
    }

    const parsedDueDate = parseDueDate(dueDate);
    if (parsedDueDate === null) {
      res.status(400).json({ message: "Invalid due date" });
      return;
    }

    const updatedTask = await updateTask(id, {
      title: typeof title === "string" ? title.trim() : undefined,
      description: typeof description === "string" ? description.trim() : undefined,
      status: parsedStatus,
      dueDate: parsedDueDate
    });

    res.json(updatedTask);
  } catch (error) {
    next(error);
  }
}

export async function removeTask(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      res.status(400).json({ message: "Invalid task id" });
      return;
    }

    const existing = await getTaskById(id);
    if (!existing) {
      res.status(404).json({ message: "Task not found" });
      return;
    }

    await deleteTask(id);
    res.status(204).end();
  } catch (error) {
    next(error);
  }
}
