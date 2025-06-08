import { Router } from "express";
import { validateUserLogin, validateUserSignUp } from "../middlewares/auth.middleware.js";
import { userLogin, userSignup } from "../controllers/auth.controller.js";

const authRoutes = Router()

authRoutes.post('/signup', validateUserSignUp, userSignup)
authRoutes.post('/login', validateUserLogin, userLogin)



export default authRoutes