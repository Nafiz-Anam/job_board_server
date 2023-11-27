const router = require("express").Router();
const CategoryController = require("../../controller/categoryController");
const CategoryUploader = require("../../uploads/CategoryUploader");
const checkAdminToken = require("../../utilities/tokenmanager/checkAdminToken");

router.post(
    "/create",
    checkAdminToken,
    CategoryUploader,
    CategoryController.create
);
router.post(
    "/update",
    checkAdminToken,
    CategoryUploader,
    CategoryController.update
);
router.post("/list", CategoryController.list);
router.post("/details", CategoryController.details);
router.post("/delete", checkAdminToken, CategoryController.delete);

module.exports = router;
