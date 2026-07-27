const express = require("express");
const router = express.Router();
const {
  createRecurring,
  getRecurring,
  toggleRecurring,
  deleteRecurring,
} = require("../controllers/recurring.controller");
const validate = require("../middleware/validate.middleware");
const { recurringSchema } = require("../validators/recurring.validator");
const protect = require("../middleware/auth.middleware");

router.get("/", protect, getRecurring);
router.post("/", protect, validate(recurringSchema), createRecurring);
router.patch("/:id/toggle", protect, toggleRecurring);
router.delete("/:id", protect, deleteRecurring);

module.exports = router;
