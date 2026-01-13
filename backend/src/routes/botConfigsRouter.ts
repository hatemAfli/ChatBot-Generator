import express from "express";
import verifyRole from "../middleware/verifyRoles";
import {
  createBotConfig,
  getBotConfigByBotId,
  updateBotConfig,
  deleteBotConfig,
  getAllBotConfigs,
} from "../controllers/botConfigsController";

const router = express.Router();
 
router.post("/",verifyRole('admin','superadmin'), createBotConfig);
router.get("/", getAllBotConfigs);
router.get("/:id", getBotConfigByBotId);
router.put("/:id",verifyRole('admin','superadmin'), updateBotConfig);
router.delete("/:id",verifyRole('admin','superadmin'), deleteBotConfig);

export default router;
