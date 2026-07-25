const express = require("express");
const router = express.Router();
const {registerUser , loginUser} = require("../controllers/auth.controller");
const validate = require("../middleware/validate.middleware");
const { registerSchema , loginSchema } = require("../validators/auth.validator");
const { authLimiter } = require("../middleware/rateLimit.middleware");

router.post("/register", authLimiter, validate(registerSchema), registerUser);
router.post("/login", authLimiter, validate(loginSchema), loginUser);

module.exports = router;