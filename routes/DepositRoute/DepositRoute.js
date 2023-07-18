const router = require("express").Router();
const DepositController = require("../../controller/depositController");

// router.post("/create", CategoryController.create);
// router.post("/update", CategoryController.update);
router.post("/list", DepositController.list);
router.post("/details", DepositController.details);

module.exports = router;
