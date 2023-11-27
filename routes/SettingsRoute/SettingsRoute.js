const router = require("express").Router();
const SettingsController = require("../../controller/settingsController");
const checkPermission = require("../../utilities/tokenmanager/checkPermission");
const checkAdminToken = require("../../utilities/tokenmanager/checkAdminToken");

router.post("/faq/add", checkAdminToken, SettingsController.add_faq);
router.post("/faq/list", SettingsController.list_faq);
router.post(
    "/faq/update",
    checkAdminToken,
    checkPermission,
    SettingsController.update_faq
);
router.post("/faq/delete", checkAdminToken, SettingsController.delete_faq);
router.post(
    "/terms_conditions/add",
    checkAdminToken,
    SettingsController.add_terms_conditions
);
router.post("/terms_conditions/list", SettingsController.list_terms_conditions);
router.post(
    "/privacy_policy/add",
    checkAdminToken,
    SettingsController.add_privacy_policy
);
router.post("/privacy_policy/list", SettingsController.list_privacy_policy);
router.post("/about_us/add", checkAdminToken, SettingsController.add_about_us);
router.post("/about_us/list", SettingsController.list_about_us);
router.post(
    "/refund_policy/add",
    checkAdminToken,
    SettingsController.add_refund_policy
);
router.post("/refund_policy/list", SettingsController.list_refund_policy);

module.exports = router;
