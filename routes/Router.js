const router = require("express").Router();
const UserRouter = require("./UserRoute/UserRouter");
const JobRouter = require("./JobRoute/JobRoute");
const CategoryRouter = require("./CategoryRoute/CategoryRoute");
const Sub_CategoryRouter = require("./Sub_CategoryRoute/Sub_CategoryRoute");
const DepositRouter = require("./Sub_CategoryRoute/Sub_CategoryRoute");
const WithdrawRouter = require("./WithdrawRoute/WithdrawRoute");
const PaymentRouter = require("./PaymentRoute/PaymentRoute");
const ExpertsRouter = require("./ExpertsRoute/ExpertsRoute");
const ClientsRouter = require("./ExpertsRoute/ExpertsRoute");
const AdminRouter = require("./AdminRoute/AdminRoute");

router.use("/user", UserRouter);
router.use("/admin", AdminRouter);
router.use("/experts", ExpertsRouter);
router.use("/clients", ClientsRouter);
router.use("/job", JobRouter);
router.use("/category", CategoryRouter);
router.use("/sub-category", Sub_CategoryRouter);
router.use("/deposit", DepositRouter);
router.use("/withdraw", WithdrawRouter);
router.use("/payment", PaymentRouter);

module.exports = router;
