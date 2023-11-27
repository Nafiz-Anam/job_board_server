const router = require("express").Router();
const TagController = require("../../controller/tagController");
const checkPermission = require("../../utilities/tokenmanager/checkPermission");

router.post("/add", checkPermission, TagController.add_tag);
router.post("/list", checkPermission, TagController.list_tags);

module.exports = router;
