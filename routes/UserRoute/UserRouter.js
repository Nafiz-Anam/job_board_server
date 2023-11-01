const router = require("express").Router();
const authController = require("../../controller/authController");
const authValidator = require("../../utilities/validations/authValidation");
const checkPermission = require("../../utilities/tokenmanager/checkpermission");
const checkAdminToken = require("../../utilities/tokenmanager/checkAdminToken");
const ProfileUploader = require("../../uploads/ProfileUploader");
const ExpertUploader = require("../../uploads/ExpertUploader");

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
router.post("/password/verify_otp", authController.password_otp_verify);
router.post(
    "/add_password",
    checkPermission,
    authValidator.add_password,
    authController.add_password_v2
);
router.post("/login", authController.login_v2);
// router.post("/login", authValidator.login, authController.login);
router.post(
    "/profile/update",
    checkPermission,
    ProfileUploader,
    authValidator.update_profile,
    authController.update_profile_v2
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
router.post("/list", authController.list);
router.post("/block-unblock", authController.block_unblock);
router.post("/delete", authController.delete);
router.post(
    "/become-expert",
    checkPermission,
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
router.post("/login/history", authController.login_list);

module.exports = router;
