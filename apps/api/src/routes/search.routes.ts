import { Router } from "express";

import { requireAuth } from "../middleware/auth.middleware.js";
import { searchMessages } from "../controllers/search.controller.js";

const router = Router();

router.post("/search", requireAuth, searchMessages);

export default router;