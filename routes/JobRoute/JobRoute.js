const router = require("express").Router();
const JobController = require("../../controller/jobController");
const accountValidation = require("../../utilities/validations/accountValidation");
const checkUserToken = require("../../utilities/tokenmanager/checkUserToken");
const receiptUpload = require("../../uploads/receiptUpload");
const KycUpload = require("../../uploads/kyc_uploader");
const jobUploader = require("../../uploads/jobUploader");

router.post("/create", jobUploader, JobController.create);
router.post("/update", jobUploader, JobController.update);
router.post("/list", JobController.list);
router.post("/details", JobController.details);

module.exports = router;
