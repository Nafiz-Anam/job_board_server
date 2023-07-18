const router = require("express").Router();
const UserRouter = require("./UserRoute/UserRouter");
const JobRouter = require("./JobRoute/JobRoute");
const CategoryRouter = require("./CategoryRoute/CategoryRoute");
const Sub_CategoryRouter = require("./Sub_CategoryRoute/Sub_CategoryRoute");

router.use("/user", UserRouter);
router.use("/job", JobRouter);
router.use("/category", CategoryRouter);
router.use("/sub-category", Sub_CategoryRouter);

module.exports = router;
