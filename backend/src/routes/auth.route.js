const express = require("express");
const router = express.Router();
const {registerUser , loginUser , savePushToken , forgotPassword , resetPassword} = require("../controllers/auth.controller");
const validate = require("../middleware/validate.middleware");
const { registerSchema , loginSchema , forgotPasswordSchema , resetPasswordSchema } = require("../validators/auth.validator");
const { authLimiter } = require("../middleware/rateLimit.middleware");
const protect = require("../middleware/auth.middleware");

router.post("/register", authLimiter, validate(registerSchema), registerUser);
router.post("/login", authLimiter, validate(loginSchema), loginUser);
router.post("/forgot-password", authLimiter, validate(forgotPasswordSchema), forgotPassword);
router.post("/reset-password", authLimiter, validate(resetPasswordSchema), resetPassword);
router.put("/push-token", protect, savePushToken);

module.exports = router;