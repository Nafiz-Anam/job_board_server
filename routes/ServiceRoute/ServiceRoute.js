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
router.post("/book", checkExpertToken, ServiceController.booking);
router.post("/bookings", checkExpertToken, ServiceController.booking_list);
// router.post(
//     "/update",
//     checkPermission,
//     serviceUploader,
//     ServiceController.update
// );
router.post("/list", checkPermission, ServiceController.list);
router.post("/details", checkPermission, ServiceController.details);
router.post(
    "/request/update",
    checkPermission,
    ServiceController.request_update
);

router.post("/delete", checkPermission, ServiceController.delete);

module.exports = router;
