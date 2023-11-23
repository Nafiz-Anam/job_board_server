const router = require("express").Router();
const ServiceController = require("../../controller/serviceController");
const serviceUploader = require("../../uploads/serviceUploader");
const checkPermission = require("../../utilities/tokenmanager/checkpermission");
const checkExpertToken = require("../../utilities/tokenmanager/checkExpertToken");

router.post(
    "/create",
    checkExpertToken,
    serviceUploader,
    ServiceController.create
);
router.post("/list", checkPermission, ServiceController.list);
router.post("/details", checkPermission, ServiceController.details);
router.post(
    "/request/update",
    checkPermission,
    ServiceController.request_update
);

router.post("/delete", checkPermission, ServiceController.delete);
router.post("/book", checkPermission, ServiceController.booking);
router.post("/bookings", ServiceController.booking_list);
router.post("/booking/status", ServiceController.booking_status);
router.post(
    "/booking/cancel",
    checkPermission,
    ServiceController.cancel_booking
);
router.post(
    "/booking/reschedule",
    checkPermission,
    ServiceController.rescheduled
);

module.exports = router;
