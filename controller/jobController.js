require("dotenv").config();
const JobModel = require("../model/jobModel");
const enc_dec = require("../utilities/decryptor/decryptor");
const helpers = require("../utilities/helper/general_helper");
const STATIC_URL = process.env.STATIC_FILE_URL;

var JobController = {
    create: async (req, res) => {
        console.log("all_files =>", req.all_files);
        try {
            let files = req.all_files.project_files;
            const filesWithStaticUrl = files.map(
                (file) => STATIC_URL + "jobs/" + file
            );
            const filesStringified = JSON.stringify(filesWithStaticUrl);
            console.log(filesStringified);

            let data = {
                title: req.bodyString("title"),
                description: req.bodyString("description"),
                category: enc_dec.decrypt(req.bodyString("category")),
                tags: req.bodyString("tags"),
                skills: req.bodyString("skills"),
                experience: req.bodyString("experience"),
                payment_type: req.bodyString("payment_type"),
                project_budget: req.bodyString("project_budget"),
                min_pay_amount: req.bodyString("min_pay_amount"),
                max_pay_amount: req.bodyString("max_pay_amount"),
                project_files: filesStringified,
            };
            await JobModel.add(data)
                .then((result) => {
                    res.status(200).json({
                        status: true,
                        message: "Job post added successfully!",
                    });
                })
                .catch((err) => {
                    console.log(err);
                    res.status(500).json({
                        status: false,
                        message: "Unable to post job. Try again!",
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
        let id = enc_dec.decrypt(req.bodyString("job_id"));
        try {
            let files = req.all_files.project_files;
            const filesWithStaticUrl = files.map(
                (file) => STATIC_URL + "jobs/" + file
            );
            const filesStringified = JSON.stringify(filesWithStaticUrl);

            let data = {
                title: req.bodyString("title"),
                description: req.bodyString("description"),
                category: enc_dec.decrypt(req.bodyString("category")),
                tags: req.bodyString("tags"),
                skills: req.bodyString("skills"),
                experience: req.bodyString("experience"),
                payment_type: req.bodyString("payment_type"),
                project_budget: req.bodyString("project_budget"),
                min_pay_amount: req.bodyString("min_pay_amount"),
                max_pay_amount: req.bodyString("max_pay_amount"),
                project_files: filesStringified,
            };
            await JobModel.updateDetails({ id: id }, data)
                .then((result) => {
                    res.status(200).json({
                        status: true,
                        message: "Job post updated successfully!",
                    });
                })
                .catch((err) => {
                    console.log(err);
                    res.status(500).json({
                        status: false,
                        message: "Unable to update job details. Try again!",
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

            const totalCount = await JobModel.get_count(condition);
            console.log(totalCount);

            await JobModel.select_list(condition, limit)
                .then(async (result) => {
                    console.log(result);
                    let response = [];
                    for (let val of result) {
                        let temp = {
                            id: val?.id ? enc_dec.encrypt(val?.id) : "",
                            title: val?.title ? val?.title : "",
                            description: val?.description
                                ? val?.description
                                : "",
                            category: val?.category ? val?.category : "",
                            tags: val?.tags ? val?.tags : "",
                            skills: val?.skills ? val?.skills : "",
                            experience: val?.experience ? val?.experience : "",
                            payment_type: val?.payment_type
                                ? val?.payment_type
                                : "",
                            project_budget: val?.project_budget
                                ? val?.project_budget
                                : 0,
                            min_pay_amount: val?.in_pay_amount
                                ? val?.in_pay_amount
                                : 0,
                            max_pay_amount: val?.max_pay_amount
                                ? val?.max_pay_amount
                                : 0,
                            project_files: val?.project_files
                                ? val?.project_files
                                : "",
                            created_at: val?.created_at ? val?.created_at : "",
                            updated_at: val?.updated_at ? val?.updated_at : "",
                        };
                        response.push(temp);
                    }
                    res.status(200).json({
                        status: true,
                        data: response,
                        message: "Jobs fetched successfully!",
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
            await JobModel.select({ id: id })
                .then(async (result) => {
                    let response = [];
                    for (let val of result) {
                        let temp = {
                            id: val?.id ? enc_dec.encrypt(val?.id) : "",
                            title: val?.title ? val?.title : "",
                            description: val?.description
                                ? val?.description
                                : "",
                            category: val?.category ? val?.category : "",
                            tags: val?.tags ? val?.tags : "",
                            skills: val?.skills ? val?.skills : "",
                            experience: val?.experience ? val?.experience : "",
                            payment_type: val?.payment_type
                                ? val?.payment_type
                                : "",
                            project_budget: val?.project_budget
                                ? val?.project_budget
                                : 0,
                            min_pay_amount: val?.in_pay_amount
                                ? val?.in_pay_amount
                                : 0,
                            max_pay_amount: val?.max_pay_amount
                                ? val?.max_pay_amount
                                : 0,
                            project_files: val?.project_files
                                ? val?.project_files
                                : "",
                            created_at: val?.created_at ? val?.created_at : "",
                            updated_at: val?.updated_at ? val?.updated_at : "",
                        };
                        response.push(temp);
                    }
                    res.status(200).json({
                        status: true,
                        data: response[0],
                        message: "Job details fetched successfully!",
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

    delete: async (req, res) => {
        try {
            let id = enc_dec.decrypt(req.bodyString("job_id"));
            await JobModel.delete({ id: id })
                .then(async (result) => {
                    res.status(200).json({
                        status: true,
                        data: response,
                        message: "Job deleted successfully!",
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

module.exports = JobController;
