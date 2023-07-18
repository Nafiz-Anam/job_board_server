const router = require("express").Router();
const JobController = require("../../controller/jobController");
const jobUploader = require("../../uploads/jobUploader");

router.post("/create", jobUploader, JobController.create);
router.post("/update", jobUploader, JobController.update);
router.post("/list", JobController.list);
router.post("/details", JobController.details);
router.post("/delete", JobController.delete);

module.exports = router;
