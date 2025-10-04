import { Request, Response, NextFunction } from "express";
import { CsrfError } from "csurf";

export function csrfErrorHandler(error: unknown, req: Request, res: Response, next: NextFunction) {
  if (error && typeof error === "object" && "code" in error) {
    const err = error as CsrfError;
    if (err.code === "EBADCSRFTOKEN") {
      res.status(403).json({ message: "Invalid or missing CSRF token" });
      return;
    }
  }
  next(error);
}