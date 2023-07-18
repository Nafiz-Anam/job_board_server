const router = require("express").Router();
const authController = require("../../controller/authController");
const authValidator = require("../../utilities/validations/authValidation");
const checkUserToken = require("../../utilities/tokenmanager/checkUserToken");
const applyUploader = require("../../uploads/CategoryUploader");

router.post("/register", authValidator.register, authController.register);
router.post("/login", authValidator.login, authController.login);
router.post("/forget-password", authController.forget_password);
router.post("/send_otp", authValidator.check_user, authController.send_otp);
router.post("/resend_otp", authValidator.check_user, authController.resend_otp);
router.post("/verify_otp", authValidator.otp_verify, authController.otp_verify);
router.post(
    "/profile/update",
    checkUserToken,
    applyUploader,
    authValidator.update_profile,
    authController.update_profile
);
router.post(
    "/profile/update-location",
    checkUserToken,
    authController.update_location
);
router.post("/change/phone", checkUserToken, authController.change_phone);
router.post("/profile/details", checkUserToken, authController.profile_details);

module.exports = router;
