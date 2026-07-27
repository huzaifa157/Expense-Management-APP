const express = require("express");
const router = express.Router();
const {registerUser , loginUser , savePushToken} = require("../controllers/auth.controller");
const validate = require("../middleware/validate.middleware");
const { registerSchema , loginSchema } = require("../validators/auth.validator");
const { authLimiter } = require("../middleware/rateLimit.middleware");
const protect = require("../middleware/auth.middleware");

router.post("/register", authLimiter, validate(registerSchema), registerUser);
router.post("/login", authLimiter, validate(loginSchema), loginUser);
router.put("/push-token", protect, savePushToken);

module.exports = router;