const router = require("express").Router();
const WithdrawController = require("../../controller/withdrawController");

router.post("/list", WithdrawController.list);


module.exports = router;
