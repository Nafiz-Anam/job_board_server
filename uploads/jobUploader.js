const multer = require("multer");
const path = require("path");

const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "public/jobs");
    },

    filename: (req, file, cb) => {
        let filename =
            file.fieldname +
            "-" +
            Date.now() +
            "-" +
            Math.round(Math.random() * 1e9) +
            path.extname(file.originalname);
        if (req.all_files) {
            req.all_files[file.fieldname] = req.all_files[file.fieldname] || [];
            req.all_files[file.fieldname].push(filename);
        } else {
            req.all_files = {};
            req.all_files[file.fieldname] = [filename];
        }
        cb(null, filename);
    },
});

const fileFilter = (req, file, cb) => {
    const allowedMimeTypes = {
        attach_img: ["image/png", "image/jpg", "image/jpeg"],
        attach_video: ["video/mp4"],
        attach_file: [
            "application/pdf",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "application/msword",
        ],
        // Add more mime types for additional file types
    };

    if (allowedMimeTypes[file.fieldname].includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(null, false);
    }
};

let jobUploader = multer({
    storage: fileStorage,
    limits: { fileSize: "100mb" }, // Adjust the file size limit as needed
    fileFilter: fileFilter,
}).fields([
    {
        name: "attach_img",
        maxCount: 5, // Set the maximum number of files allowed
    },
    {
        name: "attach_video",
        maxCount: 1, // Set the maximum number of files allowed
    },
    {
        name: "attach_file",
        maxCount: 1, // Set the maximum number of files allowed
    },
]);

module.exports = jobUploader;
