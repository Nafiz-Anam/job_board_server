const router = require("express").Router();
const ClientsController = require("../../controller/clientsController");

// router.post("/create", ClientsController.create);
router.post("/update", ClientsController.update);
router.post("/block", ClientsController.block);
router.post("/list", ClientsController.list);
router.post("/details", ClientsController.details);

module.exports = router;
