require("dotenv").config();
const Sub_CategoryModel = require("../model/sub_categoryModel");
const enc_dec = require("../utilities/decryptor/decryptor");
const helpers = require("../utilities/helper/general_helper");
const STATIC_URL = process.env.STATIC_URL;

var Sub_CategoryController = {
    create: async (req, res) => {
        console.log("all_files =>", req.all_files);
        try {
            let data = {
                name: req.bodyString("name"),
                description: req.bodyString("description"),
                category_id: enc_dec.decrypt(req.bodyString("category_id")),
                status: req.bodyString("status"),
                service_image: req.all_files.service_image,
            };
            await Sub_CategoryModel.add(data)
                .then((result) => {
                    res.status(200).json({
                        status: true,
                        message: "Sub-category added successfully!",
                    });
                })
                .catch((err) => {
                    console.log(err);
                    res.status(500).json({
                        status: false,
                        message: "Unable to add sub-category. Try again!",
                    });
                });
        } catch (error) {
            console.log(error);
            res.status(500).json({
                status: false,
                message: "Server side error! Try again.",
            });
        }
    },

    update: async (req, res) => {
        let id = enc_dec.decrypt(req.bodyString("sub_category_id"));
        try {
            let data = {
                name: req.bodyString("name"),
                description: req.bodyString("description"),
                category_id: enc_dec.decrypt(req.bodyString("category_id")),
                status: req.bodyString("status"),
                service_image: req.all_files.service_image,
            };
            await Sub_CategoryModel.updateDetails({ id: id }, data)
                .then((result) => {
                    res.status(200).json({
                        status: true,
                        message: "Sub-Category updated successfully!",
                    });
                })
                .catch((err) => {
                    console.log(err);
                    res.status(500).json({
                        status: false,
                        message: "Unable to update sub-category. Try again!",
                    });
                });
        } catch (error) {
            console.log(error);
            res.status(500).json({
                status: false,
                message: "Server side error! Try again.",
            });
        }
    },

    list: async (req, res) => {
        try {
            let limit = {
                perpage: 0,
                start: 0,
            };
            if (req.bodyString("perpage") && req.bodyString("page")) {
                perpage = parseInt(req.bodyString("perpage"));
                start = parseInt(req.bodyString("page"));
                limit.perpage = perpage;
                limit.start = (start - 1) * perpage;
            }

            let condition = {};

            const totalCount = await Sub_CategoryModel.get_count(condition);
            console.log(totalCount);

            await Sub_CategoryModel.select_list(condition, limit)
                .then(async (result) => {
                    console.log(result);
                    let response = [];
                    for (let val of result) {
                        let temp = {
                            id: val?.id ? enc_dec.encrypt(val?.id) : "",
                            name: val?.name ? val?.name : "",
                            description: val?.description
                                ? val?.description
                                : "",
                            service_image: val?.service_image
                                ? val?.service_image
                                : "",
                            category_id: val?.category_id ? enc_dec.encrypt(val?.category_id) : "",
                            status: val?.status ? val?.status : "",
                            created_at: val?.created_at ? val?.created_at : "",
                            updated_at: val?.updated_at ? val?.updated_at : "",
                        };
                        response.push(temp);
                    }
                    res.status(200).json({
                        status: true,
                        data: response,
                        message: "Category fetched successfully!",
                        total: totalCount,
                    });
                })
                .catch((err) => {
                    console.log(err);
                    res.status(500).json({
                        status: false,
                        data: {},
                        error: "Server side error!",
                    });
                });
        } catch (error) {
            console.log(error);
            res.status(500).json({
                status: false,
                data: {},
                error: "Server side error!",
            });
        }
    },

    details: async (req, res) => {
        try {
            let id = enc_dec.decrypt(req.bodyString("job_id"));
            await Sub_CategoryModel.select({ id: id })
                .then(async (result) => {
                    let response = [];
                    for (let val of result) {
                        let temp = {
                            id: val?.id ? enc_dec.encrypt(val?.id) : "",
                            name: val?.name ? val?.name : "",
                            description: val?.description
                                ? val?.description
                                : "",
                            service_image: val?.service_image
                                ? val?.service_image
                                : "",
                            category_id: val?.category_id
                                ? enc_dec.encrypt(val?.category_id)
                                : "",
                            status: val?.status ? val?.status : "",
                            created_at: val?.created_at ? val?.created_at : "",
                            updated_at: val?.updated_at ? val?.updated_at : "",
                        };
                        response.push(temp);
                    }
                    res.status(200).json({
                        status: true,
                        data: response,
                        message: "Category details fetched successfully!",
                    });
                })
                .catch((err) => {
                    console.log(err);
                    res.status(500).json({
                        status: false,
                        data: {},
                        error: "Server side error!",
                    });
                });
        } catch (error) {
            console.log(error);
            res.status(500).json({
                status: false,
                data: {},
                error: "Server side error!",
            });
        }
    },
};

module.exports = Sub_CategoryController;
