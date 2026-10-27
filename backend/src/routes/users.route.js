import { Router } from "express";
import { addHistory, getUserHistory, login, register } from "../controler/user.controler.js";


const router = Router();

router.route("/login").post(login);
router.route("/register").post(register);
router.route("/add_to_activity").post(addHistory);
router.route("/get_all_activity").get(getUserHistory);


export default router;