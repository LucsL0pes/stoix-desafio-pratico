import { Request, Response, NextFunction } from "express";

export function errorHandler(error: unknown, req: Request, res: Response, _next: NextFunction) {
  console.error(error);

  if (res.headersSent) {
    return;
  }

  res.status(500).json({ message: "Internal server error" });
}