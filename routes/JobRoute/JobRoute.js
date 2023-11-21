const router = require("express").Router();
const JobController = require("../../controller/jobController");
const applyUploader = require("../../uploads/applyUploader");
const jobUploader = require("../../uploads/jobUploader");
const checkPermission = require("../../utilities/tokenmanager/checkpermission");

router.post("/create", checkPermission, jobUploader, JobController.create);
router.post("/update", checkPermission, jobUploader, JobController.update);
router.post("/list",  JobController.list);
router.post("/request-status/update", JobController.update_request_status);
router.post("/details", checkPermission, JobController.details);
router.post("/delete", checkPermission, JobController.delete);
router.post("/apply", checkPermission, applyUploader, JobController.apply_v2);
router.post("/applied/list", checkPermission, JobController.applied_list);

module.exports = router;
