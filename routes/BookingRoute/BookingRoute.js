const router = require("express").Router();
const BookingController = require("../../controller/bookingController");

// router.post("/create", CategoryController.create);
// router.post("/update", CategoryController.update);
router.post("/list", BookingController.list);
router.post("/details", BookingController.details);

module.exports = router;
