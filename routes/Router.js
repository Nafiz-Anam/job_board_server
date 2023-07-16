const router = require("express").Router();
const UserRouter = require("./UserRoute/UserRouter");
const JobRouter = require("./JobRoute/JobRoute");

router.use("/user", UserRouter);
router.use("/job", JobRouter);

module.exports = router;
