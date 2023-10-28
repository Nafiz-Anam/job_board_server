const router = require("express").Router();
const authController = require("../../controller/authController");
const authValidator = require("../../utilities/validations/authValidation");
const checkPermission = require("../../utilities/tokenmanager/checkpermission");
const ProfileUploader = require("../../uploads/ProfileUploader");

router.post("/send_otp", authValidator.check_user, authController.send_otp);
router.post(
    "/test/send_otp",
    authValidator.check_user,
    authController.test_send_otp
);
router.post("/password/send_otp", authController.password_send_otp);
router.post("/test/password/send_otp", authController.test_password_send_otp);
router.post("/resend_otp", authValidator.check_user, authController.resend_otp);
router.post("/verify_otp", authValidator.otp_verify, authController.otp_verify);
router.post("/password/verify_otp", authController.password_otp_verify);
router.post(
    "/add_password",
    checkPermission,
    authValidator.add_password,
    authController.add_password
);
router.post("/login", authController.login);
// router.post("/login", authValidator.login, authController.login);
router.post(
    "/profile/update",
    checkPermission,
    ProfileUploader,
    authValidator.update_profile,
    authController.update_profile
);
router.post(
    "/profile/update-location",
    checkPermission,
    authController.update_location
);
router.post("/change/phone", checkPermission, authController.change_phone);
router.post(
    "/profile/details",
    checkPermission,
    authController.profile_details
);

router.post("/check-user", authController.check_user);
router.post("/forget-password", authController.forget_password);
router.post("/become-expert", authController.become_expert_request);
router.post("/become-expert/list", authController.expert_request_list);
router.post("/become-expert/success", authController.accept_expert_request);

module.exports = router;
