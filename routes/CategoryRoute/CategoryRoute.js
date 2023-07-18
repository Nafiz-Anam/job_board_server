const router = require("express").Router();
const CategoryController = require("../../controller/categoryController");
const CategoryUploader = require("../../uploads/CategoryUploader");

router.post("/create", CategoryUploader, CategoryController.create);
router.post("/update", CategoryUploader, CategoryController.update);
router.post("/list", CategoryController.list);
router.post("/details", CategoryController.details);

module.exports = router;
