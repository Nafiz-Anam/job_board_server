const router = require("express").Router();
const JobController = require("../../controller/jobController");
const applyUploader = require("../../uploads/applyUploader");
const jobUploader = require("../../uploads/jobUploader");
const checkPermission = require("../../utilities/tokenmanager/checkPermission");
const checkExpertToken = require("../../utilities/tokenmanager/checkExpertToken");

router.post("/create", checkPermission, jobUploader, JobController.create);
router.post("/update", checkPermission, jobUploader, JobController.update);
router.post("/list", JobController.list);
router.post("/details", JobController.details);
router.post("/delete", checkPermission, JobController.delete);
router.post("/apply", checkExpertToken, applyUploader, JobController.apply_v2);
router.post("/applied/list", checkPermission, JobController.applied_list);
router.post("/applied/details", checkPermission, JobController.applied_details);
router.post(
    "/request-status/update",
    checkPermission,
    JobController.update_request_status
);
router.post(
    "/work-status/update",
    checkPermission,
    JobController.work_request_status
);

module.exports = router;
