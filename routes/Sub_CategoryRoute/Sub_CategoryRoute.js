const router = require("express").Router();
const Sub_CategoryController = require("../../controller/sub_categoryController");
const CategoryUploader = require("../../uploads/CategoryUploader");
const checkAdminToken = require("../../utilities/tokenmanager/checkAdminToken");

router.post(
    "/create",
    checkAdminToken,
    CategoryUploader,
    Sub_CategoryController.create
);
router.post(
    "/update",
    checkAdminToken,
    CategoryUploader,
    Sub_CategoryController.update
);
router.post("/list", Sub_CategoryController.list);
router.post("/details", Sub_CategoryController.details);
router.post("/delete", checkAdminToken, Sub_CategoryController.delete);

module.exports = router;
