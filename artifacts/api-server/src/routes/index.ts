import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import authRouter from "./auth.js";
import tournamentsRouter from "./tournaments.js";
import roundsRouter from "./rounds.js";
import adminRouter from "./admin.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(tournamentsRouter);
router.use(roundsRouter);
router.use(adminRouter);

export default router;
