const router = require("express").Router();
const SettingsController = require("../../controller/settingsController");
const checkPermission = require("../../utilities/tokenmanager/checkpermission");

router.post("/faq/add", checkPermission, SettingsController.add_faq);
router.post("/faq/list", SettingsController.list_faq);
router.post(
    "/terms_conditions/add",
    checkPermission,
    SettingsController.add_terms_conditions
);
router.post(
    "/terms_conditions/list",

    SettingsController.list_terms_conditions
);
router.post(
    "/privacy_policy/add",
    checkPermission,
    SettingsController.add_privacy_policy
);
router.post(
    "/privacy_policy/list",

    SettingsController.list_privacy_policy
);

module.exports = router;
