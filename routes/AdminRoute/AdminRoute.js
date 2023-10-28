const router = require("express").Router();
const AdminController = require("../../controller/adminController");
const checkAdminToken = require("../../utilities/tokenmanager/checkAdminToken");

router.post("/login", AdminController.login);
router.post("/check-admin", AdminController.check_admin);
router.post(
    "/change-password",
    checkAdminToken,
    AdminController.change_password
);

module.exports = router;
