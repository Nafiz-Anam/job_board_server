const router = require("express").Router();
const UserRouter = require("./UserRoute/UserRouter");
const AccountRouter = require("./AccountRoute/AccountRoute");


router.use("/user", UserRouter);
router.use("/account", AccountRouter);

module.exports = router;
