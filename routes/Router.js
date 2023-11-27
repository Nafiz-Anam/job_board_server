const router = require("express").Router();
const UserRouter = require("./UserRoute/UserRouter");
const JobRouter = require("./JobRoute/JobRoute");
const ServiceRouter = require("./ServiceRoute/ServiceRoute");
const CategoryRouter = require("./CategoryRoute/CategoryRoute");
const Sub_CategoryRouter = require("./Sub_CategoryRoute/Sub_CategoryRoute");
const ReviewRouter = require("./ReviewRoute/ReviewRoute");
const AdminRouter = require("./AdminRoute/AdminRoute");
const SettingsRouter = require("./SettingsRoute/SettingsRoute");
const TagRouter = require("./TagRoute/TagRoute");

router.use("/admin", AdminRouter);
router.use("/user", UserRouter);
router.use("/job", JobRouter);
router.use("/service", ServiceRouter);
router.use("/category", CategoryRouter);
router.use("/sub-category", Sub_CategoryRouter);
router.use("/review", ReviewRouter);
router.use("/tag", TagRouter);
router.use("/settings", SettingsRouter);

module.exports = router;
