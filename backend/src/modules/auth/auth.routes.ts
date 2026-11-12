import { Router } from "express";
import { authenticate } from "../../middlewares/authenticate.js";
import { validateRequest } from "../../middlewares/validate-request.js";
import { authRateLimit } from "../../middlewares/rate-limit.js";
import { login, logout, me, refresh, register, updateMe, googleLogin } from "./auth.controller.js";
import { loginSchema, registerSchema, googleLoginSchema, updateProfileSchema } from "./auth.schemas.js";
import { upload } from "../../middlewares/upload.js";

export const authRouter = Router();

authRouter.post("/register", authRateLimit, validateRequest(registerSchema), register);
authRouter.post("/login", authRateLimit, validateRequest(loginSchema), login);
authRouter.post("/google", authRateLimit, validateRequest(googleLoginSchema), googleLogin);
authRouter.post("/refresh", refresh);
authRouter.post("/logout", logout);
authRouter.get("/me", authenticate, me);
authRouter.patch("/me", authenticate, upload.single("avatar"), validateRequest(updateProfileSchema), updateMe);
