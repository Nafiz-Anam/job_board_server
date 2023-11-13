const router = require("express").Router();
const TagController = require("../../controller/tagController");
const checkPermission = require("../../utilities/tokenmanager/checkpermission");

router.post("/add", checkPermission, TagController.add_tag);
router.post("/list", TagController.list_tags);

module.exports = router;
