import express from "express";
const router=express.Router();
import verifyRole from "../middleware/verifyRoles";
import { getAllUsers,createUser,deleteUser, updateUser } from "../controllers/usersController";

// ressources for all authentified users
//verifyRole('analyste','admin','superadmin')

//ressources for admin and >
// verifyRole('admin','superadmin')

//rossources for superAdmin
// verifyRole('superadmin')


// router.use(verifyRole('superadmin'));

router.post("/",createUser);
router.get("/",getAllUsers);
router.delete("/:id",deleteUser);
router.put("/:id",updateUser);


export default router;
