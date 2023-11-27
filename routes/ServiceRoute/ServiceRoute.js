const router = require("express").Router();
const ServiceController = require("../../controller/serviceController");
const serviceUploader = require("../../uploads/serviceUploader");
const checkPermission = require("../../utilities/tokenmanager/checkPermission");
const checkExpertToken = require("../../utilities/tokenmanager/checkExpertToken");
const checkAdminToken = require("../../utilities/tokenmanager/checkAdminToken");

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
    checkAdminToken,
    ServiceController.request_update
);

router.post("/delete", checkPermission, ServiceController.delete);
router.post("/book", checkPermission, ServiceController.booking);
router.post("/bookings", checkPermission, ServiceController.booking_list);
router.post(
    "/booking/details",
    checkPermission,
    ServiceController.booking_details
);
router.post(
    "/booking/status",
    checkPermission,
    ServiceController.booking_status
);
router.post(
    "/booking/work_status",
    checkPermission,
    ServiceController.work_status
);
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
