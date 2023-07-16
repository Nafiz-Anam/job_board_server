const router = require("express").Router();
const accountController = require("../../controller/accountController");
const accountValidation = require("../../utilities/validations/accountValidation");
const checkUserToken = require("../../utilities/tokenmanager/checkUserToken");
const receiptUpload = require("../../uploads/receiptUpload");
const KycUpload = require("../../uploads/kyc_uploader");

router.post(
    "/add_money",
    checkUserToken,
    receiptUpload,
    accountValidation.add_money,
    accountController.add_money
);
router.post(
    "/send_money",
    checkUserToken,
    accountValidation.send_money,
    accountController.send_money
);
router.post(
    "/mobile_recharge",
    checkUserToken,
    accountValidation.mobile_recharge,
    accountController.mobile_recharge
);
router.post("/transactions", checkUserToken, accountController.transactions);
router.post(
    "/kyc_validation",
    checkUserToken,
    KycUpload,
    accountValidation.kyc_validation,
    accountController.kyc_validation
);

module.exports = router;
