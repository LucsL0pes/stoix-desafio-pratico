import { Router } from "express";
import {
  getTasks,
  postTask,
  putTask,
  removeTask
} from "../controllers/taskController.js";

const router = Router();

router.get("/", getTasks);
router.post("/", postTask);
router.put("/:id", putTask);
router.delete("/:id", removeTask);

export default router;