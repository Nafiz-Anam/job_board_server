const router = require("express").Router();
const authController = require("../../controller/authController");
const authValidator = require("../../utilities/validations/authValidation");
const checkAdminToken = require("../../utilities/tokenmanager/checkAdminToken");
const checkPermission = require("../../utilities/tokenmanager/checkPermission");
const checkClientToken = require("../../utilities/tokenmanager/checkClientToken");
const checkUserToken = require("../../utilities/tokenmanager/checkUserToken");
const ProfileUploader = require("../../uploads/ProfileUploader");
const ExpertUploader = require("../../uploads/ExpertUploader");

// auth routes
router.post("/send_otp", authValidator.check_user, authController.send_otp);
router.post(
    "/test/send_otp",
    authValidator.check_user,
    authController.test_send_otp
);
router.post("/password/send_otp", authController.password_send_otp_v2);
router.post("/test/password/send_otp", authController.test_password_send_otp);
router.post("/resend_otp", authValidator.check_user, authController.resend_otp);
router.post(
    "/verify_otp",
    authValidator.otp_verify,
    authController.otp_verify_v2
);
router.post(
    "/verify_otp_2fa",
    authValidator.otp_verify,
    authController.otp_verify_2fa
);
router.post("/password/verify_otp", authController.password_otp_verify);
router.post(
    "/add_password",
    checkPermission,
    authValidator.add_password,
    authController.add_password_v2
);
router.post("/login", authController.login_v2);

// profile routes
router.post(
    "/profile/update",
    checkUserToken,
    ProfileUploader,
    authController.update_profile_v2
);
router.post(
    "/profile/update-location",
    checkClientToken,
    authController.update_location
);
router.post(
    "/profile/details",
    checkPermission,
    authController.profile_details
);
router.post("/check-user", authController.check_user);
router.post("/list", checkPermission, authController.list);
router.post("/block-unblock", checkAdminToken, authController.block_unblock);
router.post("/delete", checkAdminToken, authController.delete);

// expert routes
router.post(
    "/become-expert",
    checkClientToken,
    ExpertUploader,
    authController.become_expert_request
);
router.post(
    "/become-expert/list",
    checkAdminToken,
    authController.expert_request_list
);
router.post(
    "/become-expert/details",
    checkAdminToken,
    authController.expert_request_details
);
router.post(
    "/become-expert/update",
    checkAdminToken,
    authController.update_expert_request
);

// settings routes
router.post("/login/history", checkAdminToken, authController.login_list);
router.post("/two_factor_auth", checkPermission, authController.two_factor);

module.exports = router;
