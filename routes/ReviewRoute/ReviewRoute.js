const router = require("express").Router();
const ReviewController = require("../../controller/reviewController");
const checkPermission = require("../../utilities/tokenmanager/checkpermission");

router.post("/add", checkPermission, ReviewController.add_review);
router.post("/list", ReviewController.list_reviews);

module.exports = router;
