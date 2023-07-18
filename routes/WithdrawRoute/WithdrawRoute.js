const router = require("express").Router();
const WithdrawController = require("../../controller/withdrawController");

// router.post("/create", CategoryController.create);
// router.post("/update", CategoryController.update);
router.post("/list", WithdrawController.list);
router.post("/details", WithdrawController.details);

module.exports = router;
