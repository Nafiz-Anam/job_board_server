const router = require("express").Router();
const JobController = require("../../controller/jobController");
const jobUploader = require("../../uploads/jobUploader");
const checkPermission = require("../../utilities/tokenmanager/checkpermission");

router.post("/create", checkPermission, jobUploader, JobController.create);
router.post("/update", checkPermission, jobUploader, JobController.update);
router.post("/list", checkPermission, JobController.list);
router.post("/details", checkPermission, JobController.details);
router.post("/delete", checkPermission, JobController.delete);

module.exports = router;
