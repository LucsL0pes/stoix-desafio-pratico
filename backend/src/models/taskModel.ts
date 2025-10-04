import { prisma } from "../db/client.js";

export const TASK_STATUS_VALUES = ["PENDING", "IN_PROGRESS", "COMPLETED"] as const;
export type TaskStatus = (typeof TASK_STATUS_VALUES)[number];
export const DEFAULT_TASK_STATUS: TaskStatus = "PENDING";

export type CreateTaskInput = {
  title: string;
  description?: string | null;
  status?: TaskStatus;
  dueDate?: Date | null;
};

export type UpdateTaskInput = Partial<CreateTaskInput>;

export async function listTasks() {
  return prisma.task.findMany({
    orderBy: { createdAt: "desc" }
  });
}

export async function createTask(data: CreateTaskInput) {
  return prisma.task.create({
    data: {
      title: data.title,
      description: data.description ?? null,
      status: data.status ?? DEFAULT_TASK_STATUS,
      dueDate: data.dueDate ?? null
    }
  });
}

export async function updateTask(id: number, data: UpdateTaskInput) {
  const updateData: Record<string, unknown> = {};

  if (data.title !== undefined) {
    updateData.title = data.title;
  }

  if (data.description !== undefined) {
    updateData.description = data.description ?? null;
  }

  if (data.status !== undefined) {
    updateData.status = data.status;
  }

  if (data.dueDate !== undefined) {
    updateData.dueDate = data.dueDate;
  }

  return prisma.task.update({
    where: { id },
    data: updateData
  });
}

export async function deleteTask(id: number) {
  await prisma.task.delete({ where: { id } });
}

export async function getTaskById(id: number) {
  return prisma.task.findUnique({ where: { id } });
}
