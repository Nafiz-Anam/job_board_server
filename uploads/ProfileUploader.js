const multer = require("multer");
const path = require("path");

const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "public/profile");
    },

    filename: (req, file, cb) => {
        let filename =
            file.fieldname +
            "-" +
            Date.now() +
            "-" +
            Math.round(Math.random() * 1e9) +
            path.extname(file.originalname);

        // Initialize the all_files object if it doesn't exist
        if (!req.all_files) {
            req.all_files = {};
        }

        // Check if the fieldname key is already present
        if (req.all_files[file.fieldname]) {
            // Push the filename into the existing array
            req.all_files[file.fieldname].push(filename);
        } else {
            // Create a new array with the filename
            req.all_files[file.fieldname] = [filename];
        }

        cb(null, filename);
    },
});

const fileFilter = (req, file, cb) => {
    if (
        file.mimetype === "image/png" ||
        file.mimetype === "image/jpg" ||
        file.mimetype === "image/jpeg"
    ) {
        // check file type to be png, jpeg, or jpg
        cb(null, true);
    } else {
        cb(null, false); // else fails
    }
};

let ProfileUploader = multer({
    storage: fileStorage,
    limits: { fileSize: "50mb" },
    fileFilter: fileFilter,
}).fields([
    {
        name: "profile_img",
        maxCount: 1,
    },
    {
        name: "cover_image",
        maxCount: 1,
    },
    {
        name: "previous_work_image",
        maxCount: 6,
    },
]);

module.exports = ProfileUploader;
