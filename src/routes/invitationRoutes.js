import express from "express";
import { getInvitationByToken } from "../controllers/invitationController.js";

const router = express.Router();

router.get("/:token", getInvitationByToken);

export default router;