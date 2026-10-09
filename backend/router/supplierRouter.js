const express = require("express");
const router = express.Router();
const supplierController = require("../controllers/supplierController");
const { requireAuth, requireRole } = require("../middlewares/authMiddleware");

router.use(requireAuth);

router.get("/", supplierController.getAll);
router.get("/:id", supplierController.getById);
router.post("/", requireRole("admin"), supplierController.create);
router.put("/:id", requireRole("admin"), supplierController.update);
router.delete("/:id", requireRole("admin"), supplierController.remove);

module.exports = router;