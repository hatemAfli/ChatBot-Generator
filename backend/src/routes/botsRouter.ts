import express from "express";
import verifyRole from "../middleware/verifyRoles";
import {
  createBot,
  getAllBots,
  getBotById,
  updateBot,
  deleteBot
  ,publish,
  getBotsOfUser
} from "../controllers/botsController";

// ressources for all authentified users
//verifyRole('analyste','admin','superadmin')

//ressources for admin and >
// verifyRole('admin','superadmin')

//rossources for superAdmin
// verifyRole('superadmin')


 

// ,verifyRole('superadmin')
const router = express.Router();


// router.use(verifyRole('superadmin'));

router.post("/", createBot);
router.get("/", getAllBots);
router.get("/:id", getBotById);
router.put("/:id", updateBot);
router.delete("/:id", deleteBot);
router.post("/:id/publish",publish)
router.get("/user/:id",getBotsOfUser)


export default router;

