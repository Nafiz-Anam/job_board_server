const router = require("express").Router();
const ExpertsController = require("../../controller/expertsController");

// router.post("/create", ExpertsController.create);
router.post("/update", ExpertsController.update);
router.post("/block", ExpertsController.block);
router.post("/list", ExpertsController.list);
router.post("/details", ExpertsController.details);

module.exports = router;
