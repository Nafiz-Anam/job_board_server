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
    const allowedMimeTypes = [
        "image/png",
        "image/jpg",
        "image/jpeg",
        "application/pdf",
        "video/mp4",
        // Add more mime types for additional file types
    ];
    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(null, false);
    }
};

let jobUploader = multer({
    storage: fileStorage,
    limits: { fileSize: "20mb" }, // Adjust the file size limit as needed
    fileFilter: fileFilter,
}).fields([
    {
        name: "project_files",
        maxCount: 5, // Set the maximum number of files allowed
    },
]);

module.exports = jobUploader;
