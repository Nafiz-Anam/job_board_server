const router = require("express").Router();
const Sub_CategoryController = require("../../controller/sub_categoryController");
const CategoryUploader = require("../../uploads/CategoryUploader");

router.post("/create", CategoryUploader, Sub_CategoryController.create);
router.post("/update", CategoryUploader, Sub_CategoryController.update);
router.post("/list", Sub_CategoryController.list);
router.post("/details", Sub_CategoryController.details);

module.exports = router;
